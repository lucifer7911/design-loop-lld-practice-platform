const problems = [
  {
    id: 'parking-lot', title: 'Design a parking lot', level: 'INTERMEDIATE', time: '~ 35 min',
    summary: 'Model a multi-floor parking lot that assigns vehicles to suitable spots and calculates fees.',
    brief: ['The lot has multiple floors and parking spots of different sizes.', 'Support motorcycles, cars, and trucks. A vehicle should get the closest compatible open spot.', 'Issue a ticket at entry and calculate a time-based fee when a vehicle exits.', 'Show available capacity by floor and vehicle type.'],
    constraints: ['A spot can only hold one active vehicle.', 'Fee rules may vary by vehicle type.', 'Do not assume a database or UI framework. Focus on the object model.'],
    hints: ['Separate allocation from fee calculation.', 'A ticket captures a parking session; it should not own the lot.', 'Ask which object is responsible for releasing a spot.'],
    tags: ['Object modelling', 'Strategy pattern', 'State']
  },
  {
    id: 'vending-machine', title: 'Design a vending machine', level: 'FOUNDATIONAL', time: '~ 25 min',
    summary: 'Model product selection, payment, dispensing, and handling out-of-stock products.',
    brief: ['A customer selects a product and inserts one or more coins.', 'Dispense the product and correct change when payment is sufficient.', 'The machine needs to expose stock and price updates to an operator.'],
    constraints: ['A product slot has finite inventory.', 'A failed transaction must not lose a customer’s balance.', 'Make adding a payment method feasible later.'],
    hints: ['A state object can represent the current transaction.', 'Product catalogues and stock are different concerns.'],
    tags: ['State pattern', 'Transactions', 'Extensibility']
  },
  {
    id: 'elevator', title: 'Design an elevator system', level: 'ADVANCED', time: '~ 40 min',
    summary: 'Coordinate elevator cars responding to external requests across a building.',
    brief: ['A building has several elevator cars and floors.', 'Users can request travel up or down from a floor and choose a destination inside a car.', 'The controller should choose an appropriate car and maintain a sensible route.'],
    constraints: ['Each car has capacity and a current direction.', 'Requests may arrive while a car is moving.', 'Keep scheduling replaceable.'],
    hints: ['External and internal requests have different information.', 'Start with a simple dispatch rule before optimizing it.'],
    tags: ['Scheduling', 'Observer pattern', 'State']
  }
];

function rubricFor(text, problem = null) {
  const lower = text.toLowerCase();
  const categories = [
    ['Core objects', /class|object|vehicle|spot|ticket|floor|lot/, 'Name at least the main domain objects and their responsibilities.'],
    ['Responsibilities', /responsib|owns|handles|delegat|manag/, 'Make ownership explicit: which object allocates and releases a spot?'],
    ['Relationships', /has.?a|contains|associate|composition|relationship/, 'Describe how the key objects relate instead of listing isolated classes.'],
    ['Extensibility', /interface|strategy|abstract|polymorph|extend|inject/, 'Show one seam for change, such as pluggable pricing rules.'],
    ['Edge cases', /full|unavailable|fail|invalid|duplicate|error|occupied/, 'Address at least one unhappy path such as a full lot or invalid exit.']
  ];

  const checks = categories.map(([name, pattern, prompt]) => ({ name, pass: pattern.test(lower), prompt }));
  const passed = checks.filter(c => c.pass).length;
  const score = Math.min(96, 38 + passed * 11 + Math.min(8, Math.floor(text.trim().length / 120)));
  const missing = checks.filter(c => !c.pass);
  const strength = checks.find(c => c.pass)?.name || 'a starting domain vocabulary';
  const next = missing[0] || checks[0];
  const subject = problem ? problem.title.toLowerCase().replace('design a ', '') : 'this design';

  return {
    checks,
    score,
    strength,
    next,
    coach: `Your ${subject} design establishes ${strength.toLowerCase()}. The strongest next move is to turn the written flow into explicit collaborations: keep orchestration in a focused service, keep state in the object that owns it, and put changing rules behind a small interface.`
  };
}

const storage = typeof localStorage === 'undefined' ? { getItem: () => null, setItem: () => {}, removeItem: () => {} } : localStorage;
const state = { selected: 0, attempts: JSON.parse(storage.getItem('design-loop-attempts') || '[]') };
const profile = { name: 'Kaustubh', role: 'Design learner' };
const $ = s => document.querySelector(s);

function activeProblem() {
  return problems[state.selected];
}

function updateProfile() {
  const nameEl = $('#profile-name');
  const roleEl = $('#profile-role');
  if (nameEl) nameEl.textContent = profile.name;
  if (roleEl) roleEl.textContent = profile.role;
}

function renderProblem(tab = 'brief') {
  const p = activeProblem();
  const title = $('#problem-title');
  const summary = $('#problem-summary');
  const tag = $('.tag');
  const time = $('.time');
  const focus = $('#focus-tags');
  const briefContent = $('#brief-content');

  if (title) title.textContent = p.title;
  if (summary) summary.textContent = p.summary;
  if (tag) tag.textContent = p.level;
  if (time) time.textContent = p.time;
  if (focus) focus.innerHTML = p.tags.map(t => `<span class="focus-tag">${t}</span>`).join('');

  const label = tab === 'brief' ? 'What to design' : tab === 'constraints' ? 'Constraints to respect' : 'A nudge, not a solution';
  if (briefContent) {
    briefContent.innerHTML = `<h3>${label}</h3><ol>${p[tab].map(x => `<li>${x}</li>`).join('')}</ol><div class="choice-row"><span>Try another prompt</span><select id="problem-picker">${problems.map((x, i) => `<option value="${i}" ${i === state.selected ? 'selected' : ''}>${x.title}</option>`).join('')}</select></div>`;
  }

  const picker = $('#problem-picker');
  if (picker) {
    picker.onchange = e => {
      state.selected = Number(e.target.value);
      const solution = $('#solution');
      if (solution) solution.value = '';
      const saveState = $('#save-state');
      if (saveState) {
        saveState.textContent = '● Saved locally';
        saveState.className = 'saved';
      }
      renderProblem();
    };
  }
}

function renderHistory() {
  const count = $('#attempt-count');
  if (count) count.textContent = state.attempts.length;

  const list = $('#history-list');
  if (!list) return;

  if (!state.attempts.length) {
    list.innerHTML = '<div class="empty-history">Your submitted designs will show up here — feedback becomes more useful over time.</div>';
    return;
  }

  list.innerHTML = state.attempts.map((a, index) => `
    <article class="attempt">
      <div class="attempt-score">${a.score}</div>
      <div>
        <strong>${a.problem}</strong>
        <p>${escapeHtml(a.preview)}</p>
      </div>
      <div class="attempt-meta">
        <span>${a.date}</span>
        <small>${a.status}</small>
        ${a.text && a.report ? `<button class="review-button" data-attempt="${index}">Review</button>` : ''}
      </div>
    </article>
  `).join('');
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[character]));
}

function renderFeedback(report) {
  const slot = $('#feedback-section');
  if (!slot) return;

  slot.innerHTML = '';
  slot.append($('#feedback-template').content.cloneNode(true));
  slot.classList.remove('hidden');

  $('#score').textContent = report.score;
  $('#checks').innerHTML = report.checks.map(c => `
    <div class="check ${c.pass ? 'pass' : ''}">
      <span>${c.pass ? '✓' : '○'}</span>
      <div>
        <strong>${c.name}</strong>
        <small>${c.pass ? 'Present in your submission' : c.prompt}</small>
      </div>
    </div>
  `).join('');

  $('#coach-feedback').innerHTML = `
    <p>${report.coach}</p>
    <div class="coach-note"><b>Why this feedback?</b> It is based on what your submission explicitly describes—not on a single “correct” class diagram.</div>
  `;

  $('#next-title').textContent = `Improve: ${report.next.name}`;
  $('#next-copy').textContent = report.next.prompt;
  $('#try-again').onclick = () => {
    $('#solution').focus();
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  slot.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetPracticeState() {
  state.selected = 0;

  const solution = $('#solution');
  const feedback = $('#feedback-section');
  const saveState = $('#save-state');

  if (solution) solution.value = '';

  if (feedback) {
    feedback.classList.add('hidden');
    feedback.innerHTML = '';
  }

  if (saveState) {
    saveState.textContent = '● Saved locally';
    saveState.className = 'saved';
  }

  document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab.dataset.tab === 'brief'));

  const picker = $('#problem-picker');
  if (picker) picker.value = '0';

  renderProblem('brief');
}

async function submit() {
  const text = $('#solution').value.trim();

  if (text.length < 40) {
    $('#save-state').textContent = 'Add a little more detail before submitting';
    $('#save-state').className = 'warning';
    return;
  }

  $('#submit-button').disabled = true;
  $('#submit-button').innerHTML = 'Reviewing design…';
  $('#save-state').textContent = '● Evaluation in progress';

  const problem = activeProblem();
  let report;
  try {
    const response = await fetch('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problem, text })
    });
    if (!response.ok) throw new Error('External evaluator unavailable');
    report = (await response.json()).report;
  } catch (error) {
    report = { ...rubricFor(text, problem), source: 'local-fallback' };
  }

    renderFeedback(report);

    state.attempts.unshift({
      problem: problem.title,
      problemId: problem.id,
      text,
      report,
      score: report.score,
      preview: text.slice(0, 110) + (text.length > 110 ? '…' : ''),
      date: 'Just now',
      status: 'Feedback ready'
    });

    storage.setItem('design-loop-attempts', JSON.stringify(state.attempts));
    renderHistory();
    $('#submit-button').disabled = false;
    $('#submit-button').innerHTML = 'Submit for feedback <span>→</span>';
    $('#save-state').textContent = '● Feedback saved';
    $('#save-state').className = 'saved';
}

if (typeof document !== 'undefined') {
  const tabs = document.querySelectorAll('.tab');
  const tabHost = $('.problem-tabs');
  if (tabHost) {
    tabHost.addEventListener('click', e => {
      const tabButton = e.target.closest('.tab');
      if (!tabButton) return;
      tabs.forEach(x => x.classList.remove('active'));
      tabButton.classList.add('active');
      renderProblem(tabButton.dataset.tab);
    });
  }

  const submitButton = $('#submit-button');
  if (submitButton) submitButton.addEventListener('click', submit);

  const solution = $('#solution');
  if (solution) {
    solution.addEventListener('input', () => {
      const saveState = $('#save-state');
      if (saveState) {
        saveState.textContent = '● Saved locally';
        saveState.className = 'saved';
      }
    });

    solution.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit();
    });
  }

  const clearHistory = $('#clear-history');
  if (clearHistory) {
    clearHistory.onclick = () => {
      state.attempts = [];
      storage.removeItem('design-loop-attempts');
      renderHistory();
    };
  }

  const historyList = $('#history-list');
  if (historyList) {
    historyList.addEventListener('click', e => {
      const button = e.target.closest('[data-attempt]');
      if (!button) return;
      const attempt = state.attempts[Number(button.dataset.attempt)];
      state.selected = Math.max(0, problems.findIndex(problem => problem.id === attempt.problemId));
      renderProblem();
      if (solution) solution.value = attempt.text;
      renderFeedback(attempt.report);
      $('#practice').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  const resetButton = $('#reset-demo');
  if (resetButton) resetButton.onclick = resetPracticeState;

  updateProfile();
  renderProblem();
  renderHistory();
}

if (typeof module !== 'undefined') module.exports = { rubricFor, resetPracticeState, updateProfile };
