; Clipboard Yeet — AutoHotkey v2
; Sends each line from clipboard as a separate message into the focused window.
; 
; Usage:
;   1. Copy URLs (e.g. via Tab Yeet)
;   2. Focus the target chat window (Telegram, Signal, Discord, whatever)
;   3. Press Ctrl+Alt+Shift+V
;   4. Press Escape to abort a send (the script exits; re-run it to restore the hotkey)
;
; Adjust DELAY_MS if messages arrive too fast or get swallowed.

DELAY_MS := 400
sending := false

#HotIf sending
Esc::ExitApp
#HotIf

^!+v:: {
    content := A_Clipboard
    if (content = "") {
        ToolTip("Clipboard is empty")
        SetTimer(() => ToolTip(), -1500)
        return
    }

    global sending := true
    lines := StrSplit(content, "`n", "`r")
    count := 0

    for line in lines {
        line := Trim(line)
        if (line = "")
            continue
        SendText(line)
        Send("{Enter}")
        count++
        Sleep(DELAY_MS)
    }

    sending := false

    ToolTip("Sent " count " lines")
    SetTimer(() => ToolTip(), -2000)
}
