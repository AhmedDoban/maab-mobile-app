#!/bin/sh
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT" || exit 1

VERSION=$(node -p "require('./app.json').expo.version")
OUT_DIR="$ROOT/android/app/build/outputs/bundle/release"
OUT="$OUT_DIR/maab-$VERSION.aab"
mkdir -p "$OUT_DIR"

eas build --platform android --profile production --local --non-interactive --output "$OUT"
status=$?

if [ $status -eq 0 ]; then
  open "$OUT_DIR"
fi
exit $status
