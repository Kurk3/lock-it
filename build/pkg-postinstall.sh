#!/bin/bash
# Post-install: remove quarantine so the app launches without Gatekeeper block
xattr -cr "/Applications/Lock It.app" 2>/dev/null
exit 0
