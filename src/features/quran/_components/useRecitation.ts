import { AyahRef, nextAyah } from "@/features/azkar/_data/quran";
import { contentLocale } from "@/i18n/config";
import isOnline from "@/lib/isOnline";
import { useAppSelector } from "@/store/Store";
import {
  setAudioModeAsync,
  setIsAudioActiveAsync,
  useAudioPlaylist,
  useAudioPlaylistStatus,
} from "expo-audio";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppState } from "react-native";
import { ayahAudioUrl, getReciter, ReciterId } from "../_data/reciters";
import { surahName } from "../_data/surahName";
import { audioSource, cacheAudio, isAudioCached } from "./audioCache";

type Track = { ref: AyahRef; basmala: boolean };

const PREFETCH = 2;

const needsBasmala = ({ surah, ayah }: AyahRef) =>
  ayah === 1 && surah !== 1 && surah !== 9;

const sameAyah = (a: AyahRef | null, b: AyahRef | null) =>
  !!a && !!b && a.surah === b.surah && a.ayah === b.ayah;

const trackUrl = (reciter: ReciterId, { ref, basmala }: Track) =>
  basmala
    ? ayahAudioUrl(reciter, 1, 1)
    : ayahAudioUrl(reciter, ref.surah, ref.ayah);

const queueFrom = (from: AyahRef, until: AyahRef | null) => {
  const tracks: Track[] = [];
  let ref: AyahRef | null = from;
  while (ref && ref.surah === from.surah) {
    if (needsBasmala(ref)) tracks.push({ ref, basmala: true });
    tracks.push({ ref, basmala: false });
    if (sameAyah(ref, until)) break;
    ref = nextAyah(ref);
  }
  return tracks;
};

export default function useRecitation() {
  const { t, i18n } = useTranslation("azkar");
  const reciter = useAppSelector((s) => s.settings.reciter);
  const lockScreen = useAppSelector((s) => s.settings.recitationLockScreen);
  const playlist = useAudioPlaylist();
  const status = useAudioPlaylistStatus(playlist);
  const [current, setCurrent] = useState<AyahRef | null>(null);
  const [playing, setPlaying] = useState(false);
  const [offline, setOffline] = useState(false);
  const queue = useRef<Track[]>([]);
  const until = useRef<AyahRef | null>(null);
  const lockActive = useRef(false);

  const showOnLockScreen = useCallback(
    (ref: AyahRef) => {
      if (!lockScreen) return;
      const ar = contentLocale(i18n.language) === "ar";
      const metadata = {
        title: t("verseRef", {
          surah: surahName(ref.surah, ar),
          ayah: ref.ayah,
        }),
        artist: getReciter(reciter)[ar ? "ar" : "en"],
      };
      try {
        if (lockActive.current) playlist.updateLockScreenMetadata(metadata);
        else playlist.setActiveForLockScreen(true, metadata);
        lockActive.current = true;
      } catch {}
    },
    [lockScreen, i18n.language, t, reciter, playlist],
  );

  const start = useCallback(
    (from: AyahRef) => {
      const tracks = queueFrom(from, until.current);
      queue.current = tracks;
      try {
        playlist.clear();
        tracks.forEach((track) =>
          playlist.add({ uri: audioSource(trackUrl(reciter, track)) }),
        );
        playlist.skipTo(0);
        playlist.play();
      } catch {}
      tracks
        .slice(1, PREFETCH + 1)
        .forEach((track) => cacheAudio(trackUrl(reciter, track)));
      setCurrent(from);
      setPlaying(true);
      showOnLockScreen(from);
    },
    [playlist, reciter, showOnLockScreen],
  );

  const reachable = useCallback(
    async (ref: AyahRef) => {
      const url = trackUrl(reciter, { ref, basmala: needsBasmala(ref) });
      if (isAudioCached(url) || (await isOnline())) return true;
      setOffline(true);
      return false;
    },
    [reciter],
  );

  const play = useCallback(
    async (from: AyahRef, stopAt: AyahRef | null = null) => {
      if (!(await reachable(from))) return;
      until.current = stopAt;
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: lockScreen,
        interruptionMode: lockScreen ? "doNotMix" : "mixWithOthers",
      }).catch(() => {});
      setIsAudioActiveAsync(true).catch(() => {});
      start(from);
    },
    [reachable, start, lockScreen],
  );

  const pause = useCallback(() => {
    try {
      playlist.pause();
    } catch {}
    setPlaying(false);
  }, [playlist]);

  const resume = useCallback(() => {
    if (!current) return;
    try {
      playlist.play();
    } catch {}
    setPlaying(true);
  }, [playlist, current]);

  const stop = useCallback(() => {
    try {
      playlist.pause();
      playlist.clear();
      if (lockActive.current) playlist.clearLockScreenControls();
    } catch {}
    lockActive.current = false;
    queue.current = [];
    setPlaying(false);
    setCurrent(null);
    setIsAudioActiveAsync(false).catch(() => {});
  }, [playlist]);

  useEffect(() => {
    const track = queue.current[status.currentIndex];
    if (!track || !playing) return;
    setCurrent(track.ref);
    showOnLockScreen(track.ref);
    queue.current
      .slice(status.currentIndex + 1, status.currentIndex + 1 + PREFETCH)
      .forEach((next) => cacheAudio(trackUrl(reciter, next)));
  }, [status.currentIndex]);

  useEffect(() => {
    if (!status.didJustFinish || !playing) return;
    if (status.currentIndex < queue.current.length - 1) return;
    const last = queue.current[queue.current.length - 1]?.ref ?? null;
    const next = !last || sameAyah(last, until.current) ? null : nextAyah(last);
    if (!next) {
      stop();
      return;
    }
    reachable(next).then((ok) => (ok ? start(next) : stop()));
  }, [status.didJustFinish]);

  useEffect(() => {
    if (current && playing) start(current);
  }, [reciter]);

  useEffect(() => {
    if (lockScreen || !playing) return;
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") pause();
    });
    return () => sub.remove();
  }, [lockScreen, playing, pause]);

  return {
    current,
    playing,
    loading: playing && !status.playing && !status.didJustFinish,
    offline,
    dismissOffline: useCallback(() => setOffline(false), []),
    play,
    pause,
    resume,
    stop,
  };
}
