"""Score for 如果雨滴跟棒球一樣大. 120 BPM 4/4 → beat 0.5 s, bar 2 s. Cuts (= timeline.ts): 0 6 14 20 28 36 44 52 58 69.
Playful pizzicato rain in C major → drums for the fastball and the pitch (a rain patter at the film's 47 drops/s) →
the twist drops to A minor → crescendo into the burst on the bar line at 48 → hail thud → the ending bursts the drop
on the downbeat at 60 with a C-major cadence that rings under the closing line (63.6–66.6); a button on its last word
(67), the fragments rewind into the opening drop, and the C rings out to the cut (no pickup)."""
import sys, os
import numpy as np, soundfile as sf

LIB = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'lib'))
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio import sfx as X
from core.audio.sfx import SR, add

S.seed(7)
DUR, BEAT, BAR = 69.0, 0.5, 2.0
E = []                                          # note events
bus = np.zeros((int(DUR * SR), 2), np.float32)  # sfx bus
R = np.random.default_rng(3)

CH = {  # bass root (contrabass range F#1–B3), pad triad
    'C': ('C2', ['C4', 'E4', 'G4']),
    'Am': ('A1', ['C4', 'E4', 'A4']),
    'F': ('F2', ['C4', 'F4', 'A4']),
    'G': ('G1', ['D4', 'G4', 'B4']),
    'Dm': ('D2', ['D4', 'F4', 'A4']),
    'E': ('E2', ['B3', 'E4', 'G#4']),
}
NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']


def up(p, k):  # transpose a note name by k semitones
    n, o = (p[:-1], int(p[-1]))
    m = NAMES.index(n) + 12 * o + k
    return f'{NAMES[m % 12]}{m // 12}'


def pad(t, ch, d, vel=.28, inst='violas', gain=.45):
    for i, p in enumerate(CH[ch][1]):
        E.append(dict(t=t, inst=inst, pitch=p, dur=d, vel=vel, pan=(-.4, 0, .4)[i], attack=.5, gain=gain))


def low(t, ch, d, vel=.42, inst='contrabass'):
    E.append(dict(t=t, inst=inst, pitch=CH[ch][0], dur=d, vel=vel, pan=.1, attack=.2, gain=.6))


def hit(t, v=1.0, tp='C3'):  # on scene cuts
    E.append((t, 'timpani', tp, 2.0, .85 * v, 0, .85))
    E.append((t, 'gran_cassa', None, None, .75 * v, 0, .75))


def rain(t, ch, vel=.34):  # pizzicato raindrops: chord tones in 8ths, panned around
    tones = CH[ch][1] + [up(CH[ch][1][0], 12)]
    for k, i in enumerate([0, 2, 1, 3, 2, 1, 3, 2]):
        E.append((t + k * BEAT / 2, 'violins_pizz', tones[i], .3, vel * (1.15 if k % 4 == 0 else .9), float(R.uniform(-.6, .6)), .5))


MEL = {  # marimba tune, (beat, pitch) per bar
    'C': [(0, 'E5'), (1, 'G5'), (1.5, 'E5'), (2, 'C5'), (3, 'D5')],
    'Am': [(0, 'E5'), (1, 'C5'), (1.5, 'A4'), (2, 'C5'), (3, 'E5')],
    'F': [(0, 'F5'), (1, 'A5'), (1.5, 'F5'), (2, 'C5'), (3, 'A4')],
    'G': [(0, 'G5'), (1, 'D5'), (1.5, 'B4'), (2, 'D5'), (3, 'G4')],
}


def tune(t, ch, vel=.42, inst='marimba'):
    for b, p in MEL[ch]:
        E.append((t + b * BEAT, inst, p, .45, vel, float(R.uniform(-.25, .25)), .45))


def tick():  # one raindrop hitting turf: a short bright noise burst
    n = X.noise(.018) * X.env_exp(.018, .0035)
    return X.hp(X.bp(n, 1800, 9000), 1500)


loop = ['C', 'Am', 'F', 'G']
# ---- hook + size + weight (0–20): pizzicato rain, marimba tune
for b in range(10):
    t, ch = b * BAR, loop[b % 4]
    rain(t, ch, .3 if b < 3 else .34)
    pad(t, ch, BAR + .2, vel=.22 if b < 3 else .28)
    E.append((t, 'contrabass_pizz', CH[ch][0], .6, .5, .1, .55))
    E.append((t + 2 * BEAT, 'contrabass_pizz', CH[ch][0], .6, .4, .1, .5))
    if b >= 1:
        tune(t, ch, .36 if b < 3 else .42)
    if b >= 7:
        E.append(dict(t=t, inst='cellos', pitch=up(CH[ch][0], 12), dur=BAR + .1, vel=.35, pan=-.2, attack=.3, gain=.45))
E.append((0.12, 'glockenspiel', 'G6', .8, .3, .2, .3))        # the question lands
E.append((6.87, 'glockenspiel', 'C7', 1.2, .45, .4, .4))      # the real 2 mm drop appears
for k, p in enumerate(['C5', 'E5', 'G5', 'C6', 'E6', 'G6', 'C7']):   # the outline fills with 50,000 drops
    E.append((10.3 + k * .36, 'harp', p, 1.2, .4, -.3 + k * .1, .45))
E.append((10.13, 'marimba', 'C6', .6, .5, 0, .45))
add(bus, X.thump(.8, 60), 15.0, .55)                          # the scale tips
E.append((15.0, 'timpani', 'G2', 1.5, .55, 0, .6))
for t in (6, 14):
    hit(t, .45)

# ---- speed (20–28) + pitch (28–36): drums, driving bass
for b in range(10, 18):
    t, ch = b * BAR, loop[b % 4]
    rain(t, ch, .3)
    tune(t, ch, .46, 'xylophone' if b >= 14 else 'marimba')
    pad(t, ch, BAR + .2, vel=.32, inst='violins_trem' if b >= 14 else 'violas', gain=.4)
    for k in range(8):
        E.append((t + k * BEAT / 2, 'contrabass_pizz', CH[ch][0] if k % 4 != 3 else up(CH[ch][0], 7), .3, .5 if k % 2 == 0 else .38, .1, .5))
        E.append((t + k * BEAT / 2, 'snare', 'on' if k in (2, 6) else 'off', None, .42 if k in (2, 6) else .16, .15, .4))
    E.append((t, 'toms', 'low', None, .55, -.2, .5))
    E.append((t + 1.5 * BEAT, 'toms', 'high', None, .35, .2, .4))
    E.append((t + 2 * BEAT, 'toms', 'low', None, .45, -.2, .45))
add(bus, X.whoosh(1.0, .6), 19.0, .4)
hit(20, .8)
add(bus, X.whoosh(.8, .9), 23.0, .55, .3)                     # the fastball zips past
E.append((23.85, 'woodblock', 'a', None, .7, .4, .5))
hit(28, .8)
E.append((28.0, 'crash', None, None, .5, 0, .4))
for i in range(int(7.3 * 47)):                                # one tick per drop, 47 a second (= the splashes)
    t = 28.0 + 20 / 30 + i / 47 + R.uniform(-.006, .006)
    add(bus, tick(), t, float(R.uniform(.05, .16)), float(R.uniform(-.7, .7)))

# ---- twist (36–44): it can't happen. A minor, sparse
add(bus, X.whoosh(1.0, .6), 35.0, .4)
hit(36, 1.0, 'A2')
E.append((36.0, 'trombone', 'A2', 1.6, .6, 0, .5))
E.append((36.0, 'sus_cymbal', 'hit', None, .4, 0, .35))
for b, ch in zip(range(18, 22), ['Am', 'F', 'Dm', 'E']):
    t = b * BAR
    pad(t, ch, BAR + .3, vel=.26, inst='cellos' if b == 18 else 'violas', gain=.45)
    low(t, ch, BAR + .2, .4)
    E.append((t + 1.0, 'harp', CH[ch][1][2], 1.2, .3, .3, .35))
E.append(dict(t=38.33, inst='vibraphone', pitch='E5', dur=1.5, vel=.5, pan=-.2, gain=.45))   # teardrop → sphere
E.append(dict(t=41.0, inst='vibraphone', pitch='C5', dur=1.5, vel=.5, pan=.2, gain=.45))     # sphere → bun

# ---- burst (44–52): crescendo on E, bursts on the bar line at 48
for k in range(16):
    t = 44.0 + k * BEAT / 2
    E.append((t, 'violins_trem', 'E5' if k < 8 else 'G#5', .3, .2 + .03 * k, -.2, .45))
    E.append((t, 'violas', 'B4', .3, .2 + .025 * k, .2, .35))
low(44, 'E', 4.0, .5)
E.append((44.0, 'cellos', 'E3', 4.0, .4, -.1, .45))
E.append((46.0, 'sus_cymbal', 'cresc', None, .55, 0, .45))
E.append((46.0, 'snare', 'roll', None, .35, .1, .35))
E.append((47.5, 'timpani', 'E3', .5, .6, 0, .6))
add(bus, X.pop(1.0), 48.0, .9)
E.append((48.0, 'crash', None, None, .7, 0, .55))
hit(48, .9, 'A2')
for k, p in enumerate(['A6', 'E6', 'C7', 'A5', 'E6', 'C6', 'A5', 'E5', 'C6', 'A4']):   # fragments scatter
    E.append((48.05 + k * .11, 'glockenspiel' if k % 2 == 0 else 'harp', p, .9, .35, float(R.uniform(-.7, .7)), .35))
for b, ch in zip((24, 25), ('Am', 'F')):
    pad(b * BAR, ch, BAR + .3, vel=.24)
    low(b * BAR, ch, BAR + .2, .36)
E.append(dict(t=49.47, inst='vibraphone_bowed', pitch='A4', dur=2.4, vel=.4, pan=0, gain=.35))

# ---- hail (52–58): the tune comes back, lighter
add(bus, X.thump(1.0, 55), 52.35, .8)
E.append((52.35, 'toms', 'low_mallet', None, .7, -.2, .55))
for b, ch in zip((26, 27, 28), ('C', 'F', 'G')):
    t = b * BAR
    rain(t, ch, .3)
    tune(t, ch, .4)
    pad(t, ch, BAR + .2, vel=.26)
    E.append((t, 'contrabass_pizz', CH[ch][0], .6, .5, .1, .55))
hit(52, .5)

# ---- ending (58–69)
add(bus, X.whoosh(1.0, .6), 57.0, .4)
hit(58, .5, 'G2')
rain(58, 'G', .32)                                            # bar 29: dominant while the drop swells
pad(58, 'G', 2.1, vel=.3, inst='violins_trem', gain=.4)
low(58, 'G', 2.1, .45)
E.append((58.6, 'sus_cymbal', 'cresc', None, .5, 0, .4))
add(bus, X.pop(1.0), 60.0, .8)
# the cadence: C major on the payoff, rings under the closing line
for inst, ps, g in (('violins', ['E5', 'G5', 'C6'], .4), ('violas', ['C4', 'E4', 'G4'], .45), ('horn', ['C4', 'G4'], .4)):
    for i, p in enumerate(ps):
        E.append(dict(t=60.0, inst=inst, pitch=p, dur=5.6, vel=.42, pan=(-.35, 0, .35)[i % 3], attack=.05, release=1.2, gain=g))
E.append(dict(t=60.0, inst='cellos', pitch='C3', dur=5.6, vel=.45, pan=-.1, attack=.05, release=1.2, gain=.5))
E.append(dict(t=60.0, inst='contrabass', pitch='C2', dur=5.6, vel=.5, pan=.1, attack=.05, release=1.2, gain=.6))
hit(60, 1.0, 'C3')
E.append((60.0, 'tubular_bells', 'C5', 5.0, .42, 0, .4))
E.append((60.0, 'crash', None, None, .45, 0, .35))
for k, p in enumerate(['C4', 'G4', 'C5', 'E5', 'G5', 'C6']):
    E.append((60.0 + k * .09, 'harp', p, 2.5, .4, -.3 + k * .12, .4))
E.append((62.0, 'glockenspiel', 'G6', 1.5, .25, .3, .25))
E.append((64.0, 'glockenspiel', 'E6', 1.5, .22, -.3, .22))
# button (67): "no batting helmet needed" → timpani + pizz C + glockenspiel, then the fragments rewind (67.7–68.6)
hit(67.0, .75, 'C3')
E.append((67.0, 'contrabass_pizz', 'C2', .6, .6, .1, .65))
for k, p in enumerate(['C4', 'E4', 'G4', 'C5']):
    E.append((67.0 + k * .012, 'violins_pizz', p, .4, .5, (-.3, -.1, .1, .3)[k], .4))
for k, p in enumerate(['G5', 'C6']):
    E.append((67.0, 'glockenspiel', p, 1.5, .42, (-.2, .2)[k], .33))
E.append(dict(t=67.0, inst='cellos', pitch='C3', dur=1.7, vel=.3, pan=0, attack=.02, gain=.35))
add(bus, X.whoosh(.9, .7)[::-1].copy(), 67.7, .4)

mix = S.render(E, dur=DUR, master=False)
mix = S.room(mix, size=.55, mix=.2)
n = min(len(mix), len(bus))
mix = mix[:n] + bus[:n]
f = int(0.3 * SR)
mix[-f:] *= np.linspace(1, 0, f)[:, None]  # 0.3 s declick only: the button is the ending, not a fade
mix = mix / max(1e-9, np.abs(mix).max()) * .9  # tools/score.sh sets loudness and true peak
out = sys.argv[1] if len(sys.argv) > 1 else 'score.wav'
sf.write(out, mix.astype(np.float32), SR)
print('wrote', out, f'{n / SR:.2f}s', sorted({e['inst'] if isinstance(e, dict) else e[1] for e in E}))
