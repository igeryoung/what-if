"""Score for 如果你決定靠統一發票中 1,000 萬. 120 BPM 4/4 → beat 0.5 s, bar 2 s, F major.
Cuts (= timeline.ts): 0 6 14 20 28 36 44 52 60 70.
Wheel locks 7.0–10.5 s (one per beat), scanner beeps 14.5/15/15.5, odometer lands 33 s,
17 gold slips land from 45.2 s, the payoff cadence lands on 60 s, the last bar is a C7 pickup into bar 1."""
import sys, os
import numpy as np, soundfile as sf

LIB = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'lib'))
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio import sfx as X
from core.audio.sfx import SR, add

S.seed(31)
DUR, BEAT, BAR = 70.0, 0.5, 2.0
E = []
bus = np.zeros((int(DUR * SR), 2), np.float32)
rnd = np.random.default_rng(31)

CH = {  # bass root (contrabass F#1–B3), pad triad, arp tones
    'F': ('F2', ['A3', 'C4', 'F4'], ['F4', 'A4', 'C5', 'F5']),
    'Dm': ('D2', ['A3', 'D4', 'F4'], ['D4', 'F4', 'A4', 'D5']),
    'Bb': ('Bb1', ['Bb3', 'D4', 'F4'], ['Bb3', 'D4', 'F4', 'Bb4']),
    'C': ('C2', ['G3', 'C4', 'E4'], ['C4', 'E4', 'G4', 'C5']),
    'C7': ('C2', ['Bb3', 'E4', 'G4'], ['C4', 'E4', 'G4', 'Bb4']),
    'Gm': ('G1', ['Bb3', 'D4', 'G4'], ['G4', 'Bb4', 'D5', 'G5']),
    'A': ('A1', ['A3', 'C#4', 'E4'], ['A3', 'C#4', 'E4', 'A4']),
    'Am': ('A1', ['A3', 'C4', 'E4'], ['A3', 'C4', 'E4', 'A4']),
}
SECTIONS = [  # (name, start, chords — one per bar)
    ('hook', 0, ['F', 'Dm', 'C']),
    ('odds', 6, ['F', 'Dm', 'Bb', 'C']),
    ('daily', 14, ['F', 'Bb', 'C']),
    ('wait', 20, ['Dm', 'Bb', 'Gm', 'A']),
    ('year', 28, ['Dm', 'Bb', 'F', 'C']),
    ('lives', 36, ['Bb', 'F', 'Gm', 'C']),
    ('twist', 44, ['F', 'Am', 'Bb', 'C']),
    ('days', 52, ['Dm', 'Bb', 'F', 'C7']),
]


def ev(t, inst, pitch, dur, vel, pan=0.0, gain=0.6, **kw):
    E.append(dict(t=t, inst=inst, pitch=pitch, dur=dur, vel=vel, pan=pan, gain=gain, **kw))


def pad(t, ch, d, vel=.25, inst='violas', gain=.45):
    for i, p in enumerate(CH[ch][1]):
        ev(t, inst, p, d, vel, (-.4, 0, .4)[i], gain, attack=.4)


def bass_pizz(t, ch, vel=.5):
    ev(t, 'contrabass_pizz', CH[ch][0], .6, vel, .1, .7)
    ev(t + 2 * BEAT, 'contrabass_pizz', CH[ch][0], .6, vel * .85, .1, .7)


def bass_arco(t, ch, d, vel=.4):
    ev(t, 'contrabass', CH[ch][0], d, vel, .1, .55, attack=.25)


def arp(t, ch, inst='marimba', vel=.35, gain=.4, n=8):
    a = CH[ch][2]
    for k in range(n):
        ev(t + k * BEAT / 2, inst, a[(0, 1, 2, 3, 2, 1, 2, 3)[k % 8]], .3, vel * (1.1 if k % 2 == 0 else .85), (-.3, .3)[k % 2], gain)


def pizz(t, ch, vel=.3):
    a = CH[ch][2]
    for k in range(4):
        ev(t + k * BEAT + BEAT / 2, 'violins_pizz', a[(3, 2, 3, 1)[k]], .3, vel, .35, .45)


def hit(t, v=1.0, pitch='F2'):
    E.append((t, 'timpani', pitch, 2.0, .9 * v, 0, .85))
    E.append((t, 'gran_cassa', None, None, .75 * v, 0, .75))


def crash(t, v=.6):
    E.append((t, 'sus_cymbal', 'hit', None, v, .2, .5))


# —— beds per section ——
for name, t0, chords in SECTIONS:
    for b, ch in enumerate(chords):
        t = t0 + b * BAR
        if name in ('hook', 'daily'):
            arp(t, ch)
            bass_pizz(t, ch, .45)
            pad(t, ch, BAR + .2, vel=.18)
        elif name == 'odds':
            pizz(t, ch, .32)
            bass_pizz(t, ch, .5)
            pad(t, ch, BAR + .2, vel=.24)
        elif name == 'wait':
            pad(t, ch, BAR + .3, vel=.26)
            bass_arco(t, ch, BAR + .2, .42)
            ev(t, 'cellos', CH[ch][0].replace('1', '2'), BAR + .2, .3, -.2, .4, attack=.3)
            for k in range(4):  # the clock
                E.append((t + k * BEAT, 'woodblock', ('a', 'b')[k % 2], None, .32 if k % 2 == 0 else .22, (-.25, .25)[k % 2], .4))
        elif name == 'year':
            pizz(t, ch, .3)
            bass_pizz(t, ch, .5)
            pad(t, ch, BAR + .2, vel=.22)
        elif name == 'lives':
            pad(t, ch, BAR + .3, vel=.22, inst='violins', gain=.35)
            pad(t, ch, BAR + .3, vel=.2)
            bass_arco(t, ch, BAR + .2, .32)
            arp(t, ch, inst='harp', vel=.3, gain=.45)
        elif name in ('twist', 'days'):
            arp(t, ch, vel=.3, gain=.35)
            bass_pizz(t, ch, .55)
            pad(t, ch, BAR + .2, vel=.26)
            for k in range(4):
                if k % 2 == 0:
                    E.append((t + k * BEAT, 'bass_drum', None, None, .55, 0, .55))
                else:
                    E.append((t + k * BEAT, 'snare', 'on', None, .32, -.05, .35))
            for k in range(8):
                E.append((t + k * BEAT / 2, 'hihat', 'closed', None, .22 if k % 2 else .3, .3, .25))

# —— hook: a register ding, then a cheeky clarinet line ——
add(bus, X.ding(.5), 0.02, .22, .1)
for tt, p, d in [(2.0, 'C5', .4), (2.5, 'D5', .4), (3.0, 'F5', .9), (4.0, 'E5', .4), (4.5, 'D5', .4), (5.0, 'C5', .4), (5.5, 'E5', .45)]:
    ev(tt, 'clarinet', p, d, .38, -.15, .38, attack=.03)

# —— cuts ——
for t, v in [(6, .7), (14, .5), (20, .75), (28, .65), (36, .45), (44, .9), (52, .75)]:
    hit(t, v, 'F2' if t not in (20, 28) else 'A2')
for t in (5.0, 43.0, 51.0):
    add(bus, X.whoosh(1.0, .5), t, .35)
crash(44, .55)

# odds: each wheel locks on the beat with a click and a rising glockenspiel note
for i, p in enumerate(['G5', 'A5', 'Bb5', 'C6', 'D6', 'E6', 'F6', 'G6']):
    t = 7.0 + i * BEAT
    E.append((t, 'woodblock', 'c', None, .45, (-.3 + .085 * i), .45))
    ev(t, 'glockenspiel', p, .6, .38, -.3 + .085 * i, .4)
hit(11.0, .55, 'A2')
ev(11.0, 'vibraphone', 'A4', 2.5, .35, 0, .4)
ev(11.0, 'vibraphone', 'F5', 2.5, .3, 0, .35)

# daily: three scanner beeps, then the count-up runs into a ding
for t, p in [(14.5, 'C6'), (15.0, 'E6'), (15.5, 'G6')]:
    ev(t, 'glockenspiel', p, .35, .45, 0, .45)
    ev(t, 'glockenspiel', p, .12, .25, 0, .25)
for k, p in enumerate(['C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'Bb5', 'C6']):
    ev(17.0 + k * .125, 'xylophone', p, .2, .3 + .02 * k, (-.3, .3)[k % 2], .35)
add(bus, X.ding(.6), 18.0, .25, 0)

# wait: the number lands like a weight
ev(21.0, 'trombone', 'D3', 1.6, .45, -.1, .45, attack=.05)
ev(21.0, 'horn', 'A3', 1.6, .4, .1, .4, attack=.05)
E.append((21.0, 'timpani', 'D3', 2.0, .6, 0, .7))

# year: a snare roll for the odometer that crescendos into the landing at 33 s
n = int((33.0 - 28.8) / .125)
for k in range(n):
    E.append((28.8 + k * .125, 'snare', 'on' if k % 2 == 0 else 'off', None, .08 + .3 * (k / n) ** 1.6, .05, .3))
hit(33.0, .8, 'F2')
crash(33.0, .5)
for p in ('A4', 'C5', 'F5'):
    ev(33.0, 'trumpet', p, 1.2, .42, 0, .35, attack=.02)
ev(33.0, 'glockenspiel', 'F6', 1.5, .4, 0, .35)

# lives: twinkles while the 1,142 squares appear
tw = ['G5', 'A5', 'C6', 'D6', 'F6', 'G6', 'A6']
for k in range(22):
    t = 37.7 + k * .17 + float(rnd.uniform(-.03, .03))
    ev(t, 'glockenspiel', tw[int(rnd.integers(0, len(tw)))], .5, .18 + .1 * float(rnd.random()), float(rnd.uniform(-.6, .6)), .3)
ev(40.5, 'hand_chimes', 'F5', 2.5, .3, 0, .35)

# twist: 17 gold slips land, one bright note each
casc = ['F5', 'G5', 'A5', 'C6', 'D6']
for i in range(17):
    t = 45.2 + i / 6
    ev(t, 'glockenspiel', casc[i % 5] if i < 15 else ('F6', 'A6')[i - 15], .4, .3 + .01 * i, (-.5 + i / 16), .35)
for t in (48.5, 49.5, 50.5):
    for p in ('A4', 'C5', 'F5'):
        ev(t, 'trumpet_stac', p, .25, .35, .1, .3)

# days: strings climb with the counter; riser and snare build into the payoff
for k, p in enumerate(['D4', 'F4', 'A4', 'C5', 'D5']):
    ev(53.0 + k, 'violins', p, 1.05, .28 + .04 * k, -.2, .35, attack=.15)
ev(58.0, 'violins', 'E5', 2.0, .45, -.2, .4, attack=.2)
for k in range(8):
    E.append((59.0 + k * .125, 'snare', 'on', None, .18 + .06 * k, 0, .35))
add(bus, X.whoosh(1.2, .7), 58.8, .45)

# —— ending: the tonic lands with a hit on the payoff and rings; the last bar is a C7 pickup into bar 1 ——
hit(60.0, 1.0, 'F2')
crash(60.0, .6)
ev(60.0, 'tubular_bells', 'F4', 6.0, .5, 0, .45)
for i, p in enumerate(['F3', 'C4', 'F4', 'A4', 'C5']):
    ev(60.0, 'violins' if i > 2 else 'violas', p, 6.5, .38, (-.4, -.2, 0, .2, .4)[i], .45, attack=.08, release=1.5)
ev(60.0, 'cellos', 'F2', 6.5, .42, -.2, .45, attack=.08)
ev(60.0, 'contrabass', 'F2', 6.5, .45, .1, .5, attack=.08)
ev(60.0, 'horn', 'C4', 4.0, .4, .2, .4, attack=.06)
ev(60.0, 'horn', 'A3', 4.0, .38, -.2, .38, attack=.06)
for k, p in enumerate(['F5', 'A5', 'C6', 'F6']):
    ev(60.0 + k * .12, 'glockenspiel', p, 1.5, .32, (-.3, -.1, .1, .3)[k], .35)
ev(62.0, 'tubular_bells', 'A4', 4.0, .32, .1, .35)
ev(62.0, 'vibraphone', 'C5', 3.0, .3, -.1, .35)
pad(64.0, 'F', 4.2, vel=.16)
bass_arco(64.0, 'F', 4.0, .25)
# 68–70: pickup — C7 under a marimba climb that resolves to bar 1's F
bass_pizz(68.0, 'C7', .45)
pad(68.0, 'C7', 2.0, vel=.16)
for k, p in enumerate(['C4', 'E4', 'G4', 'Bb4', 'C5', 'E5', 'G5', 'Bb5']):
    ev(68.0 + k * BEAT / 2, 'marimba', p, .3, .3 + .02 * k, (-.3, .3)[k % 2], .4)

mix = S.render(E, dur=DUR, master=False)
mix = S.room(mix, size=.55, mix=.2)
n = min(len(mix), len(bus))
mix = mix[:n] + bus[:n]
f = int(0.05 * SR)
mix[-f:] *= np.linspace(1, 0, f)[:, None]  # declick only: the cadence is the ending, not a fade
mix = mix / max(1e-9, np.abs(mix).max()) * .9
out = sys.argv[1] if len(sys.argv) > 1 else 'score.wav'
sf.write(out, mix.astype(np.float32), SR)
print('wrote', out, f'{n / SR:.2f}s', sorted({e['inst'] if isinstance(e, dict) else e[1] for e in E}))
