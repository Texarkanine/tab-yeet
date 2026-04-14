; Clipboard Yeet — AutoHotkey v2
; Sends each line from clipboard as a separate message into the focused window.
; 
; Usage:
;   1. Copy URLs (e.g. via Tab Yeet)
;   2. Focus the target chat window (Telegram, Signal, Discord, whatever)
;   3. Press Ctrl+Alt+Shift+V
;
; Adjust DELAY_MS if messages arrive too fast or get swallowed.

DELAY_MS := 400

^!+v:: {
    content := A_Clipboard
    if (content = "") {
        ToolTip("Clipboard is empty")
        SetTimer(() => ToolTip(), -1500)
        return
    }

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

    ToolTip("Sent " count " lines")
    SetTimer(() => ToolTip(), -2000)
}
