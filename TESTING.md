# Testing facet

A checklist for trying facet on a real CachyOS machine. Most of the code has never run
on Linux, so this is where the bugs turn up. Tick what works. For what does not, note the
step, what happened and the output of the command under it.

## Before you start

```bash
facet update     # pull every module, relink, re-render the theme
facet status     # every module linked, nothing missing
```

Log out and in once after an update, so Hyprland starts the shell and its helpers anew.

Where to look when something is off:

| What | Command |
|---|---|
| the shell (bar, launcher, lockscreen, …) | `qs log`, or `qs log \| grep -i <word>` |
| helpers, services, login | `journalctl --user -b`, `journalctl -b -p warning` |
| Hyprland config errors | the red bar at the top, or `hyprctl configerrors` |
| what is installed | `facet status` |

A text console (Ctrl+Alt+F3) always lets you log in and undo things.

Report on [the board](https://github.com/orgs/facet-shell/projects/1): open an issue in the
repo of that part with the Bug form and paste the output of the command named for the item.

## 1. Install and the facet command

- [ ] On a fresh install: `curl -fsSL https://facet-shell.github.io/install.sh | bash` asks for
      full or only the shell, then the apps, the layout and the theme; only the picked modules
      are in `~/.local/share/frameshell/modules`
- [ ] `facet status` lists every module as linked; `facet add zed` gets one more
- [ ] An install from before facet: the migrate-to-facet line (its README) points every
      module at facet-shell, then `facet update` moves `modules/shell` to `modules/core` and
      fetches `modules/style-tui`; afterwards `facet status` shows quickshell, tui, hypr,
      wallpaper and gtk linked, `which frame` finds nothing, `which facet` does
- [ ] After the move the desktop looks and works exactly as before (bar, launcher, lockscreen,
      media keys, `qs ipc call player toggle`); `qs log` shows no missing types
- [ ] Login and boot screen still themed: `facet login`, `facet boot` find their files in style-tui
- [ ] `facet install --dry-run` shows the steps and changes nothing
- [ ] `facet theme set` without a name: a menu, ↑↓, typing `sa` jumps to sakura, Esc cancels
- [ ] Tab completion in a new fish: `facet th<Tab>`, `facet theme set <Tab>`
- [ ] `facet style list` shows tui as in use; `facet style tui` says "Already tui"
- [ ] `facet backup`, then `facet restore latest` puts it back
- [ ] `facet clean -n` lists every item with its size and deletes nothing; `facet clean` asks
      for each one (keep packages you use yourself)
- [ ] `pgrep -a 'hypridle|swaybg|cliphist'` prints nothing; if your own `hyprland.lua` starts
      one of them, remove that line

## 2. Bar

- [ ] On every screen: workspaces (or the canvas minimap), title, clock, media, CPU, temperature,
      RAM, volume, keyboard layout
- [ ] Hovering the clock shows a calendar; hovering the song shows a card with play/pause
- [ ] Scrolling on the volume changes it in steps of 5 %, the OSD shows it
- [ ] Media keys (Fn+F7/F8/F9): play/pause, next, previous on whatever plays; with Spotify and a
      video both open, a second play/pause goes to the same player as the first
      (`qs ipc call player toggle` does the same)
- [ ] Updates: a minute after login `↑ N` shows if there are updates; a click opens Ghostty
      with the update, afterwards the number is gone or smaller
- [ ] Hold Super for 1.5 s: the hotkey overlay, every bind named (no `__lua …`), it fits a
      1080p screen; letting go closes it
- [ ] Lock and unlock: the bar flies up and drops back in

## 3. Launcher

- [ ] Super+Space opens it on the focused screen; typing an app name finds it
- [ ] Enter on an app that already runs brings its window into view, the row says "running";
      Shift+Enter starts another one
- [ ] `= 2*21` copies 42; `> btop` runs in Ghostty; `: reboot` needs Enter twice
- [ ] `# heart`, Shift+Enter: the emoji lands in a browser text field and in Ghostty
- [ ] `/ readme` finds files in your home, not in `.cache` or `node_modules`
- [ ] `t 1m test`: after a minute a notification with sound that stays until snooze or done
- [ ] `a test <in two minutes, e.g. 14:05>`: the same for alarms, also after Super+Shift+Escape
      in between
- [ ] `? yt lofi` opens a YouTube search; `ssh <host>` opens it in Ghostty
- [ ] `c what is a tarball`, Enter: a thinking line counts seconds, the answer shows as text and
      code blocks in the launcher's size; select part of it, Ctrl+C copies that part
      - nothing comes? `claude -p hi` in a terminal must answer; then `qs log | grep -i claude`
- [ ] Ctrl+Alt+Q types an @ and Ctrl+Alt+E a € in Ghostty, in Zen, in the open launcher and in
      Vesktop; the layout in the bar stays as it is

## 4. Control center

- [ ] Super+C opens it; wi-fi, bluetooth, silent, stay awake, game mode and mic mute switch
- [ ] Reboot and off need a second click
- [ ] system: CPU with its curve, GPU, VRAM, RAM, disk and network move
- [ ] GoXLR: moving a physical fader moves it on screen, the mute buttons work from here
      - nothing? `pgrep -a goxlr-daemon` and `curl -s http://localhost:14564/api/get-devices`
- [ ] GoXLR Mini: a slider for System, the volume in the bar is that channel
- [ ] app mixer ›: every app that plays or records, with volume and mute; route Spotify to
      music, it now follows the music fader, and still does after restarting Spotify
      - no change? `pactl list short sink-inputs` before and after, and `wpctl status`
- [ ] tasks ›: running apps with CPU and memory; a running game shows as the game, not as
      Steam; close asks the window to quit, kill (second click) ends the whole app

## 5. Notifications

- [ ] `notify-send hello world`: a popup top right, its timer pauses on hover
- [ ] `notify-send -u critical test`: stays until you close it
- [ ] silent in the control center: popups stay away and count on the bell; the bell opens the
      history
- [ ] A song change in Spotify: a popup top left
- [ ] Settings → notifications → where: try every arrow with `notify-send hello world`; left:
      icon left, right: icon right, top or bottom middle: no icon, text centered; at the
      bottom the newest sits nearest the edge
- [ ] Style line and minimal: one line each; a Discord call still has accept and decline
- [ ] Spotify popup: wide, tall and strip, size 0.6× and 1.6×, every position, the cover
      mirrored like the notifications
- [ ] Discord open on the second screen, a DM arrives: no popup ("on no screen"); set "messages
      while Discord is open" to anyway: the popup comes
- [ ] Nothing shows? `busctl --user list | grep Notifications` must name `qs`, not mako, dunst
      or swaync

## 6. Lockscreen and idle

- [ ] Super+L locks, the password unlocks; the field is only on the screen you were on
- [ ] Preview then a real lock: `qs ipc call lock preview 8`, type the password, press Super+L
      within the 8 seconds; the real lock stays until you type the password again
- [ ] Idle: in the settings app set "lock when idle" to 1 min and "screens off when idle" to
      2; it locks after one minute, the screens go off after two, a key brings them back (idle
      lock is off until you set it)
- [ ] Stay awake in the control center: no idle lock while it is on
- [ ] `loginctl lock-session` locks
- [ ] `: suspend` in the launcher, wake up: the lockscreen is there at once, no flash of the
      desktop
      - nothing locks before sleep? `systemd-inhibit --list` must show a delay lock by
        facet, and `gdbus monitor --system --dest org.freedesktop.login1` must print
        `PrepareForSleep (true,)` when you suspend
- [ ] Wrong password: it says so, the right one works afterwards
      (`qs log | grep -i -e lock -e pam`)

## 7. Login and boot

- [ ] `facet login`, then `facet status` says "Login screen: facet greeter"
- [ ] Without a reboot: Ctrl+Alt+F3, log in, `sudo systemctl restart greetd`; the facet login
      shows and the password logs you in to Hyprland
      - black screen or the old login? `journalctl -b -t frame-greeter -u greetd`;
        `facet login remove` brings the distro's greeter back
- [ ] `facet login auto`, reboot: no greeter, the shell's lockscreen asks for the password; after
      a logout the greeter is there
      - an open desktop or a logout loop? `journalctl -b -t frame-start-locked`
- [ ] `facet boot`: it rebuilds the initramfs without errors and ends with `facet boot check`,
      all lines ✓ (or a warning that says what to change)
- [ ] Reboot: the splash shows while booting, a frame with "facet", a filling progress
      line and "starting"; with LUKS the password prompt is in that frame
      - nothing at boot? `facet boot check`, and send its output
- [ ] Shut down: the splash says "shutting down" and a short piece of the line sweeps back
      and forth; a restart says "restarting"
- [ ] `facet update` with an older splash installed: step "Boot splash" installs it again,
      the next one says "up to date"
- [ ] Ctrl+Alt+F3: the console has the theme's colors (`systemctl status frameshell-vtrgb`)
- [ ] With GRUB: `facet grub`, reboot, the menu is in the theme
- Back: `facet boot remove`, `facet grub remove`

## 8. Wallpapers

- [ ] After login the picture you picked is there (`hyprctl layers | grep qs-wallpaper`)
- [ ] Super+W, search and filter, pick another picture: it fades in, no black gap
- [ ] A video wallpaper plays and is not covered by a picture; video → picture → video works
      (`pgrep -a 'mpvpaper|linux-wallpaperengine'`)
- [ ] With Wallpaper Engine: a subscribed Workshop scene shows up and plays
- [ ] A screen with nothing set shows the theme's background color
- [ ] Lock and unlock: the video or scene runs again afterwards
- [ ] `facet wallpaper backend image`: only pictures in the app; `both` brings the rest back

## 9. Screenshots

- [ ] Print: drag a region, or click a window (it lights up), Enter takes the whole screen, Esc
      cancels
- [ ] Shift+Print takes the focused screen at once
- [ ] The picture is in `~/Pictures/screenshots` (your XDG pictures folder) and in the clipboard;
      the notification has open, edit, folder, delete
- [ ] Open a right-click menu, Print, drag over it: the menu is in the shot
- [ ] A video playing, Print, wait a few seconds, click: the shot shows the frame from the key
      press
- [ ] Two monitors: a region on the second one is cut from the right screen and sharp, and
      `ls $XDG_RUNTIME_DIR/frame-shot` is empty afterwards
- [ ] Nothing happens? `qs log | grep -i screenshot`

## 10. Recording and the video editor

- [ ] Super+Shift+R, drag a region: the picker is red, then `● rec 0:01` counts in the bar
- [ ] Super+Shift+R again (or a click on `● rec`): "recording saved", the file in
      `~/Videos/recordings` plays
- [ ] "copy" in the notification, paste in Discord: the video is attached
- [ ] Two channels on in the audio panel: next to the video a `.tracks` folder with one `.flac`
      per channel and `tracks.json` (`ls ~/Videos/recordings/*.tracks`)
      - no sound? `pactl list short sinks` while recording shows the mix sink
- [ ] "edit" in the notification (needs `qt6-multimedia-ffmpeg`): the video and one waveform row
      per channel; space plays with sound
- [ ] `c` at two places, click the middle piece, `del`: it is gone and playback jumps over it
- [ ] `b`, drag the box over something and play: it is blurred; "pixelate" turns it into blocks
- [ ] Drag a picture from Dolphin onto the preview, move it, pull its corner
- [ ] A channel that is off: drag "sync" until the mic matches the picture
- [ ] Mute a channel, "export": `<name>-edit.mp4` has the cuts, blur and picture and no muted
      channel (if not: the error in the inspector, or `qs log | grep -i editor`)
- [ ] Open a recording and close it without changing anything: no `.edit.json` appears
- [ ] "export & delete raw", "yes": `<name>-edit.mp4` stays, the recording and its `.tracks`
      folder are in the trash

## 11. Media app and picture editor

- [ ] Super+G: screenshots and recordings in one grid, videos with a thumbnail and their length
- [ ] Ctrl+click three, "delete 3", "yes, delete": gone from the grid, in the trash with their
      `.tracks` folders (Dolphin: trash:/)
- [ ] Drop a folder with pictures on the window: they show up; × under the grid takes it out
- [ ] Delete a recording in Dolphin, Super+G: "clean up 2 leftovers" takes its edit and tracks
- [ ] Screenshot, "edit": `b`, drag the box over a name, `c` and pull a corner, Ctrl+S:
      `<name>-edit.png` is blurred and cropped
- [ ] Dolphin, right click a picture or video: "Open with → facet editor"

## 12. Settings app

- [ ] Super+, (and "settings ›" in the control center): the window with seven sections
- [ ] look: another theme changes the whole desktop; "canvas", then "tiling"
- [ ] shell: change one value; `cat ~/.config/frameshell/shell.json` shows only that one, and
      "default" takes it out again
- [ ] launcher: Claude off, `c ` in the launcher no longer asks Claude
- [ ] sound: another output, music moves there
- [ ] apps: "add" on a missing module opens a terminal with `facet add`
- [ ] system: `facet status` opens in a terminal

## 13. Canvas layout and overview

Switch with `facet layout canvas`.

- [ ] Super+Ctrl+arrows moves the view, the minimap in the bar follows; a click on the minimap
      looks there
- [ ] A new window opens in a free spot in view; a dialog stays where its app puts it
- [ ] Super+Ctrl+G tidies into a grid, Super+Ctrl+H goes back to the start, Super+Ctrl+F is
      fullscreen on and off on the right screen
- [ ] An app started over a fullscreen window ends the fullscreen
- [ ] Super+wheel down: the overview of every monitor with live previews; the wheel zooms around
      the cursor, a click on a window goes to it, Esc goes back without changes
- [ ] In the overview: drag a window into the other screen's outline, it moves to that monitor;
      F makes the window under the cursor fullscreen, Q closes it
- [ ] Two monitors: a click on the second screen's minimap moves that screen, not the first
- [ ] `hyprctl reload`: the view stays where it was (`cat ~/.local/state/frameshell/canvas`)
- [ ] `facet layout tiling`: dialogs come back on screen, big windows tile again

## 14. Game mode and Super+Tab

- [ ] Start a Steam game: it gets its own workspace and the screen follows; after a few seconds
      "game mode on", animations and blur off, the wallpaper paused
- [ ] In the game: `notify-send hello` waits on the bell; a Steam invite, a friend request, a
      Discord DM or call still pops up (the rules' defaults); the next Spotify song does not
      - nothing happens? `hyprctl clients | grep -e class -e workspace` while it runs; a Steam
        game shows `steam_app_<number>`, other games go on the list under games in the settings app
- [ ] Settings → games: "+ Sober (Roblox)" puts it on the list; start Sober: game mode comes on
      (also GeForce NOW, or "from open windows" with the app open); ✕ takes it off again
- [ ] Super+Tab goes to the desktop and back to the game
- [ ] Two games open: Alt+Tab goes from one to the other; Enter on a running game in the
      launcher shows it
- [ ] An app started while the game is on screen opens on the desktop, and the screen follows
- [ ] Quit the game: "game mode off", everything as before
- [ ] With a GoXLR profile set under games: it is loaded while playing, the old one afterwards

## 15. Watchdog

- [ ] `pgrep -af frame-shell-watchdog` shows one
- [ ] Super+Shift+Escape: the bar is gone for a moment and comes back; a new file in
      `~/.local/state/frameshell/hangs`
- [ ] Fake a hang: `kill -STOP $(pgrep -xo qs)`; within about half a minute a new shell is up
- [ ] The same while locked (from Ctrl+Alt+F3, then back): the screen never opens, the new
      lockscreen takes the password
- [ ] Nothing restarts? `journalctl -b -t frame-shell-watchdog`

## 16. Clipboard

- [ ] `pgrep -af "wl-paste --watch"` shows `frame-clip store`
- [ ] Copy some text, then a picture (a screenshot); Super+V lists both, the picture with a
      preview
- [ ] Enter copies an entry back (paste it somewhere), Shift+Enter deletes it
- [ ] Copy the same text twice: it shows once, at the top
- [ ] A copy from a password manager (KeePassXC, Bitwarden) does not show up
- [ ] `ls ~/.cache/frameshell/clipboard` holds at most 100

## 17. Discord

- [ ] After `facet update vencord`, `~/.local/share/frameshell/vencord` has no `node_modules` and
      Vesktop has the theme and ShellBridge
- [ ] A DM while Vesktop is not focused: one shell popup with "open" (no second one from Vesktop)
- [ ] A group DM names the group; a mention in a server names server and channel
- [ ] Someone joins or leaves your voice channel: a popup; "Watch in shell" on a voice channel
      gives one with "join"
- [ ] An incoming call: accept and decline work; a call you miss turns into "call back"
- [ ] Mute in Discord: a popup with "unmute" (in a voice channel with the overlay showing: a red
      line in the overlay instead)
- [ ] Voice overlay: join a voice channel, put Discord on no screen: on the left under the bar
      everyone in it, no frame or background; who talks gets a green ring, muted and deafened
      red icons, a stream LIVE
- [ ] Someone joins or leaves: a green or grey line in the overlay that fades, no popup
- [ ] Super+Shift+M and Super+Shift+D from inside a game mute and deafen in Discord
- [ ] Super+Shift+V: a thin frame, drag it somewhere, Esc; it stays there after `qs` restarts;
      clicks go through it again
- [ ] Settings → notifications → Discord voice overlay: compact, only who talks, size, "in
      game", "never" each change it right away
- [ ] Launcher: `d` lists the last chats, `d anna` opens the DM, `d msg anna hi` sends it,
      `d call anna` rings, `d reply ok` goes to the last person you wrote to
- [ ] Nothing reaches the shell? `ls $XDG_RUNTIME_DIR/qs-discord.sock`, and Vesktop's DevTools
      (Ctrl+Shift+I) console for ShellBridge lines

## 18. Spotify

- [ ] `facet install spicetify`, restart Spotify: the theme is on
- [ ] `s daft punk`: tracks, artists, albums, playlists; the info pane says "via spotify client"
      - "via mpris"? `facet update spicetify`, restart Spotify; with `spicetify enable-devtools`
        the console must say `[facet] connected to the shell`
- [ ] Enter plays, Shift+Enter queues; `s next`, `s f 30`, `s 1:10`, `s like` do what they say
- [ ] Optional, the Web API: `facet spotify login` (see [docs/spotify.md](docs/spotify.md)), then
      `facet spotify status` prints your name

## 19. Steam

- [ ] `facet install steam`, start Steam: the Frameshell theme is on, the library in the theme's
      colors, no minimize or maximize buttons
- [ ] A friend message: the popup comes from the shell, not from Steam
- [ ] A game invite stays until handled; an achievement and a finished download show as shell
      popups
- [ ] Nothing reaches the shell? `grep "facet:" ~/.local/share/Steam/logs/console-linux.txt`
      must show `hooked BShowToast`; `facet status` says when Millennium is not hooked in

## 20. Keyboard (AULA F75)

Nothing has been sent to the board yet. Go in the order of
[docs/keyboard.md](docs/keyboard.md#install-and-first-test) and stop at the first surprise.

- [ ] `facet install keyboard`, replug: `frame-keyboard list` marks the configuration interface
- [ ] `frame-keyboard info --live` shows device id `03 00 00 00 00 cd`
- [ ] `frame-keyboard backup --live` saves to `~/.local/state/frameshell/keyboard/`
- [ ] `frame-keyboard highlight --live q w e --seconds 3` lights them, the old effect comes back
- [ ] Super+K: the map with the lighting, fn keys and colors tabs; apply one effect
- [ ] Hold Super: the keys that do something with it light up, letting go brings the effect back
- [ ] `facet theme set matcha`: the keys take the theme colors

## 21. Themes in the apps

- [ ] `facet theme set matcha`: bar, window borders and Zed change at once; a new Ghostty window
      and a new fish are green; `facet theme check` prints nothing
- [ ] GTK: pavucontrol or a file dialog (Zen → save a page) is dark, square, JetBrains Mono;
      `gsettings get org.gnome.desktop.interface color-scheme` says `'prefer-dark'`
- [ ] Zed (Super+Shift+E): the theme, the file tree on the left, Ctrl+J opens fish; language
      extensions install on the first start
- [ ] Zen (Super+B): square corners, the facet start page (clock, search); `yt lofi` in it
      searches YouTube
- [ ] Dolphin (Super+E): the theme's colors and JetBrains Mono after one logout
      (`echo $QT_QPA_PLATFORMTHEME` says `qt6ct`); "Open with" lists apps
- [ ] With a GoXLR: `facet goxlr` lights the faders and buttons in the theme

## 22. Drawing and paint

- [ ] Super+P: the toolbar at the bottom of the focused screen, the icons are symbols (no boxes);
      draw with the pen on every screen; hovering a button names it in the frame
      - nothing happens? `qs log | grep -i draw`, and `hyprctl binds | grep -A3 'key: P'` shows
        only the frame bind
- [ ] Each tool once: highlighter is see-through, line and arrow with Shift snap to 15°,
      rectangle and ellipse with Shift are square and round, text: click, type, Enter
- [ ] Eraser takes a whole stroke; Ctrl+Z brings it back, Ctrl+Shift+Z takes it again
- [ ] Ruler: drag it, wheel turns it (the degrees change), the pen along its edge is straight
- [ ] Click through: the drawing stays, a click on a window reaches it, the toolbar still works
- [ ] Super+P hides it, Super+P shows it again; Super+Shift+Escape (shell restart), Super+P:
      still there; Super+Shift+P clears it
- [ ] Canvas layout: draw an arrow at a window, drag the empty canvas (or right drag on the
      drawing): the arrow stays at the window, also while dragging
- [ ] Screenshot, "edit": the tools on the left; an arrow and a box, `v`, then a blur box still
      moves; Ctrl+S: `<name>-edit.png` has the drawing sharp, in full size and cropped with the
      rest; reopen: the drawing is still editable (in `<name>.edit.json`)
- [ ] Super+G, "new picture", "white": an empty page opens with the pen, the window says paint;
      Ctrl+S writes `~/Pictures/paintings/painting-…-edit.png`
- [ ] "facet paint" in the launcher and `qs ipc call editor paintOn clear` (transparent page)

## 23. Sound channels (with and without a GoXLR)

Without a GoXLR, before `facet audio channels on`:
- [ ] Nothing about channels anywhere: control center "sound" with the app mixer button,
      mixer with device lists, settings › sound only says how to turn them on, no GoXLR
      profile under games, no GoXLR lights under apps; `qs log` has no goxlr or audio errors
- [ ] `ls ~/.config/pipewire/pipewire.conf.d/` has no facet file; recording offers desktop and mic

`facet audio channels on`:
- [ ] PipeWire and the shell restart once; `pactl list short sinks` has facet-system,
      facet-game, facet-chat, facet-music; `pactl get-default-sink` is facet-system
- [ ] Sound still comes out of the speakers/headset; `wpctl status` shows the four as sinks
      and their `.output` streams on the real device
- [ ] Control center: channels with system, game, chat, music and output; a slider changes the
      channel only (Spotify on music gets quieter, a video on system not); mute works; OSD shows it
- [ ] Mixer: chips system/game/chat/music on every app; Spotify starts on music and Vesktop
      voice on chat by themselves; move Spotify to game, restart it: it stays on game
- [ ] A Steam game (or anything in game mode) plays on game
- [ ] Output row in the mixer (or settings › sound): pick another device, all channels move;
      after `systemctl --user restart pipewire wireplumber` they are still there
      (`grep target.object ~/.config/pipewire/pipewire.conf.d/facet-channels.conf`)
- [ ] Recording with game, chat and mic ticked: three FLAC files in `<recording>.tracks/`,
      the editor has a row each
- [ ] Unplug the output (USB headset): sound goes to another device, no feedback howl; plug it
      back: the channels go back (else pick it in the output row)
- [ ] Settings › sound › channels from "none": chips and channel faders go, plain devices
      again; "auto" brings them back
- [ ] A sink called "Music" made before (`pactl load-module module-null-sink sink_name=Music`),
      then `facet audio channels on`: says it takes it over, no facet-music
- [ ] `facet audio channels status` and `facet status` list them

`facet audio channels off`:
- [ ] Apps play on the real output again, it is the default; no facet-* sinks, no
      facet-channels.conf, no audio-channels.json or audio-routes.json in ~/.local/state/frameshell
- [ ] The shell shows no channels again

With the GoXLR (nothing may change):
- [ ] Faders, mutes, the Mini's System slider, chips on the GoXLR channels, recording tracks
      (incl. stream mix) and the game mode profile all as before; bloom's Quick tab now shows
      the GoXLR faders as meters with mutes
- [ ] The setup does not ask about virtual channels; `facet audio channels on` warns that the
      GoXLR's channels stay in use unless settings › sound says virtual

## 24. bloom: settings in categories, grouped notifications, album colors, device pages, ambient lock

Settings (Super+, in bloom):
- [ ] Left: a search box and nine categories; right: the picked category's menu, one card
      per group, each row with an icon, a line and what it is set to (theme name, "after 5 min" …)
- [ ] Click a row: the page slides in from the right with a back arrow and the category's
      name over the title; the back arrow, Esc, Backspace and Alt+Left go back; Esc on the
      menu closes the window
- [ ] Every page has what the old section had: Appearance › Colors has the theme cards and
      the album cover switch, Notifications › Discord the Discord rules, Games › Fps overlay
      the fps switch and corner, Lock screen › Ambient the new switch
- [ ] Type "weather" in the search box: the list under it shows Weather · Lock screen; Enter
      opens it, Esc clears the box; Ctrl+F focuses it
- [ ] `qs ipc call settings section sound`, `… section shell/weather`, `… section ambient`
      open the right place; Ctrl+Tab walks the categories
- [ ] Change a value on a page, go back: the row shows the new value; the round arrow on the
      row still puts it back

Grouped notifications and replies:
- [ ] Send three `notify-send -a test` in a row: one card with two cards peeking under it and
      "+2"; click "+2": the three unfold, click again: they fold back
- [ ] Let the front card expire: the next one springs to the front with a fresh time line
- [ ] A notification from another app in between sits on its own stack
- [ ] Popups style line and minimal: "+2" in the row, a click opens the stack
- [ ] Game mode with compact on: the pill shows "+2", nothing unfolds
- [ ] The bell: one row per app with "+2", click unfolds, the action buttons still work
- [ ] A Discord DM (Vesktop with ShellBridge): the card has "reply" and "open"; reply, type,
      Enter: "sent" shows, the card closes, Discord has the message. If typing does not reach
      the field, click into it once (then note it: the window needs exclusive keyboard focus)
- [ ] With the reply field open the card does not expire; Esc closes the field
- [ ] Settings › Notifications › Groups and replies both off: no stacks, no reply action

Ambient lock screen (Settings › Lock screen › Ambient on, 1 min):
- [ ] `qs ipc call lock preview 100`, hands off for a minute: the clock shrinks and goes
      dim, date, pill and hint fade, the blur goes full, weather, music and notes stay dimmer
- [ ] Wait another 30–60 s: the clock glides to a nearby spot over a few seconds
- [ ] Move the mouse: everything is back in half a second, the clock glides home
- [ ] Lock for real, wait, type the password straight away: the first key wakes the screen
      and counts as the first dot; Enter unlocks with the normal animation
- [ ] Two monitors: both deepen; the mouse on the other monitor wakes both
- [ ] Animations off: it dims at once, the clock never drifts

Album colors (Settings › Appearance › Colors › "Colors from the album cover", on by default):
- [ ] A song with a colorful cover: the Spotify bloom's pill, progress line and play button take
      the cover's hue, title and artist stay the theme's text; the dashboard's media card and
      the lockscreen's music (`qs ipc call lock preview 10`) show the same accent
- [ ] Skip to a song with a very different cover: the colors crossfade, no snap to the theme
- [ ] A black-and-white cover: everything is the theme's colors again
- [ ] The switch off: all three fade back to the theme; `hyprctl layers` has no qs-album-color
- [ ] `facet theme set <other>` while a song plays: the accent retones to the new surface
- [ ] `qs log` has no Canvas or getImageData errors across a few songs; if the colors never
      come (the sampler window may not paint on Hyprland), note it: there is a fallback through
      `magick` for local covers only, Spotify's covers are https

Device pages in the control center:
- [ ] Network, Bluetooth and Mic mute tiles have a divider and a chevron; the volume slider
      ends in a round chevron button; a desktop without Wi-Fi has no chevron on Network
- [ ] The left part of the Network tile toggles the radio; the chevron (or a right click)
      slides the Wi-Fi page in, the tiles leave left, the drawer height glides; Esc goes back
      to the tiles, Esc again closes the drawer
- [ ] Wi-Fi page: the connected network first with "connected" and a disconnect button;
      rescan refreshes; the header switch off shows "Wi-Fi is off", on brings the list back
- [ ] Click a known network: it connects; an unknown secured one opens a password field in
      the row, a wrong password shows nmcli's error and reopens the field, the right one
      connects. If typing does not reach the field, note it (the drawer may need exclusive
      keyboard focus for it)
- [ ] Bluetooth page: a paired headset connects and disconnects by click, battery in the row;
      "Pair a new device" runs discovery, a phone in pairing mode shows up and pairs by click
- [ ] Mic mute chevron: the input list, picking a microphone moves the check and Settings ›
      Sound › Input agrees; volume chevron: the output list, picking a device moves the sound
- [ ] Close the drawer with a page open, reopen: the tiles are back

Stream viewers in the voice overlay (Go Live):
- [ ] In a voice channel with a friend, start Go Live: nothing new yet, no line, no notification
- [ ] The friend watches the stream: an eye with 1 next to your own entry, in the list look
      their small face beside it, the feed says "name is watching your stream"
- [ ] Looks compact and talking, and the in-game pill: only the eye and the count
- [ ] Feed set to notification or both: the line comes as a dc.voice notification ("1 watching")
- [ ] The friend stops watching: "name stopped watching", the eye goes at zero
- [ ] Stop the stream while someone watches: the eye goes, no "stopped watching" line
- [ ] Restart the shell while live with a viewer: eye and count are back once the plugin reconnects
- [ ] If the eye never appears: Vesktop's console (Ctrl+Shift+I) for a "[ShellBridge] stream state
      unavailable" warning, then Discord renamed its streaming store
