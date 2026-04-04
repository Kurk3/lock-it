#!/bin/bash
set -e

APP="dist/mac-universal/Lock It.app"
ENTITLEMENTS="build/entitlements.mac.plist"
IDENTITY="-"  # ad-hoc signing (no Apple Developer account needed)

if [ ! -d "$APP" ]; then
  echo "ERROR: $APP not found. Run electron-builder first."
  exit 1
fi

echo "=== Signing Lock It.app ==="

# 1. Sign all individual binaries and dylibs inside frameworks
echo "Signing binaries inside frameworks..."
find "$APP/Contents/Frameworks" -type f \( -name "*.dylib" -o -perm +111 \) -not -name "*.plist" -not -name "*.json" -not -name "*.pak" -not -name "*.dat" -not -name "*.bin" -not -name "*.png" -not -name "*.icns" -not -name "*.lproj" | while read -r binary; do
  # Only sign Mach-O binaries
  if file "$binary" | grep -q "Mach-O"; then
    codesign --force -s "$IDENTITY" --timestamp=none "$binary" 2>/dev/null && echo "  Signed: $(basename "$binary")" || true
  fi
done

# 2. Sign frameworks
echo "Signing frameworks..."
for fw in "$APP/Contents/Frameworks/"*.framework; do
  codesign --force -s "$IDENTITY" --timestamp=none "$fw"
  echo "  Signed: $(basename "$fw")"
done

# 3. Sign helper apps with entitlements
echo "Signing helper apps..."
for helper in "$APP/Contents/Frameworks/Lock It Helper"*.app; do
  codesign --force -s "$IDENTITY" --timestamp=none --entitlements "$ENTITLEMENTS" "$helper"
  echo "  Signed: $(basename "$helper")"
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
