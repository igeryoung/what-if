"""Score for 如果一張紙能對折 42 次. 96 BPM (bar = 2.5 s), D major. Every fold gets a rising note,
so you hear the doubling. Fold schedule must match src/films/paper/timeline.ts (SEG).

    sh tools/score_norm.sh paper
"""
import sys, os
import numpy as np, soundfile as sf

LIB = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'lib'))
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio import sfx as X
from core.audio.sfx import SR, add, limit

S.seed(42)
DUR = 63.5
BAR = 2.5
BEAT = BAR / 4
E = []
bus = np.zeros((int(DUR * SR), 2), np.float32)

SEG = [(7.5, 12.0, 0, 14), (15.0, 19.5, 14, 23), (22.5, 26.0, 23, 27), (30.0, 33.5, 27, 32), (37.5, 45.0, 32, 42)]
FOLDS = [t0 + (t1 - t0) * (i + 1) / (b - a) for (t0, t1, a, b) in SEG for i in range(b - a)]

CH = {
    'D': ('D2', ['D4', 'F#4', 'A4']),
    'Bm': ('B1', ['D4', 'F#4', 'B4']),
    'G': ('G1', ['D4', 'G4', 'B4']),
    'A': ('A1', ['C#4', 'E4', 'A4']),
    'Em': ('E2', ['E4', 'G4', 'B4']),
    'F#m': ('F#2', ['C#4', 'F#4', 'A4']),
}
up = lambda p, n=1: p[:-1] + str(int(p[-1]) + n)


def pad(t, ch, d, vel=.3, inst='violas', octv=0, gain=.5):
    for i, p in enumerate(CH[ch][1]):
        E.append(dict(t=t, inst=inst, pitch=up(p, octv) if octv else p, dur=d, vel=vel, pan=(-.4, 0, .4)[i], attack=.5, gain=gain))


def low(t, ch, d, vel=.4):
    E.append(dict(t=t, inst='cellos', pitch=up(CH[ch][0]), dur=d, vel=vel, pan=-.15, attack=.3, gain=.65))
    E.append(dict(t=t, inst='contrabass', pitch=CH[ch][0], dur=d, vel=vel, pan=.1, attack=.2, gain=.55))


def pulse(t, bars, vel=.4, kick=True):
    for k in range(int(bars * 4)):
        tb = t + k * BEAT
        if kick:
            E.append((tb, 'bass_drum', None, None, vel * (1 if k % 2 == 0 else .8), 0, .6))
        E.append((tb + BEAT / 2, 'shaker', None, None, vel * .6, .3, .3))


# ── 0–7.5 hook + guess: upright piano motif, a soft clock
for i, (t, p) in enumerate([(0.0, 'A4'), (0.625, 'D5'), (1.25, 'F#5'), (2.5, 'E5'), (3.125, 'A4'), (3.75, 'D5')]):
    E.append((t, 'upright', p, 1.6, .42, (-.2, .2)[i % 2], .55))
pad(0, 'D', 2.6, .22)
pad(2.5, 'G', 2.6, .24)
E.append((3.4, 'upright', 'D6', 1.2, .35, 0, .45))  # the fold lands
add(bus, X.whoosh(.5, .5), 2.9, .4)
pad(5, 'Bm', 2.6, .28)
low(5, 'Bm', 2.5, .35)
for k in range(4):
    E.append((5 + k * BEAT, 'woodblock', None, None, .4, .2, .3))
E.append((5 + 0.625, 'upright', 'B4', 1, .4, -.2, .5))
E.append((5 + 1.25, 'upright', 'D5', 1, .4, 0, .5))
E.append((5 + 1.875, 'upright', 'F#5', 1, .45, .2, .5))
E.append((6.9, 'snare', 'roll', .6, .22, 0, .25))

# ── 7.5–45 climb: chord per bar, pulse building, one rising note per fold
climb = ['D', 'D', 'Bm', 'G', 'G', 'A', 'Em', 'G', 'A', 'Bm', 'G', 'D', 'G', 'A', 'A']  # 15 bars
for i, ch in enumerate(climb):
    t = 7.5 + i * BAR
    lvl = i / 14
    pad(t, ch, BAR + .2, vel=.26 + .14 * lvl, inst='violins' if i >= 6 else 'violas', octv=1 if i >= 10 else 0, gain=.45)
    low(t, ch, BAR + .1, .32 + .16 * lvl)
    pulse(t, 1, vel=.35 + .25 * lvl, kick=i >= 3)
    if i >= 9:
        E.append(dict(t=t, inst='horn', pitch=CH[ch][1][1], dur=BAR, vel=.35 + .15 * lvl, pan=-.2, attack=.3, gain=.4))
for t in (15.0, 22.5, 30.0, 37.5):  # cuts between milestones
    E.append((t, 'timpani', 'D2', 1.4, .55, 0, .55))
    E.append((t, 'sus_cymbal', None, None, .25, 0, .3))
# fold notes: D-major pentatonic climbing ~1 step per fold, reset an octave lower after the first segment
PENTA = ['D', 'E', 'F#', 'A', 'B']
for i, tf in enumerate(FOLDS):
    if i < 23:   # marimba, D4 upward (second segment restarts a bit lower)
        step = i if i < 14 else i - 9
        inst, pitch = 'marimba', PENTA[step % 5] + str(4 + step // 5)
    else:        # glockenspiel for the space part, D5..D7
        step = i - 23
        inst, pitch = 'glockenspiel', PENTA[step % 5] + str(5 + min(2, step // 7))
    E.append((tf - .02, inst, pitch, .5, .55 + .01 * min(i, 30), (-.25, .25)[i % 2], .5))
add(bus, X.whoosh(1.6, .6), 43.3, .55)
E.append((43.75, 'snare', 'roll', 1.2, .35, 0, .35))

# ── 45–50 payoff: the Moon
E.append((45.0, 'timpani', 'D2', 2.5, .9, 0, .9))
E.append((45.0, 'gran_cassa', None, None, .7, 0, .7))
E.append((45.0, 'crash', None, None, .5, 0, .45))
for i, ch in enumerate(['D', 'G']):
    t = 45 + i * BAR
    pad(t, ch, BAR + .3, .42, inst='violins', octv=1, gain=.5)
    pad(t, ch, BAR + .3, .38, gain=.45)
    low(t, ch, BAR + .2, .5)
    E.append(dict(t=t, inst='horn', pitch=CH[ch][1][2], dur=BAR, vel=.5, pan=.2, attack=.3, gain=.45))
    for k in range(8):
        E.append((t + k * BEAT / 2, 'glockenspiel', up(CH[ch][1][k % 3], 2), .4, .3, (-.3, .3)[k % 2], .3))

# ── 50–57.5 twist: quiet, then wonder (galaxy)
E.append((50.0, 'tubular_bells', 'B4', 2.5, .3, 0, .35))
pad(50, 'Bm', 2.6, .26)
low(50, 'Bm', 2.5, .3)
for i, p in enumerate(['F#4', 'D4', 'B3', 'D4']):
    E.append((50 + i * BEAT, 'upright', p, 1.0, .38, 0, .5))
for i, ch in enumerate(['G', 'Em']):
    t = 52.5 + i * BAR
    pad(t, ch, BAR + .3, .32, inst='vibraphone_bowed', octv=1, gain=.4)
    pad(t, ch, BAR + .3, .3, gain=.45)
    low(t, ch, BAR + .2, .32)
    for k in range(8):
        E.append((t + k * BEAT / 2, 'harp', up(CH[ch][1][k % 3], 1 + (k // 3) % 2), .6, .35, (-.3, .3)[k % 2], .35))

# ── 57.5–62.5 end: A → D, ring out
pad(57.5, 'A', 2.6, .34, inst='violins', gain=.45)
low(57.5, 'A', 2.5, .38)
pad(60.0, 'D', 3.5, .36, inst='violins', octv=1, gain=.45)
pad(60.0, 'D', 3.5, .32, gain=.45)
low(60.0, 'D', 3.5, .4)
for p in ['D4', 'F#4', 'A4', 'D5']:
    E.append((60.0, 'upright', p, 3.4, .45, 0, .5))
E.append((60.0, 'timpani', 'D2', 2.0, .45, 0, .5))

mix = S.render(E, dur=DUR, master=False)
mix = S.room(mix, size=.6, mix=.2)
n = min(len(mix), len(bus))
mix = mix[:n] + bus[:n]
fl = int(1.5 * SR)
mix[-fl:] *= np.linspace(1, 0, fl)[:, None]
mix = limit(mix / max(1e-9, np.abs(mix).max()) * .9)
out = sys.argv[1] if len(sys.argv) > 1 else 'paper.wav'
os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
sf.write(out, mix.astype(np.float32), SR)
print('wrote', out, f'{n / SR:.2f}s', len(FOLDS), 'folds', sorted({e['inst'] if isinstance(e, dict) else e[1] for e in E}))
