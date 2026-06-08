'use strict';
// Runs generateICS() from app.js in a mocked browser context and writes docs/calendar.ics.
// Run with: node scripts/gen-ics.js
// Also executed automatically by the gen-ics GitHub Actions workflow on every push that touches app.js.

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

const root  = path.join(__dirname, '..');
const appJs = fs.readFileSync(path.join(root, 'docs/assets/js/app.js'), 'utf8');

const noop  = () => {};
const noEl  = { disabled: false, value: '', classList: { add: noop, remove: noop }, style: {}, focus: noop, textContent: '' };
const noEls = { forEach: noop };
const mockDoc = {
  getElementById:   () => noEl,
  querySelector:    () => noEl,
  querySelectorAll: () => noEls,
  addEventListener: noop,
};

const ctx = vm.createContext({
  document:     mockDoc,
  window:       {},
  sessionStorage: { getItem: k => (k === 'sr_attempts' || k === 'sr_lockout') ? '0' : null, setItem: noop, removeItem: noop },
  localStorage:   { getItem: () => null, setItem: noop, removeItem: noop },
  setTimeout:   () => 0,
  clearTimeout: noop,
  setInterval:  () => 0,
  clearInterval: noop,
  console,
});

vm.runInContext(appJs, ctx);

const ics = ctx.generateICS();
fs.writeFileSync(path.join(root, 'docs/calendar.ics'), ics);

const count = (ics.match(/BEGIN:VEVENT/g) || []).length;
console.log(`calendar.ics regenerated — ${count} events`);
