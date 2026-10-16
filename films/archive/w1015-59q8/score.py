"""Score for 如果手搖飲有 3 層樓高. 120 BPM 4/4 in C → beat 0.5 s, bar 2 s.
Cuts (= timeline.ts): 0 6 12 20 28 36 44 50 56 68.
Playful marimba/pizzicato for the cup, strain for the lungs, low tremolo for the vacuum, a broad chord for the sky,
popping bubbles for the boil, thin air on Everest, then G → C cadence on the payoff, ringing; the last bar is a G7
pickup into bar 1's C when the Short replays."""
import sys, os
import numpy as np, soundfile as sf

LIB = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'lib'))
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio import sfx as X
from core.audio.sfx import SR, add

S.seed(59)
DUR, BEAT, BAR = 68.0, 0.5, 2.0
E = []
bus = np.zeros((int(DUR * SR), 2), np.float32)
rng = np.random.default_rng(59)

CH = {  # bass root (contrabass F#1–B3), triad (C4–A4 area), timpani root (F2–F#3)
    'C': ('C2', ['C4', 'E4', 'G4'], 'C3'),
    'Am': ('A1', ['C4', 'E4', 'A4'], 'A2'),
    'F': ('F2', ['C4', 'F4', 'A4'], 'F2'),
    'G': ('G1', ['D4', 'G4', 'B4'], 'G2'),
    'Dm': ('D2', ['D4', 'F4', 'A4'], 'D3'),
    'E': ('E2', ['E4', 'G#4', 'B4'], 'E3'),
}
UP = {'C': 'C5 E5 G5 C6', 'Am': 'A4 C5 E5 A5', 'F': 'F4 A4 C5 F5', 'G': 'G4 B4 D5 G5', 'Dm': 'D5 F5 A5 D6', 'E': 'E5 G#5 B5 E6'}
#      bar: 0    1     2    3    4    5    6     7    8    9    10    11   12    13   14    15   16    17
PROG = ['C', 'Am', 'F', 'C', 'G', 'F', 'Am', 'F', 'C', 'G', 'Am', 'F', 'Dm', 'E', 'Am', 'F', 'Dm', 'E',
        #18  19   20   21    22   23    24   25    26   27   28   29   30   31   32   33
        'F', 'C', 'G', 'Am', 'C', 'Am', 'F', 'Dm', 'F', 'G', 'C', 'C', 'C', 'C', 'F', 'G']
assert len(PROG) == int(DUR / BAR)


def pad(t, ch, d, vel=.3, inst='violas', gain=.5, attack=.5):
    for i, p in enumerate(CH[ch][1]):
        E.append(dict(t=t, inst=inst, pitch=p, dur=d, vel=vel, pan=(-.4, 0, .4)[i], attack=attack, gain=gain))


def low(t, ch, d, vel=.45, inst='contrabass', gain=.6):
    if CH[ch][0] == 'A1':  # the A1 sample is the boomiest note: keep Am bars from out-weighing the cadence
        vel *= .7
    E.append(dict(t=t, inst=inst, pitch=CH[ch][0], dur=d, vel=vel, pan=.1, attack=.15, gain=gain))


def hit(t, ch, v=1.0):  # on scene cuts
    E.append((t, 'timpani', CH[ch][2], 2.0, .9 * v, 0, .9))
    E.append((t, 'gran_cassa', None, None, .8 * v, 0, .8))


def marimba(t, ch, vel=.38, gain=.4, pattern=(0, 1, 2, 3, 2, 1, 2, 3)):
    notes = UP[ch].split()
    for b, k in enumerate(pattern):
        E.append((t + b * BEAT / 2, 'marimba', notes[k], .3, vel * (1.15 if b % 4 == 0 else .9), (-.3, .3)[b % 2], gain))


def pizz(t, ch, vel=.5):
    root = CH[ch][0]
    for b in (0, 2):
        E.append(dict(t=t + b * BEAT, inst='contrabass_pizz', pitch=root, dur=.5, vel=vel, pan=.05, gain=.7))
    for b in (1, 3):
        E.append(dict(t=t + b * BEAT, inst='violins_pizz', pitch=CH[ch][1][b % 3], dur=.3, vel=vel * .8, pan=-.2, gain=.4))


# ── hook + tall + push (0–20): the playful cup groove ──
MOTIF = [(0, 'E5'), (.5, 'G5'), (1.0, 'C6'), (1.5, 'G5'), (2, 'A5'), (2.5, 'E5'), (3.0, 'C5'), (3.5, 'E5'),
         (4, 'F5'), (4.5, 'A5'), (5.0, 'C6'), (5.5, 'D6')]
for i in range(10):
    t, ch = i * BAR, PROG[i]
    marimba(t, ch, vel=.34 if i < 3 else .4)
    pizz(t, ch, vel=.45 if i < 3 else .55)
    if i >= 3:
        pad(t, ch, BAR + .2, vel=.22, gain=.35)
    if i >= 6:  # push: a light shaker groove
        for b in range(8):
            E.append((t + b * BEAT / 2, 'shaker', None, None, .25 if b % 2 else .4, .3, .35))
for dt, p in MOTIF:
    E.append((dt, 'vibraphone', p, .9, .45, .15, .5))
    E.append((12 + dt, 'vibraphone', p, .9, .4, .15, .45))
E.append((6.45, 'glockenspiel', 'C7', 1.2, .5, .2, .4))  # "10 公尺" pops
E.append((6.45, 'glockenspiel', 'G6', 1.2, .4, -.2, .35))
add(bus, X.pop(.8), 9.4, .35, .1)  # pearl ring
for k in range(5):  # the tea climbing the straw
    E.append((13.9 + k * .25, 'xylophone', ['C5', 'E5', 'G5', 'C6', 'E6'][k], .3, .4, .2, .35))

# ── lungs (20–28): strain, then stuck on E ──
for i in range(10, 14):
    t, ch = i * BAR, PROG[i]
    low(t, ch, BAR + .1, vel=.45)
    pad(t, ch, BAR + .3, vel=.28 + .05 * (i - 10), inst='violins' if i >= 12 else 'violas', gain=.45)
    marimba(t, ch, vel=.3, gain=.3, pattern=(0, 2, 1, 3, 0, 2, 1, 3))
add(bus, X.whoosh(1.6, .45), 20.8, .35, 0)  # the long inhale
E.append((23.4, 'cellos_spic', 'E3', .3, .6, 0, .6))  # stops: 1 m
E.append((23.4, 'woodblock', 'a', None, .6, .2, .5))
E.append(dict(t=25.0, inst='cellos', pitch='F3', dur=3.0, vel=.35, pan=-.2, attack=.6, gain=.4))  # "out of reach"

# ── vacuum (28–36): low tremolo, timpani pulse, the drain ──
for i in range(14, 18):
    t, ch = i * BAR, PROG[i]
    low(t, ch, BAR + .1, vel=.45)
    for k, p in enumerate(CH[ch][1]):
        E.append(dict(t=t, inst='violins_trem', pitch=p, dur=BAR + .1, vel=.32 + .06 * (i - 14), pan=(-.4, 0, .4)[k], attack=.3, gain=.4))
    for b in range(4):
        E.append((t + b * BEAT, 'timpani', CH[ch][2], .6, .28 + .06 * (i - 14), 0, .4))
add(bus, X.whoosh(3.5, .5), 29.0, .25, -.1)
add(bus, X.rumble(3.5, .5), 29.0, .18, 0)
E.append((32.67, 'tubular_bells', 'E5', 3.0, .4, 0, .4))  # "最多約 10 公尺"
for k, p in enumerate(['D3', 'A3']):  # hold the tension under the limit
    E.append(dict(t=32.0, inst='horn', pitch=p, dur=2.1, vel=.42, pan=(-.25, .25)[k], attack=.3, gain=.45))
    E.append(dict(t=34.0, inst='horn', pitch=['E3', 'B3'][k], dur=2.1, vel=.46, pan=(-.25, .25)[k], attack=.3, gain=.45))
add(bus, X.whoosh(1.0, .6), 35.0, .45, 0)  # riser into the sky

# ── sky (36–44): broad, horns and strings ──
for i in range(18, 22):
    t, ch = i * BAR, PROG[i]
    low(t, ch, BAR + .2, vel=.4)
    pad(t, ch, BAR + .3, vel=.36, inst='violins', gain=.45, attack=.3)
    for k, p in enumerate(CH[ch][1][:2]):
        E.append(dict(t=t, inst='horn', pitch=p.replace('4', '3'), dur=BAR + .1, vel=.34, pan=(-.25, .25)[k], attack=.25, gain=.4))
    E.append((t, 'harp', UP[ch].split()[0], 1.5, .4, -.3, .4))
    E.append((t + 1.0, 'harp', UP[ch].split()[2], 1.5, .35, .3, .35))
E.append((39.47, 'glockenspiel', 'E6', 1.5, .45, 0, .35))  # beam levels

# ── boil (44–50): bubbles ──
XY = {'C': ['C5', 'E5', 'G5', 'C6'], 'Am': ['A4', 'C5', 'E5', 'A5'], 'F': ['A4', 'C5', 'F5', 'A5']}  # xylophone ≥ G4
for i in range(22, 25):
    t, ch = i * BAR, PROG[i]
    pizz(t, ch, vel=.5)
    pad(t, ch, BAR + .2, vel=.2, inst='violas', gain=.3)
    for b in range(8):
        n = XY[ch][int(rng.integers(0, 4))]
        E.append((t + b * BEAT / 2 + float(rng.uniform(0, .05)), 'xylophone', n, .2, float(rng.uniform(.25, .4)), float(rng.uniform(-.5, .5)), .3))
for k in range(26):
    add(bus, X.pop(float(rng.uniform(.4, .9))), 44.4 + k * .21 + float(rng.uniform(0, .1)), .22, float(rng.uniform(-.6, .6)))

# ── everest (50–56): thin air, flute over harp, riser into the end ──
for i in range(25, 28):
    t, ch = i * BAR, PROG[i]
    low(t, ch, BAR + .1, vel=.35)
    pad(t, ch, BAR + .2, vel=.24, inst='violas', gain=.35)
    for b, n in enumerate(UP[ch].split()):
        E.append((t + b * BEAT, 'harp', n, 1.0, .38, (-.3, .3)[b % 2], .4))
for dt, p in [(0, 'A5'), (1, 'F5'), (1.5, 'D5'), (2, 'A5'), (3, 'C6'), (4, 'B5'), (5, 'D6')]:
    E.append(dict(t=50 + dt, inst='flute', pitch=p, dur=.9, vel=.42, pan=.2, attack=.08, gain=.45))
E.append(dict(t=54, inst='violins', pitch='B4', dur=2.0, vel=.35, pan=0, attack=1.2, gain=.4))
E.append((54, 'gran_cassa', 'roll', None, .5, 0, .5))
add(bus, X.whoosh(1.2, .7), 54.8, .5, 0)

# ── end (56–68): the cadence lands on the payoff and rings; bar 33 is a G7 pickup into bar 1 ──
for t, ch in ((6, 'C'), (12, 'Am'), (20, 'Am'), (28, 'Am'), (36, 'F'), (44, 'C'), (50, 'Dm')):
    hit(t, ch, .55)
hit(56, 'C', 1.4)
E.append((56, 'sus_cymbal', 'hit', None, .5, 0, .45))
E.append((56.0, 'tubular_bells', 'C5', 6.0, .5, 0, .5))
E.append((57.0, 'tubular_bells', 'G4', 5.0, .35, 0, .35))  # second line lands
pad(56, 'C', 9.0, vel=.45, inst='violins', gain=.55, attack=.15)
pad(56, 'C', 9.0, vel=.32, inst='violas', gain=.4, attack=.15)
low(56, 'C', 9.0, vel=.55)
E.append(dict(t=56, inst='cellos', pitch='C3', dur=9.0, vel=.45, pan=-.1, attack=.15, gain=.5))
for k, p in enumerate(['C3', 'E3', 'G3']):
    E.append(dict(t=56, inst='horn', pitch=p, dur=6.0, vel=.5, pan=(-.3, 0, .3)[k], attack=.1, gain=.45))
for k, p in enumerate(['C4', 'E4', 'G4', 'C5', 'E5']):
    E.append((56 + k * .06, 'upright', p, 4.0, .5, (-.2, .2)[k % 2], .45))
for dt, p in MOTIF[:8]:  # the hook motif comes back, softly, under the hold
    E.append((58 + dt, 'vibraphone', p, .9, .3, .15, .35))
pad(64, 'F', 2.1, vel=.26, gain=.35)
low(64, 'F', 2.0, vel=.45, inst='contrabass_pizz')
pad(66, 'G', 2.1, vel=.3, gain=.4)
low(66, 'G', 2.0, vel=.5, inst='contrabass_pizz')
for k, p in enumerate(['G4', 'B4', 'D5', 'F5', 'G5', 'B5', 'D6', 'F6']):  # G7 pickup → bar 1's C
    E.append((66.0 + k * BEAT / 2, 'marimba', p, .3, .42 + .03 * k, (-.2, .2)[k % 2], .45))
E.append(dict(t=66.0, inst='violins_pizz', pitch='B4', dur=.3, vel=.5, pan=-.2, gain=.4))
E.append(dict(t=67.0, inst='violins_pizz', pitch='D5', dur=.3, vel=.5, pan=.2, gain=.4))

mix = S.render(E, dur=DUR, master=False)
mix = S.room(mix, size=.6, mix=.22)
n = min(len(mix), len(bus))
mix = mix[:n] + bus[:n]
f = int(0.3 * SR)
mix[-f:] *= np.linspace(1, 0, f)[:, None]  # 0.3 s declick only: the cadence is the ending, not a fade
mix = mix / max(1e-9, np.abs(mix).max()) * .9  # tools/score.sh sets loudness and true peak
out = sys.argv[1] if len(sys.argv) > 1 else 'score.wav'
sf.write(out, mix.astype(np.float32), SR)
print('wrote', out, f'{n / SR:.2f}s', sorted({e['inst'] if isinstance(e, dict) else e[1] for e in E}))
