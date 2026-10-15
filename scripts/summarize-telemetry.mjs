// Summarize playtest telemetry for PROTOTYPE.md.
// Usage: npm run telemetry            (reads every telemetry/*.json)
//        node scripts/summarize-telemetry.mjs path/to/folder
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2] ?? 'telemetry';
const files = readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
if (files.length === 0) {
  console.log(`No .json files in ${dir}/`);
  process.exit(0);
}

const pct = (x) => `${Math.round(x * 100)}%`;
const median = (xs) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const all = [];
for (const file of files) {
  const data = JSON.parse(readFileSync(join(dir, file), 'utf8'));
  const events = data.events ?? [];
  const runs = events.filter((e) => e.type === 'run_end' && e.cause !== 'quit');
  const retries = events.filter((e) => e.type === 'retry' && !e.midRun);
  const fastRetries = retries.filter((e) => e.secondsSinceEnd <= 5);
  const first = runs[0];
  const last = runs[runs.length - 1];
  const causes = runs.reduce((m, r) => ({ ...m, [r.cause]: (m[r.cause] ?? 0) + 1 }), {});
  const byVariant = [1, 2].map((v) => runs.filter((r) => r.variant === v));
  const briefings = events.filter((e) => e.type === 'briefing_close').map((e) => `V${e.variant} ${e.secondsOpen}s`);

  const row = {
    file,
    runs: runs.length,
    wins: causes.domesticated ?? 0,
    medianDuration: +median(runs.map((r) => r.duration)).toFixed(1),
    maxSeasons: Math.max(0, ...runs.map((r) => r.seasons)),
    cannonFirst: first ? first.cannonShare : null,
    cannonLast: last ? last.cannonShare : null,
    retryWithin5s: retries.length ? `${fastRetries.length}/${retries.length}` : '0/0',
    docileKills: runs.reduce((s, r) => s + (r.docileKills ?? 0), 0),
    hostileKills: runs.reduce((s, r) => s + (r.hostileKills ?? 0), 0),
    hostileEscaped: runs.reduce((s, r) => s + (r.hostileEscaped ?? 0), 0),
    causes,
    v1Runs: byVariant[0].length,
    v2Runs: byVariant[1].length,
    v1Wins: byVariant[0].filter((r) => r.cause === 'domesticated').length,
    v2Wins: byVariant[1].filter((r) => r.cause === 'domesticated').length,
    briefings,
  };
  all.push(row);

  console.log(`\n== ${file}`);
  console.log(`  runs ${row.runs} · wins ${row.wins} · median run ${row.medianDuration}s · best season ${row.maxSeasons}`);
  console.log(`  cannon share: first run ${row.cannonFirst === null ? '-' : pct(row.cannonFirst)} -> last run ${row.cannonLast === null ? '-' : pct(row.cannonLast)}`);
  console.log(`  restarts within 5 s of a run ending: ${row.retryWithin5s}`);
  console.log(`  kills: ${row.hostileKills} hostile, ${row.docileKills} docile · hostile escaped: ${row.hostileEscaped}`);
  console.log(`  run endings: ${JSON.stringify(causes)}`);
  console.log(`  V1: ${row.v1Runs} runs / ${row.v1Wins} wins · V2: ${row.v2Runs} runs / ${row.v2Wins} wins`);
  console.log(`  briefing time read: ${briefings.join(', ') || '-'}`);
}

const dropped = all.filter((r) => r.cannonFirst !== null && r.cannonLast !== null && r.runs > 1);
const fell = dropped.filter((r) => r.cannonLast < r.cannonFirst).length;
console.log('\n== ALL TESTERS');
console.log(`  files ${all.length} · runs ${all.reduce((s, r) => s + r.runs, 0)} · wins ${all.reduce((s, r) => s + r.wins, 0)}`);
console.log(`  cannon share fell from first to last run for ${fell} of ${dropped.length} testers with 2+ runs`);
console.log(`  V1 wins ${all.reduce((s, r) => s + r.v1Wins, 0)}/${all.reduce((s, r) => s + r.v1Runs, 0)} runs · V2 wins ${all.reduce((s, r) => s + r.v2Wins, 0)}/${all.reduce((s, r) => s + r.v2Runs, 0)} runs`);
