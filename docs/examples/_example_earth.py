"""Score for 如果地球轉快 10 倍. 100 BPM (bar = 2.4 s), D minor. Cuts land on bar lines.

    ../../lib/.venv/bin/python -I music/score.py public/score_raw.wav

Section times must match src/timeline.ts.
"""
import sys, os
import numpy as np, soundfile as sf

LIB = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'lib'))
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio import sfx as X
from core.audio.sfx import SR, add, limit

S.seed(11)
DUR = 61.0
BEAT = 0.6
BAR = 2.4
E = []
bus = np.zeros((int(DUR * SR), 2), np.float32)

# chord: bass root, pad triad, ostinato cell (eighths)
CH = {
    'Dm': ('D2', ['D4', 'F4', 'A4'], ['D4', 'A4', 'F4', 'A4']),
    'Bb': ('Bb1', ['D4', 'F4', 'Bb4'], ['D4', 'Bb4', 'F4', 'Bb4']),
    'F':  ('F2', ['C4', 'F4', 'A4'], ['C4', 'A4', 'F4', 'A4']),
    'C':  ('C2', ['C4', 'E4', 'G4'], ['C4', 'G4', 'E4', 'G4']),
    'Gm': ('G1', ['D4', 'G4', 'Bb4'], ['D4', 'Bb4', 'G4', 'Bb4']),
    'A':  ('A1', ['C#4', 'E4', 'A4'], ['C#4', 'A4', 'E4', 'A4']),
}
up = lambda p, n=1: p[:-1] + str(int(p[-1]) + n)


def pad(t, ch, d, vel=.3, inst='violas', octv=0, gain=.5):
    for i, p in enumerate(CH[ch][1]):
        E.append(dict(t=t, inst=inst, pitch=up(p, octv) if octv else p, dur=d, vel=vel, pan=(-.4, 0, .4)[i], attack=.5, gain=gain))


def low(t, ch, d, vel=.45):
    E.append(dict(t=t, inst='cellos', pitch=up(CH[ch][0]), dur=d, vel=vel, pan=-.15, attack=.25, gain=.7))
    E.append(dict(t=t, inst='contrabass', pitch=CH[ch][0], dur=d, vel=vel, pan=.1, attack=.2, gain=.6))


def ost(t, ch, bars=1, inst='violins_spic', vel=.5, gain=.45, octv=0):
    cell = CH[ch][2]
    for k in range(int(bars * 8)):
        p = cell[k % 4]
        E.append((t + k * BEAT / 2, inst, up(p, octv) if octv else p, .28, vel * (1 if k % 2 == 0 else .8), (-.3, .3)[k % 2], gain))


def hit(t, v=1.0):
    E.append((t, 'timpani', 'D2', 2.0, .9 * v, 0, .9))
    E.append((t, 'gran_cassa', None, None, .8 * v, 0, .8))


# 0–4.8 hook: clock ticks that speed up, then a whoosh into ×10
ticks = []
tt = 0.3
while tt < 4.5:
    ticks.append(tt)
    tt += max(0.09, 0.6 * max(0.0, 1 - tt / 4.2) ** 1.6)
for x in ticks:
    E.append((x, 'woodblock', None, None, .45, .2, .35))
E.append(dict(t=0, inst='violins', pitch='A5', dur=4.6, vel=.22, pan=0, attack=1.5, gain=.35))
E.append(dict(t=0, inst='contrabass', pitch='D2', dur=4.6, vel=.35, pan=0, attack=1.0, gain=.6))
add(bus, X.whoosh(1.2, .6), 3.0, .55)
hit(4.8, .7)

# 4.8–24: ostinato builds (8 bars): Dm Bb F C | Dm Bb Gm A
prog = ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'Gm', 'A']
for i, ch in enumerate(prog):
    t = 4.8 + i * BAR
    ost(t, ch, vel=.42 + .03 * i, gain=.38 + .02 * i)
    low(t, ch, BAR + .1, .38 + .02 * i)
    if i >= 2:
        pad(t, ch, BAR + .2, vel=.26 + .02 * i)
    if i >= 4:
        for b in range(4):
            E.append((t + b * BEAT, 'toms', None, None, .35 + .05 * (b == 0), 0, .35))
    E.append((t, 'timpani', CH[ch][0][:-1] + '2', 1.2, .45, 0, .5))
# accents on scene cuts
for t in (9.6, 14.4, 19.2):
    E.append((t, 'sus_cymbal', None, None, .25, 0, .3))

# 24–26.4 pivot: drop out, suspense, riser into the slam
E.append(dict(t=24.0, inst='violins_trem', pitch='A5', dur=2.4, vel=.35, pan=0, attack=.3, gain=.4))
E.append(dict(t=24.0, inst='cellos', pitch='D3', dur=2.4, vel=.3, pan=0, attack=.3, gain=.6))
E.append((24.9, 'snare', 'roll', 1.5, .35, 0, .35))
add(bus, X.whoosh(1.0, .7), 25.45, .6)

# 26.4–38.4 ocean: full, heavy (5 bars) — Dm Bb Gm A Dm
hit(26.4, 1.0)
E.append((26.4, 'crash', None, None, .55, 0, .45))
for i, ch in enumerate(['Dm', 'Bb', 'Gm', 'A', 'Dm']):
    t = 26.4 + i * BAR
    ost(t, ch, inst='cellos_spic', vel=.55, gain=.5, octv=-1)
    ost(t, ch, vel=.45, gain=.32)
    low(t, ch, BAR + .1, .5)
    pad(t, ch, BAR + .2, vel=.38, inst='violins', octv=1, gain=.45)
    E.append(dict(t=t, inst='horn', pitch=CH[ch][1][1], dur=BAR, vel=.45, pan=-.2, attack=.3, gain=.45))
    for b in range(4):
        E.append((t + b * BEAT, 'toms', None, None, .5 if b in (0, 2) else .35, 0, .45))
    E.append((t, 'timpani', CH[ch][0][:-1] + '2', 1.5, .6, 0, .6))
add(bus, X.rumble(4.0, .8), 31.5, .5)

# 38.4–45.6 storm: swirling tremolo strings, 3 bars Gm Bb A
for i, ch in enumerate(['Gm', 'Bb', 'A']):
    t = 38.4 + i * BAR
    pad(t, ch, BAR + .2, vel=.4, inst='violins_trem', octv=1, gain=.45)
    low(t, ch, BAR + .1, .45)
    ost(t, ch, inst='cellos_spic', vel=.45, gain=.4, octv=-1)
    E.append((t, 'timpani', CH[ch][0][:-1] + '2', 1.2, .5, 0, .5))
add(bus, X.whoosh(2.2, .5), 40.0, .45)
add(bus, X.whoosh(2.2, .5), 42.6, .45)

# 45.6–50.4 rocket: the good news, major lift F C
for i, ch in enumerate(['F', 'C']):
    t = 45.6 + i * BAR
    pad(t, ch, BAR + .2, vel=.35, gain=.45)
    low(t, ch, BAR + .1, .4)
    for k in range(8):
        E.append((t + k * BEAT / 2, 'glockenspiel', up(CH[ch][2][k % 4], 1), .4, .35, (-.3, .3)[k % 2], .3))
add(bus, X.ignite(.7), 46.9, .35)
add(bus, X.roar(3.0, .5), 47.0, .25)

# 50.4–60 end: Bb F C Dm, then ring out on D
for i, ch in enumerate(['Bb', 'F', 'C', 'Dm']):
    t = 50.4 + i * BAR
    pad(t, ch, BAR + (2.5 if i == 3 else .2), vel=.36, inst='violins', octv=1 if i >= 2 else 0, gain=.45)
    pad(t, ch, BAR + (2.5 if i == 3 else .2), vel=.32, gain=.45)
    low(t, ch, BAR + (2.5 if i == 3 else .1), .42)
    E.append(dict(t=t, inst='horn', pitch=CH[ch][1][2], dur=BAR, vel=.4, pan=.2, attack=.4, gain=.4))
hit(50.4, .6)
E.append((57.6, 'tubular_bells', 'D5', 3.0, .35, 0, .35))

mix = S.render(E, dur=DUR, master=False)
mix = S.room(mix, size=.65, mix=.22)
n = min(len(mix), len(bus))
mix = mix[:n] + bus[:n]
f = int(2.0 * SR)
mix[-f:] *= np.linspace(1, 0, f)[:, None]
mix = limit(mix / max(1e-9, np.abs(mix).max()) * .9)
out = sys.argv[1] if len(sys.argv) > 1 else 'score.wav'
sf.write(out, mix.astype(np.float32), SR)
print('wrote', out, f'{n / SR:.2f}s', sorted({e['inst'] if isinstance(e, dict) else e[1] for e in E}))
