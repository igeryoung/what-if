"""Score for 如果把你一生講過的話印成書. 120 BPM 4/4 → beat 0.5 s, bar 2 s.
Cuts (= timeline.ts): 0 6 16 24 32 42 50 62. Payoff cadence at 52 (C major), last bar is a G pickup into bar 1."""
import sys, os
import numpy as np, soundfile as sf

LIB = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'lib'))
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio import sfx as X
from core.audio.sfx import SR, add

S.seed(15)
DUR, BEAT, BAR = 62.0, 0.5, 2.0
E = []                                          # note events
bus = np.zeros((int(DUR * SR), 2), np.float32)  # sfx bus
rnd = np.random.default_rng(4)

CH = {  # bass root (contrabass F#1–B3), pad triad, arpeggio tones
    'C': ('C2', ['C4', 'E4', 'G4'], ['C4', 'G4', 'E5', 'G4']),
    'Am': ('A1', ['C4', 'E4', 'A4'], ['A3', 'E4', 'C5', 'E4']),
    'F': ('F2', ['C4', 'F4', 'A4'], ['F3', 'C4', 'A4', 'C4']),
    'G': ('G1', ['D4', 'G4', 'B4'], ['G3', 'D4', 'B4', 'D4']),
    'Dm': ('D2', ['D4', 'F4', 'A4'], ['D4', 'A4', 'F5', 'A4']),
}
MEL = {  # one bar of tune per chord: (beat, pitch, beats)
    'C': [(0, 'E5', 1), (1, 'G5', .5), (1.5, 'E5', .5), (2, 'D5', 1), (3, 'C5', 1)],
    'Am': [(0, 'A4', 1), (1, 'C5', .5), (1.5, 'E5', .5), (2, 'D5', 2)],
    'F': [(0, 'C5', 1), (1, 'F5', .5), (1.5, 'E5', .5), (2, 'D5', 1), (3, 'C5', .5), (3.5, 'A4', .5)],
    'G': [(0, 'B4', 1), (1, 'D5', 1), (2, 'G5', 2)],
    'Dm': [(0, 'D5', 1), (1, 'F5', .5), (1.5, 'E5', .5), (2, 'D5', 1), (3, 'A4', 1)],
}
#        hook           talk                       novel                bard                 tower                      um                    end
BARS = ['C', 'Am', 'F', 'G', 'C', 'Am', 'F', 'G', 'C', 'Am', 'F', 'G', 'C', 'Am', 'F', 'G', 'Am', 'F', 'C', 'Dm', 'G', 'F', 'C', 'Dm', 'Dm', 'G', 'C', 'C', 'F', 'C', 'G']
assert len(BARS) * BAR == DUR


def ev(t, inst, pitch, d, vel, pan=0.0, gain=.5, attack=None):
    e = dict(t=t, inst=inst, pitch=pitch, dur=d, vel=vel, pan=pan, gain=gain)
    if attack is not None:
        e['attack'] = attack
    E.append(e)


def pad(t, ch, d, vel=.25, inst='violas', gain=.4):
    for i, p in enumerate(CH[ch][1]):
        ev(t, inst, p, d, vel, (-.4, 0, .4)[i], gain, attack=.5)


def low(t, ch, d, vel=.4, inst='contrabass', gain=.55):
    ev(t, inst, CH[ch][0], d, vel, .1, gain, attack=.15)


def tune(t, ch, inst='upright', vel=.42, gain=.55, oct_up=False):
    for b, p, d in MEL[ch]:
        if oct_up:
            p = p[:-1] + str(int(p[-1]) + 1)
        ev(t + b * BEAT, inst, p, d * BEAT + .15, vel * (1.0 if b == 0 else .85), .15, gain)


def arp(t, ch, inst='marimba', vel=.3, gain=.35):
    tones = CH[ch][2]
    for k in range(8):
        ev(t + k * BEAT / 2, inst, tones[k % 4], .3, vel * (1 if k % 2 == 0 else .75), (-.35, .35)[k % 2], gain)


def hit(t, v=1.0, tp='C3'):
    E.append((t, 'timpani', tp, 2.0, .85 * v, 0, .8))
    E.append((t, 'gran_cassa', None, None, .7 * v, 0, .7))


def typing(t0, t1, rate=7.0, v=.18):  # keyboard-ish clicks: speech turning into print
    t = t0
    while t < t1:
        add(bus, X.click(1.0 + rnd.random() * .5, v * (.6 + .4 * rnd.random())), t, .5, rnd.uniform(-.4, .4))
        t += (1 / rate) * (.6 + .8 * rnd.random())


for i, ch in enumerate(BARS[:25]):
    t = i * BAR
    sec = 'hook' if i < 3 else 'talk' if i < 8 else 'novel' if i < 12 else 'bard' if i < 16 else 'tower' if i < 21 else 'um'
    if sec == 'hook':
        pad(t, ch, BAR + .3, vel=.2)
        low(t, ch, BAR + .1, vel=.3)
        tune(t, ch, vel=.38)
    elif sec in ('talk', 'novel'):
        pad(t, ch, BAR + .3, vel=.22)
        low(t, ch, BAR * .45, vel=.45, inst='contrabass_pizz', gain=.6)
        low(t + 2 * BEAT, ch, BAR * .45, vel=.4, inst='contrabass_pizz', gain=.55)
        arp(t, ch)
        tune(t, ch, vel=.4)
    elif sec == 'bard':  # harpsichord for the Elizabethan
        pad(t, ch, BAR + .3, vel=.22)
        low(t, ch, BAR * .45, vel=.45, inst='contrabass_pizz', gain=.6)
        low(t + 2 * BEAT, ch, BAR * .45, vel=.4, inst='contrabass_pizz', gain=.55)
        arp(t, ch, inst='harpsichord', vel=.38, gain=.4)
        tune(t, ch, inst='violins_pizz', vel=.5, gain=.5)
    elif sec == 'tower':  # build: tremolo strings swell, no tune
        pad(t, ch, BAR + .3, vel=.14 + .06 * (i - 16), inst='violins_trem', gain=.28)
        pad(t, ch, BAR + .3, vel=.2 + .03 * (i - 16), inst='cellos', gain=.36)
        low(t, ch, BAR + .1, vel=.26 + .03 * (i - 16), gain=.45)
        for b in range(4):
            E.append((t + b * BEAT, 'timpani', 'G2' if ch == 'G' else 'A2', .5, .14 + .07 * (i - 16) + .05 * (b == 0), 0, .55))
    else:  # um: bassoon "uh… um…" and pizz
        low(t, ch, BAR * .45, vel=.45, inst='cellos_pizz', gain=.6)
        low(t + 2 * BEAT, ch, BAR * .45, vel=.4, inst='cellos_pizz', gain=.55)
        pad(t, ch, BAR + .3, vel=.24)
        for b, (p, d) in enumerate([('A3', .9), ('F3', .4)]):
            ev(t + BEAT * (1 + 2 * b), 'bassoon_stac', p, d, .6, -.2, .6)
        ev(t + 3.5 * BEAT, 'xylophone', 'A5' if ch != 'C' else 'G5', .2, .25, .3, .3)

# speech → print: typing under the bubble and the word chips, the page filling, the um-book
typing(.3, 5.6, rate=5, v=.14)
typing(6.2, 10.0, rate=8, v=.2)
typing(17.0, 20.0, rate=9, v=.2)
typing(43.2, 47.0, rate=8, v=.2)
# hits on cuts
for t, v, tp in ((6, .6, 'G2'), (16, .7, 'C3'), (24, .7, 'C3'), (32, .7, 'A2'), (42, .6, 'F2'), (50, .5, 'G2')):
    hit(t, v, tp)
# details
E.append((1.5, 'glockenspiel', 'G6', .8, .3, .2, .35))   # "how many books?"
E.append((2.0, 'glockenspiel', 'C7', 1.2, .3, -.2, .35))
for k in range(6):                                          # novel: one woodblock per day
    E.append((17.0 + k * BEAT, 'woodblock', 'a', None, .5 + .05 * k, (-.3, .3)[k % 2], .5))
E.append((20.0, 'glockenspiel', 'C7', 1.5, .4, 0, .4))   # "6 days"
for k in range(15):                                         # bard: calendar fills, rising run → "55"
    E.append((26.0 + k * (2.5 / 15), 'xylophone', ['C5', 'D5', 'E5', 'G5', 'A5'][k % 5][:-1] + str(5 + k // 5), .2, .22 + .015 * k, (-.3, .3)[k % 2], .3))
E.append((28.5, 'glockenspiel', 'G6', 1.2, .4, 0, .4))
E.append((36.0, 'gran_cassa', 'roll', None, .25, 0, .45))  # tower grows
add(bus, X.whoosh(1.4, .7), 38.6, .5)
hit(40.0, 1.0, 'G2')                                        # "88 m"
E.append((40.0, 'sus_cymbal', 'hit', None, .5, 0, .45))
for p in ('G3', 'D4', 'G4', 'B4'):
    ev(40.0, 'horn', p, 1.8, .5, 0, .35)
E.append((42.5, 'woodblock', 'b', None, .45, 0, .45))     # "47 books"

# ending (50–62): G build → payoff cadence on C at 52, ring through the hold; last bar is a G pickup into bar 1's C
pad(50, 'G', 2.2, vel=.3, inst='violins_trem', gain=.35)
low(50, 'G', 2.1, vel=.32, gain=.45)
E.append((50.0, 'snare', 'roll', None, .25, 0, .35))
add(bus, X.whoosh(1.2, .6), 50.9, .45)
for k, p in enumerate(['G4', 'B4', 'D5', 'F5']):
    ev(51.0 + k * BEAT / 2, 'marimba', p, .3, .35, (-.2, .2)[k % 2], .4)
hit(52.0, 1.2, 'C3')
E.append((52.0, 'sus_cymbal', 'hit', None, .45, 0, .4))
E.append((52.0, 'tubular_bells', 'C5', 5.0, .5, 0, .45))
E.append((52.0, 'glockenspiel', 'C7', 2.0, .35, .2, .35))
for p in ('C4', 'E4', 'G4', 'C5'):
    ev(52.0, 'upright', p, 4.0, .5, 0, .5)
    ev(52.0, 'violins', p, 7.5, .3, 0, .3, attack=.3)
pad(52, 'C', 7.8, vel=.3)
low(52, 'C', 7.8, vel=.45, inst='cellos', gain=.5)
low(52, 'C', 7.8, vel=.3, gain=.45)
tune(56, 'F', vel=.3, gain=.45)                            # gentle F → C while the payoff holds
tune(58, 'C', vel=.28, gain=.42)
pad(56, 'F', 2.2, vel=.2, inst='cellos', gain=.35)
# pickup bar (60–62): G with the typing dots — leads back into the hook's C
low(60, 'G', 2.0, vel=.3, gain=.45)
pad(60, 'G', 2.1, vel=.26)
for k, p in enumerate(['G4', 'B4', 'D5', 'F5', 'G5', 'F5', 'D5', 'B4']):
    ev(60.0 + k * BEAT / 2, 'marimba', p, .3, .36 + .02 * k, (-.25, .25)[k % 2], .45)
typing(60.2, 61.8, rate=5, v=.12)

mix = S.render(E, dur=DUR, master=False)
mix = S.room(mix, size=.55, mix=.2)
n = min(len(mix), len(bus))
mix = mix[:n] + bus[:n]
f = int(0.3 * SR)
mix[-f:] *= np.linspace(1, 0, f)[:, None]  # 0.3 s declick only: the cadence is the ending, not a fade
mix = mix / max(1e-9, np.abs(mix).max()) * .9  # tools/score.sh sets loudness and true peak
out = sys.argv[1] if len(sys.argv) > 1 else 'score.wav'
sf.write(out, mix.astype(np.float32), SR)
print('wrote', out, f'{n / SR:.2f}s', sorted({e['inst'] if isinstance(e, dict) else e[1] for e in E}))
