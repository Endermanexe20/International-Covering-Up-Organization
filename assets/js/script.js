function toggleExamDesigner(btn) {
  const panel = document.getElementById('examDesigner');
  if (panel) {
    const isOpen = panel.classList.toggle('open');
    if (btn) btn.classList.toggle('active', isOpen);
  }
}

function showUnit(num, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const sections = document.querySelectorAll('.unit-section');
  if (num === 0) {
    sections.forEach(s => {
      s.classList.add('visible');
      s.style.display = 'block';
    });
  } else {
    sections.forEach(s => {
      if (parseInt(s.dataset.unit) === num) {
        s.classList.add('visible');
        s.style.display = 'block';
      } else {
        s.classList.remove('visible');
        s.style.display = 'none';
      }
    });
  }
}

function toggleAcc(header) {
}

function toggleEssay(qEl) {
  const card = qEl.closest('.essay-card');
  card.classList.toggle('open');
}

function clearHighlights(root) {
  const marks = root.querySelectorAll('mark.search-hl');
  marks.forEach(mark => {
    const parent = mark.parentNode;
    parent.replaceChild(document.createTextNode(mark.textContent), mark);
    parent.normalize();
  });
}

function highlightText(node, query) {
  if (node.nodeType === 3) {
    const val = node.nodeValue;
    const lowerVal = val.toLowerCase();
    const idx = lowerVal.indexOf(query);
    if (idx >= 0) {
      const mark = document.createElement('mark');
      mark.className = 'search-hl';
      const middle = node.splitText(idx);
      middle.splitText(query.length);
      const middleClone = middle.cloneNode(true);
      mark.appendChild(middleClone);
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
      if (highlightText(node.childNodes[i], query)) {
        i++;
      }
    }
  }
  return 0;
}

function clearSearch() {
  const input = document.getElementById('searchInput');
  if(input) {
    input.value = '';
    handleSearch('');
  }
}

function getSearchableText(node) {
  if (node.nodeType === 3) {
    return node.nodeValue;
  }
  if (node.nodeType === 1) {
    if (node.classList.contains('row-num') || 
        node.classList.contains('mcq-qn') || 
        node.classList.contains('essay-num') || 
        node.classList.contains('dbn')) {
      return '';
    }
    let text = '';
    for (let i = 0; i < node.childNodes.length; i++) {
      text += getSearchableText(node.childNodes[i]);
    }
    return text;
  }
  return '';
}

function handleSearch(query) {
  const q = query.toLowerCase().trim();
  const mainNode = document.body;
  const clearBtn = document.getElementById('clearSearchBtn');
  if (clearBtn) clearBtn.style.display = q ? 'block' : 'none';
  clearHighlights(mainNode);
  document.querySelectorAll('.search-no-match').forEach(el => el.classList.remove('search-no-match'));
  if (!q) return;
  highlightText(mainNode, q);

  const selectors = [
    '.terms-table tbody tr', 
    '.essay-card', 
    '.compare-card', 
    '.unit-pill', 
    '.rule-card',
    '.mcq-item',
    '.match-wrap',
    '.dbg-card'
  ];
  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      if (el.closest('.exam-modal') || el.closest('#examModal')) return;
      const searchableText = getSearchableText(el);
      el.classList.toggle('search-no-match', !searchableText.toLowerCase().includes(q));
    });
  });

  if (q) {
    document.querySelectorAll('.accordion').forEach(acc => {
      const items = Array.from(acc.querySelectorAll('.terms-table tbody tr, .essay-card, .compare-card, .unit-pill, .rule-card, .mcq-item, .match-wrap, .dbg-card'));
      const hasVisible = items.some(item => !item.classList.contains('search-no-match'));
      
      if (!hasVisible && items.length > 0) {
         acc.classList.add('search-no-match');
      } else {
         acc.classList.remove('search-no-match');
         acc.classList.add('open');
         const body = acc.querySelector('.acc-body');
         if (body) body.style.display = 'block';
      }
    });
    document.querySelectorAll('.unit-section').forEach(s => {
      const accs = Array.from(s.querySelectorAll('.accordion'));
      const hasVisible = accs.some(a => !a.classList.contains('search-no-match'));
      if (!hasVisible && accs.length > 0) {
         s.classList.add('search-no-match');
         s.style.display = 'none';
      } else {
         s.classList.remove('search-no-match');
         s.classList.add('visible');
         s.style.display = 'block';
      }
    });
    const firstMatch = document.querySelector('mark.search-hl');
    if(firstMatch) {
        firstMatch.scrollIntoView({behavior: 'smooth', block: 'center'});
    }
  }
}

window.addEventListener('scroll', () => {
  const total = document.body.scrollHeight - window.innerHeight;
  if (total <= 0) return;
  const pct = (window.scrollY / total) * 100;
  const progress = document.getElementById('progress');
  if (progress) progress.style.width = pct + '%';
  
  const btt = document.getElementById('backToTop');
  if (btt) {
    if (window.scrollY > 400) {
      btt.classList.add('visible');
    } else {
      btt.classList.remove('visible');
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.unit-section').forEach(s => {
    s.classList.add('visible');
    s.style.display = 'block';
  });
  document.querySelectorAll('.accordion').forEach((acc, i) => {
    acc.classList.add('open');
    const body = acc.querySelector('.acc-body');
    if (body) body.style.display = 'block';
  });
  applyThemeMode();
});

function generateExam() {
  const selectedUnits = Array.from(document.querySelectorAll('.exam-unit-checkbox:checked')).map(cb => cb.value);
  const selectedTypes = Array.from(document.querySelectorAll('.exam-type-checkbox:checked')).map(cb => cb.value);
  const randomize = document.getElementById('examRandomize').checked;
  const limit = parseInt(document.getElementById('examQuestionLimit').value) || 50;

  if (selectedUnits.length === 0 || selectedTypes.length === 0) {
    alert('Please select at least one unit and one question type.');
    return;
  }
  const examContent = document.getElementById('examContent');
  examContent.innerHTML = ''; 
  const typeNames = {
    'terms': 'Scientific Terms',
    'compare': 'Comparisons',
    'units': 'Physical Quantities & Units',
    'rules': 'Mathematical Formulas',
    'essay': 'Essay Questions',
    'tf': 'True or False Statements',
    'mcq': 'Multiple Choice Questions',
    'complete': 'Fill in the Blanks',
    'match': 'Column Matching Pairs',
    'debug': 'Code Error Correction'
  };
  
  const targetTypeCount = Math.ceil(limit / selectedTypes.length);
  
  selectedTypes.forEach(type => {
    let questionsByUnit = {};
    let activeUnits = [];
    
    selectedUnits.forEach(unit => {
      const unitContainer = document.querySelector(`.unit-section[data-unit="${unit}"]`);
      if (!unitContainer) return;
      let elements = [];
      if (type === 'terms') {
        const accs = unitContainer.querySelectorAll('.badge-terms');
        accs.forEach(badge => {
          const acc = badge.closest('.accordion');
          if (acc) elements = elements.concat(Array.from(acc.querySelectorAll('.terms-table tbody tr')));
        });
      } else if (type === 'compare') {
        const accs = unitContainer.querySelectorAll('.badge-compare');
        accs.forEach(badge => {
           const acc = badge.closest('.accordion');
           if (acc) elements = elements.concat(Array.from(acc.querySelectorAll('.compare-card')));
        });
      } else if (type === 'units') {
        const accs = unitContainer.querySelectorAll('.badge-units');
        accs.forEach(badge => {
           const acc = badge.closest('.accordion');
           if (acc) elements = elements.concat(Array.from(acc.querySelectorAll('.unit-pill')));
        });
      } else if (type === 'rules') {
        const accs = unitContainer.querySelectorAll('.badge-rules');
        accs.forEach(badge => {
           const acc = badge.closest('.accordion');
           if (acc) elements = elements.concat(Array.from(acc.querySelectorAll('.rule-card')));
        });
      } else if (type === 'essay') {
        const accs = unitContainer.querySelectorAll('.badge-essay');
        accs.forEach(badge => {
           const acc = badge.closest('.accordion');
           if (acc) elements = elements.concat(Array.from(acc.querySelectorAll('.essay-card')));
        });
      } else if (type === 'tf') {
        const accs = unitContainer.querySelectorAll('.badge-tf');
        accs.forEach(badge => {
           const acc = badge.closest('.accordion');
           if (acc) elements = elements.concat(Array.from(acc.querySelectorAll('.terms-table tbody tr')));
        });
      } else if (type === 'mcq') {
        const accs = unitContainer.querySelectorAll('.badge-mcq');
        accs.forEach(badge => {
           const acc = badge.closest('.accordion');
           if (acc) elements = elements.concat(Array.from(acc.querySelectorAll('.mcq-item')));
        });
      } else if (type === 'complete') {
        const accs = unitContainer.querySelectorAll('.badge-complete');
        accs.forEach(badge => {
           const acc = badge.closest('.accordion');
           if (acc) elements = elements.concat(Array.from(acc.querySelectorAll('.terms-table tbody tr')));
        });
      } else if (type === 'match') {
        const accs = unitContainer.querySelectorAll('.badge-match');
        accs.forEach(badge => {
           const acc = badge.closest('.accordion');
           if (acc) elements = elements.concat(Array.from(acc.querySelectorAll('.match-wrap')));
        });
      } else if (type === 'debug') {
        const accs = unitContainer.querySelectorAll('.badge-debug');
        accs.forEach(badge => {
           const acc = badge.closest('.accordion');
           if (acc) elements = elements.concat(Array.from(acc.querySelectorAll('.dbg-card')));
        });
      }
      
      let clones = [];
      elements.forEach(el => {
          let clone = el.cloneNode(true);
          clone.classList.remove('search-no-match');
          clearHighlights(clone);
          if (type === 'mcq') {
              clone.querySelectorAll('.opt').forEach(opt => {
                  if (opt.classList.contains('ok')) {
                      opt.classList.remove('ok');
                      opt.classList.add('correct-option');
                      opt.innerHTML = opt.innerHTML.replace(/[✓✓\s]+$/, '').trim();
                  }
              });
          }
          if (type === 'match') {
              clone.removeAttribute('data-matching-initialized');
              clone.querySelectorAll('.mi').forEach(mi => {
                  mi.classList.remove('paired-success', 'paired-error', 'active-match', 'match-clickable');
                  mi.style.cursor = '';
                  mi.onclick = null;
              });
          }
          clones.push(clone);
      });
      
      if (clones.length > 0) {
        if (randomize) {
          for (let i = clones.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [clones[i], clones[j]] = [clones[j], clones[i]];
          }
        }
        questionsByUnit[unit] = clones;
        activeUnits.push(unit);
      }
    });
    
    let typeItems = [];
    if (randomize) {
      for (let i = activeUnits.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [activeUnits[i], activeUnits[j]] = [activeUnits[j], activeUnits[i]];
      }
    }
    
    while (typeItems.length < targetTypeCount && activeUnits.length > 0) {
      for (let i = 0; i < activeUnits.length; i++) {
        const unit = activeUnits[i];
        const list = questionsByUnit[unit];
        if (list && list.length > 0) {
          typeItems.push(list.shift());
          if (typeItems.length >= targetTypeCount) break;
        } else {
          activeUnits.splice(i, 1);
          i--;
        }
      }
    }
    
    if (typeItems.length > 0) {
      if (randomize) {
        for (let i = typeItems.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [typeItems[i], typeItems[j]] = [typeItems[j], typeItems[i]];
        }
      }
      
      const sectionDiv = document.createElement('div');
      sectionDiv.className = 'exam-section';
      const sectionTitle = document.createElement('div');
      sectionTitle.className = 'exam-section-title';
      sectionTitle.textContent = typeNames[type] || type;
      sectionDiv.appendChild(sectionTitle);
      
      const containerDiv = document.createElement('div');
      containerDiv.className = 'exam-items-container';
      
      if (type === 'terms' || type === 'tf' || type === 'complete') {
         const table = document.createElement('table');
         table.className = 'terms-table';
         const tbody = document.createElement('tbody');
         
         typeItems.forEach((item, index) => {
            const numTd = item.querySelector('.row-num');
            if(numTd) numTd.textContent = index + 1;
            
            const ans = item.querySelector('.row-a, .rtrue, .rfalse');
            if(ans) {
                const textSpan = document.createElement('span');
                textSpan.className = 'answer-text hidden-answer';
                while(ans.firstChild) {
                    textSpan.appendChild(ans.firstChild);
                }
                ans.appendChild(textSpan);
                
                const btn = document.createElement('button');
                btn.className = 'show-answer-btn';
                btn.textContent = 'Show Answer';
                btn.onclick = () => { 
                    btn.style.display = 'none'; 
                    textSpan.classList.remove('hidden-answer');
                };
                ans.appendChild(btn);
            }
            tbody.appendChild(item);
         });
         table.appendChild(tbody);
         containerDiv.appendChild(table);
               sectionDiv.appendChild(containerDiv);
      } else {
         typeItems.forEach((item, index) => {
            const padIndex = (index + 1).toString().padStart(2, '0');
            if (type === 'mcq') {
                const numSpan = item.querySelector('.mcq-qn .row-num');
                if (numSpan) numSpan.textContent = padIndex;
                
                const options = item.querySelectorAll('.opt');
                options.forEach(opt => {
                    opt.style.cursor = 'default';
                    opt.onclick = null;
                });
                
                const btnWrapper = document.createElement('div');
                btnWrapper.style.padding = '10px 0 0';
                const btn = document.createElement('button');
                btn.className = 'show-answer-btn';
                btn.textContent = 'Show Answer';
                btn.onclick = () => {
                    btnWrapper.style.display = 'none';
                    const correctOpt = item.querySelector('.correct-option');
                    if (correctOpt) {
                        correctOpt.classList.add('ok');
                        if (!correctOpt.innerHTML.includes('✓')) {
                            correctOpt.innerHTML += ' ✓';
                        }
                    }
                };
                btnWrapper.appendChild(btn);
                item.appendChild(btnWrapper);
            } else if (type === 'essay') {
                const numSpan = item.querySelector('.essay-num');
                if(numSpan) numSpan.textContent = 'Q ' + padIndex;
                item.classList.add('open');
                
                const eq = item.querySelector('.essay-q');
                if (eq) {
                  eq.removeAttribute('onclick');
                  eq.style.cursor = 'default';
                }
                const ans = item.querySelector('.essay-ans');
                if(ans) {
                    ans.classList.add('hidden-answer');
                    const btnWrapper = document.createElement('div');
                    btnWrapper.style.padding = '0 14px 14px 48px';
                    
                    const btn = document.createElement('button');
                    btn.className = 'show-answer-btn';
                    btn.textContent = 'Show Answer';
                    btn.onclick = () => { 
                        btn.style.display = 'none'; 
                        ans.classList.remove('hidden-answer'); 
                    };
                    btnWrapper.appendChild(btn);
                    item.appendChild(btnWrapper);
                }
            } else if (type === 'match') {
                const strips = item.querySelectorAll('.ans-strip');
                strips.forEach(strip => {
                    strip.classList.add('hidden-answer');
                    const btnWrapper = document.createElement('div');
                    btnWrapper.style.padding = '10px 0 0';
                    const btn = document.createElement('button');
                    btn.className = 'show-answer-btn';
                    btn.textContent = 'Show Answer';
                    btn.onclick = () => { 
                        btnWrapper.style.display = 'none'; 
                        strip.classList.remove('hidden-answer'); 
                    };
                    btnWrapper.appendChild(btn);
                    strip.parentNode.insertBefore(btnWrapper, strip.nextSibling);
                });
            } else if (type === 'compare') {
                const tbo = item.querySelector('tbody');
                if(tbo) {
                    tbo.classList.add('hidden-answer');
                    const btnWrapper = document.createElement('div');
                    btnWrapper.style.padding = '12px';
                    const btn = document.createElement('button');
                    btn.className = 'show-answer-btn';
                    btn.textContent = 'Show Answer';
                    btn.onclick = () => { btnWrapper.style.display = 'none'; tbo.classList.remove('hidden-answer'); };
                    btnWrapper.appendChild(btn);
                    item.appendChild(btnWrapper);
                }
            } else if (type === 'units') {
                const val = item.querySelector('.unit-val');
                if(val) {
                    val.classList.add('hidden-answer');
                    const btn = document.createElement('button');
                    btn.className = 'show-answer-btn';
                    btn.textContent = 'Show Answer';
                    btn.onclick = () => { btn.style.display = 'none'; val.classList.remove('hidden-answer'); };
                    val.parentNode.insertBefore(btn, val);
                }
            } else if (type === 'rules') {
                const val = item.querySelector('.rule-formula');
                if(val) {
                    val.classList.add('hidden-answer');
                    const btn = document.createElement('button');
                    btn.className = 'show-answer-btn';
                    btn.textContent = 'Show Answers';
                    btn.style.marginTop = '10px';
                    btn.onclick = () => { 
                        btn.style.display = 'none'; 
                        val.classList.remove('hidden-answer'); 
                    };
                    val.parentNode.insertBefore(btn, val);
                }
            } else if (type === 'debug') {
                const numSpan = item.querySelector('.dbn');
                if(numSpan) numSpan.textContent = 'BUG ' + padIndex;
                item.classList.add('open');
                const dbq = item.querySelector('.dbq');
                if (dbq) {
                  dbq.removeAttribute('onclick');
                  dbq.style.cursor = 'default';
                }
                const ans = item.querySelector('.dbans');
                if(ans) {
                    ans.classList.add('hidden-answer');
                    const btnWrapper = document.createElement('div');
                    btnWrapper.style.padding = '0 14px 14px 48px';
                    const btn = document.createElement('button');
                    btn.className = 'show-answer-btn';
                    btn.textContent = 'Show Answer';
                    btn.onclick = () => { 
                        btn.style.display = 'none'; 
                        ans.classList.remove('hidden-answer'); 
                    };
                    btnWrapper.appendChild(btn);
                    item.appendChild(btnWrapper);
                }
            }
            containerDiv.appendChild(item);
         });
         sectionDiv.appendChild(containerDiv);
      }
      examContent.appendChild(sectionDiv);
    }
  });
  
  const examModal = document.getElementById('examModal');
  examModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

let examTimerInterval = null;

const examCloseBtn = document.querySelector('.exam-modal-close');
if (examCloseBtn) {
  examCloseBtn.onclick = function() {
    document.getElementById('examModal').classList.remove('active');
    document.body.style.overflow = '';
  };
}

let currentThemeMode = localStorage.getItem('themeMode') || 'system';

function applyThemeMode() {
  const html = document.documentElement;
  if (currentThemeMode === 'system') {
    html.removeAttribute('data-theme');
  } else {
    html.setAttribute('data-theme', currentThemeMode);
  }
  const btn = document.getElementById('themeToggle');
  if (btn) {
    let iconName = 'monitor';
    let textVal = 'System';
    if (currentThemeMode === 'light') {
      iconName = 'sun';
      textVal = 'Light';
    } else if (currentThemeMode === 'dark') {
      iconName = 'moon';
      textVal = 'Dark';
    }
    btn.innerHTML = `<i data-lucide="${iconName}" class="theme-icon"></i><span>${textVal}</span>`;
    if (window.lucide) lucide.createIcons();
  }
}

function toggleTheme() {
  const modes = ['system', 'light', 'dark'];
  let idx = modes.indexOf(currentThemeMode);
  currentThemeMode = modes[(idx + 1) % modes.length];
  localStorage.setItem('themeMode', currentThemeMode);
  applyThemeMode();
}

function initMatching(root) {
  const wraps = root.classList && root.classList.contains('match-wrap') ? [root] : root.querySelectorAll('.match-wrap');
  wraps.forEach(matchWrap => {
    if (!matchWrap.closest('#examModal') && !matchWrap.closest('.exam-modal')) return;
    const strip = matchWrap.querySelector('.ans-strip');
    if (!strip) return;
    if (matchWrap.dataset.matchingInitialized === 'true') return;
    matchWrap.dataset.matchingInitialized = 'true';
    
    const cols = matchWrap.querySelectorAll('.match-cols > div');
    if (cols.length >= 2) {
      const colAItems = cols[0].querySelectorAll('.mi');
      const colBItems = cols[1].querySelectorAll('.mi');
      const answerMap = {};
      const chips = strip.querySelectorAll('.ans-chip');
      
      chips.forEach(chip => {
        const parts = chip.textContent.split(/[→\->➔]+/);
        if (parts.length === 2) {
          answerMap[parts[0].trim()] = parts[1].trim();
        }
      });
      
      let activeA = null;
      let activeB = null;
      
      const checkMatch = () => {
        if (activeA && activeB) {
          const valA = activeA.querySelector('.ml').textContent.trim();
          const valB = activeB.querySelector('.ml').textContent.trim();
          if (answerMap[valA] === valB) {
            activeA.classList.remove('active-match');
            activeB.classList.remove('active-match');
            activeA.classList.add('paired-success');
            activeB.classList.add('paired-success');
          } else {
            const a = activeA;
            const b = activeB;
            a.classList.remove('active-match');
            b.classList.remove('active-match');
            a.classList.add('paired-error');
            b.classList.add('paired-error');
            setTimeout(() => {
              a.classList.remove('paired-error');
              b.classList.remove('paired-error');
            }, 600);
          }
          activeA = null;
          activeB = null;
        }
      };
      
      colAItems.forEach(mi => {
        mi.classList.add('match-clickable');
        mi.style.cursor = 'pointer';
        mi.onclick = () => {
          if (mi.classList.contains('paired-success')) return;
          colAItems.forEach(m => m.classList.remove('active-match'));
          mi.classList.add('active-match');
          activeA = mi;
          checkMatch();
        };
      });
      
      colBItems.forEach(mi => {
        mi.classList.add('match-clickable');
        mi.style.cursor = 'pointer';
        mi.onclick = () => {
          if (mi.classList.contains('paired-success')) return;
          colBItems.forEach(m => m.classList.remove('active-match'));
          mi.classList.add('active-match');
          activeB = mi;
          checkMatch();
        };
      });
    }
  });
}
