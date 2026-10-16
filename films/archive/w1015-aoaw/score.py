"""Score for 如果讓掃地機器人掃完整個台灣. 120 BPM 4/4 → beat 0.5 s, bar 2 s. C major.
Cuts (= timeline.ts): 0 6 14 22 30 38 46 54 64. Payoff cadence (C) lands at 56; bar 31 (62–64) is a G7 pickup into bar 0's C."""
import sys, os
import numpy as np, soundfile as sf

LIB = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'lib'))
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio import sfx as X
from core.audio.sfx import SR, add

S.seed(23)
DUR, BEAT, BAR = 64.0, 0.5, 2.0
E = []                                          # note events
bus = np.zeros((int(DUR * SR), 2), np.float32)  # sfx bus

CH = {  # bass root (contrabass F#1–B3), pad triad, arpeggio tones
    'C': ('C2', ['C4', 'E4', 'G4'], ['C4', 'G4', 'E5', 'G4']),
    'Am': ('A1', ['C4', 'E4', 'A4'], ['A3', 'E4', 'C5', 'E4']),
    'F': ('F2', ['C4', 'F4', 'A4'], ['F3', 'C4', 'A4', 'C4']),
    'G': ('G1', ['D4', 'G4', 'B4'], ['G3', 'D4', 'B4', 'D4']),
    'Em': ('E2', ['E4', 'G4', 'B4'], ['E3', 'B3', 'G4', 'B3']),
    'Dm': ('D2', ['D4', 'F4', 'A4'], ['D3', 'A3', 'F4', 'A3']),
    'E': ('E2', ['E4', 'G#4', 'B4'], ['E3', 'B3', 'G#4', 'B3']),
}
FIFTH = {'C': 'G2', 'Am': 'E2', 'F': 'C2', 'G': 'D2', 'Em': 'B1', 'Dm': 'A1', 'E': 'B1'}

# one chord per bar (32 bars)
PROG = (['C', 'Am', 'G'] +                 # hook 0–6
        ['C', 'F', 'Am', 'G'] +            # speed 6–14
        ['C', 'F', 'Am', 'G'] +            # hour 14–22
        ['F', 'G', 'Em', 'Am'] +           # taiwan 22–30
        ['F', 'G', 'C', 'G'] +             # earth 30–38
        ['Dm', 'G', 'Dm', 'G'] +           # yushan 38–46
        ['Am', 'Am', 'F', 'E'] +           # pyramid 46–54
        ['G', 'C', 'C', 'C', 'G'])         # end 54–64 (G → C cadence at 56, G pickup at 62)
assert len(PROG) == 32


def ev(t, inst, pitch, dur, vel, pan=0.0, gain=0.5, **kw):
    E.append(dict(t=t, inst=inst, pitch=pitch, dur=dur, vel=vel, pan=pan, gain=gain, **kw))


def perc(t, inst, variant, vel, pan=0.0, gain=0.5):
    E.append((t, inst, variant, None, vel, pan, gain))


def pad(t, ch, d, vel=.3, inst='violas', gain=.45):
    for i, p in enumerate(CH[ch][1]):
        ev(t, inst, p, d, vel, (-.4, 0, .4)[i], gain, attack=.5)


def arp(t, ch, vel=.35, inst='marimba', gain=.38, n=8):
    tones = CH[ch][2]
    step = BAR / n
    for k in range(n):
        ev(t + k * step, inst, tones[k % 4], step * 1.6, vel * (1.0 if k % 2 == 0 else .8), (-.3, .3)[k % 2], gain)


def pizz(t, ch, vel=.5):
    ev(t, 'contrabass_pizz', CH[ch][0], .6, vel, .1, .6)
    ev(t + 2 * BEAT, 'contrabass_pizz', FIFTH[ch], .6, vel * .85, .1, .6)


def hit(t, v=1.0, pitch='C3'):
    E.append((t, 'timpani', pitch, 2.0, .9 * v, 0, .9))
    E.append((t, 'gran_cassa', None, None, .8 * v, 0, .8))


def mel(t0, notes, inst, vel=.5, gain=.45, pan=0.0):
    """notes: (beat offset, pitch, beats)"""
    for b, p, d in notes:
        ev(t0 + b * BEAT, inst, p, d * BEAT, vel, pan, gain)


bar = lambda i: i * BAR

# ---------------- hook 0–6: sparse, a question ----------------
for i in range(0, 3):
    pad(bar(i), PROG[i], BAR + .3, vel=.22)
    ev(bar(i), 'contrabass', CH[PROG[i]][0], BAR + .2, .3, .1, .5, attack=.3)
    arp(bar(i), PROG[i], vel=.25, gain=.3)
ev(0.02, 'glockenspiel', 'C6', .6, .35, .2, .3)
ev(0.27, 'glockenspiel', 'E6', .6, .32, .2, .3)
ev(0.52, 'glockenspiel', 'G6', .9, .35, .2, .3)
ev(1.75, 'glockenspiel', 'G6', .4, .3, -.2, .3)
ev(2.0, 'glockenspiel', 'A6', 1.2, .34, -.2, .3)      # "要掃多久？" rises
for k, p in enumerate(['G4', 'A4', 'B4', 'D5']):     # bar 2 lift into the groove
    ev(4.0 + k * BEAT, 'vibraphone', p, .6, .3, .2, .35)
add(bus, X.whoosh(1.4, .5), 4.7, .45)                  # zoom into the robot
hit(6.0, .55)

# ---------------- groove: speed 6–14, hour 14–22 ----------------
for i in range(3, 11):
    t = bar(i)
    ch = PROG[i]
    pizz(t, ch, .5)
    arp(t, ch, vel=.32)
    pad(t, ch, BAR + .2, vel=.18, gain=.35)
    for b in range(4):
        perc(t + b * BEAT, 'woodblock', 'a' if b % 2 == 0 else 'b', .32, .35, .35)   # the robot's tick
    for k in range(8):
        perc(t + k * BEAT / 2, 'shaker', None, .18 if k % 2 else .24, -.3, .25)
# clarinet tune over the hour (bars 7–10)
TUNE = [(0, 'E5', .5), (.5, 'G5', .5), (1, 'E5', .5), (1.5, 'C5', .5), (2, 'D5', .5), (2.5, 'E5', .5), (3, 'C5', 1)]
TUNE2 = [(0, 'A4', .5), (.5, 'C5', .5), (1, 'A4', .5), (1.5, 'F4', .5), (2, 'G4', .5), (2.5, 'A4', .5), (3, 'G4', 1)]
mel(bar(3), TUNE, 'clarinet_stac', .4, .38, -.15)
mel(bar(4), TUNE2, 'clarinet_stac', .38, .38, -.15)
mel(bar(5), [(0, 'C5', .5), (.5, 'E5', .5), (1, 'A5', 1), (2, 'G5', .5), (2.5, 'E5', .5), (3, 'C5', 1)], 'clarinet_stac', .4, .38, -.15)
mel(bar(6), [(0, 'B4', .5), (.5, 'D5', .5), (1, 'G5', 1), (2, 'F5', .5), (2.5, 'D5', .5), (3, 'B4', 1)], 'clarinet_stac', .4, .38, -.15)
hit(14.0, .5)
for k in range(48):                                    # time-lapse: 16ths speed up the hour
    tt = 14.3 + k * .0625
    perc(tt, 'hihat', 'closed', .16 + .2 * k / 48, .25, .3)
add(bus, X.whoosh(1.2, .55), 16.5, .45)
E.append((17.75, 'glockenspiel', 'G6', 1.0, .45, 0, .35))    # "300 m²" lands
E.append((17.75, 'timpani', 'G2', 1.5, .5, 0, .6))
mel(bar(9), TUNE, 'clarinet_stac', .38, .36, -.15)
mel(bar(10), [(0, 'B4', .5), (.5, 'D5', .5), (1, 'G5', 1), (2, 'D5', 1), (3, 'B4', 1)], 'clarinet_stac', .38, .36, -.15)
add(bus, X.whoosh(1.0, .6), 21.0, .5)                  # into the big zoom-out

# ---------------- taiwan 22–30: the camera pulls back, strings open up ----------------
hit(22.0, .7, 'F2')
ev(22.0, 'harp', 'C4', 1.5, .4, -.3, .4)
for k, p in enumerate(['F3', 'A3', 'C4', 'F4', 'A4', 'C5', 'F5', 'A5', 'C6']):
    ev(22.0 + k * .07, 'harp', p, 1.6, .38, -.3 + k * .07, .4)
for i in range(11, 15):
    t = bar(i)
    ch = PROG[i]
    k = i - 11
    for j, p in enumerate(CH[ch][1]):
        ev(t, 'violins', p.replace('4', '5'), BAR + .3, .22 + .06 * k, (-.5, 0, .5)[j], .4, attack=.6)
    pad(t, ch, BAR + .3, vel=.25 + .05 * k, gain=.4)
    ev(t, 'cellos', CH[ch][0].replace('1', '2'), BAR + .2, .35, -.1, .45, attack=.4)
    arp(t, ch, vel=.26, gain=.3)
    pizz(t, ch, .42)
ev(24.5, 'vibraphone', 'C6', 1.5, .35, .2, .35)        # 36,197 lands
add(bus, X.whoosh(1.0, .5), 29.0, .45)

# ---------------- earth 30–38: around and around ----------------
hit(30.0, .55, 'F2')
for i in range(15, 19):
    t = bar(i)
    ch = PROG[i]
    pizz(t, ch, .55)
    arp(t, ch, vel=.34, gain=.4, n=16)
    pad(t, ch, BAR + .2, vel=.18, inst='horn', gain=.15)
    perc(t, 'bass_drum', None, .35, 0, .42)
    perc(t + 2 * BEAT, 'bass_drum', None, .28, 0, .4)
    for b in (1, 3):
        perc(t + b * BEAT, 'snare', 'off', .22, .1, .3)
    for kk in range(8):
        perc(t + kk * BEAT / 2, 'shaker', None, .2, -.3, .25)
mel(bar(15), [(0, 'A4', 1), (1, 'C5', 1), (2, 'F5', 2)], 'horn', .32, .2, .1)
mel(bar(16), [(0, 'G4', 1), (1, 'B4', 1), (2, 'D5', 2)], 'horn', .32, .2, .1)
mel(bar(17), [(0, 'C5', 1), (1, 'E5', 1), (2, 'G5', 2)], 'violins', .34, .34, .1)
mel(bar(18), [(0, 'F5', 1), (1, 'D5', 1), (2, 'B4', 2)], 'violins', .32, .34, .1)
add(bus, X.whoosh(.9, .45), 37.2, .4)

# ---------------- yushan 38–46: bonk, then the mountain ----------------
hit(38.0, .5, 'D3')
mel(38.0, [(0, 'D3', .5), (.5, 'F3', .5), (1, 'A3', .5)], 'bassoon_stac', .5, .5, -.1)
add(bus, X.thump(.8, 70), 38.93, .7)                   # the robot bumps the foot of the mountain
perc(38.93, 'woodblock', 'c', .5, .2, .45)
ev(39.0, 'tuba_stac', 'D2', .5, .5, 0, .55)
ev(39.6, 'bassoon_stac', 'C#3', .4, .4, -.1, .45)
ev(39.85, 'bassoon_stac', 'D3', .4, .38, -.1, .45)
perc(40.0, 'gran_cassa', 'roll', .35, 0, .5)
for i, t in enumerate(np.arange(40.0, 42.5, .125)):    # the zoom-out climbs
    ev(float(t), 'violins_pizz', ['D4', 'F4', 'A4', 'D5', 'F5', 'A5', 'D6'][min(6, i // 3)], .2, .34 + .02 * i, .2, .45)
ev(40.0, 'violins_trem', 'A4', 2.5, .38, -.2, .45, attack=1.5)
ev(40.0, 'violins_trem', 'D5', 2.5, .38, .2, .45, attack=1.5)
hit(42.5, .9, 'G2')
perc(42.5, 'clash', 'crash', .45, 0, .4)
for j, p in enumerate(['G3', 'B3', 'D4', 'G4']):
    ev(42.5, 'horn', p, 3.3, .42, (-.3, -.1, .1, .3)[j], .28, attack=.1)
ev(42.5, 'tuba', 'G1', 3.3, .45, 0, .45)
for t, p in [(43.0, 'G2'), (43.5, 'D2'), (44.0, 'G2'), (44.5, 'D2'), (45.0, 'G2'), (45.5, 'B1')]:
    ev(t, 'tuba_stac', p, .4, .4, 0, .45)
for t, p in [(43.25, 'B3'), (43.75, 'B3'), (44.25, 'D4'), (44.75, 'D4'), (45.25, 'B3'), (45.75, 'D4')]:
    ev(t, 'bassoon_stac', p, .3, .32, -.2, .4)

# ---------------- pyramid 46–54: 4,500 years tick by ----------------
hit(46.0, .55, 'A2')
for i in range(23, 27):
    t = bar(i)
    ch = PROG[i]
    arp(t, ch, vel=.3, inst='harp', gain=.4)
    ev(t, 'contrabass', CH[ch][0], BAR + .1, .38, .1, .5, attack=.2)
    pad(t, ch, BAR + .2, vel=.2, gain=.35)
    for b in range(4):
        perc(t + b * BEAT, 'frame_drum', None, .3 if b % 2 == 0 else .2, -.2, .4)
    for kk in range(8):
        perc(t + kk * BEAT / 2, 'shaker', None, .16, .3, .22)
mel(bar(23), [(0, 'E5', 1.5), (1.5, 'F5', .5), (2, 'E5', 1), (3, 'D5', .5), (3.5, 'C5', .5)], 'oboe', .42, .42, .15)
mel(bar(24), [(0, 'B4', 1), (1, 'C5', .5), (1.5, 'B4', .5), (2, 'A4', 2)], 'oboe', .4, .42, .15)
mel(bar(25), [(0, 'A4', .5), (.5, 'C5', .5), (1, 'F5', 1)], 'oboe', .42, .42, .15)
hit(51.0, .6, 'A2')                                   # "1/3" lands
E.append((51.0, 'tubular_bells', 'A4', 3.0, .38, 0, .35))
mel(bar(26), [(0, 'G#4', 1), (1, 'B4', 1), (2, 'D5', 1), (3, 'E5', 1)], 'oboe', .4, .42, .15)

# ---------------- end 54–64 ----------------
# bar 27: the sweep fast-forwards over G7, rising run + snare roll into the cadence
for k, p in enumerate(['G3', 'B3', 'D4', 'F4', 'G4', 'B4', 'D5', 'F5', 'G5', 'B5', 'D6', 'F6', 'G6', 'B6', 'C7', 'C7']):
    if k < 15:
        ev(54.0 + k * .125, 'marimba', p, .3, .3 + .02 * k, (-.3, .3)[k % 2], .38)
pad(54.0, 'G', 2.1, vel=.3, gain=.4)
ev(54.0, 'contrabass', 'G1', 2.0, .45, .1, .55, attack=.2)
perc(54.0, 'snare', 'roll', .35, 0, .4)
add(bus, X.whoosh(1.2, .55), 54.8, .45)
# 56: the payoff — C major tutti + hit, left to ring through the hold
hit(56.0, 1.3, 'C3')
for j, p in enumerate(['C3', 'E3', 'G3']):
    ev(56.0, 'trombone', p, 4.5, .45, (-.2, 0, .2)[j], .4, attack=.05, release=1.5)
perc(56.0, 'crash', None, .55, 0, .45)
E.append((56.0, 'tubular_bells', 'C5', 6.0, .5, 0, .45))
for j, p in enumerate(['C5', 'E5', 'G5']):
    ev(56.0, 'violins', p, 5.6, .5, (-.4, 0, .4)[j], .45, attack=.05, release=1.5)
for j, p in enumerate(['C4', 'E4', 'G4']):
    ev(56.0, 'horn', p, 5.0, .42, (-.3, 0, .3)[j], .42, attack=.05, release=1.5)
ev(56.0, 'cellos', 'C3', 5.6, .45, -.1, .5, attack=.05, release=1.5)
ev(56.0, 'contrabass', 'C2', 5.6, .5, .1, .55, attack=.05, release=1.5)
for j, p in enumerate(['C6', 'E6', 'G6']):
    ev(56.0 + j * .06, 'glockenspiel', p, 2.0, .38, (-.2, 0, .2)[j], .32)
for t, p in [(58.0, 'G5'), (59.0, 'E5'), (60.0, 'C5'), (61.0, 'E5')]:   # quiet sparkle in the hold
    ev(t, 'marimba', p, .8, .22, (-.2, .2)[int(t) % 2], .3)
# bar 31: the robot zips home — G7 pickup that resolves into bar 0's C when the Short replays
for k, p in enumerate(['G4', 'B4', 'D5', 'F5']):
    ev(62.0 + k * BEAT, 'marimba', p, .45, .42, (-.2, .2)[k % 2], .38)
ev(62.0, 'contrabass_pizz', 'G1', .6, .45, .1, .55)
ev(63.0, 'contrabass_pizz', 'D2', .6, .4, .1, .55)
for b in range(4):
    perc(62.0 + b * BEAT, 'woodblock', 'a' if b % 2 == 0 else 'b', .3, .35, .35)
add(bus, X.whoosh(1.0, .4), 62.7, .35)

mix = S.render(E, dur=DUR, master=False)
mix = S.room(mix, size=.55, mix=.2)
n = min(len(mix), len(bus))
mix = mix[:n] + bus[:n]
f = int(0.05 * SR)
mix[-f:] *= np.linspace(1, 0, f)[:, None]  # 50 ms declick only: the cadence is the ending, not a fade
mix = mix / max(1e-9, np.abs(mix).max()) * .9  # tools/score.sh sets loudness and true peak
out = sys.argv[1] if len(sys.argv) > 1 else 'score.wav'
sf.write(out, mix.astype(np.float32), SR)
print('wrote', out, f'{n / SR:.2f}s', sorted({e['inst'] if isinstance(e, dict) else e[1] for e in E}))
