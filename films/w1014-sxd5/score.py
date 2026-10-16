"""Score for 如果人不用睡覺. A lullaby waltz: 120 BPM in 3/4 (beat = 0.5 s, bar = 1.5 s), F major / D minor.
Every cut lands on a bar line; section times must match src/films/w1014-sxd5/timeline.ts.

    sh tools/score_norm.sh w1014-sxd5
"""
import sys, os
import numpy as np, soundfile as sf

LIB = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'lib'))
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio import sfx as X
from core.audio.sfx import SR, add, limit

S.seed(1014)
DUR = 60.6
BEAT = 0.5
BAR = 1.5
E = []
bus = np.zeros((int(DUR * SR), 2), np.float32)

CH = {
    'F':  ('F2', ['C4', 'F4', 'A4']),
    'Dm': ('D2', ['D4', 'F4', 'A4']),
    'Bb': ('Bb1', ['D4', 'F4', 'Bb4']),
    'C':  ('C2', ['C4', 'E4', 'G4']),
    'C7': ('C2', ['E4', 'G4', 'Bb4']),
    'Gm': ('G1', ['D4', 'G4', 'Bb4']),
    'A':  ('A1', ['C#4', 'E4', 'A4']),
    'Eb': ('Eb2', ['Eb4', 'G4', 'Bb4']),
}
up = lambda p, n=1: p[:-1] + str(int(p[-1]) + n)


def pad(t, ch, d, vel=.25, inst='violas', octv=0, gain=.45, attack=.5):
    for i, p in enumerate(CH[ch][1]):
        E.append(dict(t=t, inst=inst, pitch=up(p, octv) if octv else p, dur=d, vel=vel, pan=(-.4, 0, .4)[i], attack=attack, gain=gain))


def low(t, ch, d, vel=.35, gain=.6):
    E.append(dict(t=t, inst='cellos', pitch=up(CH[ch][0]), dur=d, vel=vel, pan=-.15, attack=.3, gain=gain))
    E.append(dict(t=t, inst='contrabass', pitch=CH[ch][0], dur=d, vel=vel, pan=.1, attack=.25, gain=gain * .9))


def waltz(t, ch, vel=.4, harp=True):
    """oom-pah-pah: pizz bass on 1, harp chord on 2 and 3"""
    E.append((t, 'contrabass_pizz', up(CH[ch][0]), .9, vel, -.1, .7))
    E.append((t, 'cellos_pizz', up(CH[ch][0]), .9, vel * .8, .1, .45))
    if harp:
        for b in (1, 2):
            for i, p in enumerate(CH[ch][1]):
                E.append((t + b * BEAT + i * .012, 'harp', p, .8, vel * (.8 if b == 1 else .7), (-.3, 0, .3)[i], .4))


def mel(t0, notes, inst='vibraphone', vel=.45, gain=.5, octv=0, pan=0):
    """notes: (bar, beat, pitch, beats) relative to t0"""
    for bar, beat, p, n in notes:
        E.append((t0 + bar * BAR + beat * BEAT, inst, up(p, octv) if octv else p, n * BEAT + .3, vel, pan, gain))


def hit(t, pitch='F2', v=1.0, cym=True):
    E.append((t, 'timpani', pitch, 2.0, .8 * v, 0, .8))
    E.append((t, 'gran_cassa', None, None, .6 * v, 0, .6))
    if cym:
        E.append((t, 'sus_cymbal', None, None, .35 * v, 0, .35))


# lullaby (original): A G | F C | D F A | G ‖ second half for the end
LULL_A = [(0, 0, 'A4', 2), (0, 2, 'G4', 1), (1, 0, 'F4', 2), (1, 2, 'C4', 1), (2, 0, 'D4', 1), (2, 1, 'F4', 1), (2, 2, 'A4', 1), (3, 0, 'G4', 3)]

# ── 0–4.5 hook: a music box, then the alarm on bar 2 ─────────────────────────
mel(0, [(0, 0, 'A5', 2), (0, 2, 'G5', 1)], inst='glockenspiel', vel=.4, gain=.45)
for i, p in enumerate(['F3', 'A3', 'C4']):
    E.append((i * BEAT, 'harp', p, 1.2, .35, (-.2, 0, .2)[i], .4))
E.append(dict(t=0, inst='violas', pitch='F4', dur=1.6, vel=.18, pan=0, attack=.6, gain=.4))
E.append((1.5, 'triangle', 'roll', 1.0, .5, .2, .45))
for k in range(6):
    E.append((1.5 + k * .125, 'glockenspiel', ('C7', 'A6')[k % 2], .2, .4, (-.25, .25)[k % 2], .4))
add(bus, X.pop(.6), 1.5, .35)
for t, p in [(2.25, 'C5'), (2.5, 'A4'), (3.0, 'F5'), (3.25, 'C5'), (3.5, 'A5'), (3.75, 'C6')]:
    E.append((t, 'violins_pizz', p, .4, .55, .15, .5))
E.append((3.0, 'contrabass_pizz', 'F2', .9, .5, 0, .7))
for k, p in enumerate(['F4', 'A4', 'C5', 'F5', 'A5', 'C6', 'F6']):
    E.append((3.75 + k * .1, 'harp', p, .6, .35, -.2 + k * .06, .35))
add(bus, X.whoosh(.7, .5), 3.8, .4)
hit(4.5, 'F2', .8)

# ── 4.5–12 life: the waltz, lullaby on vibraphone (bars 3–7) ────────────────
for i, ch in enumerate(['F', 'Dm', 'Bb', 'C', 'F']):
    t = 4.5 + i * BAR
    waltz(t, ch, .38 + .02 * i)
    if i >= 1:
        pad(t, ch, BAR + .2, vel=.2 + .02 * i)
mel(4.5, LULL_A + [(4, 0, 'F4', 2), (4, 2, 'A4', 1)], inst='vibraphone', vel=.5, gain=.55, octv=1)
mel(4.5, LULL_A, inst='glockenspiel', vel=.25, gain=.25, octv=1)
E.append((6.0, 'hand_chimes', 'A5', 1.5, .3, .2, .3))        # dots turn violet
add(bus, X.whoosh(.9, .35), 7.4, .3)                         # dots regroup
hit(9.0, 'C2', .5)                                           # "27 年"
E.append((9.0, 'hand_chimes', 'C6', 2.0, .4, 0, .35))

# ── 12–19.5 gain: brighter, flute joins (bars 8–12) ──────────────────────────
for i, ch in enumerate(['Bb', 'F', 'Gm', 'C', 'C7']):
    t = 12 + i * BAR
    waltz(t, ch, .42)
    pad(t, ch, BAR + .2, vel=.26, inst='violins' if i >= 2 else 'violas', gain=.4)
LULL_B = [(0, 0, 'D5', 2), (0, 2, 'C5', 1), (1, 0, 'A4', 2), (1, 2, 'F4', 1), (2, 0, 'Bb4', 1), (2, 1, 'A4', 1), (2, 2, 'G4', 1), (3, 0, 'C5', 3)]
mel(12, LULL_B, inst='flute', vel=.45, gain=.45)
mel(12, LULL_B, inst='vibraphone', vel=.35, gain=.35, octv=1)
for k, p in enumerate(['F5', 'A5', 'C6', 'F6', 'A6', 'C7']):          # the night slice turns gold
    E.append((13.5 + k * .19, 'glockenspiel', p, .6, .4, -.3 + k * .12, .4))
hit(16.5, 'C2', .7)                                                   # "122 天"
E.append(dict(t=16.5, inst='horn', pitch='E4', dur=1.5, vel=.4, pan=-.2, attack=.2, gain=.4))
E.append(dict(t=16.5, inst='horn', pitch='G4', dur=1.5, vel=.4, pan=.2, attack=.2, gain=.4))
for k, p in enumerate(['E4', 'G4', 'Bb4']):                           # lead-in to the pivot
    E.append((18.0 + k * BEAT, 'upright', p, .6, .4, 0, .5))

# ── 19.5–22.5 pivot: hush ────────────────────────────────────────────────────
E.append(dict(t=19.5, inst='violins_trem', pitch='A5', dur=3.0, vel=.22, pan=0, attack=.4, gain=.35))
E.append(dict(t=19.5, inst='cellos', pitch='D3', dur=3.0, vel=.25, pan=0, attack=.3, gain=.5))
E.append((19.5, 'upright', 'D4', 1.4, .4, 0, .5))
E.append((19.5, 'upright', 'A3', 1.4, .3, 0, .4))
E.append((21.0, 'timpani', 'D2', 1.5, .45, 0, .5))
E.append((21.0, 'upright', 'F4', 1.2, .4, 0, .5))
E.append((21.7, 'snare', 'roll', .8, .3, 0, .3))

# ── 22.5–31.5 record: the clock (bars 15–20), D minor ────────────────────────
OST = {'Dm': ['D3', 'A3', 'F3', 'A3', 'D3', 'A3'], 'Bb': ['D3', 'Bb3', 'F3', 'Bb3', 'D3', 'Bb3'], 'A': ['C#3', 'A3', 'E3', 'A3', 'C#3', 'A3'],
       'Gm': ['D3', 'Bb3', 'G3', 'Bb3', 'D3', 'Bb3'], 'Eb': ['Eb3', 'Bb3', 'G3', 'Bb3', 'Eb3', 'Bb3']}


def ost(t, ch, vel=.45, gain=.45, inst='cellos_spic'):
    for k, p in enumerate(OST[ch]):
        E.append((t + k * BEAT / 2, inst, p, .25, vel * (1 if k % 2 == 0 else .8), (-.25, .25)[k % 2], gain))


for i, ch in enumerate(['Dm', 'Dm', 'Bb', 'A', 'Dm', 'A']):
    t = 22.5 + i * BAR
    lvl = i / 5
    ost(t, ch, .42 + .12 * lvl, .4 + .1 * lvl)
    low(t, ch, BAR + .1, .32 + .12 * lvl)
    if i >= 2:
        pad(t, ch, BAR + .2, vel=.22 + .1 * lvl, inst='violins_trem', octv=1, gain=.35)
    E.append((t, 'toms', 'low', None, .3 + .2 * lvl, 0, .4))
for k in range(18):                                                   # clock tick on every beat
    E.append((22.5 + k * BEAT, 'woodblock', 'a' if k % 3 == 0 else 'b', None, .4 if k % 3 == 0 else .3, .25, .32))


def h_rec(fr):  # same easing as scenes.tsx Record: 0→264 h over frames 12..135
    x = min(1, max(0, (fr - 12) / (135 - 12)))
    return 264 * (4 * x ** 3 if x < .5 else 1 - (-2 * x + 2) ** 3 / 2)


DMIN = ['D5', 'E5', 'F5', 'G5', 'A5', 'Bb5', 'C6', 'D6', 'E6', 'F6', 'A6']
fr = 12
for k in range(11):                                                   # a chime for every sleepless day
    while h_rec(fr) < 24 * (k + 1) - 5:
        fr += .25
    E.append((22.5 + fr / 30, 'glockenspiel', DMIN[k], .5, .32, (-.3, .3)[k % 2], .3))
hit(27.0, 'D2', .9)                                                   # 264
E.append((27.0, 'crash', None, None, .35, 0, .3))
for k, p in enumerate(['D3', 'F3', 'A3']):                            # the three symptoms
    E.append((27.5 + k * BEAT, 'trombone_stac', p, .3, .5, (-.2, 0, .2)[k], .45))
    E.append((27.5 + k * BEAT, 'toms', 'high', None, .35, 0, .35))

# ── 31.5–39 drunk: woozier, the meter climbs (bars 21–25) ────────────────────
for i, ch in enumerate(['Gm', 'Gm', 'Eb', 'A', 'A']):
    t = 31.5 + i * BAR
    lvl = i / 4
    if i < 3:
        ost(t, ch, .45 + .1 * lvl, .42)
        low(t, ch, BAR + .1, .35 + .1 * lvl)
        pad(t, ch, BAR + .2, vel=.25 + .1 * lvl, inst='violins_trem', octv=1, gain=.38)
    for k in range(6):                                                # ticks in eighths now
        E.append((t + k * BEAT / 2, 'woodblock', 'c', None, .28 + .06 * (k == 0), .25, .28))
E.append(dict(t=31.5, inst='oboe', pitch='D5', dur=2.9, vel=.3, pan=-.3, attack=.3, gain=.3))
E.append(dict(t=34.5, inst='oboe', pitch='Eb5', dur=1.4, vel=.32, pan=-.3, attack=.2, gain=.3))
E.append((35.2, 'snare', 'roll', .8, .35, 0, .32))
hit(36.0, 'A1', 1.0)                                                  # 0.10 %
E.append((36.0, 'crash', None, None, .45, 0, .4))
low(36.0, 'A', 3.0, .45)
pad(36.0, 'A', 3.0, vel=.35, inst='violins_trem', octv=1, gain=.4)
E.append(dict(t=36.0, inst='horn', pitch='A3', dur=3.0, vel=.45, pan=0, attack=.15, gain=.45))
E.append((37.5, 'trombone_stac', 'A2', .4, .5, 0, .45))               # badge
add(bus, X.whoosh(1.0, .45), 38.1, .4)

# ── 39–48 wash: water and calm (bars 26–31) ──────────────────────────────────
WCH = ['Dm', 'Bb', 'F', 'Bb', 'F', 'C']
for i, ch in enumerate(WCH):
    t = 39 + i * BAR
    pad(t, ch, BAR + .3, vel=.24, inst='vibraphone_bowed', octv=1, gain=.4)
    low(t, ch, BAR + .2, .28, .5)
    tones = CH[ch][1]
    if i >= 2:      # flowing harp eighths once the brain "sleeps"
        for k in range(6):
            p = [tones[0], tones[1], tones[2], up(tones[0]), tones[2], tones[1]][k]
            E.append((t + k * BEAT / 2, 'harp', up(p) if k == 3 else p, .8, .38, (-.35, .35)[k % 2], .42))
    else:
        E.append((t, 'harp', tones[0], 1.4, .35, -.2, .4))
        E.append((t + BEAT, 'harp', tones[2], 1.2, .3, .2, .35))
add(bus, X.whoosh(.8, .4), 40.2, .3)                                  # zoom into the brain
E.append((42.0, 'hand_chimes', 'F5', 2.0, .4, -.2, .35))              # sleep switch
E.append((42.0, 'hand_chimes', 'C6', 2.0, .32, .2, .3))
add(bus, X.whoosh(2.2, .35), 42.0, .3)
E.append((43.5, 'timpani', 'Bb1', 1.5, .4, 0, .45))                   # +60 %
for k, p in enumerate(['D6', 'F6', 'Bb6']):
    E.append((43.5 + k * .15, 'glockenspiel', p, .5, .32, (-.2, 0, .2)[k], .32))
mel(45.0, [(0, 0, 'A5', 2), (0, 2, 'G5', 1), (1, 0, 'E5', 3)], inst='flute', vel=.38, gain=.4)

# ── 48–54 dolphin: halves of the brain take turns, so does the stereo (bars 32–35) ──
for i, ch in enumerate(['Dm', 'Bb', 'F', 'C']):
    t = 48 + i * BAR
    pan = 0 if i == 0 else (.65 if i % 2 == 1 else -.65)   # follow the awake half
    tones = CH[ch][1]
    for k in range(6):
        p = [tones[0], tones[1], tones[2], up(tones[0]), tones[2], tones[1]][k]
        E.append((t + k * BEAT / 2, 'marimba', up(p) if k == 3 else p, .5, .45, pan, .45))
    low(t, ch, BAR + .2, .3, .5)
    pad(t, ch, BAR + .3, vel=.22, inst='violas', gain=.38)
    E.append((t, 'contrabass_pizz', up(CH[ch][0]), .9, .4, 0, .6))
    if i >= 1:
        E.append((t, 'hand_chimes', up(tones[2], 1), 1.2, .25, -pan, .25))  # the sleeping half: a soft bell

# ── 54–60 end: the lullaby comes home (bars 36–39) ───────────────────────────
for i, ch in enumerate(['F', 'Bb', 'C', 'F']):
    t = 54 + i * BAR
    last = i == 3
    waltz(t, ch, .32, harp=not last)
    pad(t, ch, BAR + (2.2 if last else .3), vel=.26, inst='violins', gain=.38)
    pad(t, ch, BAR + (2.2 if last else .3), vel=.22, gain=.4)
    low(t, ch, BAR + (2.2 if last else .2), .3, .5)
END_MEL = [(0, 0, 'A4', 2), (0, 2, 'G4', 1), (1, 0, 'F4', 2), (1, 2, 'D4', 1), (2, 0, 'E4', 1), (2, 1, 'G4', 1), (2, 2, 'Bb4', 1), (3, 0, 'A4', 4)]
mel(54, END_MEL, inst='upright', vel=.5, gain=.55)
mel(54, END_MEL, inst='glockenspiel', vel=.28, gain=.28, octv=1)
for p in ['F4', 'A4', 'C5', 'F5']:
    E.append((58.5, 'upright', p, 2.0, .4, 0, .45))
E.append((58.5, 'hand_chimes', 'F5', 2.0, .35, 0, .35))
E.append((58.5, 'timpani', 'F2', 2.0, .35, 0, .4))

mix = S.render(E, dur=DUR, master=False)
mix = S.room(mix, size=.6, mix=.24)
n = min(len(mix), len(bus))
mix = mix[:n] + bus[:n]
fl = int(1.6 * SR)
mix[-fl:] *= np.linspace(1, 0, fl)[:, None]
mix = limit(mix / max(1e-9, np.abs(mix).max()) * .9)
out = sys.argv[1] if len(sys.argv) > 1 else 'w1014-sxd5.wav'
os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
sf.write(out, mix.astype(np.float32), SR)
print('wrote', out, f'{n / SR:.2f}s', sorted({e['inst'] if isinstance(e, dict) else e[1] for e in E}))
