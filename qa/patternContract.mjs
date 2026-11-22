// Run before/after registry reconciliation. Only imports type-erased pure engines.
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const { analyzePatterns, ALL_PATTERNS } = await import(pathToFileURL(resolve('src/engine/patterns.ts')));
const { createEmptyChain, placeTile } = await import(pathToFileURL(resolve('src/engine/chain.ts')));

export const examples = {
  cadena_simple: [1,2,3,4], cadena_larga: [0,1,2,3,4,5],
  cadena_maxima: [0,1,2,3,4,5,6,0], doble_doble: [1,1,2,2],
  triple_doble: [1,1,2,2,3,3], todo_dobles: [2,2,2,2],
  dominio: [2,2,2,3], cierre_exacto: [1,2,3,1], escalera: [0,1,2,3,4],
  simetria: [1,2,2,1], parejas: [1,2,1,2,1], racha_alta: [4,5,6,4],
  racha_baja: [0,1,2,1,0], alternancia: [1,1,2,2,3],
  suma_exacta: [3,4,4,2], puente: [0,1,2,3,4,6], espejo: [1,2,1,2,3],
  zigzag: [1,4,2,5,1,3], suma_impar: [0,1,2,3,4], avalancha: [0,1,2,3,4],
  trinidad: [1,2,1,3], fractal: [0,1,1,3,1], armonia: [4,5,4,1],
  constelacion: [0,1,2,3,4,5], diminuendo: [6,5,4,3,2],
  corona: [1,1,2,2,3,3], hexagrama: [0,1,2,3,4,5,6],
  triple_filo: [0,0,1,1,2,2,3], crescendo: [0,1,2,3,4],
  cuna: [1,2,1,2], ouroboros: [0,1,2,3,4,5,6,0],
};
const chainOf = values => values.slice(1).reduce((chain, value, i) =>
  placeTile(chain, { id: `fixture-${i}`, top: values[i], bottom: value, type: 'normal' }, 'right'), createEmptyChain());
let cursor = 0xD01A1;
const random = n => { cursor = (Math.imul(cursor, 1664525) + 1013904223) >>> 0; return cursor % n; };
const chains = Object.values(examples).map(chainOf);
for (let sample = 0; sample < 2000; sample++) {
  let chain = createEmptyChain();
  const length = random(31);
  for (let i = 0; i < length; i++) {
    const side = random(2) ? 'left' : 'right';
    const end = (side === 'left' ? chain.leftEnd : chain.rightEnd) ?? random(7);
    const other = random(7), flip = random(2);
    const type = ['normal','normal','normal','wild','mirror'][random(5)];
    chain = placeTile(chain, { id: `${sample}-${i}`, top: flip ? other : end, bottom: flip ? end : other, type }, side);
  }
  chains.push(chain);
}
const results = chains.map(analyzePatterns);
for (const [id, values] of Object.entries(examples)) {
  if (!analyzePatterns(chainOf(values)).patterns.some(p => p.id === id)) throw Error(`Invalid example: ${id}`);
}
const actual = { count: chains.length, sha256: createHash('sha256').update(JSON.stringify(results)).digest('hex'),
  coverage: [...new Set(results.flatMap(r => r.patterns.map(p => p.id)))].sort(),
  registryDifferences: ALL_PATTERNS.filter(p => results.flatMap(r=>r.patterns).some(r => r.id === p.id && (r.bonus !== p.bonus || r.multiplier !== p.multiplier))).map(p=>p.id) };
const mode = process.argv[2], path = process.argv[3];
if (mode === 'capture') await writeFile(path, JSON.stringify(actual,null,2));
else if (mode === 'verify') {
  const before = JSON.parse(await readFile(path,'utf8'));
  if (actual.sha256 !== before.sha256 || actual.count !== before.count) throw Error('Pattern gameplay changed');
  if (actual.registryDifferences.length) throw Error('Registry still diverges');
}
console.log(actual);
