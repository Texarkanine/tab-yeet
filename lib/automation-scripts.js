/**
 * Bundled automation snippets for the options page (platform-specific helpers).
 */

/** Official AutoHotkey v2 language and API reference. */
export const AUTOHOTKEY_V2_DOCS_URL = "https://www.autohotkey.com/docs/v2/";

/**
 * AutoHotkey v2 script: send each non-empty clipboard line as its own message
 * into the focused window (Ctrl+Alt+Shift+V).
 */
export const WINDOWS_CLIPBOARD_YEET_AHK = `; Clipboard Yeet — AutoHotkey v2
; Sends each line from clipboard as a separate message into the focused window.
; 
; Usage:
;   1. Copy URLs (e.g. via Tab Yeet)
;   2. Focus the target chat window (Telegram, Signal, whatever)
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

    lines := StrSplit(content, "\`n", "\`r")
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
`;
