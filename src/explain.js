// Click-to-open explanations: a small (i) beside a term that has to stay short
// in a table but needs a sentence or two to be honest about what it means.
//
// Inline rather than a hover tooltip, so it works on touch and can run long.
//
// Which ones are open is held here rather than in the DOM, because the results
// panel is rebuilt on every keystroke - anything stored in the markup would snap
// shut as you type.
//
// NB the class is `explain`, not `info`. Findings already carry `info` as a
// severity class, and a `.info` rule would match `.finding.info` too.

const open = new Set();

/** The (i) button. `key` must be unique per page and stable across renders. */
export const infoBtn = (key) =>
  `<button type="button" class="explain" data-info="${key}" aria-expanded="${open.has(key)}"
    aria-label="What this means">i</button>`;

// Every body carries `data-info-body`, including the generated ones. Without it
// a panel is only ever opened by the render pass that produced it - which is
// wrong for anything the toggle does not redraw, such as the person cards, whose
// markup is rebuilt on add/remove but not on a click.

/** The explanation, as a full-width row inside a table.mini. */
export const infoRow = (key, text) =>
  `<tr class="explain-row" data-info-body="${key}"${open.has(key) ? '' : ' hidden'}>` +
  `<td colspan="2">${text}</td></tr>`;

/** The explanation, for anywhere that is not a table. */
export const infoNote = (key, text) =>
  `<p class="explain-body" data-info-body="${key}"${open.has(key) ? '' : ' hidden'}>${text}</p>`;

/**
 * Bring every panel on the page into line with the open set, wherever it came
 * from. Pair a button with a body by key:
 *
 *   <button class="explain" data-info="buffer">i</button>
 *   <p class="explain-body" data-info-body="buffer" hidden>...</p>
 */
function syncPanels() {
  document.querySelectorAll('[data-info-body]').forEach((el) => {
    el.hidden = !open.has(el.dataset.infoBody);
  });
  document.querySelectorAll('.explain[data-info]').forEach((b) => {
    b.setAttribute('aria-expanded', open.has(b.dataset.info));
  });
}

/**
 * Install the toggle. `rerender` rebuilds the results from the open set, so
 * there is one source of truth and no state stranded in the markup; static
 * panels are toggled directly, since nothing redraws them.
 */
export function bindExplain(rerender) {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-info]');
    if (!btn) return;
    const key = btn.dataset.info;
    if (open.has(key)) open.delete(key); else open.add(key);
    rerender();
    syncPanels();
  });
  syncPanels();
}
