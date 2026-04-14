/**
 * Platform registry for bundled automation scripts.
 *
 * Each entry describes one platform tab on the options page.
 * Adding a new platform requires only a new entry here plus the
 * corresponding files — no HTML or JS changes needed.
 *
 * @typedef {object} Platform
 * @property {string} id          Unique identifier (used for DOM IDs).
 * @property {string} label       Human-readable tab label.
 * @property {string} descriptionPath  Extension-relative path to an HTML fragment
 *                                     injected into the panel as descriptive content.
 * @property {string} [scriptPath]     Extension-relative path to a script file whose
 *                                     text is shown in a read-only textarea. Omit for
 *                                     platforms that don't have a script yet.
 */

/** @type {Platform[]} */
export const PLATFORMS = [
  {
    id: "windows",
    label: "Windows",
    descriptionPath: "automation-scripts/windows/description.html",
    scriptPath: "automation-scripts/windows/clipboard-yeet.ahk",
  },
  {
    id: "linux",
    label: "Linux",
    descriptionPath: "automation-scripts/linux/description.html",
  },
  {
    id: "macos",
    label: "macOS",
    descriptionPath: "automation-scripts/macos/description.html",
  },
];
