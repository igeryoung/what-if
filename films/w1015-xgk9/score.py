"""Score for 如果把你一輩子眨眼的時間加起來 / every blink of your life.
120 BPM 4/4 → beat 0.5 s, bar 2 s, A minor. Cuts (= timeline.ts): 0 6 14 22 32 40 50 58 69.
Kalimba arpeggios = the ticking of blinks; 15 glockenspiel ticks land on the 15 minute-ring marks (14.5–18.0 s,
eighth notes); 18 xylophone ticks on the 18 dark days (34.5 s on, sixteenths). The life count builds to a hit at 48,
the twist drops to almost nothing, the payoff lands on an E → Am cadence at 60 s and rings under the closing line (63.4–66.4);
a button on its last word (67) with one last on-screen blink, then the Am rings out to the cut (no pickup).
"""
import sys, os
import numpy as np, soundfile as sf

LIB = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'lib'))
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio import sfx as X
from core.audio.sfx import SR, add

S.seed(15)
DUR, BEAT, BAR = 69.0, 0.5, 2.0
E = []
bus = np.zeros((int(DUR * SR), 2), np.float32)

CH = {  # bass root, pad triad, kalimba arpeggio (F3–C#5)
    'Am': ('A1', ['C4', 'E4', 'A4'], ['A3', 'C4', 'E4', 'A4']),
    'F': ('F2', ['C4', 'F4', 'A4'], ['F3', 'A3', 'C4', 'F4']),
    'C': ('C2', ['C4', 'E4', 'G4'], ['G3', 'C4', 'E4', 'G4']),
    'G': ('G1', ['D4', 'G4', 'B4'], ['G3', 'B3', 'D4', 'G4']),
    'Dm': ('D2', ['D4', 'F4', 'A4'], ['A3', 'D4', 'F4', 'A4']),
    'E': ('E2', ['B3', 'E4', 'G#4'], ['G#3', 'B3', 'E4', 'G#4']),
    'E7': ('E2', ['D4', 'E4', 'G#4'], ['G#3', 'B3', 'D4', 'E4']),
}
PROG = (['Am', 'F', 'G'] +                    # 0–2   hook
        ['Am', 'F', 'C', 'G'] +               # 3–6   one blink
        ['Am', 'F', 'C', 'G'] +               # 7–10  minute
        ['Am', 'F', 'C', 'G', 'E'] +          # 11–15 day
        ['Am', 'F', 'C', 'G'] +               # 16–19 year
        ['Am', 'F', 'C', 'Dm', 'E'] +         # 20–24 life
        ['F', 'Dm', 'F', 'Dm'] +              # 25–28 twist
        ['E', 'Am', 'Am', 'Am', 'Am'])        # 29–33 end (the film stops half a bar later, at 69)
assert len(PROG) == 34
ARP = [0, 1, 2, 3, 2, 1, 2, 3]


def pad(t, ch, d, vel=.3, inst='violas', gain=.5, oct_=0):
    for i, p in enumerate(CH[ch][1]):
        if oct_:
            p = p[:-1] + str(int(p[-1]) + oct_)
        E.append(dict(t=t, inst=inst, pitch=p, dur=d, vel=vel, pan=(-.4, 0, .4)[i], attack=.5, gain=gain))


def low(t, ch, d, vel=.45, inst='contrabass', gain=.6):
    E.append(dict(t=t, inst=inst, pitch=CH[ch][0], dur=d, vel=vel, pan=.1, attack=.2, gain=gain))


def kal(t, ch, n=8, step=.25, vel=.42, gain=.5, pat=ARP):
    for b in range(n):
        p = CH[ch][2][pat[b % len(pat)]]
        E.append((t + b * step, 'kalimba', p, .5, vel * (1.0 if b % 2 == 0 else .8), (-.25, .25)[b % 2], gain))


def hit(t, v=1.0, pitch='A2'):
    E.append((t, 'timpani', pitch, 2.0, .9 * v, 0, .9))
    E.append((t, 'gran_cassa', None, None, .8 * v, 0, .8))


def blink(t, v=1.0):  # a soft wooden "shutter" on each on-screen blink
    E.append((t, 'woodblock', 'c', None, .35 * v, .15, .35))
    add(bus, X.thump(.5 * v, 90), t, .25)


for i, ch in enumerate(PROG):
    t = i * BAR
    if i <= 2:                     # hook: kalimba + soft violas
        kal(t, ch, vel=.4)
        pad(t, ch, BAR + .3, vel=.22, gain=.4)
        if i >= 1:
            low(t, ch, BAR + .1, vel=.3, gain=.45)
    elif i <= 6:                   # one blink: slow motion, quarters, cellos join
        kal(t, ch, n=4, step=.5, vel=.38)
        pad(t, ch, BAR + .3, vel=.26, gain=.45)
        low(t, ch, BAR + .1, vel=.38)
        E.append(dict(t=t, inst='cellos', pitch=CH[ch][0][:-1] + '3' if CH[ch][0][-1] in '12' else CH[ch][0], dur=BAR + .2, vel=.3, pan=-.2, attack=.4, gain=.4))
    elif i <= 10:                  # minute: eighths back, vibraphone colour
        kal(t, ch, vel=.4)
        pad(t, ch, BAR + .3, vel=.28, gain=.45)
        low(t, ch, BAR + .1, vel=.42)
    elif i <= 24:                  # day → year → life: pulse builds
        lvl = (i - 11) / 13.0
        kal(t, ch, vel=.4 + .1 * lvl)
        pad(t, ch, BAR + .3, vel=.3 + .12 * lvl, gain=.5)
        low(t, ch, BAR + .1, vel=.45 + .1 * lvl)
        for b in range(4):
            E.append((t + b * BEAT, 'contrabass_pizz', CH[ch][0], .4, .5 + .15 * lvl, .1, .45))
        if i >= 13:
            for b in range(8):
                E.append((t + b * .25, 'marimba', CH[ch][2][ARP[b] if b % 2 else 3], .3, .3 + .1 * lvl, (-.35, .35)[b % 2], .32))
        if i >= 16:
            pad(t, ch, BAR + .3, vel=.22 + .15 * lvl, inst='violins', gain=.38, oct_=1)
        if i >= 16:
            for b in range(4):
                E.append((t + b * BEAT + .25, 'violins_pizz', CH[ch][1][b % 3], .3, .38 + .1 * lvl, (-.4, .4)[b % 2], .35))
        if i >= 20:
            E.append(dict(t=t, inst='violins_trem', pitch=CH[ch][1][2][:-1] + '5', dur=BAR + .1, vel=.25 + .25 * lvl, pan=.3, attack=.3, gain=.35))
            E.append(dict(t=t, inst='cellos', pitch=CH[ch][0][:-1] + '3' if CH[ch][0][-1] in '12' else CH[ch][0], dur=BAR + .2, vel=.35 + .2 * lvl, pan=-.25, attack=.3, gain=.45))

# hook blinks (frames 26, 118) — the world goes dark
for t in (26 / 30, 118 / 30):
    blink(t)
# scene cuts
hit(6.0, .55)
hit(14.0, .6)
hit(22.0, .65)
hit(32.0, .7)
hit(40.0, .75)
# one blink in slow motion: the lid closes (7.33–8.73), stays shut, opens (9.6–11.0)
E.append(dict(t=7.3, inst='vibraphone_bowed', pitch='E5', dur=1.6, vel=.35, pan=-.2, attack=.6, gain=.45))
E.append(dict(t=8.7, inst='vibraphone_bowed', pitch='C5', dur=1.2, vel=.3, pan=.2, attack=.3, gain=.4))
E.append(dict(t=9.6, inst='vibraphone_bowed', pitch='A4', dur=1.8, vel=.35, pan=0, attack=.4, gain=.45))
add(bus, X.whoosh(1.2, .35), 7.4, .25, -.2)
add(bus, X.whoosh(1.2, .35), 9.7, .25, .2)
E.append((11.0, 'glockenspiel', 'E6', 1.0, .4, 0, .4))
# minute ring: 15 ticks on the marks (eighths), then the gather and the 4.5 s arc
ticks = ['E6', 'A6', 'C7', 'A6', 'E6', 'C6', 'A6', 'F6', 'C7', 'A6', 'F6', 'C6', 'A6', 'F6', 'G6']
for k, p in enumerate(ticks):
    t = 14.5 + .25 * k
    E.append((t, 'glockenspiel', p, .4, .42, (-.4 + .8 * k / 14), .4))
    E.append((t, 'woodblock', 'c', None, .18, .2, .25))
add(bus, X.whoosh(1.1, .5), 18.7, .35)
hit(20.0, .45)
E.append((20.0, 'tubular_bells', 'E4', 2.0, .3, 0, .3))
# day: count runs 22.7–27, slivers swept together 27.6–28.7, 72 min lands at 29.0
add(bus, X.whoosh(1.1, .5), 27.6, .35)
E.append((29.0, 'tubular_bells', 'G4', 2.5, .32, 0, .32))
E.append((29.0, 'timpani', 'G2', 1.5, .45, 0, .5))
# year: 18 dark days, sixteenths from 34.5
for j in range(18):
    p = ['A5', 'C6', 'E6', 'A6'][j % 4] if j < 16 else ['B6', 'C7'][j - 16]
    E.append((34.5 + .125 * j, 'xylophone', p, .2, .3 + .02 * j, (-.3, .3)[j % 2], .32))
E.append((37.0, 'tubular_bells', 'A4', 2.5, .3, 0, .3))
# life: crescendo into the hit at 48 (count lands), dominant E held to the drop at 50
E.append((44.0, 'timpani', 'A2', 4.0, .3, 0, .4))
E.append((46.0, 'gran_cassa', 'roll', None, .45, 0, .45))
add(bus, X.whoosh(1.4, .7), 46.7, .45)
hit(48.0, 1.0, 'B2')
E.append((48.0, 'crash', None, None, .5, 0, .4))
pad(48.0, 'E', 2.0, vel=.45, inst='violins', gain=.45, oct_=1)
# twist (50–58): the drop — bowed vibraphone, glass, a harp sweep as the black frames are cut out (54.1–55.6)
E.append((50.0, 'gong', None, None, .3, 0, .35))
for i, ch in enumerate(['F', 'Dm', 'F', 'Dm']):
    t = 50 + i * BAR
    pad(t, ch, BAR + .4, vel=.2, inst='vibraphone_bowed', gain=.4)
    low(t, ch, BAR + .2, vel=.25, gain=.4)
    E.append((t + 1.0, 'glass', CH[ch][1][2][:-1] + '5', 1.5, .25, (-.3, .3)[i % 2], .3))
for k, p in enumerate(['F3', 'A3', 'C4', 'F4', 'A4', 'C5', 'F5', 'A5', 'C6', 'F6']):
    E.append((54.15 + k * .14, 'harp', p, 1.5, .35 + .02 * k, (-.5 + k * .1), .4))
add(bus, X.whoosh(1.1, .5), 57.0, .4)
# end: bar 29 = E (eye returns, count runs 58.3–60), cadence Am on 60.0 and let it ring
blink(58 + 24 / 30, .8)
pad(58.0, 'E', 2.1, vel=.32, gain=.45)
low(58.0, 'E', 2.1, vel=.42)
for k, p in enumerate(['G#3', 'B3', 'E4', 'G#4', 'B4', 'E4', 'G#4', 'B4']):
    E.append((58.0 + k * .25, 'kalimba', p, .5, .4 + .03 * k, (-.25, .25)[k % 2], .52))
E.append((58.3, 'sus_cymbal', 'cresc', None, .4, 0, .4))
hit(60.0, 1.0)
E.append((60.0, 'tubular_bells', 'A4', 6.0, .45, 0, .45))
E.append((60.0, 'glockenspiel', 'A6', 2.0, .4, 0, .35))
for p in ['A2', 'E3', 'A3', 'C4', 'E4']:
    E.append((60.0, 'upright', p, 6.0, .5, 0, .45))
pad(60.0, 'Am', 7.0, vel=.38, gain=.5)
pad(60.0, 'Am', 6.0, vel=.3, inst='violins', gain=.4, oct_=1)
low(60.0, 'Am', 6.5, vel=.5)
E.append(dict(t=60.0, inst='cellos', pitch='A2', dur=6.5, vel=.35, pan=-.2, attack=.1, gain=.45))
kal(64.0, 'Am', n=4, step=.5, vel=.26)        # under the closing line, softly
# button (67): "you missed 4.5 more seconds" → the eye blinks once more; timpani + pizz A + kalimba + glockenspiel
blink(67.0, 1.0)
hit(67.0, .75)
E.append(dict(t=67.0, inst='contrabass_pizz', pitch='A1', dur=.6, vel=.65, pan=.1, gain=.75))
for k, p in enumerate(['A3', 'A4']):
    E.append((67.0, 'kalimba', p, .8, .55, (-.2, .2)[k], .55))
for k, p in enumerate(['A5', 'A6']):
    E.append((67.0, 'glockenspiel', p, 1.5, .42, (-.2, .2)[k], .33))
E.append(dict(t=67.0, inst='cellos', pitch='A2', dur=1.7, vel=.3, pan=0, attack=.02, gain=.35))

mix = S.render(E, dur=DUR, master=False)
mix = S.room(mix, size=.6, mix=.22)
n = min(len(mix), len(bus))
mix = mix[:n] + bus[:n]
f = int(0.3 * SR)
mix[-f:] *= np.linspace(1, 0, f)[:, None]  # 0.3 s declick only: the button is the ending, not a fade
mix = mix / max(1e-9, np.abs(mix).max()) * .9  # tools/score.sh sets loudness and true peak
out = sys.argv[1] if len(sys.argv) > 1 else 'score.wav'
sf.write(out, mix.astype(np.float32), SR)
names = sorted({e['inst'] if isinstance(e, dict) else e[1] for e in E})
print('wrote', out, f'{n / SR:.2f}s', names)
