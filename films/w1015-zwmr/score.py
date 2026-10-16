"""Score for 如果狗用狗年齡過生日 / What if dogs had birthdays in dog years.

120 BPM 4/4 in F major → beat 0.5 s, bar 2 s, 34¾ bars.
Cuts (= timeline.ts): 0 6 12 20 28 36 44 52 60 69.5.
Sync points (scene-local frames in timeline.ts, here in seconds):
  ×7 candles pop 7.0 … 8.25 (8th notes) · answer candles 28.5 → 30.0 (accelerating), "31" lands 30.0
  curve points 37.5 / 39.0 / 40.5 · ×7 line crosses 46.72, "84" lands 47.67, bracket 49.0
  size: small/big animals 52.2, swap 55.5, clocks 56.2 · end: candles 60.27 → 61.73, payoff cadence 62.0,
  the closing line 64.8–67.1, a button on its last word (67.5), candles sink 68.27 → 69.2 while the F rings to the cut
  (no pickup).
"""
import sys, os
import numpy as np, soundfile as sf

LIB = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'lib'))
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio import sfx as X
from core.audio.sfx import SR, add

S.seed(23)
DUR, BEAT, BAR = 69.5, 0.5, 2.0
E = []
bus = np.zeros((int(DUR * SR), 2), np.float32)

CH = {  # bass root (contrabass/cello range), pad triad
    'F': ('F2', ['C4', 'F4', 'A4']),
    'Dm': ('D2', ['D4', 'F4', 'A4']),
    'Bb': ('Bb1', ['D4', 'F4', 'Bb4']),
    'C': ('C2', ['C4', 'E4', 'G4']),
    'Gm': ('G1', ['D4', 'G4', 'Bb4']),
    'A': ('A1', ['C#4', 'E4', 'A4']),
    'Am': ('A1', ['C4', 'E4', 'A4']),
    'C7': ('C2', ['E4', 'G4', 'Bb4']),
}
FIFTH = {'F': 'C3', 'Dm': 'A2', 'Bb': 'F2', 'C': 'G2', 'Gm': 'D2', 'A': 'E2', 'Am': 'E2', 'C7': 'G2'}
# one chord per bar (bar index = t / 2); bar 2 splits Bb | C
BARS = ['F', 'Dm', 'Bb',            # hook
        'F', 'Bb', 'C',             # seven
        'F', 'Dm', 'Gm', 'C',       # parent
        'Dm', 'Bb', 'Gm', 'A',      # dna
        'F', 'Am', 'Bb', 'C',       # answer
        'Dm', 'Bb', 'F', 'C',       # curve
        'Dm', 'Gm', 'Bb', 'A',      # flip
        'Dm', 'Bb', 'Gm', 'C',      # size
        'C', 'F', 'F', 'F', 'F']    # end (the film stops at 69.5)


def ev(t, inst, pitch, d, vel, pan=0.0, gain=.5, attack=None):
    e = dict(t=t, inst=inst, pitch=pitch, dur=d, vel=vel, pan=pan, gain=gain)
    if attack is not None:
        e['attack'] = attack
    E.append(e)


def pad(t, ch, d, vel=.3, inst='violas', gain=.45):
    for i, p in enumerate(CH[ch][1]):
        ev(t, inst, p, d, vel, (-.4, 0, .4)[i], gain, attack=.4)


def oompah(t, ch, vel=.5):
    """pizz bass on 1 and 3, pizz chord on 2 and 4"""
    ev(t, 'cellos_pizz', CH[ch][0].replace('1', '2'), .4, vel, -.1, .55)
    ev(t + 2 * BEAT, 'cellos_pizz', FIFTH[ch], .4, vel * .85, -.1, .5)
    for b in (1, 3):
        for i, p in enumerate(CH[ch][1]):
            ev(t + b * BEAT, 'violins_pizz', p, .3, vel * .7, (-.3, 0, .3)[i], .32)


def shaker(t0, t1, vel=.25):
    k = 0
    t = t0
    while t < t1 - 1e-6:
        E.append((t, 'shaker', None, None, vel * (1.0 if k % 2 else .65), .25, .3))
        t += BEAT / 2
        k += 1


def hit(t, v=1.0):
    E.append((t, 'timpani', 'F2', 2.0, .85 * v, 0, .8))
    E.append((t, 'gran_cassa', None, None, .7 * v, 0, .7))


# Opening motif (original), 3 bars, on marimba with a glockenspiel octave above. (beat, pitch, beats)
MOTIF = [
    (0, 'C5', 1), (1, 'F5', 1), (2, 'A5', .5), (2.5, 'G5', .5), (3, 'F5', 1),
    (4, 'D5', 1), (5, 'F5', .5), (5.5, 'A5', .5), (6, 'D6', 1), (7, 'C6', 1),
    (8, 'Bb5', .5), (8.5, 'A5', .5), (9, 'G5', 1), (10, 'E5', .5), (10.5, 'F5', .5), (11, 'G5', 1),
]
OCT = {'C5': 'C6', 'D5': 'D6', 'E5': 'E6', 'F5': 'F6', 'G5': 'G6', 'A5': 'A6', 'Bb5': 'Bb6', 'C6': 'C7', 'D6': 'D7'}


def motif(t0, vel=.55, glock=.28, bars=3):
    for b, p, d in MOTIF:
        if b >= bars * 4:
            continue
        t = t0 + b * BEAT
        ev(t, 'marimba', p, d * BEAT + .1, vel, .15, .5)
        if glock:
            ev(t, 'glockenspiel', OCT[p], .4, glock, -.2, .3)


# ── hook 0–6 ────────────────────────────────────────────────────────────────
motif(0.0)
for i, ch in enumerate(['F', 'Dm']):
    ev(i * BAR, 'cellos_pizz', CH[ch][0].replace('1', '2'), .4, .5, -.1, .55)
    ev(i * BAR + 1.0, 'cellos_pizz', FIFTH[ch], .4, .42, -.1, .5)
ev(4.0, 'cellos_pizz', 'Bb2', .4, .5, -.1, .55)
ev(5.0, 'cellos_pizz', 'C3', .4, .5, -.1, .55)
pad(0, 'F', 2.1, .18)
pad(2, 'Dm', 2.1, .18)
pad(4, 'Bb', 1.1, .2)
pad(5, 'C', 1.1, .22)
E.append((5.5, 'triangle', 'open', None, .25, .3, .3))

# ── seven 6–12: oom-pah, candle pops on 8th notes ──────────────────────────
hit(6.0, .55)
for b in range(3, 6):
    oompah(b * BAR, BARS[b])
shaker(6.0, 12.0, .22)
for k, p in enumerate(['C6', 'D6', 'E6', 'F6', 'G6', 'A6']):
    ev(7.0 + k * .25, 'glockenspiel', p, .5, .45, (-.3, .3)[k % 2], .42)
for k, p in enumerate(['F5', 'F5', 'E5', 'C5']):  # "the usual rule" tag on marimba
    ev(9.0 + k * .5, 'marimba', p, .45, .45, .1, .4)
add(bus, X.whoosh(.9, .5), 11.1, .35)

# ── parent 12–20: puppies pop, then the "not even close" bassoon ───────────
hit(12.0, .5)
for b in range(6, 10):
    oompah(b * BAR, BARS[b], .45)
shaker(12.0, 16.0, .2)
for k, p in enumerate(['A5', 'C6', 'F6']):  # puppies pop
    E.append((12.53 + k * .27, 'xylophone', p, .4, .4, (-.3, 0, .3)[k], .38))
motif(12.0, vel=.38, glock=0, bars=2)
for t, p, d in [(16.0, 'C3', .2), (16.25, 'Bb2', .2), (16.5, 'A2', .2), (16.75, 'G2', .2), (17.0, 'F2', .8)]:
    ev(t, 'bassoon_stac' if d < .5 else 'bassoon', p, d, .45, .2, .34)
E.append((17.0, 'woodblock', 'b', None, .45, .3, .4))
add(bus, X.whoosh(.9, .5), 19.1, .35)

# ── dna 20–28: hushed, a clock ticking while the tags pile up ──────────────
hit(20.0, .45)
for b in range(10, 14):
    t = b * BAR
    ch = BARS[b]
    ev(t, 'cellos', CH[ch][0].replace('1', '2'), BAR + .1, .32, -.1, .4, attack=.3)
    pad(t, ch, BAR + .2, .2, inst='vibraphone_bowed', gain=.35)
    tones = CH[ch][1] + [CH[ch][1][1].replace('4', '5')]
    for k in range(8):
        ev(t + k * BEAT / 2, 'vibraphone', tones[(k * 2 + k // 4) % 4], .5, .34, (-.35, .35)[k % 2], .4)
    for k in range(4):
        E.append((t + k * BEAT, 'woodblock', 'a' if k % 2 == 0 else 'b', None, .28, .35, .3))
add(bus, X.whoosh(1.4, .6), 26.6, .4)
E.append((26.0, 'snare', 'roll', None, .3, 0, .3))

# ── answer 28–36: the candle run and the big "31" ──────────────────────────
hit(28.0, .7)
RUN = ['A4', 'Bb4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'Bb5', 'C6', 'D6', 'E6', 'F6', 'G6', 'A6', 'Bb6', 'C7']
for i in range(1, 31):
    t = 28.0 + (15 + 45 * np.sqrt((i - 1) / 30)) / 30
    ev(t, 'xylophone', RUN[min(16, round((i - 1) * 16 / 29))], .3, .32 + .2 * i / 30, (-.4 + .8 * (i % 5) / 4), .34)
E.append((30.0, 'sus_cymbal', 'hit', None, .7, 0, .55))
hit(30.0, 1.0)
for p in ['F2', 'C3', 'F3', 'A3', 'C4', 'F4']:
    ev(30.0, 'upright', p, 1.8, .6, 0, .35)
for p in ['F3', 'A3', 'C4']:
    ev(30.0, 'horn', p, 1.9, .45, 0, .32, attack=.05)
ev(28.0, 'contrabass', 'F2', 2.0, .4, .1, .45)
for b in range(15, 18):
    oompah(b * BAR, BARS[b], .5)
    pad(b * BAR, BARS[b], BAR + .2, .26, inst='violins', gain=.38)
shaker(30.0, 36.0, .24)
motif(30.0, vel=.42, glock=.22, bars=3)
add(bus, X.whoosh(.9, .5), 35.1, .35)

# ── curve 36–44: the arpeggio slows down as the curve flattens ─────────────
hit(36.0, .5)
for b, step in zip(range(18, 22), (BEAT / 2, BEAT, 2 * BEAT, 4 * BEAT)):
    t = b * BAR
    ch = BARS[b]
    pad(t, ch, BAR + .2, .26, inst='violins', gain=.38)
    ev(t, 'contrabass', CH[ch][0], BAR + .1, .38, .1, .45, attack=.2)
    tones = CH[ch][1] + [CH[ch][1][0].replace('4', '5')]
    k = 0
    while k * step < BAR - 1e-6:
        ev(t + k * step, 'marimba', tones[k % 4], step + .1, .38, (-.3, .3)[k % 2], .4)
        k += 1
for t, p in [(37.5, 'F5'), (39.0, 'A5'), (40.5, 'C6')]:
    ev(t, 'vibraphone_hard', p, 1.2, .55, .2, .45)
    ev(t, 'glockenspiel', p.replace('5', '6').replace('C6', 'C7') if p != 'C6' else 'C7', .6, .3, -.2, .3)
add(bus, X.whoosh(.9, .5), 43.1, .35)

# ── flip 44–52: minor, the ×7 line overshoots ──────────────────────────────
hit(44.0, .6)
for b in range(22, 26):
    oompah(b * BAR, BARS[b], .45)
shaker(44.0, 52.0, .2)
for b, line in [(22, ['D4', 'F4', 'A4', 'F4']), (23, ['G4', 'Bb4', 'D5', 'Bb4'])]:
    for k, p in enumerate(line):
        ev(b * BAR + k * BEAT, 'clarinet', p, .4, .4, -.2, .4)
for k in range(12):  # the red line drawing: a rising pizz scale
    ev(44.67 + k * .25, 'violins_pizz', ['D4', 'E4', 'F4', 'G4', 'A4', 'Bb4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5'][k], .3, .4, .2, .35)
E.append((46.72, 'triangle', 'open', None, .4, .2, .4))
for t, p, d in [(47.67, 'Bb4', .22), (47.92, 'A4', .22), (48.17, 'Ab4', .22), (48.42, 'G4', .9)]:
    ev(t, 'trumpet_mute', p, d, .6, .25, .5)
E.append((49.0, 'woodblock', 'a', None, .5, .2, .4))
E.append((49.25, 'woodblock', 'a', None, .4, .2, .35))
add(bus, X.whoosh(.9, .5), 51.1, .35)

# ── size 52–60: piccolo for the small animals, tuba for the big ones ───────
hit(52.0, .5)
for b in range(26, 30):
    oompah(b * BAR, BARS[b], .5)
shaker(52.0, 60.0, .2)
for b in range(27, 30):  # marimba broken chords keep the groove under the dogs
    tones = CH[BARS[b]][1] + [CH[BARS[b]][1][0].replace('4', '5')]
    for k in range(8):
        ev(b * BAR + k * BEAT / 2, 'marimba', tones[(k * 2 + k // 4) % 4], .3, .36, (-.3, .3)[k % 2], .4)
for t, p in [(52.2, 'A6'), (52.33, 'C7')]:
    ev(t, 'piccolo', p, .12, .4, -.3, .35)
for t, p in [(52.6, 'D2'), (53.0, 'A1')]:
    ev(t, 'tuba_stac', p, .35, .6, .3, .55)
for t, p in [(55.5, 'Bb6'), (55.63, 'D7'), (55.76, 'F7')]:
    ev(t, 'piccolo', p, .12, .4, -.3, .35)
for t, p in [(55.9, 'G1'), (56.25, 'D2'), (56.5, 'G1')]:
    ev(t, 'tuba_stac', p, .3, .6, .3, .55)
for k in range(13):  # the clocks: slow tock on the left, fast tick on the right
    E.append((56.25 + k * .25, 'claves', None, None, .22, .45, .25))
    if k % 4 == 0:
        E.append((56.25 + k * .25, 'woodblock', 'c', None, .3, -.45, .3))
E.append((58.5, 'snare', 'roll', None, .25, 0, .28))
add(bus, X.whoosh(1.2, .6), 58.8, .4)

# ── end 60–69.5: candles rise on the dominant, cadence on the payoff, ring under the closing line, button at 67.5 ──
hit(60.0, .55)
pad(60.0, 'C', 2.0, .3, inst='violins', gain=.4)
ev(60.0, 'contrabass', 'C2', 2.0, .42, .1, .5, attack=.2)
for i in range(1, 31):
    t = 60.0 + (8 + 44 * np.sqrt((i - 1) / 30)) / 30
    ev(t, 'xylophone', RUN[min(16, round((i - 1) * 16 / 29))], .3, .3 + .18 * i / 30, (-.4 + .8 * (i % 5) / 4), .32)
E.append((60.5, 'snare', 'roll', None, .35, 0, .35))
# 62.0: the payoff — tonic chord + hit, let it ring
hit(62.0, 1.1)
E.append((62.0, 'sus_cymbal', 'hit', None, .75, 0, .55))
for p in ['F4', 'A4', 'C5']:
    ev(62.0, 'tubular_bells', p, 4.0, .4, 0, .33)
for p in ['F2', 'C3', 'F3', 'A3', 'C4', 'F4', 'A4']:
    ev(62.0, 'upright', p, 3.5, .6, 0, .32)
for p in ['F3', 'A3', 'C4']:
    ev(62.0, 'horn', p, 3.6, .45, 0, .32, attack=.06)
for p, pan in [('C5', -.3), ('F5', 0), ('A5', .3)]:
    ev(62.0, 'violins', p, 4.2, .34, pan, .36, attack=.08)
ev(62.0, 'contrabass', 'F2', 4.2, .48, .1, .5, attack=.1)
ev(62.0, 'cellos', 'F3', 4.2, .38, -.1, .4, attack=.1)
for k, p in enumerate(['C7', 'A6', 'F6', 'C6']):
    ev(62.25 + k * .25, 'glockenspiel', p, .8, .3 - k * .04, (-.2, .2)[k % 2], .3)
# 65–67: under the closing line, the first notes of the motif, quietly
pad(65.0, 'F', 2.2, .2, inst='violins', gain=.32)
ev(65.0, 'contrabass', 'F2', 2.2, .3, .1, .4, attack=.2)
for k, p in enumerate(['C6', 'D6', 'C6']):
    ev(65.5 + k * .5, 'glockenspiel', p, .6, .22, -.2, .26)
# button (67.5): "better get a bigger cake" → timpani + pizz F + glockenspiel, then the F rings out; candles sink 68.27 → 69.2
hit(67.5, .75)
ev(67.5, 'contrabass_pizz', 'F2', .6, .65, .1, .75)
for k, p in enumerate(['F3', 'A3', 'C4', 'F4']):
    ev(67.5 + k * .012, 'violins_pizz', p, .4, .5, (-.3, -.1, .1, .3)[k], .4)
for k, p in enumerate(['F5', 'F6']):
    ev(67.5, 'glockenspiel', p, 1.5, .42, (-.2, .2)[k], .33)
ev(67.5, 'cellos', 'F3', 1.7, .3, 0, .35, attack=.02)
E.append((68.3, 'triangle', 'open', None, .2, .3, .25))

mix = S.render(E, dur=DUR, master=False)
mix = S.room(mix, size=.55, mix=.2)
n = min(len(mix), len(bus))
mix = mix[:n] + bus[:n]
f = int(0.3 * SR)
mix[-f:] *= np.linspace(1, 0, f)[:, None]  # 0.3 s declick only: the button is the ending, not a fade
mix = mix / max(1e-9, np.abs(mix).max()) * .9
out = sys.argv[1] if len(sys.argv) > 1 else 'score.wav'
sf.write(out, mix.astype(np.float32), SR)
print('wrote', out, f'{n / SR:.2f}s', sorted({e['inst'] if isinstance(e, dict) else e[1] for e in E}))
