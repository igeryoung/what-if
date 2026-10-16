"""Score for 如果你一輩子不剪頭髮. 120 BPM (bar = 2 s), D major, playful and curious.
Cuts on bar lines; section times must match src/films/w1013-s1h5/timeline.ts.

    sh tools/score_norm.sh w1013-s1h5
"""
import sys, os
import numpy as np, soundfile as sf

LIB = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'lib'))
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio import sfx as X
from core.audio.sfx import SR, add, limit

S.seed(1013)
DUR = 62.5
BEAT = 0.5
BAR = 2.0
E = []
bus = np.zeros((int(DUR * SR), 2), np.float32)
up = lambda p, n=1: p[:-1] + str(int(p[-1]) + n)

CH = {  # bass, triad, arp cell (8 eighths)
    'D':  ('D2', ['D4', 'F#4', 'A4'], ['D4', 'A4', 'F#4', 'A4', 'D5', 'A4', 'F#4', 'A4']),
    'Bm': ('B1', ['D4', 'F#4', 'B4'], ['B3', 'F#4', 'D4', 'F#4', 'B4', 'F#4', 'D4', 'F#4']),
    'G':  ('G1', ['D4', 'G4', 'B4'], ['G3', 'D4', 'B3', 'D4', 'G4', 'D4', 'B3', 'D4']),
    'A':  ('A1', ['C#4', 'E4', 'A4'], ['A3', 'E4', 'C#4', 'E4', 'A4', 'E4', 'C#4', 'E4']),
    'Em': ('E2', ['E4', 'G4', 'B4'], ['E4', 'B4', 'G4', 'B4', 'E5', 'B4', 'G4', 'B4']),
}
PROG = ['D', 'Bm', 'G', 'A']


def arp(t, ch, inst='marimba', vel=.45, gain=.5, step=.25, octv=0, n=8):
    cell = CH[ch][2]
    for k in range(n):
        p = cell[k % 8]
        E.append((t + k * step, inst, up(p, octv) if octv else p, step * 1.8, vel * (1 if k % 2 == 0 else .8), (-.3, .3)[k % 2], gain))


def pizz(t, ch, vel=.55):
    b = up(CH[ch][0])
    E.append(dict(t=t, inst='contrabass_pizz', pitch=b, dur=.5, vel=vel, pan=0, gain=.85))
    E.append(dict(t=t + 1.0, inst='contrabass_pizz', pitch=b, dur=.5, vel=vel * .85, pan=0, gain=.85))


def pad(t, ch, d, vel=.28, inst='violas', octv=0, gain=.45):
    for i, p in enumerate(CH[ch][1]):
        E.append(dict(t=t, inst=inst, pitch=up(p, octv) if octv else p, dur=d, vel=vel, pan=(-.4, 0, .4)[i], attack=.4, gain=gain))


def cello(t, ch, d, vel=.4):
    E.append(dict(t=t, inst='cellos', pitch=up(CH[ch][0]), dur=d, vel=vel, pan=-.1, attack=.3, gain=.6))


def kit(t, vel=.6, hat=True, clap=True):
    for b in range(4):
        tb = t + b * BEAT
        if b in (0, 2):
            E.append((tb, 'bass_drum', None, None, vel, 0, .8))
        if clap and b in (1, 3):
            E.append((tb, 'claps', None, None, vel * .5, -.1, .3))
        if hat:
            E.append((tb + .25, 'hihat', None, None, .28, .25, .35))


# 0–6 hook: kalimba question motif, soft pad
motif = [('A4', 0), ('D5', .5), ('F#5', 1.0), ('E5', 1.5)]
for bar, ch in enumerate(['D', 'Bm', 'G']):
    t = bar * BAR
    for p, dt in motif:
        E.append((t + dt, 'kalimba', p if bar != 2 else up(p, 0), .9, .5, .2, .6))
    pad(t, ch, BAR + .3, vel=.22)
E.append((5.0, 'kalimba', 'A5', 1.0, .45, 0, .55))
add(bus, X.whoosh(.8, .4), 5.2, .4)

# 6–12 speed: clock ticks (a month per tick), marimba + pizz
for i, ch in enumerate(['D', 'Bm', 'G']):
    t = 6 + i * BAR
    arp(t, ch, vel=.42, gain=.45)
    pizz(t, ch)
    for b in range(4):
        E.append((t + b * BEAT, 'woodblock', None, None, .35 if b % 2 == 0 else .25, .3, .35))
E.append((6.0, 'triangle', None, None, .3, .2, .3))

# 12–22 naive: building up, kick enters, strings climb
for i, ch in enumerate(['D', 'Bm', 'G', 'A', 'A']):
    t = 12 + i * BAR
    arp(t, ch, vel=.44 + .02 * i, gain=.45, octv=1 if i >= 3 else 0)
    pizz(t, ch, .6)
    pad(t, ch, BAR + .2, vel=.26 + .03 * i, inst='violins' if i >= 2 else 'violas', octv=1 if i >= 2 else 0)
    cello(t, ch, BAR + .2, .38 + .03 * i)
    kit(t, .5 + .05 * i, clap=i >= 2)
E.append((20.0, 'snare', 'roll', 2.0, .3, 0, .3))
add(bus, X.whoosh(.9, .5), 21.1, .5)

# 22–30 twist: hit, then sparse — vibraphone, low strings
E.append((22.0, 'timpani', 'D2', 2.0, .8, 0, .8))
E.append((22.0, 'crash', None, None, .45, 0, .4))
E.append(dict(t=22.0, inst='contrabass', pitch='D2', dur=3.8, vel=.45, pan=0, attack=.05, gain=.6))
for i, ch in enumerate(['Bm', 'G', 'Em', 'A']):
    t = 22 + i * BAR
    pad(t, ch, BAR + .3, vel=.24, inst='violas')
    cello(t, ch, BAR + .3, .34)
    for k, p in enumerate(CH[ch][1] + [up(CH[ch][1][0])]):
        E.append((t + .5 + k * .35, 'vibraphone', up(p), 1.6, .32, (-.3, .3)[k % 2], .45))
add(bus, X.whoosh(.7, .4), 29.3, .35)

# 30–36 limit: settled, light groove
for i, ch in enumerate(['D', 'G', 'A']):
    t = 30 + i * BAR
    arp(t, ch, inst='marimba', vel=.4, gain=.42)
    pizz(t, ch, .55)
    pad(t, ch, BAR + .2, vel=.26)
    kit(t, .45, hat=True, clap=False)
E.append((30.0, 'triangle', None, None, .35, .2, .35))

# 36–44 record: wonder — glockenspiel melody over horns
mel = ['F#5', 'A5', 'D6', 'C#6', 'B5', 'A5', 'F#5', 'E5']
for i, ch in enumerate(['G', 'D', 'Bm', 'A']):
    t = 36 + i * BAR
    pad(t, ch, BAR + .3, vel=.3, inst='violins', octv=1)
    E.append(dict(t=t, inst='horn', pitch=CH[ch][1][1], dur=BAR, vel=.32, pan=-.2, attack=.3, gain=.45))
    cello(t, ch, BAR + .3, .4)
    pizz(t, ch, .5)
    E.append((t, 'glockenspiel', mel[2 * i], 1.2, .4, .2, .45))
    E.append((t + 1.0, 'glockenspiel', mel[2 * i + 1], 1.2, .36, .2, .45))
    E.append((t, 'harp', up(CH[ch][0], 2), 1.8, .4, -.2, .5))
E.append((36.0, 'sus_cymbal', None, None, .3, 0, .3))
add(bus, X.whoosh(.7, .4), 43.3, .35)

# 44–56 sum + life: groove builds to the climax
for i, ch in enumerate(PROG + PROG + ['D', 'Bm', 'G', 'A'][:4]):
    t = 44 + i * BAR
    if t >= 56:
        break
    hi = t >= 50
    arp(t, ch, inst='marimba', vel=.46, gain=.45, octv=1 if hi else 0)
    if hi:
        arp(t, ch, inst='kalimba', vel=.35, gain=.35, step=.5, n=4, octv=1)
    pizz(t, ch, .62)
    pad(t, ch, BAR + .2, vel=.3 + (.06 if hi else 0), inst='violins' if hi else 'violas', octv=1 if hi else 0)
    cello(t, ch, BAR + .2, .44)
    kit(t, .6 if hi else .5)
E.append((50.0, 'crash', None, None, .4, 0, .35))
E.append((50.0, 'timpani', 'D2', 1.5, .6, 0, .6))
E.append((54.0, 'snare', 'roll', 2.0, .28, 0, .28))

# 56–62 end: resolve on D, ring out
for p, pan in [('D3', -.2), ('A3', .1), ('F#4', -.1), ('A4', .2), ('D5', 0), ('E5', .3)]:
    E.append((56.0, 'upright', p, 5.5, .45, pan, .5))
pad(56, 'D', 5.5, vel=.32, inst='violins', octv=1)
pad(56, 'D', 5.5, vel=.3)
cello(56, 'D', 5.5, .42)
E.append(dict(t=56.0, inst='contrabass', pitch='D2', dur=5.5, vel=.42, pan=0, attack=.1, gain=.55))
E.append((56.0, 'sus_cymbal', None, None, .3, 0, .3))
for p, dt in motif:
    E.append((58.0 + dt, 'kalimba', p, 1.2, .4, .2, .5))
E.append((60.0, 'kalimba', 'D5', 2.0, .4, 0, .5))

mix = S.render(E, dur=DUR, master=False)
mix = S.room(mix, size=.5, mix=.2)
n = min(len(mix), len(bus))
mix = mix[:n] + bus[:n]
f = int(1.5 * SR)
mix[-f:] *= np.linspace(1, 0, f)[:, None]
mix = limit(mix / max(1e-9, np.abs(mix).max()) * .89)
out = sys.argv[1] if len(sys.argv) > 1 else 'score.wav'
os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
sf.write(out, mix.astype(np.float32), SR)
used = sorted({e['inst'] if isinstance(e, dict) else e[1] for e in E})
print('wrote', out, f'{n / SR:.2f}s', used)
