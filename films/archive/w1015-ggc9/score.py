"""Score for 如果用樂高蓋 101. 120 BPM 4/4 → beat 0.5 s, bar 2 s.
Cuts (= timeline.ts): 0 6 14 24 32 40 46 56 66.
A minor (the question) → C major cadence on the payoff (58 s) → last bar E7 pickup into bar 1's Am on replay."""
import sys, os
import numpy as np, soundfile as sf

LIB = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'lib'))
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio import sfx as X
from core.audio.sfx import SR, add

S.seed(101)
DUR, BEAT, BAR = 66.0, 0.5, 2.0
E = []                                          # note events
bus = np.zeros((int(DUR * SR), 2), np.float32)  # sfx bus

CH = {  # bass root (contrabass F#1–B3), pad voicing (violas), arpeggio tones (pizz / marimba)
    'Am': ('A1', ['A3', 'C4', 'E4'], ['A4', 'C5', 'E5']),
    'F': ('F2', ['A3', 'C4', 'F4'], ['F4', 'A4', 'C5']),
    'G': ('G1', ['B3', 'D4', 'G4'], ['G4', 'B4', 'D5']),
    'G7': ('G1', ['B3', 'F4', 'G4'], ['G4', 'B4', 'F5']),
    'C': ('C2', ['G3', 'C4', 'E4'], ['C5', 'E5', 'G5']),
    'Dm': ('D2', ['A3', 'D4', 'F4'], ['D5', 'F5', 'A5']),
    'E': ('E2', ['G#3', 'B3', 'E4'], ['E4', 'G#4', 'B4']),
    'E7': ('E2', ['G#3', 'D4', 'E4'], ['E4', 'G#4', 'D5']),
}


def pad(t, ch, d, vel=.3, inst='violas', gain=.45):
    for i, p in enumerate(CH[ch][1]):
        E.append(dict(t=t, inst=inst, pitch=p, dur=d, vel=vel, pan=(-.4, 0, .4)[i], attack=.4, gain=gain))


def low(t, ch, d, vel=.45, inst='contrabass', gain=.55):
    E.append(dict(t=t, inst=inst, pitch=CH[ch][0], dur=d, vel=vel, pan=.1, attack=.15, gain=gain))


def pizz(t, ch, n=8, vel=.42, gain=.42, inst='violins_pizz', step=BEAT / 2):
    a = CH[ch][2]
    order = [0, 1, 2, 1]
    for k in range(n):
        E.append((t + k * step, inst, a[order[k % 4]], .3, vel * (1.1 if k % 4 == 0 else .9), (-.25, .25)[k % 2], gain))


def mar(t, ch, vel=.35, gain=.32):
    a = CH[ch][2]
    for b in range(4):
        E.append((t + b * BEAT, 'marimba', a[b % 3], .45, vel, (-.3, .3)[b % 2], gain))


def hit(t, v=1.0, pitch='A2'):  # on scene cuts
    E.append((t, 'timpani', pitch, 2.0, .85 * v, 0, .85))
    E.append((t, 'gran_cassa', None, None, .7 * v, 0, .7))


def click(t, v=.5, p=1.0, pan=0):  # a LEGO brick snapping on
    add(bus, X.click(p, v), t, .55, pan)


# ---- HOOK 0–6: Am F G, plucky question ---------------------------------------------------------
for i, ch in enumerate(['Am', 'F', 'G']):
    t = i * BAR
    pizz(t, ch, 16, vel=.38)
    low(t, ch, BAR, vel=.35, inst='contrabass_pizz', gain=.6)
    pad(t, ch, BAR + .2, vel=.18, gain=.3)
E.append((1.0, 'glockenspiel', 'E6', 1.0, .25, .2, .25))   # the question line lands
E.append((1.5, 'glockenspiel', 'C6', 1.0, .22, -.2, .22))

# ---- TALL 6–14: C G Am F; glock climbs with the column (8.3–11.8 s) ------------------------------
hit(6.0, .45, 'C3')
for i, ch in enumerate(['C', 'G', 'Am', 'F']):
    t = 6 + i * BAR
    mar(t, ch)
    pizz(t, ch, 16, vel=.32, gain=.35)
    low(t, ch, BAR + .1, vel=.4)
    pad(t, ch, BAR + .2, vel=.22)
scale = ['C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6', 'D6', 'E6', 'F6', 'G6', 'A6', 'C7']
for k, p in enumerate(scale):
    E.append((8.5 + k * .25, 'glockenspiel', p, .6, .18 + .02 * k, (-.3, .3)[k % 2], .3))

# ---- PRESS 14–24: Dm Dm E E (squeeze) → the brick melts on 20.0 → Am F --------------------------
hit(14.0, .5, 'D3')
for i, ch in enumerate(['Dm', 'Dm', 'E']):
    t = 14 + i * BAR
    low(t, ch, BAR + .1, vel=.4 + .1 * i, inst='cellos', gain=.5)
    low(t, ch, BAR + .1, vel=.4 + .1 * i)
    for b in range(4):
        E.append((t + b * BEAT, 'contrabass_pizz', CH[ch][0], .3, .5, 0, .55))
# rising tremolo as the force climbs (16–20)
for k, p in enumerate(['A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G#5', 'A5']):
    E.append(dict(t=16 + k * .5, inst='violins_trem', pitch=p, dur=.55, vel=.2 + .04 * k, pan=-.2, attack=.1, gain=.38))
E.append((17.0, 'timpani', 'E3', 3.0, .25, 0, .4))
E.append((18.0, 'gran_cassa', 'roll', None, .35, 0, .5))
add(bus, X.creak(.4), 18.9, .35, .1)
add(bus, X.creak(.5), 19.45, .4, -.1)
# no bang: a soft, low squish and a sagging pizz line
add(bus, X.thump(.7, 55), 20.0, .6)
for k, p in enumerate(['E5', 'D5', 'C5', 'B4', 'A4']):
    E.append((20.0 + k * .125, 'violins_pizz', p, .3, .38 - .04 * k, .2, .4))
E.append((20.0, 'cellos', 'A2', 2.0, .35, 0, .45))
for i, ch in enumerate(['Am', 'F']):
    t = 20 + i * BAR
    pad(t, ch, BAR + .2, vel=.22)
    low(t, ch, BAR, vel=.3, inst='contrabass_pizz', gain=.5)
E.append((20.5, 'glockenspiel', 'A5', 1.2, .22, 0, .3))       # ≈ 432 kg
for k in range(4):
    E.append((22 + k * BEAT, 'marimba', ['C5', 'A4', 'F4', 'A4'][k], .4, .26, (-.2, .2)[k % 2], .3))

# ---- STACK 24–32: bricks click on (24.5–26.0), then the zoom climbs to 375,000 -------------------
hit(24.0, .4, 'F2')
for k, t in enumerate([24.5, 24.75, 25.0, 25.25, 25.5, 25.75, 26.0]):
    click(t, .55, 1.0 + .03 * k, (-.15, .15)[k % 2])
rng = np.random.default_rng(7)
ts = 26.0 + 3.6 * (np.linspace(0, 1, 46) ** .6)                # clicks blur together as the stack races up
for k, t in enumerate(ts[1:]):
    click(float(t), .32 * (1 - k / 60), .9 + rng.random() * .4, float(rng.uniform(-.5, .5)))
for i, ch in enumerate(['F', 'G', 'Am', 'E']):
    t = 24 + i * BAR
    pizz(t, ch, 16, vel=.3 + .05 * i, gain=.38)
    low(t, ch, BAR + .1, vel=.35 + .05 * i)
    pad(t, ch, BAR + .2, vel=.2 + .05 * i, inst='violins' if i >= 2 else 'violas')
for k, p in enumerate(['C4', 'E4', 'G4', 'C5', 'E5', 'G5', 'C6']):
    E.append(dict(t=26.0 + k * .5, inst='violins', pitch=p, dur=.6, vel=.25 + .04 * k, pan=.2, attack=.08, gain=.35))
E.append((29.5, 'glockenspiel', 'E6', 1.5, .35, 0, .35))     # 375,000 lands
hit(30.0, .55, 'E3')
add(bus, X.whoosh(1.2, .5), 30.9, .4)

# ---- SEVEN 32–40: C F C G; seven Taipei 101s land on beats 33.0 … 36.0 ---------------------------
hit(32.0, .9, 'C3')
E.append((32.0, 'sus_cymbal', 'hit', None, .35, 0, .4))
for i, ch in enumerate(['C', 'F', 'C', 'G']):
    t = 32 + i * BAR
    mar(t, ch, vel=.4, gain=.34)
    pizz(t, ch, 16, vel=.36, gain=.36)
    low(t, ch, BAR + .1, vel=.5)
    pad(t, ch, BAR + .2, vel=.24, inst='violins', gain=.34)
for k, p in enumerate(['C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5']):
    t = 33.0 + k * .5
    E.append((t, 'glockenspiel', p, .8, .3 + .03 * k, (-.3, .3)[k % 2], .36))
    add(bus, X.thump(.3 + .03 * k, 90 + 6 * k), t, .3)
E.append((36.5, 'glockenspiel', 'C6', 1.6, .5, 0, .42))       # ≈ 7 Taipei 101s
E.append((36.5, 'tubular_bells', 'C5', 3.0, .35, 0, .35))
t = 33.0
for p, d in [('E4', 1.0), ('G4', .5), ('C5', 1.5), ('B4', .5), ('G4', 1.0), ('A4', .5), ('B4', 1.0)]:  # horn line, 33–39
    E.append(dict(t=t, inst='horn', pitch=p, dur=d + .1, vel=.36, pan=-.1, attack=.08, gain=.26))
    t += d

# ---- YUSHAN 40–46: Am F G, airy; the mountain rises, the ghost 101 drops at 41.9 -----------------
add(bus, X.whoosh(1.0, .4), 39.6, .2)
hit(40.0, .45, 'A2')
for i, ch in enumerate(['Am', 'F', 'G']):
    t = 40 + i * BAR
    pad(t, ch, BAR + .3, vel=.34, inst='violins', gain=.48)
    pad(t, ch, BAR + .3, vel=.3, gain=.42)
    low(t, ch, BAR + .1, vel=.42)
    E.append((t, 'harp', CH[ch][2][0], 1.5, .3, -.2, .35))
    E.append((t + .25, 'harp', CH[ch][2][1], 1.5, .28, 0, .32))
    E.append((t + .5, 'harp', CH[ch][2][2], 1.5, .26, .2, .3))
for p, t, d in [('E5', 40.5, 1.0), ('A5', 41.5, 1.5), ('G5', 43.0, .5), ('F5', 43.5, 1.0), ('D5', 44.5, 1.5)]:
    E.append(dict(t=t, inst='flute', pitch=p, dur=d, vel=.4, pan=.15, attack=.1, gain=.5))
E.append((41.9, 'glockenspiel', 'B5', 1.0, .3, .3, .3))

# ---- TWIST 46–56: Dm Dm E E | (55) silence → the tower buckles, crashes at ~53.9 ---------------
hit(46.0, .6, 'D3')
for i, ch in enumerate(['Dm', 'Dm', 'E', 'E']):
    t = 46 + i * BAR
    low(t, ch, BAR + .1, vel=.45 + .05 * i, inst='cellos', gain=.62)
    low(t, ch, BAR + .1, vel=.45 + .05 * i, gain=.62)
    pad(t, ch, BAR + .2, vel=.28 + .04 * i, inst='violins_trem', gain=.5)
    for b in range(4):
        if t + b * BEAT < 53.5:
            E.append((t + b * BEAT, 'contrabass_pizz', CH[ch][0], .3, .5, 0, .55))
            E.append((t + b * BEAT, 'woodblock', 'a' if b % 2 == 0 else 'b', None, .2, .3, .16))
E.append((48.0, 'glockenspiel', 'A5', 1.2, .3, -.2, .3))      # magnifier: 2 mm
add(bus, X.creak(.45), 51.7, .4)
add(bus, X.creak(.55), 52.5, .45, .2)
E.append((52.0, 'gran_cassa', 'cresc', None, .45, 0, .55))
add(bus, X.crash(.9), 53.85, .75, -.2)                          # plastic bricks hit the ground
E.append((53.9, 'timpani', 'E3', 2.0, .6, 0, .7))
E.append((53.9, 'gran_cassa', None, None, .6, 0, .6))
add(bus, X.whoosh(1.0, .45), 55.0, .35)

# ---- END 56–66: G7 as the 101 rebuilds (clicks) → C major cadence on the payoff (58) → ring →
# last bar E7 pickup that resolves into bar 1's Am when the Short replays --------------------------
pad(56, 'G7', 2.1, vel=.3, inst='violins', gain=.4)
low(56, 'G7', 2.1, vel=.45)
for k in range(12):
    click(56.0 + k * (1.6 / 12), .45, 1.0 + .02 * k, (-.3, .3)[k % 2])
for k, p in enumerate(['G4', 'B4', 'D5', 'F5']):
    E.append((56.0 + k * BEAT, 'marimba', p, .45, .35, (-.2, .2)[k % 2], .34))
# the cadence: tonic + hit, let it ring through the hold
hit(58.0, 1.0, 'C3')
E.append((58.0, 'sus_cymbal', 'hit', None, .4, 0, .45))
E.append((58.0, 'tubular_bells', 'C5', 5.0, .45, 0, .42))
E.append((58.0, 'glockenspiel', 'C6', 3.0, .4, .2, .38))
pad(58, 'C', 6.0, vel=.36, inst='violins', gain=.45)
pad(58, 'C', 6.0, vel=.3, inst='violas', gain=.4)
low(58, 'C', 6.0, vel=.5)
E.append((58.0, 'horn', 'C4', 3.0, .4, -.1, .35))
E.append((58.0, 'horn', 'G4', 3.0, .36, .1, .32))
E.append((58.0, 'harp', 'C3', 3.0, .4, 0, .4))
for k, p in enumerate(['C5', 'E5', 'G5', 'C6']):
    E.append((58.0 + k * .125, 'harp', p, 2.0, .3, (-.2, .2)[k % 2], .3))
# pickup bar (64–66): E7, plucky like bar 1, leading into Am
low(64, 'E7', 2.0, vel=.42, inst='contrabass_pizz', gain=.65)
pad(64, 'E7', 2.0, vel=.2, gain=.32)
for k, p in enumerate(['E4', 'G#4', 'B4', 'D5', 'E5', 'D5', 'B4', 'G#4']):
    E.append((64.0 + k * .25, 'violins_pizz', p, .3, .42, (-.25, .25)[k % 2], .46))
for k, p in enumerate(['E5', 'D5', 'B4', 'G#4']):
    E.append((64.0 + k * BEAT, 'marimba', p, .45, .32, (-.2, .2)[k % 2], .3))

mix = S.render(E, dur=DUR, master=False)
mix = S.room(mix, size=.55, mix=.2)
n = min(len(mix), len(bus))
mix = mix[:n] + bus[:n]
f = int(0.3 * SR)
mix[-f:] *= np.linspace(1, 0, f)[:, None]  # 0.3 s declick only: the cadence is the ending, not a fade
mix = mix / max(1e-9, np.abs(mix).max())
th = .55  # soft knee on the few hard transients so loudnorm can stay linear
a = np.abs(mix)
mix = np.where(a < th, mix, np.sign(mix) * (th + (1 - th) * np.tanh((a - th) / (1 - th))))
mix = mix / max(1e-9, np.abs(mix).max()) * .9  # tools/score.sh sets loudness and true peak
out = sys.argv[1] if len(sys.argv) > 1 else 'score.wav'
sf.write(out, mix.astype(np.float32), SR)
print('wrote', out, f'{n / SR:.2f}s', sorted({e['inst'] if isinstance(e, dict) else e[1] for e in E}))
