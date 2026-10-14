// Tiny in-memory telemetry. No network calls, no libraries. Press T to download JSON.

export interface TelemetryEvent {
  t: number; // ms since session start
  type: string;
  [key: string]: unknown;
}

const sessionStart = new Date();
const t0 = performance.now();
const events: TelemetryEvent[] = [];

export function log(type: string, data: Record<string, unknown> = {}) {
  events.push({ t: Math.round(performance.now() - t0), type, ...data });
}

const median = (xs: number[]) => {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

export function summary() {
  const ends = events.filter((e) => e.type === 'run_end');
  const retries = events.filter((e) => e.type === 'retry').length;
  const durations = ends.map((e) => e.duration as number);
  const dart = ends.reduce((s, e) => s + (e.dartShots as number), 0);
  const cannon = ends.reduce((s, e) => s + (e.cannonShots as number), 0);
  return {
    runs: ends.length,
    medianDuration: +median(durations).toFixed(1),
    retryPct: ends.length ? Math.round((100 * retries) / ends.length) : 0,
    cannonPct: dart + cannon ? Math.round((100 * cannon) / (dart + cannon)) : 0,
  };
}

export function summaryLine() {
  const s = summary();
  return `runs ${s.runs} · median ${s.medianDuration}s · retry ${s.retryPct}% · cannon ${s.cannonPct}% · [T] export`;
}

export function download() {
  const stamp = sessionStart.toISOString().replace(/[:.]/g, '-');
  const payload = {
    game: 'Pressure (Lab B prototype)',
    sessionStart: sessionStart.toISOString(),
    exportedAt: new Date().toISOString(),
    summary: summary(),
    events,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `pressure-telemetry-${stamp}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  log('export', { eventCount: events.length });
}
