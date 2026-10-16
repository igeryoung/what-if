"""Score for 如果地球上的螞蟻集合起來. 120 BPM (bar = 2 s), E minor → G major. Cuts on bar lines.

    sh tools/score_norm.sh ants
Section times must match src/films/ants/timeline.ts.
"""
import sys, os
import numpy as np, soundfile as sf

LIB = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'lib'))
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio import sfx as X
from core.audio.sfx import SR, add, limit

S.seed(23)
DUR = 61.0
BEAT = 0.5
BAR = 2.0
E = []
bus = np.zeros((int(DUR * SR), 2), np.float32)
up = lambda p, n=1: p[:-1] + str(int(p[-1]) + n)

CH = {  # bass, triad, arp cell (8 eighths)
    'Em': ('E2', ['E4', 'G4', 'B4'], ['E4', 'B4', 'G4', 'B4', 'E5', 'B4', 'G4', 'B4']),
    'C':  ('C2', ['E4', 'G4', 'C5'], ['C4', 'G4', 'E4', 'G4', 'C5', 'G4', 'E4', 'G4']),
    'G':  ('G1', ['D4', 'G4', 'B4'], ['G3', 'D4', 'B3', 'D4', 'G4', 'D4', 'B3', 'D4']),
    'D':  ('D2', ['D4', 'F#4', 'A4'], ['D4', 'A4', 'F#4', 'A4', 'D5', 'A4', 'F#4', 'A4']),
    'Am': ('A1', ['C4', 'E4', 'A4'], ['A3', 'E4', 'C4', 'E4', 'A4', 'E4', 'C4', 'E4']),
    'B':  ('B1', ['D#4', 'F#4', 'B4'], ['B3', 'F#4', 'D#4', 'F#4', 'B4', 'F#4', 'D#4', 'F#4']),
}


def arp(t, ch, inst='marimba', vel=.45, gain=.5, step=.25, octv=0, n=8):
    cell = CH[ch][2]
    for k in range(n):
        p = cell[k % 8]
        E.append((t + k * step, inst, up(p, octv) if octv else p, step * 1.6, vel * (1 if k % 2 == 0 else .8), (-.35, .35)[k % 2], gain))


def pizz_bass(t, ch, vel=.55):
    b = up(CH[ch][0])
    E.append(dict(t=t, inst='contrabass_pizz', pitch=b, dur=.5, vel=vel, pan=0, gain=.85))
    E.append(dict(t=t + 1.0, inst='contrabass_pizz', pitch=b, dur=.5, vel=vel * .85, pan=0, gain=.85))


def pad(t, ch, d, vel=.28, inst='violas', octv=0, gain=.45):
    for i, p in enumerate(CH[ch][1]):
        E.append(dict(t=t, inst=inst, pitch=up(p, octv) if octv else p, dur=d, vel=vel, pan=(-.4, 0, .4)[i], attack=.4, gain=gain))


def steps(t0, t1, every=.25, vel=.25, gain=.25):
    t = t0
    k = 0
    while t < t1 - 1e-6:
        E.append((t, 'woodblock' if k % 2 == 0 else 'claves', None, None, vel * (1 if k % 4 == 0 else .7), (.3, -.3)[k % 2], gain))
        t += every
        k += 1


# 0–6 hook: one ant — tiny footsteps + kalimba
steps(0.2, 2.4, every=.125, vel=.18, gain=.18)
for t, p in [(0.0, 'B4'), (1.0, 'E5'), (2.0, 'G5'), (3.0, 'B4'), (4.0, 'D5'), (4.5, 'F#5')]:
    E.append((t, 'kalimba', p, 1.2, .5, 0, .5))
E.append(dict(t=0, inst='violas', pitch='E4', dur=6, vel=.2, pan=0, attack=1.5, gain=.35))
add(bus, X.whoosh(1.0, .5), 5.0, .4)

# 6–16 count: an ostinato that keeps getting busier (5 bars)
cnt = ['Em', 'C', 'G', 'D', 'B']
for i, ch in enumerate(cnt):
    t = 6 + i * BAR
    step = .25 if i < 2 else .125
    arp(t, ch, inst='marimba', vel=.4 + .04 * i, gain=.42 + .03 * i, step=step, n=int(BAR / step))
    pizz_bass(t, ch, .5 + .05 * i)
    if i >= 1:
        pad(t, ch, BAR + .1, vel=.22 + .04 * i, octv=0)
    if i >= 2:
        for b in range(4):
            E.append((t + b * BEAT, 'bass_drum', None, None, .45 + .08 * (b == 0), 0, .55))
    if i >= 3:
        E.append(dict(t=t, inst='violins_trem', pitch=up(CH[ch][1][2]), dur=BAR, vel=.3 + .08 * (i - 3), pan=0, attack=.3, gain=.35))
E.append((15.0, 'snare', 'roll', 1.0, .4, 0, .35))
E.append((16.0, 'crash', None, None, .5, 0, .4))
E.append((16.0, 'timpani', 'E2', 1.5, .7, 0, .7))

# 16–24 per person: groove (4 bars)
for i, ch in enumerate(['Em', 'C', 'G', 'D']):
    t = 16 + i * BAR
    arp(t, ch, inst='marimba', vel=.42, gain=.42)
    pizz_bass(t, ch)
    pad(t, ch, BAR + .1, vel=.26)
    for b in range(4):
        tb = t + b * BEAT
        E.append((tb, 'bass_drum', None, None, .5 if b % 2 == 0 else .35, 0, .5))
        E.append((tb + .25, 'shaker', None, None, .3, .2, .3))
        if b in (1, 3):
            E.append((tb, 'claps', None, None, .3, -.1, .28))

# 24–30 density: busy sixteenths (3 bars)
for i, ch in enumerate(['Em', 'C', 'B']):
    t = 24 + i * BAR
    arp(t, ch, inst='xylophone', vel=.32, gain=.28, step=.125, n=16, octv=0)
    arp(t, ch, inst='violins_pizz', vel=.45, gain=.4)
    pizz_bass(t, ch)
    for b in range(4):
        E.append((t + b * BEAT, 'bass_drum', None, None, .45, 0, .45))
    steps(t, t + BAR, every=.125, vel=.15, gain=.15)

# 30–32 pivot: stop, one low note and a roll
E.append(dict(t=30.0, inst='cellos', pitch='E2', dur=2.0, vel=.45, pan=0, attack=.05, gain=.7))
E.append((30.9, 'timpani', 'E2', 1.0, .3, 0, .35))
E.append((31.0, 'snare', 'roll', 1.0, .35, 0, .3))

# 32–46 scale: careful weighing (2 bars) → the ants land at 36 (big hit) → full (5 bars)
for i, ch in enumerate(['Am', 'B']):
    t = 32 + i * BAR
    pad(t, ch, BAR + .1, vel=.3)
    E.append(dict(t=t, inst='cellos', pitch=up(CH[ch][0]), dur=BAR, vel=.4, pan=0, attack=.2, gain=.65))
    for b in range(4):
        E.append((t + b * BEAT, 'violins_pizz', CH[ch][1][b % 3], .4, .4, (-.3, .3)[b % 2], .4))
E.append((33.0, 'timpani', 'A1', 1.0, .4, 0, .4))
E.append((36.0, 'timpani', 'E2', 2.0, .95, 0, .9))
E.append((36.0, 'gran_cassa', None, None, .85, 0, .8))
E.append((36.0, 'crash', None, None, .55, 0, .45))
for i, ch in enumerate(['Em', 'C', 'G', 'D', 'Em']):
    t = 36 + i * BAR
    arp(t, ch, inst='marimba', vel=.45, gain=.42)
    pizz_bass(t, ch, .6)
    pad(t, ch, BAR + .1, vel=.34, inst='violins', octv=1, gain=.4)
    pad(t, ch, BAR + .1, vel=.3)
    E.append(dict(t=t, inst='horn', pitch=CH[ch][1][1], dur=BAR, vel=.4, pan=-.2, attack=.3, gain=.4))
    for b in range(4):
        tb = t + b * BEAT
        E.append((tb, 'bass_drum', None, None, .55 if b % 2 == 0 else .4, 0, .55))
        E.append((tb + .25, 'shaker', None, None, .3, .2, .3))
        if b in (1, 3):
            E.append((tb, 'snare2', None, None, .35, 0, .3))

# 46–54 where: warm, wide (4 bars)
for i, ch in enumerate(['C', 'G', 'Am', 'D']):
    t = 46 + i * BAR
    arp(t, ch, inst='kalimba', vel=.45, gain=.45)
    pizz_bass(t, ch, .5)
    pad(t, ch, BAR + .1, vel=.32, inst='violins', octv=1, gain=.4)
    for b in range(4):
        E.append((t + b * BEAT, 'bass_drum', None, None, .4 if b % 2 == 0 else .28, 0, .45))

# 54–60 end: resolve to G, ring out
for i, ch in enumerate(['C', 'D']):
    t = 54 + i * BAR
    arp(t, ch, inst='marimba', vel=.38, gain=.38)
    pad(t, ch, BAR + .1, vel=.3)
    pizz_bass(t, ch, .45)
for p, pan in [('G2', 0), ('D3', -.2), ('B3', .2), ('G4', -.1), ('B4', .1), ('D5', 0)]:
    E.append((58.0, 'upright', p, 3.0, .45, pan, .5))
pad(58.0, 'G', 3.0, vel=.32, inst='violins', octv=1, gain=.4)
E.append((58.0, 'glockenspiel', 'G5', 2.0, .3, 0, .3))
steps(58.5, 59.6, every=.125, vel=.12, gain=.12)

mix = S.render(E, dur=DUR, master=False)
mix = S.room(mix, size=.45, mix=.18)
n = min(len(mix), len(bus))
mix = mix[:n] + bus[:n]
f = int(1.5 * SR)
mix[-f:] *= np.linspace(1, 0, f)[:, None]
mix = limit(mix / max(1e-9, np.abs(mix).max()) * .9)
out = sys.argv[1] if len(sys.argv) > 1 else 'ants.wav'
sf.write(out, mix.astype(np.float32), SR)
print('wrote', out, f'{n / SR:.2f}s', sorted({e['inst'] if isinstance(e, dict) else e[1] for e in E}))
