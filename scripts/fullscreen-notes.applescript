-- =============================================
-- Fullscreen Notes
--
-- Opens Notes and enters macOS fullscreen mode.
-- This automatically creates its own desktop space.
--
-- Requirements:
--   - Accessibility permission for the calling app
--   - macOS Sonoma or later
-- =============================================

tell application "Notes"
	activate
end tell
delay 1

-- Enter fullscreen via keyboard shortcut (Ctrl+Cmd+F)
tell application "System Events"
	key code 3 using {control down, command down}
end tell
delay 0.5

return "Done"
