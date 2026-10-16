"""Score for 如果你家的貓跟老虎一樣大 / What if your cat were as big as a tiger.
120 BPM 4/4 → beat 0.5 s, bar 2 s. A minor, sneaky pizzicato.
Cuts (= timeline.ts): 0 6 14 22 30 38 48 56.
Sync points (scene-local frames in timeline.ts → seconds): mug crash 2.0, cat lands on lap 7.0, pouches 18–20,
box grows 23.3–25.3, ping-pong table lands ~26.7, swipes 32/34/36 with crashes 33/35/37, 95.6 % at 40,
shrink at 44, cadence + payoff at 48, the closing line 50.7–53.2, a button on its last word at 54, then the
tonic rings to the cut (no pickup: the ending ends; bar 1 opens on the same Am when the Short replays).
"""
import sys, os
import numpy as np, soundfile as sf

LIB = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'lib'))
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio import sfx as X
from core.audio.sfx import SR, add

S.seed(29)
DUR, BEAT, BAR = 56.0, 0.5, 2.0
E = []                                          # note events
bus = np.zeros((int(DUR * SR), 2), np.float32)  # sfx bus

CH = {  # bass root, fifth (contrabass F#1–B3), mid chord
    'Am': ('A1', 'E2', ['C4', 'E4', 'A4']),
    'F': ('F2', 'C3', ['C4', 'F4', 'A4']),
    'Dm': ('D2', 'A2', ['D4', 'F4', 'A4']),
    'E': ('E2', 'B2', ['D4', 'G#4', 'B4']),
    'G': ('G2', 'D3', ['D4', 'G4', 'B4']),
}
BARS = ['Am', 'Am', 'E',                     # hook
        'Am', 'F', 'Dm', 'E',                # lap
        'Am', 'F', 'Dm', 'E',                # food
        'Dm', 'Am', 'F', 'E',                # litter
        'Am', 'Am', 'F', 'E',                # push
        'Dm', 'F', 'G', 'Am', 'E',           # dna
        'Am', 'Am', 'Am', 'Am']              # end
assert len(BARS) * BAR == DUR


def ev(t, inst, pitch, dur, vel, pan=0.0, gain=.5, **kw):
    E.append(dict(t=t, inst=inst, pitch=pitch, dur=dur, vel=vel, pan=pan, gain=gain, **kw))


def hit(t, v=1.0, pitch='A2'):  # scene cuts
    E.append((t, 'timpani', pitch, 2.0, .8 * v, 0, .8))
    E.append((t, 'gran_cassa', None, None, .7 * v, 0, .7))


def oompah(i, v=.5, skip=()):
    """Sneaky pizzicato: bass on beats 1 and 3, a short chord on 2 and 4."""
    t0 = i * BAR
    r, f5, ch = CH[BARS[i]]
    for b in range(4):
        t = t0 + b * BEAT
        if b in skip:
            continue
        if b % 2 == 0:
            ev(t, 'contrabass_pizz', r if b == 0 else f5, .4, v + .1, .1, .7)
        else:
            for k, p in enumerate(ch):
                ev(t + k * .012, 'violins_pizz', p, .3, v * .8, (-.3, 0, .3)[k], .35)


def melody(t0, notes, inst='clarinet_stac', vel=.5, gain=.45, pan=-.15):
    for beat, p in notes:
        ev(t0 + beat * BEAT, inst, p, .22, vel, pan, gain)


# tiptoe motif over two bars (beats)
TIP_A = [(0, 'A4'), (.5, 'C5'), (1, 'E5'), (1.5, 'D#5'), (2, 'E5'), (3, 'C5'), (3.5, 'A4')]
TIP_B = [(0, 'B4'), (.5, 'G#4'), (1, 'E4'), (2, 'F4'), (2.5, 'E4'), (3, 'D4'), (3.5, 'E4')]
TIP_F = [(0, 'C5'), (.5, 'A4'), (1, 'F4'), (1.5, 'A4'), (2, 'C5'), (3, 'D5'), (3.5, 'C5')]
TIP_D = [(0, 'D5'), (.5, 'A4'), (1, 'F4'), (2, 'E4'), (2.5, 'F4'), (3, 'G#4'), (3.5, 'B4')]
TIP_FOR = {'Am': TIP_A, 'F': TIP_F, 'Dm': TIP_D, 'E': TIP_B}

# ── hook 0–6: the paw slides (0.1–1.2), the mug falls, crash on 2.0, one beat of silence, then the tiptoe again
oompah(0, .45)
melody(0, TIP_A, vel=.45)
add(bus, X.whoosh(.9, .5), .12, .35, .3)
E.append((1.25, 'woodblock', 'b', None, .5, .4, .35))  # the mug tips over the edge
add(bus, X.crash(1.0), 2.0, .9, .45)
E.append((2.0, 'timpani', 'A2', 1.5, .6, 0, .5))
oompah(1, .4, skip=(0,))
melody(2.5, [(0, 'E5'), (.5, 'C5'), (1.5, 'A4'), (2.5, 'E4')], vel=.4)
oompah(2, .45)
melody(4, TIP_B, vel=.45)

# ── lap 6–14: heavier — bassoon doubles the bass; the cat lands on 7.0
hit(6, .55)
for i in range(3, 7):
    oompah(i, .5)
    melody(i * BAR, TIP_FOR[BARS[i]], vel=.45)
    r, f5, _ = CH[BARS[i]]
    for b in (0, 2):
        ev(i * BAR + b * BEAT, 'bassoon_stac', r if b == 0 else f5, .3, .5, -.1, .4)
add(bus, X.thump(1.0, 55), 7.0, .9, 0)
E.append((7.0, 'gran_cassa', None, None, .9, 0, .9))
E.append((7.0, 'timpani', 'F2', 1.2, .7, 0, .6))
for k, p in enumerate(['A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G#5', 'A5']):  # the count-up 0 → 220
    ev(7.2 + k * .125, 'xylophone', p, .2, .35 + .03 * k, .2, .3)

# ── food 14–22: marimba arpeggios; a glockenspiel run while the 65 pouches pop in (18–20)
hit(14, .5)
for i in range(7, 11):
    oompah(i, .4)
    _, _, ch = CH[BARS[i]]
    for b in range(8):
        ev(i * BAR + b * BEAT / 2, 'marimba', ch[[0, 1, 2, 1][b % 4]], .3, .35, (-.3, .3)[b % 2], .4)
RUN = ['A5', 'C6', 'D6', 'E6', 'G6', 'A6', 'C7', 'A6', 'G6', 'A6', 'C7', 'D7', 'E7', 'D7', 'C7', 'E7']
for k, p in enumerate(RUN):
    ev(18 + k * .125, 'glockenspiel', p, .3, .3 + .015 * k, (-.4 + .05 * k), .3)
melody(20, TIP_B, vel=.4)

# ── litter 22–30: big and slow — tuba on the roots, horns hold, a cymbal swell while the box grows
hit(22, .5, 'F2')
for i in range(11, 15):
    t0 = i * BAR
    r, f5, ch = CH[BARS[i]]
    ev(t0, 'tuba_stac', r, .5, .55, 0, .55)
    ev(t0 + BEAT * 2, 'tuba_stac', f5, .5, .5, 0, .5)
    for k, p in enumerate(ch[:2]):
        ev(t0, 'horn', p.replace('4', '3'), BAR, .35, (-.2, .2)[k], .35, attack=.2)
    for b in (1, 3):
        for k, p in enumerate(ch):
            ev(t0 + b * BEAT, 'violins_pizz', p, .3, .3, (-.3, 0, .3)[k], .3)
E.append((23.2, 'sus_cymbal', 'cresc', None, .5, 0, .35))
E.append((24.33, 'glockenspiel', 'E6', .5, .45, 0, .35))  # "3 m"
add(bus, X.thump(.8, 70), 26.67, .6, 0)
E.append((26.67, 'woodblock', 'a', None, .6, -.2, .4))
melody(28, TIP_B, vel=.4, inst='bassoon_stac', pan=.1)

# ── push 30–38: driving 8ths; a whoosh on each swipe, a crash 1 s later; the last one is the whole table
hit(30, .55)
for i in range(15, 19):
    t0 = i * BAR
    r, f5, ch = CH[BARS[i]]
    for b in range(8):
        ev(t0 + b * BEAT / 2, 'contrabass_pizz', r if b % 4 < 2 else f5, .25, .45 + (.1 if b % 2 == 0 else 0), .1, .6)
    for b in (1, 3):
        for k, p in enumerate(ch):
            ev(t0 + b * BEAT, 'violins_pizz', p, .3, .4, (-.3, 0, .3)[k], .35)
for k, ts in enumerate((32, 34, 36)):
    add(bus, X.whoosh(.35, .9), ts, .55, .3)
    E.append((ts, 'snare', 'on', None, .6, 0, .4))
    add(bus, X.crash(1.0), ts + 1, .8 + .1 * k, .4)
    E.append((ts + 1, 'timpani', ('A2', 'F2', 'A2')[k], 1.2, .55 + .15 * k, 0, .55))
E.append((37.0, 'gran_cassa', None, None, 1.0, 0, .9))
E.append((37.0, 'clash', 'crash', None, .6, 0, .4))
melody(30, [(0, 'A4'), (.5, 'C5'), (1, 'E5'), (2, 'A5')], vel=.5)

# ── dna 38–48: the music holds its breath; 95.6 % lands on 40; the cat shrinks on 44; dominant into 48
E.append((38.0, 'gran_cassa', None, None, .4, 0, .4))
for i in range(19, 24):
    t0 = i * BAR
    r, f5, ch = CH[BARS[i]]
    ev(t0, 'contrabass', r, BAR + .2, .35, .1, .5, attack=.3)
    for k, p in enumerate(ch):
        ev(t0, 'violins', p, BAR + .2, .22, (-.4, 0, .4)[k], .35, attack=.5)
    for b in range(8):
        ev(t0 + b * BEAT / 2, 'vibraphone', ch[[0, 1, 2, 1][b % 4]], .4, .25, (-.3, .3)[b % 2], .3)
E.append((40.0, 'sus_cymbal', 'hit', None, .45, 0, .35))
for k, p in enumerate(['A5', 'E6', 'A6']):
    ev(40.0 + k * .02, 'glockenspiel', p, 1.0, .5, (-.2, 0, .2)[k], .35)
E.append((40.0, 'timpani', 'F2', 1.5, .5, 0, .45))
for k, p in enumerate(['E6', 'C6', 'A5', 'E5']):  # shrinking back to house-cat size
    ev(44.0 + k * .12, 'xylophone', p, .2, .4, .2, .3)
for k, p in enumerate(['A3', 'C4', 'E4', 'A4', 'C5', 'E5']):
    ev(44.0 + k * .1, 'harp', p, 1.5, .35, -.2, .35)
melody(46, [(0, 'B4'), (.5, 'G#4'), (1, 'E4'), (2, 'D5'), (3, 'B4'), (3.5, 'G#4')], vel=.35, inst='clarinet_stac')
add(bus, X.whoosh(1.0, .6), 47.0, .45)

# ── end 48–56: tonic cadence on the payoff, a soft ring under the closing line (50.7–53.2),
# a button on its last word (54), and the Am rings out to the cut
hit(48, 1.0)
E.append((48.0, 'tubular_bells', 'A4', 6.0, .45, 0, .4))
E.append((48.0, 'clash', 'crash', None, .35, 0, .25))
ev(48.0, 'contrabass', 'A1', 5.0, .45, .1, .55, attack=.05, release=1.5)
for k, p in enumerate(['A2', 'E3', 'A3']):
    ev(48.0, 'cellos', p, 5.0, .4, (-.2, 0, .2)[k], .4, attack=.05, release=1.5)
for k, p in enumerate(['C4', 'E4', 'A4']):
    ev(48.0, 'violas', p, 5.0, .35, (-.4, 0, .4)[k], .35, attack=.05, release=1.5)
for k, p in enumerate(['E5', 'A5']):
    ev(48.0, 'violins', p, 5.0, .32, (-.3, .3)[k], .32, attack=.05, release=1.5)
for k, p in enumerate(['A3', 'E4']):
    ev(48.0, 'horn', p, 3.0, .4, (-.2, .2)[k], .35, attack=.05)
for k, p in enumerate(['A4', 'C5', 'E5', 'A5', 'C6', 'E6']):
    ev(48.0 + k * .08, 'harp', p, 3.0, .4, .2, .4)
# under the closing line: the tiptoe motif one last time, quietly, resolving down to A
melody(51.0, [(0, 'E5'), (.5, 'C5'), (1, 'B4'), (2, 'G#4'), (3, 'A4')], vel=.3, inst='clarinet_stac')
# button (54): the joke lands → pizz A + timpani + glockenspiel, then everything rings out
hit(54.0, .75)
ev(54.0, 'contrabass_pizz', 'A1', .5, .6, .1, .7)
for k, p in enumerate(['A3', 'C4', 'E4', 'A4']):
    ev(54.0 + k * .012, 'violins_pizz', p, .4, .5, (-.3, -.1, .1, .3)[k], .4)
for k, p in enumerate(['A5', 'A6']):
    ev(54.0, 'glockenspiel', p, 1.5, .45, (-.2, .2)[k], .35)
ev(54.0, 'cellos', 'A2', 1.7, .3, 0, .35, attack=.02, release=1.2)

mix = S.render(E, dur=DUR, master=False)
mix = S.room(mix, size=.55, mix=.2)
n = min(len(mix), len(bus))
mix = mix[:n] + bus[:n]
f = int(0.3 * SR)
mix[-f:] *= np.linspace(1, 0, f)[:, None]  # 0.3 s declick only: the button is the ending, not a fade
mix = mix / max(1e-9, np.abs(mix).max()) * .9  # tools/score.sh sets loudness and true peak
out = sys.argv[1] if len(sys.argv) > 1 else 'score.wav'
sf.write(out, mix.astype(np.float32), SR)
print('wrote', out, f'{n / SR:.2f}s', sorted({e['inst'] if isinstance(e, dict) else e[1] for e in E}))
