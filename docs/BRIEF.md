# What-if Studio — brief for one film

You are making ONE short "what if" film in two language versions, Traditional Chinese and English, in this repo.
Read `docs/CHEATSHEET.md` next: it has the layout, the kit API, film and score skeletons, the instrument list and the
tools. Don't read whole reference films or `lib/` sources. For one specific technique, grep the file the cheat sheet
points to and read only those lines.

## The deliverable
- Everything for the film lives in `films/<FILM_ID>/` (lowercase a-z0-9-): the code (`index.tsx` exporting `Video`,
  `TOTAL` and `LANGS = ['zh', 'en']`), `score.py` → `score.wav`, any assets, `meta.json`, and the renders in `out/`.
- 55–72 s, 1080×1920, 30 fps. Narrated in both languages (see Narration). Original score at −14 LUFS. Don't pad the
  middle or the ending to reach a length.
- Two versions of the same film: Chinese (composition `<FILM_ID>`) and English (`<FILM_ID>-en`). They share the visuals,
  the timing and the score; only the on-screen text differs. Write every on-screen string as `t('中文', 'English')`.
- Final files: `films/<FILM_ID>/out/zh.mp4` and `films/<FILM_ID>/out/en.mp4`, made with `node tools/render.mjs <FILM_ID>`.
- Cover images: `films/<FILM_ID>/out/thumb_zh.jpg` and `thumb_en.jpg` from `thumb.tsx` (see Thumbnail).
- `films/<FILM_ID>/meta.json` with both languages and their YouTube Shorts copy (format below).

## Ownership (other sessions run in parallel)
Only create/edit `films/<FILM_ID>/**`. Never edit `engine/`, `tools/`, `studio/`, `docs/` or other films.
Need a kit change? Copy the code into your folder.

## Story
Hook in the first 2 s (a question or a striking image) → 4–7 beats, each built around ONE number or image →
a twist → the ending (below), which answers the hook and leads back into it.
Hold each line long enough to read (~6–8 Chinese chars per second). One idea per screen.

## Ending (plan it before the beats)
The usual failure is an ending that waits: the payoff is said in two seconds and then nothing happens for six more,
or the music drifts into a pickup that sounds like "to be continued". Shorts replay automatically, so the ending
must feel finished and still lead straight back into the opening. The ending scene is about 7–9 s:
payoff → closing line → button → ~2 s ring and settle → cut to frame 0.
- Come back to the opening: reuse the hook's image, layout and colors (reuse the hook's art component) and answer
  the hook's question with what the film showed. The viewer should feel "back where we started, and now I know".
- Payoff line: the answer is the biggest moment of the film, spoken and on screen in headline size (96–124 px),
  at most two lines, landing on the score's tonic cadence. Keep it clear of the art.
- Closing line: right after the payoff (~0.4 s), one short spoken line that lands the film, shown under the payoff
  (64–72 px, accent color). It is a punchline that calls back to the hook or the thumbnail's question, not a new
  fact, not a question and not a moral: 「所以你的杯子……還是保不住。」/ "So your mug? Still doomed.",
  「所以，蛋糕記得買大一點。」/ "Better get a bigger cake." Chinese ≤ ~14 characters, English ≤ ~8 words.
- Button: the score's last hit (timpani + pizzicato tonic + a high glockenspiel note) lands on the first beat at least
  0.3 s after the closing line ends (the later of the two languages). The film ends 2 s after the button: no
  pickup bar, no new melody after it; the tonic just rings into the cut. An on-screen beat on the button (a blink,
  a bounce, the art snapping back) makes it land harder.
- Seamless replay: in the last ~1 s the text fades out and the picture settles into frame 0 (same background, same
  art in the same place). Frame 0 already shows the opening image, so there is no fade from black and no fade to
  black. Credits (32 px) may sit with the payoff, away from the art.

## English version
- A faithful line-by-line translation of the Chinese: same facts, same numbers, same comparisons and examples.
  Don't swap in local equivalents. Convert number words correctly (萬 = 10 thousand, 億 = 100 million,
  兆 = trillion, 京 = 10 quadrillion) and keep the units the Chinese version uses.
- Natural, concise English in sentence case. A line must be readable at about 3 words per second within the same hold time;
  if it isn't, shorten the wording, not the meaning.
- English runs up to ~1.8× wider than Chinese: set sizes per language with `t(zhSize, enSize)` and check every wrap.

## Facts
Every number or factual claim on screen must be either computed by you (show the arithmetic in meta.json notes)
or verified with WebSearch/WebFetch from a reputable source (paper, government, major outlet, Wikipedia with its
citations). Prefer qualitative wording over an unverified number. Label units honestly (e.g. "以乾重的碳計").

## Look
Dark or bold flat palette, big type (headlines 84–120 px, never under 32 px), generous spacing, clean vector art
drawn in SVG/canvas (no stock footage, no AI images). Keep text inside y≈200–1500 and away from the right edge
(platform UI). Real imagery only from public-domain sources (NASA etc.) — credit it.
Never animate CSS `filter: blur()` (stale frames). Motion: springs/eases, a camera move or zoom per scene.

## Music
Write `films/<FILM_ID>/score.py` from the score skeleton in `docs/CHEATSHEET.md` (lib sampler; no 'piano' — use 'upright').
Pick a tempo; cut scenes on bar lines; put hits on the cuts. End on a cadence that leads back to bar 1 (see Ending).
Then `sh tools/score.sh <FILM_ID>` → `films/<FILM_ID>/score.wav` (it prints the loudness; expect −14 LUFS).
Leave room for the voice: keep the texture light under the spoken lines and put the big hits on the cuts.
The engine plays `mix_<lang>.wav` (or `score.wav` when there is none) automatically; don't add an `<Audio>` yourself.

## Narration
Both versions are narrated: Chinese by `zh-TW-HsiaoChenNeural`, English by `en-US-AndrewNeural` (Microsoft's online
edge-tts voices). The visuals and their timing stay as they are; the voice follows them.
- Write `films/<FILM_ID>/narration.json` once the timeline and the score are done:
  `{"zh": [{"at": 0.3, "text": "如果…？"}, …], "en": [{"at": 0.3, "text": "What if…?"}, …]}` (`at` = film seconds).
- One short spoken line per on-screen beat, starting ~0.2 s after its text appears; the hook line at ~0.3 s, the payoff
  line on the ending's cadence. Say the same facts and numbers as the screen, in spoken words; skip the small notes.
  The English is a translation of the Chinese, like the on-screen text.
- Pace: Chinese ≈ 4.5 characters a second, English ≈ 2.7 words a second. Write numbers in Chinese as they are read
  (「兩百二十公斤」); when the voice would misread something, add `"say"` with the spoken form.
- `sh tools/voice.sh <FILM_ID>` fetches the voices, prints a cue table and writes `mix_zh.wav` and `mix_en.wav` (the voice
  over the ducked score, −14 LUFS). If it reports a line that overlaps the next one, shorten the line, move its `at`,
  or add `"rate": "+8%"`; don't retime the visuals for the voice. Run it again whenever score.wav or narration.json changes.

## Thumbnail
The cover people see in the Shorts feed before they tap (also usable as a Reels/TikTok cover). It sells the hook, not the answer.
- Write `films/<FILM_ID>/thumb.tsx` exporting `Thumb` (1080×1920, both languages through `t()`), then
  `node tools/thumb.mjs <FILM_ID>` → `out/thumb_zh.jpg`, `out/thumb_en.jpg`, and `out/thumb_small.jpg` (both at feed size).
- Headline = the what-if question, shortened if needed (「如果樹全部消失？」, not the full title): Chinese at most ~10 characters
  on 2–3 lines at 150–180 px weight 900; English 120–140 px on at most 4 short lines.
- One teaser line under it (64–80 px, accent color) that raises the stakes or hints at the twist, as a question.
  Never the payoff number or the answer.
- One big focal image taken from the hook (import the film's own art components, same palette), so the cover matches
  the first frame. Nothing else: no credits, sources, notes, logos or small text.
- Headline and teaser inside y≈300–1100; nothing important in the bottom ~350 px (the feed puts the title over it).
  Every word must still read in `thumb_small.jpg`.
- `<FILM_ID>-thumb` is a silent 2 s composition and the tool renders its last frame, so kit animations (`Line`, `useIn`)
  have settled. To reuse a scene that keeps moving, wrap it in `<Freeze frame={n}>` from remotion.
  Example: `films/archive/w1015-0dhj/thumb.tsx`.

## Check loop (do not skip)
1. `npx tsc -p .`
2. `node tools/stills.mjs <FILM_ID> <8–12 seconds spread over the film>` → Read `films/<FILM_ID>/out/stills/sheet_zh.jpg`
   and `sheet_en.jpg`; fix overlap, clipping, bad wraps, empty frames and illegible text in both languages.
3. `sh tools/voice.sh <FILM_ID>` until every line fits (see Narration), then `node tools/render.mjs <FILM_ID>` → Read `films/<FILM_ID>/out/zh_sheet.jpg` and `en_sheet.jpg`; also extract ~12 consecutive
   frames around one transition (`ffmpeg -i films/<id>/out/zh.mp4 -vf "select='between(n\,A\,B)',scale=180:-1,tile=12x1" -frames:v 1 -vsync 0 x.jpg`)
   and check they advance in order.
4. Read `films/<FILM_ID>/out/zh_ends.jpg` and `en_ends.jpg`. The top row is the last 6 s and the bottom row is the
   first 6 s, at 2 frames per second. The top row should show the payoff, then the closing line under it, then the
   settle. Its last frame must look like the same shot as the bottom row's first frame, because the replay cuts
   straight from one to the other. If it ends mid-motion, ends on black, or doesn't match the opening, fix it.
5. `node tools/thumb.mjs <FILM_ID>` → Read `out/thumb_small.jpg`, then `thumb_zh.jpg` and `thumb_en.jpg`; fix any word
   that doesn't read at feed size, and any spoiler.
6. Iterate until polished, then write meta.json.

## meta.json
```json
{
  "zh": {
    "title": "如果…",
    "summary": "一兩句話說明這支片",
    "youtube": {"title": "…", "description": "…", "tags": ["…"]}
  },
  "en": {
    "title": "What if…",
    "summary": "One or two sentences.",
    "youtube": {"title": "…", "description": "…", "tags": ["…"]}
  },
  "sources": [{"label": "…", "url": "…"}],
  "notes": "arithmetic and known weaknesses, in Chinese"
}
```
YouTube Shorts copy, written separately for each language (the English one is a translation of the Chinese one):
- `title`: at most 70 characters (YouTube's limit is 100). A hook that matches what the film shows. No hashtags.
- `description`: the first line is the hook (it shows in the Shorts feed). Then 2–4 sentences on what the film shows,
  with the same numbers as the film. The last line is 3–5 hashtags ending with `#shorts`. No sources and no music
  credit in the description (the sources go in `sources` above).
- `tags`: 5–12 search keywords in that language, at most 400 characters in total.
- Never use `<` or `>` in a title or description: YouTube rejects them.

## Revisions
If you are resumed with feedback, re-read this brief first (the layout may have changed since your last run), then apply
the feedback, re-render with `node tools/render.mjs <FILM_ID>` and update meta.json.
If the feedback only concerns the thumbnail (e.g. a film made before thumbnails existed), write or fix `thumb.tsx` and run
`node tools/thumb.mjs <FILM_ID>` (check loop step 5); don't re-render the film.
To add English to an older Chinese-only film: wrap every on-screen string in `t('中文', 'English')` (`useT` from
`engine/kit/lang`), give the longer English lines their own sizes, export `LANGS = ['zh', 'en']`, check stills in both
languages, render, then add `en` (with its YouTube copy) to meta.json and fill in `zh.youtube` if it's missing.

## Final message
End with 3–6 short lines in Traditional Chinese: what the film shows, the scene list, and any caveats.
