# Store screenshots

Put 8 phone screenshots of the app here (PNG or JPG, full screen, portrait), named exactly:

| File | Screen | Theme | Language |
| --- | --- | --- | --- |
| `home-dark-en` | Home (Azkar) | Dark | English |
| `home-light-ar` | Home (Azkar) | Light | Arabic |
| `mushaf-page` | Quran reader, any page (e.g. Al Imran) | Light | Arabic |
| `hadith-dark-en` | Hadith | Dark | English |
| `quran-light-ar` | Quran list | Light | Arabic |
| `quran-dark-en` | Quran list | Dark | English |
| `fatiha-light` | Quran reader, Al-Fatiha | Light | Arabic |
| `qibla-dark-en` | Qibla | Dark | English |

Then run:

```bash
npm run store:screenshots
```

It writes `google-play-screenshots/` (5 slides at 1080×1920, `feature-graphic.png` at 1024×500, the panorama) and `app-store-screenshots/` (5 slides at 1320×2868, the panorama). Captions and the phone layout are in the script.
