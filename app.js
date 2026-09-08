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
  return { checks, score, strength, next, coach: `Your ${subject} design establishes ${strength.toLowerCase()}. The strongest next move is to turn the written flow into explicit collaborations: keep orchestration in a focused service, keep state in the object that owns it, and put changing rules behind a small interface.` };
}

const storage = typeof localStorage === 'undefined' ? { getItem: () => null, setItem: () => {}, removeItem: () => {} } : localStorage;
const state = { selected: 0, attempts: JSON.parse(storage.getItem('design-loop-attempts') || '[]') };
const $ = s => document.querySelector(s);
function activeProblem() { return problems[state.selected]; }
function renderProblem(tab = 'brief') {
  const p = activeProblem();
  $('#problem-title').textContent = p.title; $('#problem-summary').textContent = p.summary;
  $('.tag').textContent = p.level; $('.time').textContent = p.time; $('#focus-tags').innerHTML = p.tags.map(t => `<span class="focus-tag">${t}</span>`).join('');
  const label = tab === 'brief' ? 'What to design' : tab === 'constraints' ? 'Constraints to respect' : 'A nudge, not a solution';
  $('#brief-content').innerHTML = `<h3>${label}</h3><ol>${p[tab].map(x => `<li>${x}</li>`).join('')}</ol><div class="choice-row"><span>Try another prompt</span><select id="problem-picker">${problems.map((x,i) => `<option value="${i}" ${i===state.selected?'selected':''}>${x.title}</option>`).join('')}</select></div>`;
  $('#problem-picker').addEventListener('change', e => { state.selected = Number(e.target.value); $('#solution').value = ''; renderProblem(); });
}
function renderHistory() {
  $('#attempt-count').textContent = state.attempts.length;
  const list = $('#history-list');
  if (!state.attempts.length) { list.innerHTML = '<div class="empty-history">Your submitted designs will show up here — feedback becomes more useful over time.</div>'; return; }
  list.innerHTML = state.attempts.map((a, index) => `<article class="attempt"><div class="attempt-score">${a.score}</div><div><strong>${a.problem}</strong><p>${escapeHtml(a.preview)}</p></div><div class="attempt-meta"><span>${a.date}</span><small>${a.status}</small>${a.text && a.report ? `<button class="review-button" data-attempt="${index}">Review</button>` : ''}</div></article>`).join('');
}
function escapeHtml(value) { return value.replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character])); }
function renderFeedback(report) {
  const slot = $('#feedback-section');
  slot.innerHTML = ''; slot.append($('#feedback-template').content.cloneNode(true)); slot.classList.remove('hidden');
  $('#score').textContent = report.score;
  $('#checks').innerHTML = report.checks.map(c => `<div class="check ${c.pass ? 'pass' : ''}"><span>${c.pass ? '✓' : '○'}</span><div><strong>${c.name}</strong><small>${c.pass ? 'Present in your submission' : c.prompt}</small></div></div>`).join('');
  $('#coach-feedback').innerHTML = `<p>${report.coach}</p><div class="coach-note"><b>Why this feedback?</b> It is based on what your submission explicitly describes—not on a single “correct” class diagram.</div>`;
  $('#next-title').textContent = `Improve: ${report.next.name}`; $('#next-copy').textContent = report.next.prompt;
  $('#try-again').onclick = () => { $('#solution').focus(); window.scrollTo({top: 180, behavior: 'smooth'}); };
  slot.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function submit() {
  const text = $('#solution').value.trim();
  if (text.length < 40) { $('#save-state').textContent = 'Add a little more detail before submitting'; $('#save-state').className = 'warning'; return; }
  $('#submit-button').disabled = true; $('#submit-button').innerHTML = 'Reviewing design…'; $('#save-state').textContent = '● Evaluation in progress';
  setTimeout(() => {
    const report = rubricFor(text, activeProblem());
    renderFeedback(report);
    state.attempts.unshift({ problem: activeProblem().title, problemId: activeProblem().id, text, report, score: report.score, preview: text.slice(0, 110) + (text.length > 110 ? '…' : ''), date: 'Just now', status: 'Feedback ready' });
    storage.setItem('design-loop-attempts', JSON.stringify(state.attempts)); renderHistory(); $('#submit-button').disabled = false; $('#submit-button').innerHTML = 'Submit for feedback <span>→</span>'; $('#save-state').textContent = '● Feedback saved'; $('#save-state').className = 'saved';
  }, 850);
}
if (typeof document !== 'undefined') {
  $('.problem-tabs').addEventListener('click', e => { if (!e.target.matches('.tab')) return; document.querySelectorAll('.tab').forEach(x => x.classList.remove('active')); e.target.classList.add('active'); renderProblem(e.target.dataset.tab); });
  $('#submit-button').addEventListener('click', submit);
  $('#solution').addEventListener('input', () => { $('#save-state').textContent = '● Saved locally'; $('#save-state').className = 'saved'; });
  $('#solution').addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit(); });
  $('#clear-history').onclick = () => { state.attempts = []; storage.removeItem('design-loop-attempts'); renderHistory(); };
  $('#history-list').addEventListener('click', e => {
    const button = e.target.closest('[data-attempt]');
    if (!button) return;
    const attempt = state.attempts[Number(button.dataset.attempt)];
    state.selected = Math.max(0, problems.findIndex(problem => problem.id === attempt.problemId));
    renderProblem(); $('#solution').value = attempt.text; renderFeedback(attempt.report);
    $('#practice').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('#reset-demo').onclick = () => { $('#solution').value = ''; $('#feedback-section').classList.add('hidden'); $('#feedback-section').innerHTML = ''; };
  renderProblem(); renderHistory();
}
if (typeof module !== 'undefined') module.exports = { rubricFor };
