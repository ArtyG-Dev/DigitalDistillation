/* Merges the original Rohn almanac data with data/entries.new.js into data/entries.js */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const html = fs.readFileSync(path.join(root, 'data', 'rohn-source.html'), 'utf8');
const m = html.match(/const DATA = (\[[\s\S]*?\n\];)/);
if (!m) throw new Error('Rohn DATA block not found');
const ROHN = eval(m[1].replace(/;\s*$/, ''));

global.window = {};
require(path.join(root, 'data', 'entries.new.js'));
const NEW = global.window.DD_NEW;

global.window = {};
require(path.join(root, 'data', 'entries.c21.js'));
const C21 = global.window.DD_NEW_C21;

const rohn = ROHN.map(d => ({
  id: 'rohn-' + String(d.n).padStart(2, '0'),
  au: 'rohn', s: d.s, a: d.a, p: d.p, k: d.k, src: d.src
}));

const all = rohn.concat(NEW, C21);

// integrity checks
const ids = all.map(e => e.id);
if (new Set(ids).size !== ids.length) throw new Error('duplicate ids');
global.window = {};
require(path.join(root, 'data', 'authors.js'));
const authorIds = new Set(global.window.DD_AUTHORS.map(a => a.id));
const eras = new Set(global.window.DD_ERAS);
global.window.DD_AUTHORS.forEach(a => {
  if (!eras.has(a.era)) throw new Error('unknown era on author ' + a.id + ': ' + a.era);
});
const withEntries = new Set(all.map(e => e.au));
global.window.DD_AUTHORS.forEach(a => {
  if (!withEntries.has(a.id)) throw new Error('author has no entries: ' + a.id);
});
all.forEach(e => {
  if (!authorIds.has(e.au)) throw new Error('unknown author: ' + e.au);
  if (!e.s || !e.a || !e.p || !e.src || !Array.isArray(e.k) || e.k.length < 3)
    throw new Error('incomplete entry: ' + e.id);
});

const out =
`/* Digital Distillation — entry corpus. GENERATED: edit entries.new.js or re-run tools/build-entries.js.
   Every entry is an ORIGINAL wording expressing a documented idea. None is a quotation.
   Fields: id | au (author id) | s (subject) | a (affirmation) | p (practice) | k (keywords) | src (attribution) */

window.DD_ENTRIES = [
${all.map(e => '  ' + JSON.stringify(e)).join(',\n')}
];
`;
fs.writeFileSync(path.join(root, 'data', 'entries.js'), out);
console.log('entries:', all.length, '| authors:', new Set(all.map(e=>e.au)).size);
