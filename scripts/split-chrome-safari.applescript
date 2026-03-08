-- =============================================
-- Split Screen: Safari (left) + Chrome (right)
--
-- Creates a new desktop space and tiles Safari
-- and Chrome side by side on it.
--
-- Requirements:
--   - Accessibility permission for the calling app
--   - macOS Sonoma or later
-- =============================================

-- Tile a window to the left half (handles both menu item variants)
on tileLeft(processName)
	tell application "System Events"
		tell process processName
			set winItems to name of every menu item of menu "Window" of menu bar 1
			if winItems contains "Move Window to Left Side of Screen" then
				click menu item "Move Window to Left Side of Screen" of menu "Window" of menu bar 1
			else if winItems contains "Tile Window to Left of Screen" then
				click menu item "Tile Window to Left of Screen" of menu "Window" of menu bar 1
			end if
		end tell
	end tell
end tileLeft

-- Tile a window to the right half (handles both menu item variants)
on tileRight(processName)
	tell application "System Events"
		tell process processName
			set winItems to name of every menu item of menu "Window" of menu bar 1
			if winItems contains "Move Window to Right Side of Screen" then
				click menu item "Move Window to Right Side of Screen" of menu "Window" of menu bar 1
			else if winItems contains "Tile Window to Right of Screen" then
				click menu item "Tile Window to Right of Screen" of menu "Window" of menu bar 1
			end if
		end tell
	end tell
end tileRight

-- STEP 1: Open Mission Control
tell application "System Events"
	key code 126 using {control down}
end tell
delay 1.5

-- STEP 2: Click "+" to create a new desktop
tell application "System Events"
	tell process "Dock"
		click button 1 of group "Spaces Bar" of group 1 of group "Mission Control"
	end tell
end tell
delay 0.8

-- STEP 3: Switch to the new desktop (last one in the bar)
tell application "System Events"
	tell process "Dock"
		set desktopButtons to every button of list 1 of group "Spaces Bar" of group 1 of group "Mission Control"
		click last item of desktopButtons
	end tell
end tell
delay 0.8

-- STEP 4: Close Mission Control
tell application "System Events"
	key code 53
end tell
delay 0.8

-- STEP 5: Open Chrome and Safari
tell application "Google Chrome"
	activate
	if (count of windows) = 0 then make new window
end tell
delay 0.5

tell application "Safari"
	activate
	if (count of windows) = 0 then make new document
end tell
delay 0.5

-- STEP 6: Tile Safari to the left half
tell application "Safari" to activate
delay 0.3
my tileLeft("Safari")
delay 0.5

-- STEP 7: Tile Chrome to the right half
tell application "Google Chrome" to activate
delay 0.3
my tileRight("Google Chrome")
delay 0.3

return "Done"
