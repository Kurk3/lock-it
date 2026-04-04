#!/bin/bash
set -e

APP_NAME="Lock It"
VERSION="1.0.0"
PKG_DIR="dist/pkg-staging"
SCRIPTS_DIR="dist/pkg-scripts"
OUTPUT="dist/${APP_NAME}-${VERSION}.pkg"

# Clean
rm -rf "$PKG_DIR" "$SCRIPTS_DIR" "$OUTPUT"

# Stage using ditto (handles Electron symlinks and extended attrs properly)
mkdir -p "$PKG_DIR"
ditto "dist/mac-universal/${APP_NAME}.app" "$PKG_DIR/${APP_NAME}.app"

# Post-install script (removes quarantine after install)
mkdir -p "$SCRIPTS_DIR"
cp build/pkg-postinstall.sh "$SCRIPTS_DIR/postinstall"
chmod +x "$SCRIPTS_DIR/postinstall"

# Verify codesign before packaging
echo "Verifying app signature..."
codesign --verify --deep --strict "$PKG_DIR/${APP_NAME}.app" || { echo "ERROR: App signature invalid. Run build:mac first."; exit 1; }

# Build pkg — contents of PKG_DIR go into /Applications
pkgbuild \
  --root "$PKG_DIR" \
  --scripts "$SCRIPTS_DIR" \
  --identifier "com.lockit.app" \
  --version "$VERSION" \
  --install-location "/Applications" \
  "$OUTPUT"

# Clean staging
rm -rf "$PKG_DIR" "$SCRIPTS_DIR"

echo ""
echo "=== PKG installer ready: $OUTPUT ==="
