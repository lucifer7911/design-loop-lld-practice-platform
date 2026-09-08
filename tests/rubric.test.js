const test = require('node:test');
const assert = require('node:assert/strict');
const { rubricFor } = require('../app.js');

test('recognises a detailed design across rubric dimensions', () => {
  const report = rubricFor('Classes include Vehicle, ParkingSpot and Ticket. The lot owns floors and delegates allocation. A PricingStrategy interface makes fee rules extensible. If a floor is full, return an unavailable error.');
  assert.ok(report.score >= 80);
  assert.ok(report.checks.filter(x => x.pass).length >= 4);
});
test('gives a concrete next step for a sparse submission', () => {
  const report = rubricFor('I would build a parking system.');
  assert.ok(report.score < 70);
  assert.ok(report.next.prompt.length > 10);
});
test('never returns a score above 96', () => {
  const report = rubricFor('class vehicle spot ticket floor lot responsibility owns relationship interface strategy full error '.repeat(100));
  assert.equal(report.score, 96);
});

test('coaching names the selected problem instead of assuming parking lot', () => {
  const report = rubricFor('The machine has a ProductSlot and a Transaction. A State interface handles payment. If stock is unavailable, return an error.', { title: 'Design a vending machine' });
  assert.match(report.coach, /vending machine/);
  assert.doesNotMatch(report.coach, /parking session/);
});
