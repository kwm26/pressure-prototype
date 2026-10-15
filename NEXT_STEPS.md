# Finishing Lab B: checklist

Due **Wed Oct 14, 11:59 pm**. Tick these off in order. Delete this file before submitting if you like.

---

## 1. Put it on GitHub + Pages (≈5 min, you + Claude)

1. Go to **https://github.com/new**
   - Repository name: `pressure-prototype`
   - **Public** (free GitHub Pages needs a public repo)
   - Do **not** add a README, .gitignore or license (the repo must be empty)
   - Click **Create repository** and copy its URL.
2. Paste the URL to Claude. Claude runs:
   ```bash
   git remote add origin https://github.com/<you>/pressure-prototype.git
   git push -u origin main
   ```
   A browser window may ask you to sign in to GitHub the first time. That's Git Credential Manager.
3. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. **Actions** tab → "Deploy to GitHub Pages" → **Re-run** if the first run failed before step 3. Wait for the green check (≈1 min).
5. Your live link: `https://<you>.github.io/pressure-prototype/`
   - Open it in a **private / incognito window** to confirm it works signed-out.
   - Put the link in `README.md` (Claude can do this).
6. **Settings → Collaborators → Add people** → add your instructor.

## 2. Three Loop Log entries (≈20 min, you play)

Rule: **change one number, play, write down which number moved.** Use the Tuning panel (top-right), then press R. Say "add a Loop Log entry for X, leave the result blank", then fill in the result yourself.

Candidates from what we've seen so far (pick any three, or your own):

| If you notice… | Change one thing | Number to watch |
|---|---|---|
| Winning in 1 season is too easy | `domesticSeasons` 1 → 2 | win rate, run length |
| Hostiles strip all the green blocks in ~25 s | `nodeHp` 3 → 5 (or `nodeCount` 28 → 40) | nodes left at season end, seasons survived |
| The cannon is spammed (or never used) | `cannonCooldown` 1.1 → 1.6 (or → 0.7) | corner-stat cannon % |
| Seasons drag (~46 s each) | `descentSpeed` 17 → 24 | median run length |
| Hunters bite you before you can react | `hunterSpeedBonus` 0.6 → 0.4 | how often runs end in `bitten` |

Download telemetry (T) after each loop and save it as `telemetry/loop1.json`, etc.

## 3. Six playtests (the long pole)

You need **6 testers, at least 2 from outside this class.** Each tester plays **both** variants (Variant Comparison rule). Alternate the order:

| Tester | First | Then |
|---|---|---|
| 1, 3, 5 | `…/pressure-prototype/?v=1` | press **2** |
| 2, 4, 6 | `…/pressure-prototype/?v=2` | press **1** |

**Script, same every time:**
1. Hand over the link with one sentence: *"It's a Centipede-style game prototype. Play it however you like."* Don't explain anything else.
2. Watch silently for **3 minutes**. Jot down retries, confusion and quits.
3. Ask one question: **"What were you trying to do?"** Write their answer word for word. Also note: could they say what a color/outline means? Did they mention their kills changing the next wave? (**yes / no**, which is your Keep/Kill number)
4. Have them press the other variant key and play ~2 more minutes. Ask the same question again.
5. Press **T** and save the file as `telemetry/T1_<initials>.json` **before** the next tester.

Fill one row per tester in the PROTOTYPE.md Playtest Log, and V1 vs. V2 in the Variant Comparison.

## 4. Numbers for the Verdict

```bash
npm run telemetry
```

This prints per tester: cannon share first → last run, wins, run endings, restarts within 5 s, and V1 vs. V2 wins. Paste the output (and your notes) to Claude for help drafting the Verdict. **The keep / pivot / kill call is yours.**

Your thresholds (from the card): **Keep** = 5 of 6 explain it · **Kill** = 2 or fewer · **Pivot** = they get the colors but can't say what they're trying to win.

## 5. 60–90 s gameplay video

Windows: **Win + Alt + R** starts/stops recording (Xbox Game Bar), and saves to `Videos\Captures`. Show, in order:
1. The briefing (≈5 s)
2. A chain splitting when you dart a middle segment
3. Swapping to the cannon, and a blast splitting edge bugs into clones
4. The season-end recap (escaped / offspring / next swarm)
5. Getting bitten or overrun, then **R** for an instant restart
6. Opening the Tuning panel and changing one number
7. Pressing **T** to download telemetry

Upload it to YouTube (Unlisted) or Google Drive, or attach it directly in Canvas.

## 6. Before you submit

- [ ] Fill in the **Time:** line in each BUILD_LOG.md entry, and add an entry for the playtest/loop session
- [ ] PROTOTYPE.md: 3+ Loop Log entries, Variant Comparison, 6-row Playtest Log, **Verdict last**
- [ ] `telemetry/` has the JSON files
- [ ] Commit and push (Claude can do this)
- [ ] Live link checked in a private window
- [ ] Canvas: live link · GitHub link (instructor added) · PROTOTYPE.md · BUILD_LOG.md · telemetry files · video
