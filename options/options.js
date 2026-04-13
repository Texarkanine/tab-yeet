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
 * Moves the item at `fromIndex` to `toIndex` in a single step (same semantics as
 * splice: remove, then insert at the new index in the shortened array).
 *
 * @param {Array<{ id: string, pattern: string, replacement: string, enabled: boolean }>} rules
 * @param {number} fromIndex
 * @param {number} toIndex
 */
export function reorderRules(rules, fromIndex, toIndex) {
  if (fromIndex === toIndex) return rules;
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= rules.length ||
    toIndex >= rules.length
  ) {
    return rules;
  }
  const next = [...rules];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

/**
 * Reorders by **insertion slot** `0..rules.length` (gap before row `i`, or `length`
 * after the last row). Dropping on the "before this row" slot for the row being
 * dragged is a no-op (`insertionSlot === fromIndex`).
 *
 * @param {Array<{ id: string, pattern: string, replacement: string, enabled: boolean }>} rules
 * @param {number} fromIndex
 * @param {number} insertionSlot
 */
export function reorderRulesToInsertionSlot(rules, fromIndex, insertionSlot) {
  const n = rules.length;
  if (fromIndex < 0 || fromIndex >= n) return rules;
  if (insertionSlot < 0 || insertionSlot > n) return rules;
  if (insertionSlot === fromIndex) return rules;
  const next = [...rules];
  const [item] = next.splice(fromIndex, 1);
  let insertAt = insertionSlot;
  if (insertionSlot > fromIndex) insertAt--;
  next.splice(insertAt, 0, item);
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

/** @type {string | null} */
let activeDragRuleId = null;

/** @type {HTMLDivElement | null} */
let dragInsertIndicatorEl = null;

function hideDragInsertIndicator() {
  if (dragInsertIndicatorEl) {
    dragInsertIndicatorEl.classList.remove("rule-insert-indicator--visible");
  }
  activeDragRuleId = null;
}

/**
 * @param {number} clientY
 * @param {HTMLUListElement} list
 */
function insertionSlotFromPointer(clientY, list) {
  const cards = [...list.querySelectorAll(".rule-card")];
  const n = cards.length;
  if (n === 0) return 0;
  if (clientY < cards[0].getBoundingClientRect().top) return 0;
  if (clientY > cards[n - 1].getBoundingClientRect().bottom) return n;
  for (let i = 0; i < n; i++) {
    const r = cards[i].getBoundingClientRect();
    if (clientY < r.top) return i;
    if (clientY <= r.bottom) {
      const mid = r.top + r.height / 2;
      return clientY < mid ? i : i + 1;
    }
  }
  return n;
}

/**
 * @param {HTMLElement} wrap
 * @param {HTMLUListElement} list
 * @param {number} slot
 */
function positionInsertIndicator(wrap, list, slot) {
  if (!dragInsertIndicatorEl) return;
  const cards = [...list.querySelectorAll(".rule-card")];
  const n = cards.length;
  if (n === 0) return;
  const wrapRect = wrap.getBoundingClientRect();
  let y;
  if (slot <= 0) {
    y = cards[0].getBoundingClientRect().top - wrapRect.top + wrap.scrollTop;
  } else if (slot >= n) {
    y =
      cards[n - 1].getBoundingClientRect().bottom -
      wrapRect.top +
      wrap.scrollTop;
  } else {
    y = cards[slot].getBoundingClientRect().top - wrapRect.top + wrap.scrollTop;
  }
  dragInsertIndicatorEl.style.top = `${y}px`;
  dragInsertIndicatorEl.classList.add("rule-insert-indicator--visible");
}

/**
 * @param {HTMLElement} wrap
 * @param {HTMLUListElement} list
 */
function attachRuleListDragDrop(wrap, list) {
  if (wrap.dataset.tabYeetDragDropBound === "true") return;
  wrap.dataset.tabYeetDragDropBound = "true";

  let indicator = wrap.querySelector(".rule-insert-indicator");
  if (!(indicator instanceof HTMLDivElement)) {
    indicator = document.createElement("div");
    indicator.className = "rule-insert-indicator";
    indicator.setAttribute("aria-hidden", "true");
    wrap.prepend(indicator);
  }
  dragInsertIndicatorEl = indicator;

  wrap.addEventListener("dragover", (e) => {
    if (!activeDragRuleId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const slot = insertionSlotFromPointer(e.clientY, list);
    positionInsertIndicator(wrap, list, slot);
  });

  wrap.addEventListener("drop", async (e) => {
    if (!activeDragRuleId) return;
    e.preventDefault();
    const draggedId = activeDragRuleId;
    const slot = insertionSlotFromPointer(e.clientY, list);
    const from = state.rules.findIndex((r) => r.id === draggedId);
    if (from < 0) return;
    const nextRules = reorderRulesToInsertionSlot(state.rules, from, slot);
    if (nextRules === state.rules) {
      if (dragInsertIndicatorEl) {
        dragInsertIndicatorEl.classList.remove("rule-insert-indicator--visible");
      }
      return;
    }
    state.rules = nextRules;
    await saveRules(state.rules);
    if (dragInsertIndicatorEl) {
      dragInsertIndicatorEl.classList.remove("rule-insert-indicator--visible");
    }
    renderRules(list, state.rules);
  });
}

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

    const handle = document.createElement("button");
    handle.type = "button";
    handle.className = "rule-drag-handle";
    handle.textContent = "⋮⋮";
    handle.setAttribute("aria-label", "Drag to reorder");
    handle.title = "Drag to reorder";
    handle.draggable = true;
    handle.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", rule.id);
      e.dataTransfer.effectAllowed = "move";
      activeDragRuleId = rule.id;
      li.classList.add("rule-card--dragging");
    });
    handle.addEventListener("dragend", () => {
      li.classList.remove("rule-card--dragging");
      hideDragInsertIndicator();
    });

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

    actions.append(toggle, del);
    li.append(handle, patWrap, repWrap, actions);
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
  const wrap = list.closest(".rule-list-wrap");
  if (wrap instanceof HTMLElement) {
    attachRuleListDragDrop(wrap, list);
  }
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
