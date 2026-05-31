/* ═══════════════════════════════════════════════════════
   PHYS / WEB-PROG STUDY TOOL — script.js
   Fixes: accordions always open, search-filter, exam, responsive
═══════════════════════════════════════════════════════ */

/* ─── Exam Designer Toggle ──────────────────────────── */
function toggleExamDesigner(btn) {
  const panel = document.getElementById('examDesigner');
  if (panel) {
    const isOpen = panel.classList.toggle('open');
    if (btn) btn.classList.toggle('active', isOpen);
  }
}

/* ─── Unit Tabs ─────────────────────────────────────── */
function showUnit(num, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.querySelectorAll('.unit-section').forEach(s => {
    const match = num === 0 || parseInt(s.dataset.unit) === num;
    s.classList.toggle('visible', match);
    s.style.display = match ? 'block' : 'none';
  });
}

/* ─── Accordion (always open by default, toggle on click) */
function toggleAcc(header) {
  // Accordions are always open — no toggle
}

/* ─── Copy Code ─────────────────────────────────────── */
function cp(btn) {
  const codeEl = btn.closest('.cb-wrap').querySelector('code');
  const text = (codeEl.innerText || codeEl.textContent).trim();
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = 'Copied!'; btn.classList.add('ok');
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('ok'); }, 2000);
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
    btn.textContent = 'Copied!'; btn.classList.add('ok');
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('ok'); }, 2000);
  });
}

/* ─── Download Code ─────────────────────────────────── */
function dlCode(id, filename) {
  const ta = document.getElementById(id);
  if (!ta) { alert('Code not found: ' + id); return; }
  const content = ta.value || ta.textContent;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(a.href);
}

/* ─── Essay Toggle ──────────────────────────────────── */
function toggleEssay(qEl) {
  const card = qEl.closest('.essay-card');
  if (card) card.classList.toggle('open');
}

/* ─── Highlight Helpers ─────────────────────────────── */
function clearHighlights(root) {
  root.querySelectorAll('mark.search-hl').forEach(mark => {
    const parent = mark.parentNode;
    parent.replaceChild(document.createTextNode(mark.textContent), mark);
    parent.normalize();
  });
}

function highlightText(node, query) {
  if (node.nodeType === 3) {
    const val = node.nodeValue, lv = val.toLowerCase(), idx = lv.indexOf(query);
    if (idx >= 0) {
      const mark = document.createElement('mark');
      mark.className = 'search-hl';
      const middle = node.splitText(idx);
      middle.splitText(query.length);
      mark.appendChild(middle.cloneNode(true));
      middle.parentNode.replaceChild(mark, middle);
      return 1;
    }
  } else if (node.nodeType === 1 && node.childNodes &&
    !/^(script|style|mark|button|input|header|th)$/i.test(node.tagName) &&
    !node.classList.contains('exam-designer') &&
    !node.classList.contains('unit-header') &&
    !node.classList.contains('acc-header') &&
    !node.classList.contains('exam-modal') &&
    node.id !== 'examModal' &&
    !node.classList.contains('row-num') &&
    !node.classList.contains('mcq-qn') &&
    !node.classList.contains('essay-num') &&
    !node.classList.contains('dbn')) {
    for (let i = 0; i < node.childNodes.length; i++) {
      if (highlightText(node.childNodes[i], query)) i++;
    }
  }
  return 0;
}

function getSearchableText(node) {
  if (node.nodeType === 3) return node.nodeValue;
  if (node.nodeType === 1) {
    if (node.classList.contains('row-num') || node.classList.contains('mcq-qn') ||
        node.classList.contains('essay-num') || node.classList.contains('dbn')) return '';
    let t = '';
    for (let i = 0; i < node.childNodes.length; i++) t += getSearchableText(node.childNodes[i]);
    return t;
  }
  return '';
}

/* ─── Search Filter State ───────────────────────────── */
const TYPE_SELECTORS = {
  terms:   { sel: '.terms-table tbody tr', badge: 'badge-terms'   },
  compare: { sel: '.compare-card',         badge: 'badge-compare' },
  essay:   { sel: '.essay-card',           badge: 'badge-essay'   },
  units:   { sel: '.unit-pill',            badge: 'badge-units'   },
  rules:   { sel: '.rule-card',            badge: 'badge-rules'   },
  mcq:     { sel: '.mcq-item',             badge: 'badge-mcq'     },
  tf:      { sel: '.terms-table tbody tr', badge: 'badge-tf'      },
  complete:{ sel: '.terms-table tbody tr', badge: 'badge-complete'},
  match:   { sel: '.match-wrap',           badge: 'badge-match'   },
  debug:   { sel: '.dbg-card',             badge: 'badge-debug'   },
};
const ALL_TYPES = Object.keys(TYPE_SELECTORS);

function getActiveFilters() {
  const dd = document.getElementById('searchFilterDropdown');
  if (!dd) return ALL_TYPES;
  const visible = Array.from(dd.querySelectorAll('.filter-option:not([style*="display: none"]) input[type="checkbox"]:not([value="all"])'));
  const allBox = dd.querySelector('input[value="all"]');
  if (allBox && allBox.checked) return visible.map(cb => cb.value);
  return visible.filter(cb => cb.checked).map(cb => cb.value);
}

function handleFilterChange(changed) {
  const dd = document.getElementById('searchFilterDropdown');
  if (!dd) return;
  const visible = Array.from(dd.querySelectorAll('.filter-option:not([style*="display: none"]) input[type="checkbox"]:not([value="all"])'));
  if (changed === 'all') {
    const allBox = dd.querySelector('input[value="all"]');
    visible.forEach(cb => { cb.checked = allBox.checked; });
  } else {
    const allBox = dd.querySelector('input[value="all"]');
    if (allBox) allBox.checked = visible.every(cb => cb.checked);
  }
  // workshops page: re-run search (unit filter handled inside handleSearch)
  if (document.body.classList.contains('workshops-page')) {
    const inp = document.getElementById('searchInput');
    handleSearch(inp ? inp.value : '');
  } else {
    updateFilterBadge();
    const inp = document.getElementById('searchInput');
    if (inp && inp.value.trim()) handleSearch(inp.value);
  }
}

function updateFilterBadge() {
  const btn = document.getElementById('searchFilterBtn');
  const dd  = document.getElementById('searchFilterDropdown');
  if (!btn || !dd) return;
  const visible = Array.from(dd.querySelectorAll('.filter-option:not([style*="display: none"]) input[type="checkbox"]:not([value="all"])'));
  const active = visible.filter(cb => cb.checked).length;
  const allActive = active === visible.length;
  btn.classList.toggle('active', !allActive);
  let badge = btn.querySelector('#searchFilterBadge');
  if (!allActive) {
    if (!badge) {
      badge = document.createElement('span');
      badge.id = 'searchFilterBadge';
      badge.className = 'search-filter-badge';
      btn.appendChild(badge);
    }
    badge.textContent = active;
    badge.style.display = 'flex';
  } else if (badge) {
    badge.remove();
  }
}

function initSearchFilters() {
  const dd = document.getElementById('searchFilterDropdown');
  if (!dd) return;
  ALL_TYPES.forEach(type => {
    const { badge } = TYPE_SELECTORS[type];
    const exists = !!document.querySelector(`.${badge}`);
    const opt = dd.querySelector(`input[value="${type}"]`);
    if (opt) {
      const label = opt.closest('.filter-option');
      if (label) {
        label.style.display = exists ? 'flex' : 'none';
        if (!exists) opt.checked = false;
      }
    }
  });
  const visible = Array.from(dd.querySelectorAll('.filter-option:not([style*="display: none"]) input[type="checkbox"]:not([value="all"])'));
  const allBox = dd.querySelector('input[value="all"]');
  if (allBox) allBox.checked = visible.every(cb => cb.checked);
  updateFilterBadge();
}

function toggleSearchFilter() {
  const dd  = document.getElementById('searchFilterDropdown');
  const btn = document.getElementById('searchFilterBtn');
  if (!dd) return;
  const isOpen = dd.classList.toggle('open');
  if (btn) btn.classList.toggle('active', isOpen);
  if (isOpen) {
    const close = (e) => {
      if (!dd.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
        dd.classList.remove('open');
        if (btn) btn.classList.remove('active');
        document.removeEventListener('click', close);
      }
    };
    setTimeout(() => document.addEventListener('click', close), 0);
  }
}

/* ─── Clear Search ──────────────────────────────────── */
function clearSearch() {
  const inp = document.getElementById('searchInput');
  if (inp) { inp.value = ''; handleSearch(''); }
}

/* ─── Main Search Handler ───────────────────────────── */
function handleSearch(query) {
  const isWorkshops = document.body.classList.contains('workshops-page');
  const kw = query.toLowerCase().trim();
  const clearBtn = document.getElementById('clearSearchBtn');
  if (clearBtn) clearBtn.style.display = kw ? 'flex' : 'none';

  /* ── workshops page: keyword + unit-filter search + highlight ── */
  if (isWorkshops) {
    const activeUnits = getActiveWorkshopUnits();

    // clear old highlights first
    clearHighlights(document.body);

    document.querySelectorAll('.accordion').forEach(card => {
      const unitNum    = parseInt(card.dataset.unit);
      const unitAllowed = activeUnits.length === 0 || activeUnits.includes(unitNum);
      const kwMatch    = !kw || card.textContent.toLowerCase().includes(kw);
      const visible    = unitAllowed && kwMatch;
      card.classList.toggle('search-no-match', !visible);
      if (visible) card.classList.add('open');
    });

    // apply highlights only on visible accordions
    if (kw) {
      document.querySelectorAll('.accordion:not(.search-no-match) .acc-body').forEach(body => {
        highlightText(body, kw);
      });
    }

    document.querySelectorAll('.unit-section').forEach(s => {
      const hasVisible = Array.from(s.querySelectorAll('.accordion'))
        .some(a => !a.classList.contains('search-no-match'));
      s.style.display = hasVisible ? 'block' : 'none';
      s.classList.toggle('visible', hasVisible);
    });

    const nm = document.getElementById('nm');
    const total = document.querySelectorAll('.accordion:not(.search-no-match)').length;
    if (nm) nm.classList.toggle('vis', (kw.length > 0 || activeUnits.length > 0) && total === 0);
    updateWorkshopFilterBadge();
    return;
  }

  /* ── study pages: filter-aware search ── */
  clearHighlights(document.body);
  document.querySelectorAll('.search-no-match').forEach(el => el.classList.remove('search-no-match'));
  if (!kw) {
    // restore all sections & keep accordions open
    document.querySelectorAll('.unit-section').forEach(s => {
      s.classList.add('visible'); s.style.display = 'block';
    });
    document.querySelectorAll('.accordion').forEach(a => a.classList.add('open'));
    return;
  }

  highlightText(document.body, kw);
  const activeFilters = getActiveFilters();

  ALL_TYPES.forEach(type => {
    const { sel, badge } = TYPE_SELECTORS[type];
    const included = activeFilters.includes(type);
    document.querySelectorAll(sel).forEach(el => {
      if (el.closest('.exam-modal') || el.closest('#examModal')) return;
      const parentAcc = el.closest('.accordion');
      const hasBadge = parentAcc && parentAcc.querySelector(`.${badge}`);
      if (!hasBadge && !['terms','tf','complete'].includes(type)) return;
      if (!included) { el.classList.add('search-no-match'); return; }
      el.classList.toggle('search-no-match', !getSearchableText(el).toLowerCase().includes(kw));
    });
  });

  // re-process shared selector types by badge
  ['terms','tf','complete'].forEach(type => {
    const { badge } = TYPE_SELECTORS[type];
    const included = activeFilters.includes(type);
    document.querySelectorAll('.accordion').forEach(acc => {
      if (!acc.querySelector(`.${badge}`)) return;
      acc.querySelectorAll('.terms-table tbody tr').forEach(el => {
        if (el.closest('.exam-modal') || el.closest('#examModal')) return;
        if (!included) { el.classList.add('search-no-match'); return; }
        el.classList.toggle('search-no-match', !getSearchableText(el).toLowerCase().includes(kw));
      });
    });
  });

  // show/hide accordions based on item visibility
  document.querySelectorAll('.accordion').forEach(acc => {
    const items = Array.from(acc.querySelectorAll(
      '.terms-table tbody tr,.essay-card,.compare-card,.unit-pill,.rule-card,.mcq-item,.match-wrap,.dbg-card'
    ));
    const hasVisible = items.length === 0 || items.some(i => !i.classList.contains('search-no-match'));
    acc.classList.toggle('search-no-match', !hasVisible);
    if (hasVisible) acc.classList.add('open');
  });

  // show/hide unit sections
  document.querySelectorAll('.unit-section').forEach(s => {
    const hasVisible = Array.from(s.querySelectorAll('.accordion'))
      .some(a => !a.classList.contains('search-no-match'));
    s.classList.toggle('search-no-match', !hasVisible);
    s.classList.toggle('visible', hasVisible);
    s.style.display = hasVisible ? 'block' : 'none';
  });

  // show no-match message if nothing visible
  const nm = document.getElementById('nm');
  if (nm) {
    const anyVisible = document.querySelectorAll('.accordion:not(.search-no-match)').length > 0;
    nm.classList.toggle('vis', kw.length > 0 && !anyVisible);
  }
}

/* ─── Workshop Filter Helpers ───────────────────────── */
function getActiveWorkshopUnits() {
  const dd = document.getElementById('searchFilterDropdown');
  if (!dd) return [];
  const allBox = dd.querySelector('input[value="all"]');
  if (allBox && allBox.checked) return []; // empty = all
  const checked = Array.from(dd.querySelectorAll('input[type="checkbox"]:not([value="all"])'))
    .filter(cb => cb.checked)
    .map(cb => parseInt(cb.value.replace('unit-', '')));
  return checked;
}

function updateWorkshopFilterBadge() {
  const btn = document.getElementById('searchFilterBtn');
  const dd  = document.getElementById('searchFilterDropdown');
  if (!btn || !dd) return;
  const all  = Array.from(dd.querySelectorAll('input[type="checkbox"]:not([value="all"])'));
  const active = all.filter(cb => cb.checked).length;
  const isAll  = active === all.length;
  btn.classList.toggle('active', !isAll);
  let badge = btn.querySelector('#searchFilterBadge');
  if (!isAll) {
    if (!badge) {
      badge = document.createElement('span');
      badge.id = 'searchFilterBadge'; badge.className = 'search-filter-badge';
      btn.appendChild(badge);
    }
    badge.textContent = active; badge.style.display = 'flex';
  } else if (badge) { badge.remove(); }
}

/* ─── Workshop Exam Generator ───────────────────────── */
function generateWorkshopExam() {
  const selectedUnits = Array.from(document.querySelectorAll('.exam-unit-checkbox:checked')).map(cb => parseInt(cb.value));
  const randomize     = document.getElementById('examRandomize') && document.getElementById('examRandomize').checked;
  const limit         = parseInt((document.getElementById('examQuestionLimit') || {}).value) || 10;

  if (selectedUnits.length === 0) {
    alert('Please select at least one unit.');
    return;
  }

  // Gather all matching accordions
  let workshops = [];
  selectedUnits.forEach(unit => {
    const sec = document.querySelector(`.unit-section[data-unit="${unit}"]`);
    if (!sec) return;
    sec.querySelectorAll('.accordion').forEach(acc => {
      workshops.push({ unit, el: acc });
    });
  });

  if (workshops.length === 0) {
    alert('No workshops found for selected units.');
    return;
  }

  // Shuffle if needed
  if (randomize) {
    for (let i = workshops.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [workshops[i], workshops[j]] = [workshops[j], workshops[i]];
    }
  }
  workshops = workshops.slice(0, limit);

  // Build exam content
  const examContent = document.getElementById('examContent');
  if (!examContent) return;
  examContent.innerHTML = '';

  workshops.forEach((w, idx) => {
    const clone = w.el.cloneNode(true);
    clone.classList.remove('search-no-match');
    clone.classList.add('open');
    clearHighlights(clone);

    // remove onclick from acc-header so it can't be collapsed in exam
    const header = clone.querySelector('.acc-header');
    if (header) {
      header.removeAttribute('onclick');
      header.style.cursor = 'default';
    }

    // add exam number badge
    const titleEl = clone.querySelector('.acc-title');
    const numBadge = document.createElement('span');
    numBadge.style.cssText = 'font-family:Space Mono,monospace;font-size:0.7rem;color:var(--text-muted);margin-right:10px;';
    numBadge.textContent = String(idx + 1).padStart(2, '0') + '.';
    if (titleEl) titleEl.prepend(numBadge);

    // hide download buttons in exam view
    clone.querySelectorAll('.dl-bar, .dl').forEach(el => el.style.display = 'none');

    const wrapper = document.createElement('div');
    wrapper.className = 'exam-section';
    wrapper.appendChild(clone);
    examContent.appendChild(wrapper);
  });

  // re-run hljs on cloned code blocks
  if (window.hljs) {
    examContent.querySelectorAll('pre code').forEach(block => {
      block.removeAttribute('data-highlighted');
      hljs.highlightElement(block);
    });
  }

  const modal = document.getElementById('examModal');
  if (modal) { modal.classList.add('active'); document.body.style.overflow = 'hidden'; document.body.classList.add('exam-open'); }
}


window.addEventListener('scroll', () => {
  const total = document.body.scrollHeight - window.innerHeight;
  if (total > 0) {
    const pct = (window.scrollY / total) * 100;
    const bar = document.getElementById('progress');
    if (bar) bar.style.width = pct + '%';
  }
  const btt = document.getElementById('backToTop');
  if (btt) btt.classList.toggle('visible', window.scrollY > 400);
});

/* ─── DOMContentLoaded ──────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Show ALL unit sections
  document.querySelectorAll('.unit-section').forEach(s => {
    s.classList.add('visible');
    s.style.display = 'block';
  });

  // Open ALL accordions by default on every page
  document.querySelectorAll('.accordion').forEach(acc => {
    acc.classList.add('open');
  });

  applyThemeMode();
  initSearchFilters();
  if (window.hljs) hljs.highlightAll();
  if (window.lucide) lucide.createIcons();

  // Exam modal close button (safe — runs after DOM ready)
  const examCloseBtn = document.querySelector('.exam-modal-close');
  if (examCloseBtn) {
    examCloseBtn.onclick = () => {
      const modal = document.getElementById('examModal');
      if (modal) modal.classList.remove('active');
      document.body.style.overflow = '';
      document.body.classList.remove('exam-open');
    };
  }
});

/* ─── Custom Exam Generator ─────────────────────────── */
function generateExam() {
  const selectedUnits = Array.from(document.querySelectorAll('.exam-unit-checkbox:checked')).map(cb => cb.value);
  const selectedTypes = Array.from(document.querySelectorAll('.exam-type-checkbox:checked')).map(cb => cb.value);
  const randomize     = document.getElementById('examRandomize') && document.getElementById('examRandomize').checked;
  const limit         = parseInt((document.getElementById('examQuestionLimit') || {}).value) || 50;

  if (selectedUnits.length === 0 || selectedTypes.length === 0) {
    alert('Please select at least one unit and one question type.');
    return;
  }

  const examContent = document.getElementById('examContent');
  if (!examContent) return;
  examContent.innerHTML = '';

  const typeNames = {
    terms:   'Scientific Terms',     compare: 'Comparisons',
    units:   'Physical Quantities',  rules:   'Mathematical Formulas',
    essay:   'Essay Questions',      tf:      'True or False',
    mcq:     'Multiple Choice',      complete:'Fill in the Blanks',
    match:   'Column Matching',      debug:   'Code Error Correction'
  };

  const perType = Math.ceil(limit / selectedTypes.length);

  selectedTypes.forEach(type => {
    let byUnit = {}, activeUnits = [];

    selectedUnits.forEach(unit => {
      const sec = document.querySelector(`.unit-section[data-unit="${unit}"]`);
      if (!sec) return;
      let els = [];

      const grab = (badgeClass, itemSel) => {
        sec.querySelectorAll(`.${badgeClass}`).forEach(badge => {
          const acc = badge.closest('.accordion');
          if (acc) els = els.concat(Array.from(acc.querySelectorAll(itemSel)));
        });
      };

      if      (type === 'terms')   grab('badge-terms',   '.terms-table tbody tr');
      else if (type === 'compare') grab('badge-compare',  '.compare-card');
      else if (type === 'units')   grab('badge-units',    '.unit-pill');
      else if (type === 'rules')   grab('badge-rules',    '.rule-card');
      else if (type === 'essay')   grab('badge-essay',    '.essay-card');
      else if (type === 'tf')      grab('badge-tf',       '.terms-table tbody tr');
      else if (type === 'mcq')     grab('badge-mcq',      '.mcq-item');
      else if (type === 'complete')grab('badge-complete', '.terms-table tbody tr');
      else if (type === 'match')   grab('badge-match',    '.match-wrap');
      else if (type === 'debug')   grab('badge-debug',    '.dbg-card');

      const clones = els.map(el => {
        const c = el.cloneNode(true);
        c.classList.remove('search-no-match');
        clearHighlights(c);
        if (type === 'mcq') {
          c.querySelectorAll('.opt').forEach(opt => {
            if (opt.classList.contains('ok')) {
              opt.classList.remove('ok');
              opt.classList.add('correct-option');
              opt.innerHTML = opt.innerHTML.replace(/[✓\s]+$/, '').trim();
            }
          });
        }
        if (type === 'match') {
          c.removeAttribute('data-matching-initialized');
          c.querySelectorAll('.mi').forEach(mi => {
            mi.classList.remove('paired-success','paired-error','active-match','match-clickable');
            mi.style.cursor = '';
            mi.onclick = null;
          });
        }
        return c;
      });

      if (randomize) {
        for (let i = clones.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [clones[i], clones[j]] = [clones[j], clones[i]];
        }
      }

      if (clones.length) { byUnit[unit] = clones; activeUnits.push(unit); }
    });

    if (randomize) {
      for (let i = activeUnits.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [activeUnits[i], activeUnits[j]] = [activeUnits[j], activeUnits[i]];
      }
    }

    let items = [];
    while (items.length < perType && activeUnits.length > 0) {
      for (let i = 0; i < activeUnits.length; i++) {
        const list = byUnit[activeUnits[i]];
        if (list && list.length) {
          items.push(list.shift());
          if (items.length >= perType) break;
        } else { activeUnits.splice(i--, 1); }
      }
    }

    if (!items.length) return;

    if (randomize) {
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }
    }

    const section = document.createElement('div');
    section.className = 'exam-section';
    const title = document.createElement('div');
    title.className = 'exam-section-title';
    title.textContent = typeNames[type] || type;
    section.appendChild(title);

    const container = document.createElement('div');
    container.className = 'exam-items-container';

    const mkShowBtn = (label, onShow) => {
      const btn = document.createElement('button');
      btn.className = 'show-answer-btn';
      btn.textContent = label;
      btn.onclick = () => { btn.style.display = 'none'; onShow(); };
      return btn;
    };

    if (['terms','tf','complete'].includes(type)) {
      const table = document.createElement('table');
      table.className = 'terms-table';
      const tbody = document.createElement('tbody');
      items.forEach((item, idx) => {
        const num = item.querySelector('.row-num');
        if (num) num.textContent = idx + 1;
        const ans = item.querySelector('.row-a, .rtrue, .rfalse');
        if (ans) {
          const sp = document.createElement('span');
          sp.className = 'answer-text hidden-answer';
          while (ans.firstChild) sp.appendChild(ans.firstChild);
          ans.appendChild(sp);
          ans.appendChild(mkShowBtn('Show Answer', () => sp.classList.remove('hidden-answer')));
        }
        tbody.appendChild(item);
      });
      table.appendChild(tbody);
      container.appendChild(table);
    } else {
      items.forEach((item, idx) => {
        const pad = String(idx + 1).padStart(2, '0');

        if (type === 'mcq') {
          const num = item.querySelector('.mcq-qn .row-num');
          if (num) num.textContent = pad;
          item.querySelectorAll('.opt').forEach(o => { o.style.cursor = 'default'; o.onclick = null; });
          const wrap = document.createElement('div');
          wrap.style.padding = '10px 0 0';
          wrap.appendChild(mkShowBtn('Show Answer', () => {
            const co = item.querySelector('.correct-option');
            if (co) { co.classList.add('ok'); if (!co.innerHTML.includes('✓')) co.innerHTML += ' ✓'; }
          }));
          item.appendChild(wrap);

        } else if (type === 'essay') {
          const num = item.querySelector('.essay-num');
          if (num) num.textContent = 'Q ' + pad;
          item.classList.add('open');
          const eq = item.querySelector('.essay-q');
          if (eq) { eq.removeAttribute('onclick'); eq.style.cursor = 'default'; }
          const ans = item.querySelector('.essay-ans');
          if (ans) {
            ans.classList.add('hidden-answer');
            const wrap = document.createElement('div');
            wrap.style.padding = '0 14px 14px 48px';
            wrap.appendChild(mkShowBtn('Show Answer', () => ans.classList.remove('hidden-answer')));
            item.appendChild(wrap);
          }

        } else if (type === 'match') {
          item.querySelectorAll('.ans-strip').forEach(strip => {
            strip.classList.add('hidden-answer');
            const wrap = document.createElement('div');
            wrap.style.padding = '10px 0 0';
            wrap.appendChild(mkShowBtn('Show Answer', () => {
              wrap.style.display = 'none';
              strip.classList.remove('hidden-answer');
            }));
            strip.parentNode.insertBefore(wrap, strip.nextSibling);
          });

        } else if (type === 'compare') {
          const answers = [];
          item.querySelectorAll('tbody tr').forEach(row => {
            Array.from(row.querySelectorAll('td')).slice(2).forEach(td => {
              const sp = document.createElement('span');
              sp.className = 'answer-text hidden-answer';
              while (td.firstChild) sp.appendChild(td.firstChild);
              td.appendChild(sp); answers.push(sp);
            });
          });
          if (answers.length) {
            const wrap = document.createElement('div');
            wrap.style.padding = '12px';
            wrap.appendChild(mkShowBtn('Show Answer', () => answers.forEach(sp => sp.classList.remove('hidden-answer'))));
            item.appendChild(wrap);
          }

        } else if (type === 'units') {
          const val = item.querySelector('.unit-val');
          if (val) {
            val.classList.add('hidden-answer');
            val.parentNode.insertBefore(mkShowBtn('Show Answer', () => val.classList.remove('hidden-answer')), val);
          }

        } else if (type === 'rules') {
          const val = item.querySelector('.rule-formula');
          if (val) {
            val.classList.add('hidden-answer');
            const btn = mkShowBtn('Show Answers', () => val.classList.remove('hidden-answer'));
            btn.style.marginTop = '10px';
            val.parentNode.insertBefore(btn, val);
          }

        } else if (type === 'debug') {
          const num = item.querySelector('.dbn');
          if (num) num.textContent = 'BUG ' + pad;
          item.classList.add('open');
          const dq = item.querySelector('.dbq');
          if (dq) { dq.removeAttribute('onclick'); dq.style.cursor = 'default'; }
          const ans = item.querySelector('.dbans');
          if (ans) {
            ans.classList.add('hidden-answer');
            const wrap = document.createElement('div');
            wrap.style.padding = '0 14px 14px 48px';
            wrap.appendChild(mkShowBtn('Show Answer', () => ans.classList.remove('hidden-answer')));
            item.appendChild(wrap);
          }
        }

        container.appendChild(item);
      });
    }

    section.appendChild(container);
    examContent.appendChild(section);
  });

  const modal = document.getElementById('examModal');
  if (modal) { modal.classList.add('active'); document.body.style.overflow = 'hidden'; document.body.classList.add('exam-open'); }
  
  // init matching in exam modal
  setTimeout(() => {
    const modal = document.getElementById('examModal');
    if (modal) initMatching(modal);
  }, 100);
}

/* ─── Theme ──────────────────────────────────────────── */
let currentThemeMode = 'system';
try { currentThemeMode = localStorage.getItem('themeMode') || 'system'; } catch (e) {}

function applyThemeMode() {
  const html = document.documentElement;
  if (currentThemeMode === 'system') html.removeAttribute('data-theme');
  else html.setAttribute('data-theme', currentThemeMode);
  const btn = document.getElementById('themeToggle');
  if (btn) {
    const icons  = { system: 'contrast', light: 'sun', dark: 'moon' };
    const labels = { system: 'System',   light: 'Light', dark: 'Dark' };
    btn.innerHTML = `<i data-lucide="${icons[currentThemeMode]}" class="theme-icon"></i><span>${labels[currentThemeMode]}</span>`;
    if (window.lucide) lucide.createIcons();
  }
}

function toggleTheme() {
  const modes = ['system','light','dark'];
  currentThemeMode = modes[(modes.indexOf(currentThemeMode) + 1) % 3];
  try { localStorage.setItem('themeMode', currentThemeMode); } catch (e) {}
  applyThemeMode();
}

/* ─── Matching Game (in exam modal) ─────────────────── */
function initMatching(root) {
  const wraps = (root.classList && root.classList.contains('match-wrap'))
    ? [root] : root.querySelectorAll('.match-wrap');
  wraps.forEach(wrap => {
    if (!wrap.closest('#examModal') && !wrap.closest('.exam-modal')) return;
    const strip = wrap.querySelector('.ans-strip');
    if (!strip || wrap.dataset.matchingInitialized === 'true') return;
    wrap.dataset.matchingInitialized = 'true';

    const cols = wrap.querySelectorAll('.match-cols > div');
    if (cols.length < 2) return;
    const colA = cols[0].querySelectorAll('.mi');
    const colB = cols[1].querySelectorAll('.mi');
    const ansMap = {};
    wrap.querySelectorAll('.ans-chip').forEach(chip => {
      const parts = chip.textContent.split(/[→\-\->➔]+/);
      if (parts.length === 2) ansMap[parts[0].trim()] = parts[1].trim();
    });

    let activeA = null, activeB = null;
    const checkMatch = () => {
      if (!activeA || !activeB) return;
      const vA = activeA.querySelector('.ml').textContent.trim();
      const vB = activeB.querySelector('.ml').textContent.trim();
      if (ansMap[vA] === vB) {
        activeA.classList.add('paired-success');
        activeB.classList.add('paired-success');
      } else {
        const a = activeA, b = activeB;
        a.classList.add('paired-error'); b.classList.add('paired-error');
        setTimeout(() => { a.classList.remove('paired-error'); b.classList.remove('paired-error'); }, 600);
      }
      activeA.classList.remove('active-match');
      activeB.classList.remove('active-match');
      activeA = null; activeB = null;
    };

    colA.forEach(mi => {
      mi.classList.add('match-clickable'); mi.style.cursor = 'pointer';
      mi.onclick = () => {
        if (mi.classList.contains('paired-success')) return;
        colA.forEach(m => m.classList.remove('active-match'));
        mi.classList.add('active-match'); activeA = mi; checkMatch();
      };
    });
    colB.forEach(mi => {
      mi.classList.add('match-clickable'); mi.style.cursor = 'pointer';
      mi.onclick = () => {
        if (mi.classList.contains('paired-success')) return;
        colB.forEach(m => m.classList.remove('active-match'));
        mi.classList.add('active-match'); activeB = mi; checkMatch();
      };
    });
  });
}
