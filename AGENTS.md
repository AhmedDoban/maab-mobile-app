# Maab — project instructions

Arabic/English Islamic app: azkar, hadith, Quran mushaf, prayer times with adhan, qibla.
Expo SDK 57, expo-router, React Native 0.86, Reanimated 4, react-native-svg, Redux Toolkit, NativeWind v5, i18next.

## Commands

- Typecheck (the required check after every change): `npx tsc --noEmit`
- Format touched files: `npx prettier --write <files>`
- Dev server for Expo Go: `npm start` (`npm run start:clear` clears the cache). The local native modules are optional, so in Expo Go the native adhan, widgets and Android icon switching are simply off. Dev server for the development build installed by `npm run android`: `npm run start:dev`
- Run on a connected Android phone: `npm run android` (sets JAVA_HOME/ANDROID_HOME, lists devices with adb, then builds a debug app with `expo run:android --device`)
- Android release APK: `npm run build:android` (output: `android/app/build/outputs/apk/release/maab.apk`)
  - If `android/` is missing it runs `expo prebuild` first. `npm run build:android -- --clean` regenerates it from scratch (needed after changing `app.json`, plugins or native modules).
- Google Play bundle: `npm run build:aab` (EAS local build signed with the EAS upload key, output: `android/app/build/outputs/bundle/release/maab-<version>.aab`). Upload this one to Play, never the `build:android` output (debug-signed).
- Don't run web exports or screenshot checks unless asked.
- Never run `git commit`, `git push` or anything else that creates commits or sends code to GitHub, even when asked with a short "git commit". The owner commits and pushes themselves. Every time a commit is requested, reply with a summary of the uncommitted changes (grouped by feature/fix, with the main files) and a ready-to-paste commit message, and leave the actual commit to the owner.
- Packages: install with `npm install <pkg>` (Expo packages with `npx expo install <pkg>`). Run `npm audit` after changing dependencies and fix with `npm audit fix` only. Never `npm audit fix --force` — it downgrades Expo. Pin patched transitive versions through `overrides` in package.json, and only after checking the dependent still loads (ESM-only versions break `require()` callers).

## Folder structure

```
src/
  app/                 expo-router routes only — thin files that render a feature screen
  features/<feature>/  one folder per feature (azkar, hadith, quran, prayer-times, qibla, settings, favorites)
    <Screen>.tsx       top-level screens used by routes (e.g. QuranHome.tsx, SurahReader.tsx)
    _ui/               the feature's presentational components
    _components/       the feature's hooks and non-visual helpers (useX.ts, caches, loaders)
    _data/             static data (JSON) and pure functions over it
    _sections/         (settings only) one file per settings page
  components/          shared, feature-agnostic components
    ui/                primitives (see "Shared components" below)
    hero/              page hero, compact header, search field
    theme/             ThemeProvider and theme context
  hooks/               shared hooks (useThemeColors, useDirection, ...)
  store/               Redux store, slices (Slices/), persistence, RTK Query base
  messages/{ar,en}/    translation JSON per namespace (common, azkar, hadith, prayer, qibla, settings)
  constants/           palettes, colors, static config
  lib/                 generic utilities
modules/               local Expo native modules (adhan-alarm: Android exact alarms + full-screen adhan)
plugins/               Expo config plugins (referenced from app.json)
scripts/               build scripts (Android run/APK, Play bundle, version bump, mushaf page images)
.githooks/             git hooks (pre-commit runs the version bump)
assets/                fonts, images, mushaf page images (assets/images/mushaf), surah frames
```

### Where new code goes

- A new route: a file in `src/app/(group)/` that only imports and renders a screen from `src/features`. No logic or components inside `src/app`.
- UI used by one feature: `src/features/<feature>/_ui/`.
- UI used by two or more features: `src/components/ui/` (or the matching `src/components/` subfolder).
- A hook: `_components/` in its feature, or `src/hooks/` if shared.
- Pure logic and data: `_data/` in its feature, or `src/lib/` if generic.
- App state that persists: a slice in `src/store/Slices/`. Persistence is automatic for Settings and Azkar slice actions.

## Shared components (`src/components/ui`)

| Component | Use for |
| --- | --- |
| `AppText` | All text (`variant="quran"` for Quran, `weight`, `arabic`) |
| `Icon` | All icons (`IconKey` names) |
| `PressableScale` | Every pressable with the press-scale animation |
| `BottomSheet` | Any sheet that slides up (drag to close, backdrop fade, safe area) |
| `SheetHeader` | Title + close button row for sheets |
| `Dialog` | Centered popup with dimmed backdrop (confirmations, pickers) |
| `NoInternetDialog` | Offline popup (Lottie + open network settings). Check with `src/lib/isOnline` before network-only actions |
| `ContentActions` | Share / copy / save row on zikr and hadith cards |
| `IconCircle` | Round icon badge |
| `BrandCardBackground` | Palette gradient background for hero-style cards |
| `ContentColumn` | The centered, width-capped content column (`max-w-3xl`) that also keeps clear of the notch in landscape. Use it (or `useContentColumn()` as a style) instead of a raw `w-full max-w-3xl self-center` view |
| `EmptyState`, `Skeleton`, `SectionTitle`, `OrnamentHeading`, `Screen`, `PageHeader` | Empty lists, loading placeholders, headings, screen shells |

Shared hooks live in `src/hooks` (`useThemeColors`, `useDirection`, `useCompactHero`, `useStatusBarStyle`, `useTabBarSpace`...). Feature-level reusable pieces stay in the feature (e.g. `settings/_ui/SelectableCard`, `settings/_ui/SettingsCard`, `quran/_components/useLocalDigits`).

## Component rules

- One component per file. The file name is the component name (`ZikrCard.tsx` exports `ZikrCard`). No inner or helper components in the same file — give each its own file.
- Default export the component. Hooks are `useX.ts` files with one default-exported hook.
- Reuse before writing: check `src/components/ui` first (BottomSheet, Dialog, SheetHeader, PressableScale, AppText, Icon, EmptyState, ...). Extract a shared component as soon as the same UI appears twice.
- Keep components presentational. Data loading, selectors and side effects go in hooks.
- Props: typed inline or as a `Props` type, no `any`. Keep the prop surface small and explicit.

## Style and code conventions

- Match the surrounding code. No code comments.
- Styling uses NativeWind `className` with theme tokens (`bg-main-bg`, `text-main`, `text-main-gray`, `border-line`...). Use `style` for dynamic values.
- Exception: on components wrapping native views that don't receive className on Android (e.g. `GestureHandlerRootView` inside a `Modal`), use an explicit `style`.
- Colors come from `useThemeColors()` / feature color hooks (`useMushafColors`, `usePopupColors`, `useSettingsColors`). Never hardcode palette colors. Theme must work in light, dark and all palettes.
- Text: use `AppText`, never raw `Text`. Quran text uses `variant="quran"`.
- All user-visible strings go through i18next (`useTranslation("<namespace>")`). Add keys to both `src/messages/ar/*.json` and `src/messages/en/*.json`. Arabic needs plural forms `_zero/_one/_two/_few/_many/_other`.
- The app is RTL-first. Use `useDirection()` for direction-aware layout, and render Arabic digits with `toArabicDigits` when the locale is Arabic.
- Popups: bottom sheets use `src/components/ui/BottomSheet`. Centered confirmations use `Dialog` / `ResetDialog`. Don't use system `Alert`.
- Haptics: only on meaningful actions (settings choices, zikr counter, favorites, copy, reset dialogs, prayer reminder). Never on navigation, tabs or page swipes.

## Performance rules

- `memo` list items and anything rendered many times. Pass stable props: `useCallback` handlers and `useMemo` objects for memoized children.
- Redux selectors return primitives or use `shallowEqual`. Never select a whole slice.
- Animations and scroll tracking run on the UI thread (Reanimated shared values, `useAnimatedScrollHandler`). Cross to JS with `scheduleOnRN` only when a value changes.
- Long lists use `FlatList` (virtualized), not `ScrollView` + `map`.
- Large JSON is loaded lazily (`require` inside a function, cached in a module variable), not at import time.
- Don't add timers or clocks per component. Reuse the shared prayer clock in `usePrayerSchedule`.

## Versioning

- The version bumps automatically on every commit through `.githooks/pre-commit` → `scripts/bump-version.js`. It updates `version` in `app.json`, `package.json` and `package-lock.json`, and stages them. Build numbers (`android.versionCode`, `ios.buildNumber`) are not in `app.json`: EAS keeps them remotely (`appVersionSource: "remote"`) and increments them on every production build.
- Level is chosen from the staged changes:
  - **none:** only docs, `.gitignore`, editor/hook files or the lockfile changed.
  - **minor:** a new route in `src/app`, a new feature screen (`src/features/<feature>/<Screen>.tsx`), a new native module, or a new dependency.
  - **patch:** anything else.
  - **major:** never automatic — commit with `BUMP=major git commit ...`. `BUMP=patch|minor|none` also overrides.
- If the version in `app.json` was already changed in the commit, the hook leaves it alone.
- The hook is installed by `npm install` (the `prepare` script sets `core.hooksPath`). Don't edit version numbers by hand unless releasing a major.

## Feature notes

- **Mushaf:** the source pages are SVGs kept outside the repo in `~/Desktop/maab-unused-assets/mushaf-source` (`pages/NNN.svg` plus `titles.json`; set `MUSHAF_SOURCE` to use another folder; do not edit them). `node scripts/render-mushaf-pages.mjs` (needs `cwebp`) renders each page's text to a transparent lossless WebP in `assets/images/mushaf/NNN.webp` and writes `_data/chunks/pageMeta/NNN.json` (viewBox, ayah markers, title frames) plus `_data/pageImages.ts`; run it again only if the SVGs change. The reader draws three layers per page: `PageUnderlay` (ayah colors, wird, bookmark, highlight, surah frames), the text image through `expo-image` tinted with the mushaf ink color, and `PageMarkers` (ayah markers in the accent color). Ayah highlight and long-press hit testing use the per-page ayah boxes in `src/features/quran/_data/chunks/ayahBoxes/NNN.json`. The large Quran data lives in chunks under `_data/chunks/`: ayah text, English translation and the Muyassar tafsir per surah (`text/`, `translation/`, `muyassar/`, `001`–`114`), ayah boxes per page (`ayahBoxes/`, `001`–`604`). Each folder has an `index.ts` of lazy loaders (`() => require("./NNN.json")`); load only the chunk you need and cache it, never the whole folder (except English search, which needs every translation chunk). The page footer's hizb-quarter label reads `_data/pageQuarters.json` (one number per page, the quarter that starts on the page).
- **Azkar data:** one file per category in `src/features/azkar/_data/adhkar/<categoryId>.ts`, loaded on demand by `getItems` in `_data/index.ts`. Each item has `ar` and `en` blocks (`title?`, `prefix`, `text`, `suffix`, `virtue`, `source`) and a `count`. Category metadata and progress goals (`{ id, count }` per item) live in `_data/categories.ts` so the home screen never loads the texts — when adding, removing or changing the count of an item, update its goal there too. A new category needs a loader line in `_data/index.ts`.
- **Hadith data:** `src/features/hadith/_data/hadiths/partN.ts` (50 per file, `ar`/`en` blocks), with the ordered ids in `hadithIds.ts`. Parts load on demand (`getHadithAt`, `getHadith`, `getHadiths`).
- **Language:** Arabic mode shows only Arabic and English mode only English. Only the mushaf pages stay Arabic in both; elsewhere an ayah shows its English translation in English mode.
- **Offline first:** Quran text, tafsir (Muyassar), search, azkar, local hadiths and prayer times are bundled. Only recitation audio (everyayah.com, cached on device by `audioCache`), Dorar hadith search (cached in AsyncStorage) and the city name lookup use the network.
- **Prayer alerts:** on Android they go through the native `modules/adhan-alarm` (exact alarm + full-screen intent that opens the adhan popup). iOS uses expo-notifications. Native changes need a new build.
- **Android folder:** `android/` and `ios/` are generated and git-ignored. Put native config in `app.json` or a plugin in `plugins/`, never only in `android/`.
