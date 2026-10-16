"""Score for 如果地球上的樹全部消失. 100 BPM 4/4 → beat 0.6 s, bar 2.4 s, D minor.
Cuts (= timeline.ts): 0 4.8 12 21.6 28.8 36 43.2 52.8 60.

Ideas: the hook's plucks land on the frames where trees vanish; in the carbon scene one tick per block (16th notes);
in the "half" scene the marimba loses notes at the same times the 46 trees go dark, then only a clock is left;
the end resolves to F major as the sapling grows.
"""
import sys, os
import numpy as np, soundfile as sf

LIB = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'lib'))
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio import sfx as X
from core.audio.sfx import SR, add

S.seed(15)
rnd = np.random.default_rng(15)
DUR, BEAT, BAR = 61.0, 0.6, 2.4
E = []                                          # note events
bus = np.zeros((int(DUR * SR), 2), np.float32)  # sfx bus
fr = lambda n: n / 30.0                         # film frames → seconds

CH = {  # bass root (contrabass F#1–B3), pad triad, ostinato cell (eighths)
    'Dm': ('D2', ['D4', 'F4', 'A4'], ['D4', 'A4', 'F4', 'A4']),
    'Bb': ('Bb1', ['D4', 'F4', 'Bb4'], ['D4', 'Bb4', 'F4', 'Bb4']),
    'F': ('F2', ['C4', 'F4', 'A4'], ['C4', 'A4', 'F4', 'A4']),
    'C': ('C2', ['C4', 'E4', 'G4'], ['C4', 'G4', 'E4', 'G4']),
    'Gm': ('G1', ['D4', 'G4', 'Bb4'], ['D4', 'Bb4', 'G4', 'Bb4']),
    'A': ('A1', ['C#4', 'E4', 'A4'], ['C#4', 'A4', 'E4', 'A4']),
}
up = lambda p, n=1: p[:-1] + str(int(p[-1]) + n)

# bar index → chord (25 bars)
PROG = (['Dm', 'Dm'] +                 # hook 0–1
        ['Dm', 'Bb', 'F'] +            # count 2–4
        ['Gm', 'F', 'C', 'Dm'] +       # oxygen 5–8
        ['Dm', 'Bb', 'A'] +            # carbon 9–11
        ['Bb', 'F', 'C'] +             # rain 12–14
        ['Dm', 'F', 'C'] +             # life 15–17
        ['Dm', 'Bb', 'Gm', 'A'] +      # half 18–21
        ['Dm', 'Bb', 'F'])             # end 22–24


def pad(t, ch, d, vel=.3, inst='violas', octv=0, gain=.5, attack=.5):
    for i, p in enumerate(CH[ch][1]):
        E.append(dict(t=t, inst=inst, pitch=up(p, octv) if octv else p, dur=d, vel=vel, pan=(-.4, 0, .4)[i], attack=attack, gain=gain))


def low(t, ch, d, vel=.45, inst='contrabass', gain=.6):
    E.append(dict(t=t, inst=inst, pitch=CH[ch][0], dur=d, vel=vel, pan=.1, attack=.2, gain=gain))


def hit(t, v=1.0, pitch='D3'):  # on scene cuts
    E.append((t, 'timpani', pitch, 2.0, .9 * v, 0, .9))
    E.append((t, 'gran_cassa', None, None, .8 * v, 0, .8))


def ostinato(bar, inst='marimba', vel=.38, gain=.35, keep=lambda t: True, octv=0):
    t0 = bar * BAR
    cell = CH[PROG[bar]][2]
    for k in range(8):
        t = t0 + k * BEAT / 2
        if keep(t):
            p = cell[k % 4]
            E.append((t, inst, up(p, octv) if octv else p, .35, vel * (1.1 if k % 4 == 0 else .9), (-.35, .35)[k % 2], gain))


def mel(t0, notes, inst, vel=.45, gain=.5, pan=0., attack=.05):
    t = t0
    for p, beats in notes:
        if p:
            E.append(dict(t=t, inst=inst, pitch=p, dur=beats * BEAT * .95, vel=vel, pan=pan, attack=attack, gain=gain))
        t += beats * BEAT


PENTA_HI = ['D5', 'F5', 'G5', 'A5', 'C6', 'D6']

# ── hook (0–4.8): low pad, rising harp; one pluck per vanishing tree ──
pad(0, 'Dm', 2 * BAR + .3, vel=.22, attack=1.2)
low(0, 'Dm', 2 * BAR + .2, vel=.35)
for k, p in enumerate(['D3', 'F3', 'A3', 'D4', 'F4', 'A4', 'D5', 'F5']):
    E.append((k * BEAT / 2, 'harp', p, 1.2, .35, -.3 + k * .08, .45))
N_TREES = 30
for k in range(N_TREES):  # same times as timeline HOOK_VANISH with sqrt spacing
    t = fr(30 + 96 * np.sqrt(k / (N_TREES - 1)))
    E.append((t, 'violins_pizz', PENTA_HI[rnd.integers(len(PENTA_HI))], .3, .22 + .1 * k / N_TREES, float(rnd.uniform(-.6, .6)), .4))
add(bus, X.whoosh(1.0, .5), 3.8, .4)

# ── count (4.8–12): marimba pulse; glockenspiel sparkles while the spiral fills ──
hit(4.8, .75)
for b in range(2, 5):
    pad(b * BAR, PROG[b], BAR + .2, vel=.26)
    low(b * BAR, PROG[b], BAR + .1)
    ostinato(b)
for k in range(24):  # spiral fills scene frames 44–154
    t = 4.8 + fr(44) + k * (fr(110) / 24)
    E.append((t, 'glockenspiel', ['A5', 'C6', 'D6', 'F6', 'G6', 'A6'][k % 6], .5, .16 + .1 * (k / 24), float(rnd.uniform(-.5, .5)), .3))
add(bus, X.whoosh(1.0, .55), 11.0, .45)

# ── oxygen (12–21.6): suspended question, "No." on beat 3, then an airy flute line ──
hit(12.0, .8)
pad(12.0, 'Gm', BAR + .1, vel=.22, inst='violins', octv=0, attack=.8)
low(12.0, 'Gm', BAR, vel=.3)
E.append(dict(t=12.0, inst='violins_trem', pitch='D5', dur=BAR, vel=.18, pan=.2, attack=.6, gain=.3))
t_no = 12.0 + fr(36)                      # "不會。" pops
E.append((t_no, 'harp', 'F3', 2.0, .55, -.2, .5))
E.append((t_no, 'harp', 'C4', 2.0, .5, 0, .5))
E.append((t_no, 'harp', 'A4', 2.0, .5, .2, .5))
E.append((t_no, 'glockenspiel', 'F6', 1.0, .35, .2, .35))
E.append((t_no, 'timpani', 'F2', 1.5, .45, 0, .6))
for b in range(6, 9):
    pad(b * BAR, PROG[b], BAR + .2, vel=.24)
    low(b * BAR, PROG[b], BAR + .1, vel=.38)
    for k in range(4):
        E.append((b * BAR + k * BEAT, 'vibraphone', CH[PROG[b]][1][(k + 1) % 3], .9, .22, (-.3, .3)[k % 2], .3))
mel(6 * BAR, [('A4', 1), ('C5', 1), ('F5', 2), ('E5', 1), ('D5', 1), ('C5', 2), ('D5', 3), ('A4', 1)], 'flute', vel=.42, gain=.42, pan=-.1, attack=.08)
add(bus, X.whoosh(1.2, .7), 20.4, .55)

# ── carbon (21.6–28.8): heavy low brass; one tick per year-block on 16ths ──
hit(21.6, 1.0)
for b in range(9, 12):
    ch = PROG[b]
    pad(b * BAR, ch, BAR + .2, vel=.28, inst='cellos', octv=-1, gain=.4)
    low(b * BAR, ch, BAR + .1, vel=.4)
    E.append(dict(t=b * BAR, inst='horn', pitch=up(CH[ch][1][0], -1), dur=BAR, vel=.3, pan=-.2, attack=.3, gain=.36))
    E.append(dict(t=b * BAR, inst='trombone', pitch=CH[ch][0][:-1] + '2', dur=BAR, vel=.28, pan=.2, attack=.3, gain=.32))
    for k in range(4):
        E.append((b * BAR + k * BEAT, 'cellos_spic', CH[ch][0][:-1] + '3', .3, .28, 0, .3))
for i in range(29):  # timeline CARBON_BLOCK0 = 72 f, step 4.5 f
    t = 21.6 + fr(72 + 4.5 * i)
    E.append((t, 'woodblock', 'abc'[i % 3], None, .28 + .2 * (i / 28), (-.3, .3)[i % 2], .35))
    if i % 4 == 0:
        E.append((t, 'marimba', 'D3', .3, .4, 0, .35))
E.append((21.6 + fr(72 + 4.5 * 28), 'timpani', 'A2', 1.5, .5, 0, .6))

# ── rain (28.8–36): harp rising like vapour, glockenspiel droplets ──
hit(28.8, .55, pitch='A#2')
for b in range(12, 15):
    ch = PROG[b]
    pad(b * BAR, ch, BAR + .2, vel=.24, inst='violins', attack=.8, gain=.42)
    low(b * BAR, ch, BAR + .1, vel=.35)
    arp = [CH[ch][1][0], CH[ch][1][1], CH[ch][1][2], up(CH[ch][1][0]), up(CH[ch][1][1]), up(CH[ch][1][2])]
    for k in range(8):
        E.append((b * BAR + k * BEAT / 2, 'harp', arp[min(k, 5)] if k < 6 else arp[11 - k - 2], .9, .32, -.4 + k * .1, .45))
for k in range(18):
    t = 28.8 + fr(14) + k * 0.36 + float(rnd.uniform(-.06, .06))
    E.append((t, 'glockenspiel', ['C6', 'D6', 'F6', 'G6', 'A6', 'C7'][rnd.integers(6)], .4, .14, float(rnd.uniform(-.6, .6)), .25))

# ── life (36–43.2): the fullest section: marimba, pizz, shaker, flute bird-calls ──
hit(36.0, .6)
for b in range(15, 18):
    ch = PROG[b]
    pad(b * BAR, ch, BAR + .2, vel=.32)
    low(b * BAR, ch, BAR + .1, vel=.42)
    ostinato(b, vel=.5, gain=.42)
    for k in range(4):
        E.append((b * BAR + k * BEAT, 'violins_pizz', CH[ch][1][k % 3], .3, .3, (-.4, .4)[k % 2], .35))
    for k in range(8):
        E.append((b * BAR + k * BEAT / 2, 'shaker', None, None, .22 if k % 2 else .3, .3, .3))
    E.append((b * BAR, 'frame_drum', None, None, .4, 0, .45))
    E.append((b * BAR + 2 * BEAT, 'frame_drum', None, None, .3, 0, .4))
for t0, ps in ((36.0 + fr(10), ('A5', 'C6', 'A5')), (36.0 + fr(20), ('G5', 'A#5', 'G5')), (36.0 + fr(30), ('F5', 'A5', 'F5')),
               (39.6, ('C6', 'D6', 'C6', 'A5')), (41.4, ('A5', 'C6'))):
    for k, p in enumerate(ps):
        E.append(dict(t=t0 + k * .1, inst='flute', pitch=p, dur=.12, vel=.32, pan=.35, attack=.01, gain=.35))
add(bus, X.whoosh(1.2, .7), 42.0, .55)

# ── half (43.2–52.8): the marimba drops notes exactly when the 46 trees go dark; then a clock ──
hit(43.2, 1.0)
r46 = np.random.default_rng(46)
gone = sorted(43.2 + fr(54 + 108 * k / 45) for k in range(46))
dropped = set()
for b in range(18, 22):
    ch = PROG[b]
    pad(b * BAR, ch, BAR + .2, vel=.26 if b < 20 else .2)
    low(b * BAR, ch, BAR + .1, vel=.42)
for b in (18, 19):  # note k is dropped once ~46% of trees are gone by then (and with matching probability)
    def keep(t):
        lost = sum(g <= t for g in gone) / 100
        return r46.random() >= lost * 1.4
    ostinato(b, vel=.42, keep=keep)
for g in gone[::3]:
    E.append((g, 'violins_pizz', ['A5', 'F5', 'D5', 'A4'][int(g * 10) % 4], .25, .18, float(r46.uniform(-.5, .5)), .3))
t_b = 43.2 + fr(180)  # "every year we still cut…"
for k in range(int((52.8 - t_b) / BEAT) + 1):
    E.append((t_b + k * BEAT, 'woodblock', 'c', None, .3 if k % 4 else .42, -.2, .35))
E.append((43.2 + fr(198), 'timpani', 'D3', 2.0, .7, 0, .8))
E.append((43.2 + fr(198), 'gran_cassa', None, None, .55, 0, .6))
E.append(dict(t=t_b, inst='cellos', pitch='D3', dur=52.8 - t_b, vel=.32, pan=0, attack=.6, gain=.5))

# ── end (52.8–60): solo upright and bowed vibraphone; resolves to F major as the sapling grows ──
E.append((52.8, 'tubular_bells', 'D4', 3.0, .3, 0, .35))
E.append((52.8, 'gran_cassa', None, None, .35, 0, .4))
for b in range(22, 25):
    ch = PROG[b]
    for i, p in enumerate(CH[ch][1]):
        E.append(dict(t=b * BAR, inst='vibraphone_bowed', pitch=p, dur=BAR + .3, vel=.22, pan=(-.3, 0, .3)[i], attack=.6, gain=.35))
    low(b * BAR, ch, BAR + .1, vel=.3)
    E.append((b * BAR, 'upright', CH[ch][0][:-1] + '2', 2.2, .35, -.1, .45))
mel(22 * BAR, [('A4', 1), ('D5', 1), ('F5', 2), ('F5', 1), ('D5', 1), ('C5', 2), ('A4', 4)], 'upright', vel=.42, gain=.55, pan=.1)
for k, p in enumerate(['F3', 'C4', 'F4', 'A4', 'C5', 'G5']):  # final F add9, rolled
    E.append((24 * BAR + .9 + k * .07, 'upright', p, 3.0, .3, -.2 + k * .08, .4))
E.append((24 * BAR + .9, 'glockenspiel', 'A6', 1.5, .12, .3, .25))

mix = S.render(E, dur=DUR, master=False)
mix = S.room(mix, size=.6, mix=.22)
n = min(len(mix), len(bus))
mix = mix[:n] + bus[:n]
end = int(60.0 * SR)
mix = mix[:end]
f = int(2.0 * SR)
mix[-f:] *= np.linspace(1, 0, f)[:, None]  # 2 s fade-out
mix = mix / max(1e-9, np.abs(mix).max()) * .9  # tools/score.sh sets loudness and true peak
out = sys.argv[1] if len(sys.argv) > 1 else 'score.wav'
sf.write(out, mix.astype(np.float32), SR)
print('wrote', out, f'{len(mix) / SR:.2f}s', sorted({e['inst'] if isinstance(e, dict) else e[1] for e in E}))
