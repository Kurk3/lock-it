-- =============================================
-- Workspace Layout
--
-- Desktop 1: Notes (maximized or fullscreen)
-- Desktop 2: Safari (left) + Chrome (right)
--
-- Closes apps first, creates a new desktop,
-- tiles Chrome + Safari side by side, then
-- goes back and opens Notes.
--
-- Config: set notesFullscreen to true for macOS
-- fullscreen, or false to just maximize the window.
--
-- Requirements:
--   - Accessibility permission for the calling app
--   - macOS Sonoma or later
-- =============================================

-- Get screen size for window positioning
tell application "Finder"
	set screenBounds to bounds of window of desktop
	set screenW to item 3 of screenBounds
	set screenH to item 4 of screenBounds
end tell
set halfW to screenW / 2

-- CONFIG: true = macOS fullscreen, false = maximized window
set notesFullscreen to false

-- STEP 1: Close apps and wait until they're actually gone
tell application "System Events"
	set runningApps to name of every process
end tell

if runningApps contains "Google Chrome" then tell application "Google Chrome" to quit
if runningApps contains "Safari" then tell application "Safari" to quit
if runningApps contains "Notes" then tell application "Notes" to quit

repeat 20 times
	delay 0.3
	tell application "System Events"
		set stillRunning to name of every process
	end tell
	if stillRunning does not contain "Google Chrome" and stillRunning does not contain "Safari" and stillRunning does not contain "Notes" then exit repeat
end repeat
delay 0.5

-- STEP 2: Open Mission Control
tell application "System Events"
	key code 126 using {control down}
end tell
delay 2.5

-- STEP 3: Count existing desktops — reuse one if available, otherwise create new
tell application "System Events"
	tell process "Dock"
		set allButtons to every button of list 1 of group "Spaces Bar" of group 1 of group "Mission Control"
		set desktopButtons to {}
		repeat with b in allButtons
			if name of b starts with "Desktop" then
				set end of desktopButtons to b
			end if
		end repeat

		-- If only 1 desktop exists, create a new one
		if (count of desktopButtons) < 2 then
			click button 1 of group "Spaces Bar" of group 1 of group "Mission Control"
			delay 0.8
			-- Re-scan to find the new desktop
			set allButtons to every button of list 1 of group "Spaces Bar" of group 1 of group "Mission Control"
			set desktopButtons to {}
			repeat with b in allButtons
				if name of b starts with "Desktop" then
					set end of desktopButtons to b
				end if
			end repeat
		end if

		-- Click the last desktop (reuse existing or switch to new)
		click last item of desktopButtons
	end tell
end tell
delay 0.8

-- STEP 4: Close Mission Control
tell application "System Events"
	key code 53
end tell
delay 1

-- STEP 5: Open Safari on the left half
tell application "Safari"
	activate
end tell
delay 1
tell application "Safari"
	if (count of windows) = 0 then make new document
	set bounds of window 1 to {0, 25, halfW, screenH}
end tell
delay 0.3

-- STEP 6: Open Chrome on the right half
tell application "Google Chrome"
	activate
end tell
delay 1
tell application "Google Chrome"
	if (count of windows) = 0 then make new window
	set bounds of window 1 to {halfW, 25, screenW, screenH}
end tell
delay 0.3

-- STEP 7: Go back to Desktop 1 and open Notes
tell application "System Events"
	key code 123 using {control down}
end tell
delay 1

tell application "Notes"
	activate
end tell
delay 1

-- Make sure Notes has a window
tell application "System Events"
	tell process "Notes"
		if (count of windows) = 0 then
			keystroke "n" using {command down}
			delay 0.5
		end if
	end tell
end tell

if notesFullscreen then
	-- macOS fullscreen (creates its own space)
	tell application "System Events"
		key code 3 using {control down, command down}
	end tell
else
	-- Maximized window (fills screen but stays a normal window)
	tell application "Notes"
		set bounds of window 1 to {0, 25, screenW, screenH}
	end tell
end if
delay 0.5

return "Done"
