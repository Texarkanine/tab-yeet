import { loadRules, saveRules } from "../lib/storage.js";

/**
 * @param {string} pattern
 * @returns {string | null} Error message, or null when valid.
 */
export function validateRegex(pattern) {
  const p = String(pattern ?? "").trim();
  if (!p) return "Pattern is required";
  try {
    new RegExp(p);
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : "Invalid pattern";
  }
}

/**
 * @returns {string}
 */
export function generateRuleId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `rule-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * @param {Array<{ id: string, pattern: string, replacement: string, enabled: boolean }>} rules
 * @param {string} pattern
 * @param {string} replacement
 */
export function addRule(rules, pattern, replacement) {
  const id = generateRuleId();
  return [...rules, { id, pattern, replacement, enabled: true }];
}

/**
 * @param {Array<{ id: string, pattern: string, replacement: string, enabled: boolean }>} rules
 * @param {string} id
 * @param {Partial<{ pattern: string, replacement: string, enabled: boolean }>} updates
 */
export function editRule(rules, id, updates) {
  return rules.map((r) => (r.id === id ? { ...r, ...updates } : r));
}

/**
 * @param {Array<{ id: string, pattern: string, replacement: string, enabled: boolean }>} rules
 * @param {string} id
 */
export function deleteRule(rules, id) {
  return rules.filter((r) => r.id !== id);
}

/**
 * @param {Array<{ id: string, pattern: string, replacement: string, enabled: boolean }>} rules
 * @param {string} id
 * @param {"up" | "down"} direction
 */
export function moveRule(rules, id, direction) {
  const i = rules.findIndex((r) => r.id === id);
  if (i < 0) return rules;
  const j = direction === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= rules.length) return rules;
  const next = [...rules];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

/**
 * @param {Array<{ id: string, pattern: string, replacement: string, enabled: boolean }>} rules
 * @param {string} id
 */
export function toggleRule(rules, id) {
  return rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
}

const state = {
  /** @type {Awaited<ReturnType<typeof loadRules>>} */
  rules: [],
};

/**
 * @param {HTMLElement} root
 * @param {typeof state.rules} rules
 */
export function renderRules(root, rules) {
  root.innerHTML = "";
  for (const rule of rules) {
    const li = document.createElement("li");
    li.className = `rule-card${rule.enabled ? "" : " disabled"}`;
    li.dataset.id = rule.id;

    const patWrap = document.createElement("div");
    patWrap.className = "field";
    const patLabel = document.createElement("label");
    patLabel.textContent = "Pattern";
    const patInput = document.createElement("input");
    patInput.type = "text";
    patInput.value = rule.pattern;
    patInput.dataset.field = "pattern";
    patWrap.append(patLabel, patInput);

    const repWrap = document.createElement("div");
    repWrap.className = "field";
    const repLabel = document.createElement("label");
    repLabel.textContent = "Replacement";
    const repInput = document.createElement("input");
    repInput.type = "text";
    repInput.value = rule.replacement;
    repInput.dataset.field = "replacement";
    repWrap.append(repLabel, repInput);

    const actions = document.createElement("div");
    actions.className = "rule-actions";

    const up = document.createElement("button");
    up.type = "button";
    up.textContent = "Up";
    up.addEventListener("click", async () => {
      state.rules = moveRule(state.rules, rule.id, "up");
      await saveRules(state.rules);
      renderRules(root, state.rules);
    });

    const down = document.createElement("button");
    down.type = "button";
    down.textContent = "Down";
    down.addEventListener("click", async () => {
      state.rules = moveRule(state.rules, rule.id, "down");
      await saveRules(state.rules);
      renderRules(root, state.rules);
    });

    const del = document.createElement("button");
    del.type = "button";
    del.textContent = "Delete";
    del.addEventListener("click", async () => {
      state.rules = deleteRule(state.rules, rule.id);
      await saveRules(state.rules);
      renderRules(root, state.rules);
    });

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.textContent = rule.enabled ? "Disable" : "Enable";
    toggle.addEventListener("click", async () => {
      state.rules = toggleRule(state.rules, rule.id);
      await saveRules(state.rules);
      renderRules(root, state.rules);
    });

    const onCommit = async () => {
      const p = patInput.value.trim();
      const err = validateRegex(p);
      const errorEl = document.getElementById("error");
      if (err) {
        if (errorEl) errorEl.textContent = err;
        return;
      }
      if (errorEl) errorEl.textContent = "";
      state.rules = editRule(state.rules, rule.id, {
        pattern: p,
        replacement: repInput.value.trim(),
      });
      await saveRules(state.rules);
      renderRules(root, state.rules);
    };

    patInput.addEventListener("blur", onCommit);
    repInput.addEventListener("blur", onCommit);

    actions.append(up, down, toggle, del);
    li.append(patWrap, repWrap, actions);
    root.appendChild(li);
  }
}

/**
 * @param {HTMLUListElement} list
 * @param {HTMLInputElement} patternInput
 * @param {HTMLInputElement} replacementInput
 * @param {HTMLButtonElement} addBtn
 */
export async function init(list, patternInput, replacementInput, addBtn) {
  state.rules = await loadRules();
  renderRules(list, state.rules);

  addBtn.addEventListener("click", async () => {
    const p = patternInput.value.trim();
    const err = validateRegex(p);
    const errorEl = document.getElementById("error");
    if (err) {
      if (errorEl) errorEl.textContent = err;
      return;
    }
    if (errorEl) errorEl.textContent = "";
    state.rules = addRule(state.rules, p, replacementInput.value.trim());
    await saveRules(state.rules);
    patternInput.value = "";
    replacementInput.value = "";
    renderRules(list, state.rules);
  });
}

const rulesEl = document.getElementById("rules");
const newPat = document.getElementById("new-pattern");
const newRep = document.getElementById("new-replacement");
const addBtn = document.getElementById("add-btn");

if (
  rulesEl instanceof HTMLUListElement &&
  newPat instanceof HTMLInputElement &&
  newRep instanceof HTMLInputElement &&
  addBtn instanceof HTMLButtonElement
) {
  init(rulesEl, newPat, newRep, addBtn).catch(() => {
    const errorEl = document.getElementById("error");
    if (errorEl) errorEl.textContent = "Failed to load rules.";
  });
}
