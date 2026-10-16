"""Score for 如果全世界停電 24 小時. 100 BPM (bar = 2.4 s), A minor. Cuts land on bar lines.

    sh tools/score_norm.sh blackout

Section times must match T in src/films/blackout/index.tsx.
"""
import sys, os
import numpy as np, soundfile as sf

LIB = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'lib'))
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio import sfx as X
from core.audio.sfx import SR, add, limit

S.seed(24)
DUR = 61.0
BEAT = 0.6
BAR = 2.4
E = []
bus = np.zeros((int(DUR * SR), 2), np.float32)
up = lambda p, n=1: p[:-1] + str(int(p[-1]) + n)

CH = {
    'Am': ('A1', ['A3', 'C4', 'E4']),
    'F':  ('F1', ['A3', 'C4', 'F4']),
    'Dm': ('D2', ['A3', 'D4', 'F4']),
    'E':  ('E2', ['G#3', 'B3', 'E4']),
    'C':  ('C2', ['G3', 'C4', 'E4']),
    'G':  ('G1', ['G3', 'B3', 'D4']),
}


def pad(t, ch, d, vel=.28, inst='violas', octv=0, gain=.45, attack=.6):
    for i, p in enumerate(CH[ch][1]):
        E.append(dict(t=t, inst=inst, pitch=up(p, octv) if octv else p, dur=d, vel=vel, pan=(-.4, 0, .4)[i], attack=attack, gain=gain))


def drone(t, ch, d, vel=.4):
    E.append(dict(t=t, inst='cellos', pitch=up(CH[ch][0]), dur=d, vel=vel, pan=-.1, attack=.4, gain=.65))
    E.append(dict(t=t, inst='contrabass', pitch=CH[ch][0], dur=d, vel=vel, pan=.1, attack=.4, gain=.55))


def tick(t0, t1, every=BEAT, vel=.35, inst='claves'):
    t = t0
    k = 0
    while t < t1 - 1e-6:
        E.append((t, inst, None, None, vel * (1 if k % 4 == 0 else .7), .25 if k % 2 else -.25, .3))
        t += every
        k += 1


def hum(t0, t1, gain=.06):
    """mains hum: 100 Hz + harmonics, soft."""
    n = int((t1 - t0) * SR)
    tt = np.arange(n) / SR
    x = sum(a * np.sin(2 * np.pi * f * tt) for f, a in [(100, 1), (200, .45), (300, .2), (400, .1)])
    x *= np.minimum(1, tt / .4) * np.minimum(1, (t1 - t0 - tt) / .05)
    add(bus, (x * gain).astype(np.float32), t0, 1.0)


# 0–4.8 hook: the city is alive (hum + warm pad), flicker, then the cut
hum(0, 4.62, .07)
pad(0, 'C', 2.4, vel=.3, attack=1.0)
pad(2.4, 'G', 2.2, vel=.3)
E.append((0.0, 'vibraphone', 'E5', 2.0, .3, .2, .35))
E.append((1.2, 'vibraphone', 'G5', 2.0, .28, -.2, .3))
for t in (2.0, 2.15, 2.3):
    add(bus, X.click(1.4, .5), t, .35)
add(bus, X.thump(1.0, 55), 4.62, 1.0)
E.append((4.62, 'gran_cassa', None, None, .9, 0, .9))
E.append((4.62, 'timpani', 'A1', 2.5, .8, 0, .8))

# 4.8–38.4 the dark: ticking clock, low drones, tension grows (14 bars)
prog = ['Am', 'Am', 'F', 'F', 'Dm', 'Dm', 'E', 'E', 'Am', 'F', 'Dm', 'E', 'Am', 'E']
for i, ch in enumerate(prog):
    t = 4.8 + i * BAR
    drone(t, ch, BAR + .1, .32 + .015 * i)
    if i >= 2:
        pad(t, ch, BAR + .2, vel=.22 + .012 * i, inst='violins_trem' if i >= 8 else 'violas', gain=.4)
    if i % 2 == 0:
        E.append((t, 'timpani', CH[ch][0][:-1] + '2', 1.4, .4 + .02 * i, 0, .5))
    # pizzicato heartbeat figure
    for k, (dt, p) in enumerate([(0, 0), (BEAT * 1.5, 1), (BEAT * 2, 2)]):
        if i >= 1:
            E.append((t + dt, 'cellos_pizz', up(CH[ch][1][p], -1), .4, .45, 0, .45))
tick(5.4, 38.4, BEAT, .32)
# accents on cuts
for t in (9.6, 14.4, 19.2, 24.0, 28.8, 33.6):
    E.append((t, 'sus_cymbal', None, None, .18, 0, .25))
E.append((33.6, 'gran_cassa', None, None, .5, 0, .5))
E.append((36.0, 'snare', 'roll', 2.4, .3, 0, .3))
add(bus, X.whoosh(1.0, .5), 37.5, .45)

# 38.4–45.6 restart: lift to the major, hum comes back as lights return
for i, ch in enumerate(['F', 'C', 'G']):
    t = 38.4 + i * BAR
    pad(t, ch, BAR + .2, vel=.32 + .04 * i, inst='violins', octv=1, gain=.45)
    pad(t, ch, BAR + .2, vel=.3, gain=.4)
    drone(t, ch, BAR + .1, .42)
    for k in range(8):
        E.append((t + k * BEAT / 2, 'glockenspiel', up(CH[ch][1][k % 3], 1), .4, .25 + .04 * i, (-.3, .3)[k % 2], .3))
hum(39.4, 45.4, .04)
E.append((38.4, 'timpani', 'F2', 2.0, .6, 0, .6))

# 45.6–52.8 real events: steady, serious pulse
for i, ch in enumerate(['Am', 'F', 'E']):
    t = 45.6 + i * BAR
    pad(t, ch, BAR + .2, vel=.32, gain=.45)
    drone(t, ch, BAR + .1, .4)
    for b in range(4):
        E.append((t + b * BEAT, 'toms', None, None, .35 if b % 2 == 0 else .25, 0, .35))
E.append((45.6, 'gran_cassa', None, None, .55, 0, .55))

# 52.8–60 end: warm resolve, ring out
for i, ch in enumerate(['F', 'G', 'C']):
    t = 52.8 + i * BAR
    pad(t, ch, BAR + (2.6 if i == 2 else .2), vel=.34, inst='violins', octv=1 if i == 2 else 0, gain=.45)
    pad(t, ch, BAR + (2.6 if i == 2 else .2), vel=.3, gain=.4)
    drone(t, ch, BAR + (2.6 if i == 2 else .1), .38)
    E.append((t, 'upright', CH[ch][1][2], 2.0, .4, 0, .45))
E.append((57.6, 'vibraphone', 'C5', 3.0, .35, 0, .35))

mix = S.render(E, dur=DUR, master=False)
mix = S.room(mix, size=.6, mix=.22)
n = min(len(mix), len(bus))
mix = mix[:n] + bus[:n]
# true silence right after the cut, before the clock starts
a, b = int(4.66 * SR), int(5.3 * SR)
fade = np.linspace(0.0, 1.0, b - a)[:, None]
mix[a:b] *= np.maximum(0.25, fade)
f = int(2.0 * SR)
mix[-f:] *= np.linspace(1, 0, f)[:, None]
mix = limit(mix / max(1e-9, np.abs(mix).max()) * .9)
out = sys.argv[1] if len(sys.argv) > 1 else 'score.wav'
sf.write(out, mix.astype(np.float32), SR)
print('wrote', out, f'{n / SR:.2f}s', sorted({e['inst'] if isinstance(e, dict) else e[1] for e in E}))
