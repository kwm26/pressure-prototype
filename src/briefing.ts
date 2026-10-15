// Start-of-session briefing popup. Both variants show goal, bug key (shoot/spare), tools and controls;
// Variant 2 also explains fertility (fill color) and inheritance.
import { CONFIG as C } from './config';

export type Variant = 1 | 2;

let overlay: HTMLDivElement | null = null;
let onClose: (() => void) | null = null;

const swatch = (fill: string, pulse = false) =>
  `<span class="sw${pulse ? ' pulse' : ''}" style="background:${fill};"></span>`;

// SVG bug icon drawn the same way as in the game: fill = fertility, outline = hostility.
export function bugIcon(aggr: 0 | 1 | 2, size = 34, fill = '#3fd1c0') {
  const ring = aggr === 1 ? '<circle cx="17" cy="17" r="10" fill="none" stroke="#ffb347" stroke-width="2.5"/>' : '';
  const spikes = aggr === 2
    ? '<circle cx="17" cy="17" r="10" fill="none" stroke="#ff3b3b" stroke-width="3"/>' +
      [45, 135, 225, 315].map((d) => {
        const a = (d * Math.PI) / 180;
        return `<line x1="${17 + Math.cos(a) * 10}" y1="${17 + Math.sin(a) * 10}" x2="${17 + Math.cos(a) * 16}" y2="${17 + Math.sin(a) * 16}" stroke="#ff3b3b" stroke-width="3"/>`;
      }).join('')
    : '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 34 34"><circle cx="17" cy="17" r="9" fill="${fill}"/>${ring}${spikes}</svg>`;
}

// Shown in BOTH variants: which bugs to shoot and which to spare.
const bugKey = `
    <h3>Bug types: what to shoot</h3>
    <div class="key">
      <div class="spare">${bugIcon(0)}<b>DOCILE</b><span>no outline</span><em>SPARE</em><small>Harmless. You need ${C.domesticMinSurvivors}+ of these to escape.</small></div>
      <div class="shoot">${bugIcon(1)}<b>HOSTILE</b><span>orange ring</span><em>SHOOT</em><small>Chews through the green blocks.</small></div>
      <div class="shoot">${bugIcon(2)}<b>HUNTER</b><span>red spikes</span><em>SHOOT FIRST</em><small>Breaks off near the bottom and chases you.</small></div>
    </div>
    <p class="note">Only the <b>outline</b> decides what to shoot. A shown key stays in the bottom-left corner while you play.</p>`;

function html(variant: Variant) {
  // V2 only: how fill color (fertility) and inheritance shape the next wave.
  const legend = variant === 2 ? `
    <h3>How the next wave is made</h3>
    <p><b>Fill color = fertility</b>: how many offspring an escaped bug has.</p>
    <p>${swatch('#4a6b5a')} sterile: no offspring · ${swatch('#3fd1c0')} fertile: some · ${swatch('#ff4fd8', true)} very fertile (pulses): many</p>
    <p class="note">Offspring inherit outline and color from their parents (with a small chance of mutation). Every hostile that escapes means more hostiles next season. A very fertile one means a lot more.</p>` : '';

  return `
  <div class="card">
    <h2>PRESSURE</h2>
    <p class="tag">You're not here to exterminate the swarm. You're here to breed it into something harmless.</p>

    <h3>Goal</h3>
    <p><b>Finish a season where only docile (non-hostile) bugs escape, at least ${C.domesticMinSurvivors} of them.</b></p>
    <p>Bugs that reach the bottom <b>escape and breed</b> into next season's swarm. Their offspring inherit their traits, so whatever you let through, you get more of.</p>

    ${bugKey}

    <h3>You lose if</h3>
    <p>a bug touches you · the swarm grows to ${C.overrunCap} · you kill every bug (nothing left to tame)</p>

    <h3>Tools</h3>
    <p><b>Dart</b> (white): fast, kills one bug per shot. Precise.</p>
    <p><b>Cannon</b> (orange): slow, kills everything in the blast, <i>docile bugs too</i>, and can split bugs at the edge into clones.</p>
    ${legend}
    <h3>Controls</h3>
    <p>Move: mouse, WASD or arrows (anywhere in the bottom strip) · Shoot: click or Space · Swap tool: Q or right-click · Restart: R · This briefing: H</p>

    <button id="brief-start">Press Space to start</button>
    <p class="variant">briefing V${variant}</p>
  </div>`;
}

const css = `
#briefing { position: fixed; inset: 0; background: #0b1110e6; display: flex; align-items: center; justify-content: center; z-index: 50; font-family: system-ui, sans-serif; }
#briefing .card { max-width: 600px; max-height: 92vh; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; background: #111b18; border: 1px solid #2a4038; border-radius: 10px; padding: 14px 22px; color: #cfeee4; font-size: 13px; line-height: 1.35; }
#briefing h2 { margin: 0; letter-spacing: 4px; color: #fff; }
#briefing h3 { margin: 10px 0 3px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #7fa89a; }
#briefing p { margin: 3px 0; }
#briefing .tag { color: #9fc4b6; font-style: italic; }
#briefing .cols { display: flex; gap: 18px; } #briefing .cols > div { flex: 1; }
#briefing .note { color: #9fc4b6; font-size: 13px; }
#briefing .key { display: flex; gap: 8px; margin: 4px 0; }
#briefing .key > div { flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 6px 4px; border-radius: 8px; }
#briefing .key .spare { background: #173327; border: 1px solid #2f6b4a; }
#briefing .key .shoot { background: #33201a; border: 1px solid #6b3b2f; }
#briefing .key b { font-size: 13px; color: #fff; }
#briefing .key span { font-size: 11px; color: #9fc4b6; }
#briefing .key em { font-style: normal; font-weight: 700; margin: 2px 0; }
#briefing .key .spare em { color: #6fe39a; } #briefing .key .shoot em { color: #ff8a5c; }
#briefing .key small { font-size: 11px; color: #b9d3c9; }
#briefing .sw { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin: 0 6px 0 4px; vertical-align: middle; }
#briefing .pulse { animation: pulse 0.8s ease-in-out infinite alternate; }
@keyframes pulse { from { transform: scale(0.85); } to { transform: scale(1.15); } }
#briefing button { margin-top: 12px; width: 100%; padding: 10px; font-size: 15px; background: #2f5a3a; color: #fff; border: 0; border-radius: 6px; cursor: pointer; }
#briefing .variant { text-align: right; font-size: 10px; color: #3d5a4e; }
@media (max-width: 560px) { #briefing .key { flex-direction: column; } }
`;

export function showBriefing(variant: Variant, closed: () => void) {
  hideBriefing();
  if (!document.getElementById('briefing-css')) {
    const style = document.createElement('style');
    style.id = 'briefing-css';
    style.textContent = css;
    document.head.appendChild(style);
  }
  overlay = document.createElement('div');
  overlay.id = 'briefing';
  overlay.innerHTML = html(variant);
  document.body.appendChild(overlay);
  onClose = closed;
  overlay.querySelector('#brief-start')!.addEventListener('click', closeBriefing);
}

export const isBriefingOpen = () => overlay !== null;

function hideBriefing() {
  overlay?.remove();
  overlay = null;
}

export function closeBriefing() {
  if (!overlay) return;
  hideBriefing();
  const cb = onClose;
  onClose = null;
  cb?.();
}
