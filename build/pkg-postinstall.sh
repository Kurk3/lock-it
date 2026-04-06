#!/bin/bash
# Post-install: prepare app for first launch

# Remove quarantine so Gatekeeper doesn't block
xattr -cr "/Applications/Lock It.app" 2>/dev/null

# Reset old Accessibility permission (forces re-prompt on next launch)
# This is needed because ad-hoc signing changes the code signature each build,
# which invalidates the old Accessibility permission entry
tccutil reset Accessibility com.lockit.app 2>/dev/null

exit 0
