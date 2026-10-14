// Start-of-session briefing popup. Variant 1 = goal + controls only; Variant 2 adds the trait legend.
import { CONFIG as C } from './config';

export type Variant = 1 | 2;

let overlay: HTMLDivElement | null = null;
let onClose: (() => void) | null = null;

const swatch = (fill: string, ring = '', spikes = false, pulse = false) =>
  `<span class="sw${pulse ? ' pulse' : ''}" style="background:${fill};${ring ? `box-shadow:0 0 0 ${spikes ? 3 : 2}px ${ring};` : ''}"></span>`;

function html(variant: Variant) {
  const legend = variant === 2 ? `
    <h3>Reading the swarm</h3>
    <div class="cols">
      <div>
        <b>Fill color = fertility</b>
        <p>${swatch('#4a6b5a')} sterile: can't breed</p>
        <p>${swatch('#3fd1c0')} fertile: breeds</p>
        <p>${swatch('#ff4fd8', '', false, true)} very fertile (pulses): breeds fast</p>
      </div>
      <div>
        <b>Outline = hostility</b>
        <p>${swatch('#3fd1c0')} no outline: <b>docile</b>, harmless. Let these live.</p>
        <p>${swatch('#3fd1c0', '#ffb347')} orange ring: <b>hostile</b>, chews through growth nodes</p>
        <p>${swatch('#3fd1c0', '#ff3b3b', true)} red spikes: <b>hunter</b>, breaks off and chases you</p>
      </div>
    </div>
    <p class="note">Offspring inherit their parents' traits, with a small chance of mutation.</p>` : '';

  return `
  <div class="card">
    <h2>PRESSURE</h2>
    <p class="tag">You're not here to exterminate the swarm. You're here to breed it into something harmless.</p>

    <h3>Goal</h3>
    <p><b>Finish a season where only docile (non-hostile) bugs escape, at least ${C.domesticMinSurvivors} of them.</b></p>
    <p>Bugs that reach the bottom <b>escape and breed</b> into next season's swarm. Their offspring inherit their traits, so whatever you let through, you get more of.</p>

    <h3>You lose if</h3>
    <p>a bug touches you · the swarm grows to ${C.overrunCap} · you kill every bug (nothing left to tame)</p>

    <h3>Tools</h3>
    <p><b>Dart</b> (white): fast, kills one bug per shot. Precise.</p>
    <p><b>Cannon</b> (orange): slow, kills everything in the blast, <i>docile bugs too</i>, and can split bugs at the edge into clones.</p>
    ${legend}
    <h3>Controls</h3>
    <p>Move: mouse or A/D · Shoot: click or Space · Swap tool: Q or right-click · Restart: R · This briefing: H</p>

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
#briefing .sw { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin: 0 6px 0 4px; vertical-align: middle; }
#briefing .pulse { animation: pulse 0.8s ease-in-out infinite alternate; }
@keyframes pulse { from { transform: scale(0.85); } to { transform: scale(1.15); } }
#briefing button { margin-top: 12px; width: 100%; padding: 10px; font-size: 15px; background: #2f5a3a; color: #fff; border: 0; border-radius: 6px; cursor: pointer; }
#briefing .variant { text-align: right; font-size: 10px; color: #3d5a4e; }
@media (max-width: 560px) { #briefing .cols { flex-direction: column; } }
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
