import { formatTabs, FORMAT_ORDER, FORMAT_LABELS } from "../lib/formats.js";
import { loadFormatPreference, loadRules, saveFormatPreference } from "../lib/storage.js";
import { transformUrls } from "../lib/transforms.js";

/**
 * Sort tabs by visual order (index ascending).
 * @param {browser.tabs.Tab[]} tabs
 * @returns {browser.tabs.Tab[]}
 */
export function sortTabsByWindowOrder(tabs) {
  return [...tabs].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
}

/**
 * Indices whose post-transform URL duplicates an earlier tab (first wins).
 * @param {string[]} transformedUrls
 * @returns {Set<number>}
 */
export function detectDuplicates(_tabs, transformedUrls) {
  const first = new Map();
  const out = new Set();
  transformedUrls.forEach((url, i) => {
    if (first.has(url)) out.add(i);
    else first.set(url, i);
  });
  return out;
}

/**
 * Clipboard write: prefers `navigator.clipboard`, falls back to `execCommand`.
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

/**
 * Build clipboard text for checked tab subset.
 * @param {Array<{ title?: string, url?: string }>} tabsSubset
 * @param {Array<{ pattern: string, replacement: string, enabled?: boolean }>} rules
 * @param {string} formatKey
 * @returns {string}
 */
export function buildCopyText(tabsSubset, rules, formatKey) {
  const urls = tabsSubset.map((t) => t.url ?? "");
  const transformed = transformUrls(urls, rules);
  const rows = tabsSubset.map((t, i) => ({
    title: t.title ?? "",
    url: transformed[i] ?? "",
  }));
  return formatTabs(rows, formatKey);
}

/**
 * @returns {Promise<browser.tabs.Tab[]>}
 */
export async function loadTabs() {
  const tabs = await browser.tabs.query({ currentWindow: true });
  return sortTabsByWindowOrder(tabs);
}

/**
 * @param {HTMLElement} root
 * @param {boolean} success
 * @param {string} [message]
 */
export function showFeedback(root, success, message = "") {
  root.textContent = message;
  root.classList.remove("success", "error");
  if (success) root.classList.add("success");
  else if (message) root.classList.add("error");
}

/**
 * @param {HTMLSelectElement} select
 */
export function populateFormatSelect(select) {
  select.innerHTML = "";
  for (const key of FORMAT_ORDER) {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = FORMAT_LABELS[key] ?? key;
    select.appendChild(opt);
  }
}

const state = {
  /** @type {browser.tabs.Tab[]} */
  tabs: [],
  /** @type {string[]} */
  transformed: [],
  /** @type {Awaited<ReturnType<typeof loadRules>>} */
  rules: [],
  /** @type {string} */
  formatKey: "plain",
};

/**
 * @param {HTMLUListElement} list
 * @param {browser.tabs.Tab[]} tabs
 * @param {string[]} transformed
 */
export function renderTabList(list, tabs, transformed) {
  list.innerHTML = "";
  const duplicate = detectDuplicates(tabs, transformed);
  tabs.forEach((tab, i) => {
    const li = document.createElement("li");
    li.className = "tab-row";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = !duplicate.has(i);
    cb.dataset.index = String(i);
    const label = document.createElement("label");
    const titleEl = document.createElement("div");
    titleEl.className = "title";
    titleEl.textContent = tab.title || tab.url || "(untitled)";
    const urlEl = document.createElement("div");
    urlEl.className = "url";
    const displayUrl = tab.url ?? "";
    urlEl.textContent = displayUrl;
    label.append(titleEl, urlEl);
    label.title = `${tab.title ?? ""}\n${displayUrl}`;
    label.setAttribute("for", `tab-cb-${i}`);
    cb.id = `tab-cb-${i}`;
    li.append(cb, label);
    list.appendChild(li);
  });
}

/**
 * @param {HTMLSelectElement} formatSelect
 * @param {HTMLButtonElement} copyBtn
 * @param {HTMLButtonElement} optionsBtn
 * @param {HTMLUListElement} list
 * @param {HTMLElement} feedbackEl
 */
export async function init(formatSelect, copyBtn, optionsBtn, list, feedbackEl) {
  populateFormatSelect(formatSelect);
  state.rules = await loadRules();
  state.formatKey = await loadFormatPreference();
  formatSelect.value = FORMAT_ORDER.includes(state.formatKey)
    ? state.formatKey
    : "plain";

  formatSelect.addEventListener("change", async () => {
    state.formatKey = formatSelect.value;
    await saveFormatPreference(state.formatKey);
  });

  optionsBtn.addEventListener("click", () => {
    browser.runtime.openOptionsPage();
  });

  state.tabs = await loadTabs();
  const urls = state.tabs.map((t) => t.url ?? "");
  state.transformed = transformUrls(urls, state.rules);
  renderTabList(list, state.tabs, state.transformed);

  copyBtn.addEventListener("click", async () => {
    const checks = list.querySelectorAll('input[type="checkbox"]');
    /** @type {browser.tabs.Tab[]} */
    const picked = [];
    checks.forEach((el) => {
      if (el instanceof HTMLInputElement && el.checked) {
        const idx = Number.parseInt(el.dataset.index ?? "-1", 10);
        const tab = state.tabs[idx];
        if (tab) picked.push(tab);
      }
    });
    const text = buildCopyText(picked, state.rules, state.formatKey);
    const ok = await copyToClipboard(text);
    if (ok) showFeedback(feedbackEl, true, "Copied.");
    else showFeedback(feedbackEl, false, "Could not copy to clipboard.");
    window.setTimeout(() => {
      feedbackEl.textContent = "";
      feedbackEl.classList.remove("success", "error");
    }, 2000);
  });
}

if (typeof window !== "undefined") {
  const formatSelect = document.getElementById("format-select");
  const copyBtn = document.getElementById("copy-btn");
  const optionsBtn = document.getElementById("open-options");
  const list = document.getElementById("tab-list");
  const feedbackEl = document.getElementById("feedback");
  if (
    formatSelect instanceof HTMLSelectElement &&
    copyBtn instanceof HTMLButtonElement &&
    optionsBtn instanceof HTMLButtonElement &&
    list instanceof HTMLUListElement &&
    feedbackEl instanceof HTMLElement
  ) {
    init(formatSelect, copyBtn, optionsBtn, list, feedbackEl).catch(() => {
      showFeedback(feedbackEl, false, "Failed to load tabs.");
    });
  }
}
