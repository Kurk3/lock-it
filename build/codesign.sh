#!/bin/bash
set -e

APP="dist/mac-universal/Lock It.app"
ENTITLEMENTS="build/entitlements.mac.plist"
IDENTITY="-"  # ad-hoc signing

if [ ! -d "$APP" ]; then
  echo "ERROR: $APP not found. Run electron-builder first."
  exit 1
fi

echo "=== Signing Lock It.app ==="

# 1. Sign ALL Mach-O binaries inside Frameworks (inside-out)
echo "Signing all binaries inside Frameworks..."
find "$APP/Contents/Frameworks" -type f | while read -r f; do
  if file "$f" | grep -q "Mach-O"; then
    codesign --force -s "$IDENTITY" --timestamp=none "$f" 2>/dev/null && echo "  Signed: $(basename "$f")" || true
  fi
done

# 2. Sign helper apps with entitlements
echo "Signing helper apps..."
for helper in "$APP/Contents/Frameworks/Lock It Helper"*.app; do
  codesign --force --deep -s "$IDENTITY" --timestamp=none --entitlements "$ENTITLEMENTS" "$helper"
  echo "  Signed: $(basename "$helper")"
done

# 3. Sign frameworks
echo "Signing frameworks..."
for fw in "$APP/Contents/Frameworks/"*.framework; do
  codesign --force --deep -s "$IDENTITY" --timestamp=none "$fw"
  echo "  Signed: $(basename "$fw")"
done

# 4. Sign the main app with entitlements
echo "Signing main app..."
codesign --force -s "$IDENTITY" --timestamp=none --entitlements "$ENTITLEMENTS" "$APP"

# 5. Verify
echo ""
echo "=== Verifying signature ==="
codesign --verify --deep --strict "$APP" && echo "OK: Signature is valid" || echo "FAIL: Signature verification failed"

echo ""
echo "=== Done ==="
