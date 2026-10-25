# Maab — مآب

An Arabic/English Islamic app for Android and iOS: daily azkar, hadith, the Madinah mushaf, prayer times with adhan, and qibla. Most of it works without an internet connection.

![Maab screenshots](google-play-screenshots/panorama-preview.jpg)

## Features

- **Azkar:** morning, evening, sleep, after-prayer and more, with a tap counter, daily progress and reminders.
- **Hadith:** a hadith of the day, a local collection, and online search on Dorar.net with authenticity grades.
- **Quran:** the Madinah mushaf page by page, surah and juz lists, search, the Muyassar tafsir, recitation audio, bookmarks, saved ayahs and a khatma plan.
- **Prayer times:** calculated on the device for your location, several calculation methods, and adhan alerts with a choice of muezzin or your own sound.
- **Widgets:** next-prayer and prayer-times widgets on Android and iOS, plus a next-prayer countdown on the lock screen.
- **Qibla:** a compass that points to the Kaaba.
- **Made for both languages:** Arabic (right-to-left) and English, light and dark themes, several color palettes, matching app icons, and portrait and landscape on phones and tablets.

## Offline first

The Quran text, tafsir, search, azkar, local hadiths and prayer times are bundled with the app. Only three things use the network:

| Source | Used for |
| --- | --- |
| [EveryAyah](https://everyayah.com) | Quran recitation audio, saved on the device after the first play |
| [Dorar.net](https://dorar.net) | Online hadith search with authenticity grades |
| [OpenStreetMap](https://www.openstreetmap.org) | Your city name for prayer times |

## Tech stack

Expo SDK 58 · React Native 0.88 · expo-router · TypeScript · Reanimated 4 · react-native-svg · Redux Toolkit · NativeWind · i18next.
Native parts are local Expo modules in [`modules/`](modules) (Android exact adhan alarms and playback, prayer widgets, app icon switching) and an iOS widget target in [`targets/widget`](targets/widget).

## Getting started

You need Node.js, and either Android Studio tools (JDK 17 and the Android SDK) or Xcode.

```bash
npm install
npm run android   # build and run on a connected Android phone
npm run ios       # build and run on the iOS simulator
```

For the full app (native adhan playback and widgets) use a development build.
After the first build, start the dev server for it with `npm run start:dev`. `npm start` opens the app in Expo Go instead, without the native adhan and widgets.

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Start the dev server for Expo Go |
| `npm run start:clear` | Same, with a clean cache |
| `npm run start:dev` | Start the dev server for the development build |
| `npm run android` | Build a debug app and run it on a connected Android device |
| `npm run ios` | Build and run on iOS |
| `npm run build:android` | Release APK in `android/app/build/outputs/apk/release/` |
| `npm run build:aab` | Signed Google Play bundle (local EAS build) |
| `npx tsc --noEmit` | Typecheck |

The version number goes up by itself on every commit, through a git hook that `npm install` sets up.

## Project structure

```
src/app/            routes (expo-router), thin files that render a screen
src/features/       one folder per feature: azkar, hadith, quran, prayer-times, qibla, settings, favorites
src/components/     shared UI
src/store/          Redux store and slices
src/messages/       Arabic and English translations
modules/            local native modules
assets/             fonts, images, mushaf page images, adhan audio
```

[AGENTS.md](AGENTS.md) has the full conventions: where code goes, component rules, styling, performance and data notes.

## Privacy

Maab has no accounts, ads or analytics. Your settings and progress stay on your device. See the [privacy policy](https://ahmeddoban.vercel.app/maab/privacy-policy).

## Author

Built by [Ahmed Doban](https://ahmeddoban.vercel.app).
