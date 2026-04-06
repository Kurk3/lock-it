#!/bin/bash
set -e

APP_NAME="Lock It"
VERSION="1.0.0"
DMG_DIR="dist/dmg-staging"
DMG_TEMP="dist/${APP_NAME}-temp.dmg"
OUTPUT="dist/${APP_NAME}-${VERSION}.dmg"
VOLUME_NAME="Install ${APP_NAME}"

# Clean
rm -rf "$DMG_DIR" "$DMG_TEMP" "$OUTPUT"

# Stage: app + Applications symlink
mkdir -p "$DMG_DIR"
cp -R "dist/mac-universal/${APP_NAME}.app" "$DMG_DIR/${APP_NAME}.app"
ln -s /Applications "$DMG_DIR/Applications"

# Remove resource forks
find "$DMG_DIR" -name '._*' -delete 2>/dev/null || true
dot_clean "$DMG_DIR" 2>/dev/null || true

# Verify codesign
echo "Verifying app signature..."
codesign --verify --deep --strict "$DMG_DIR/${APP_NAME}.app" || { echo "ERROR: App signature invalid."; exit 1; }

# Create writable DMG first (so we can style it)
echo "Creating DMG..."
hdiutil create -volname "$VOLUME_NAME" \
  -srcfolder "$DMG_DIR" \
  -ov -format UDRW \
  "$DMG_TEMP"

# Mount it
MOUNT_DIR=$(hdiutil attach -readwrite -noverify "$DMG_TEMP" | grep '/Volumes/' | tail -1 | sed 's/.*\(\/Volumes\/.*\)/\1/' | xargs)
echo "Mounted at: $MOUNT_DIR"

# Style the DMG window with AppleScript
echo "Styling DMG window..."
osascript << APPLESCRIPT
tell application "Finder"
  tell disk "$VOLUME_NAME"
    open
    set current view of container window to icon view
    set toolbar visible of container window to false
    set statusbar visible of container window to false
    set bounds of container window to {100, 100, 640, 480}
    set theViewOptions to icon view options of container window
    set arrangement of theViewOptions to not arranged
    set icon size of theViewOptions to 100
    set background color of theViewOptions to {65535, 65535, 65535}
    set position of item "${APP_NAME}.app" of container window to {130, 200}
    set position of item "Applications" of container window to {410, 200}
    close
    open
    update without registering applications
    delay 2
    close
  end tell
end tell
APPLESCRIPT

# Unmount
hdiutil detach "$MOUNT_DIR" -quiet

# Convert to compressed read-only DMG
hdiutil convert "$DMG_TEMP" -format UDZO -o "$OUTPUT"

# Clean
rm -rf "$DMG_DIR" "$DMG_TEMP"

echo ""
echo "=== DMG installer ready: $OUTPUT ==="
