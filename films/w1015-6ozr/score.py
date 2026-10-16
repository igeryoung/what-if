"""Score for 如果人類能像壁虎一樣爬牆. 120 BPM 4/4 → beat 0.5 s, bar 2 s, A minor.
Cuts (= timeline.ts): 0 6 16 24 32 40 48 54 62 71.
Marimba + pizzicato 'creeping' ostinato; hits on every cut; the payoff lands on an A-minor cadence at 62 and rings
under the closing line (65.7–68.6); a button on its last word (69), then the Am rings out to the cut (no pickup)."""
import sys, os
import numpy as np, soundfile as sf

LIB = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'lib'))
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio import sfx as X
from core.audio.sfx import SR, add

S.seed(23)
DUR, BEAT, BAR = 71.0, 0.5, 2.0
E = []                                          # note events
bus = np.zeros((int(DUR * SR), 2), np.float32)  # sfx bus

CH = {  # bass root (contrabass F#1–B3), pad triad, marimba arpeggio
    'Am': ('A1', ['C4', 'E4', 'A4'], ['A3', 'E4', 'A4', 'C5']),
    'F': ('F2', ['C4', 'F4', 'A4'], ['F3', 'C4', 'F4', 'A4']),
    'C': ('C2', ['C4', 'E4', 'G4'], ['C4', 'G4', 'C5', 'E5']),
    'G': ('G1', ['D4', 'G4', 'B4'], ['G3', 'D4', 'G4', 'B4']),
    'Dm': ('D2', ['D4', 'F4', 'A4'], ['D4', 'A4', 'D5', 'F5']),
    'E': ('E2', ['E4', 'G#4', 'B4'], ['E3', 'B3', 'E4', 'G#4']),
}

# one chord per bar, cuts on bar lines
PROG = (['Am', 'F', 'G'] +                    # hook 0–6
        ['Am', 'F', 'C', 'G', 'E'] +          # secret 6–16
        ['Am', 'Dm', 'F', 'E'] +              # strength 16–24
        ['F', 'G', 'Am', 'E'] +               # scale 24–32
        ['Am', 'F', 'Dm', 'E'] +              # species 32–40
        ['F', 'G', 'Am', 'E'] +               # forty 40–48
        ['Dm', 'Am', 'E'] +                   # shoe 48–54
        ['F', 'Dm', 'E', 'E'])                # front 54–62 (twist) → end at 62
assert len(PROG) == 31


def pad(t, ch, d, vel=.3, inst='violas', gain=.45):
    for i, p in enumerate(CH[ch][1]):
        E.append(dict(t=t, inst=inst, pitch=p, dur=d, vel=vel, pan=(-.4, 0, .4)[i], attack=.4, gain=gain))


def hit(t, v=1.0):  # scene cuts
    E.append((t, 'timpani', 'A2', 2.0, .85 * v, 0, .85))
    E.append((t, 'gran_cassa', None, None, .7 * v, 0, .7))


# ---------------------------------------------------------------- the creeping ostinato (bars 0–30)
for i, ch in enumerate(PROG):
    t = i * BAR
    root, triad, arp = CH[ch]
    scene_big = 20 <= i <= 30                # forty → front: fuller
    E.append(dict(t=t, inst='contrabass_pizz', pitch=root, dur=.6, vel=.7, pan=.1, gain=.75))
    E.append(dict(t=t + 2 * BEAT, inst='contrabass_pizz', pitch=root, dur=.6, vel=.55, pan=.1, gain=.7))
    for b in range(8):                       # marimba 8ths: up-down arpeggio
        p = arp[(0, 1, 2, 3, 2, 1, 2, 1)[b]]
        E.append((t + b * BEAT / 2, 'marimba', p, .3, (.42 if b % 2 == 0 else .3), (-.3, .3)[b % 2], .42))
    for b in (1, 3):                         # pizz chords on the off-beats
        for k, p in enumerate(triad):
            E.append(dict(t=t + b * BEAT + .25, inst='violins_pizz', pitch=p, dur=.3, vel=.35, pan=(-.3, 0, .3)[k], gain=.32))
    E.append((t + BEAT, 'woodblock', 'b', None, .25, -.4, .22))
    E.append((t + 3 * BEAT, 'woodblock', 'a', None, .22, .4, .2))
    if scene_big:
        pad(t, ch, BAR + .2, vel=.32, inst='cellos', gain=.4)
    elif i >= 8:
        pad(t, ch, BAR + .2, vel=.22)

for t in (6, 16, 24, 32, 40, 48):
    hit(t, .7)
hit(54, .9)

# ---------------------------------------------------------------- sync points (seconds = timeline.ts frames / 30)
# hook: the gecko scurries (frames 6–42) → woodblock 16ths
for k in range(10):
    E.append((.25 + k * .125, 'woodblock', ('a', 'c')[k % 2], None, .3, (-.2, .2)[k % 2], .25))
# secret: stage B (9.5 s) hairs → glockenspiel shimmer; count-up 9.77–10.77; stage C (13 s) the hair splits → harp run
for k, p in enumerate(['A5', 'C6', 'E6', 'A6', 'C7', 'E7']):
    E.append((9.5 + k * .125, 'glockenspiel', p, .6, .35, (-.3, .3)[k % 2], .3))
for k, p in enumerate(['A3', 'C4', 'E4', 'A4', 'C5', 'E5', 'A5', 'C6', 'E6', 'A6']):
    E.append((13.67 + k * .09, 'harp', p, 1.2, .45, -.4 + k * .08, .45))
# strength: "133 kg" lands at 17.5 s; the two adults drop at 20 s
E.append((17.5, 'timpani', 'A2', 1.5, .6, 0, .6))
E.append((17.5, 'sus_cymbal', 'hit', None, .35, .2, .3))
add(bus, X.thump(.8, 70), 20.0, .6)
E.append((20.0, 'tuba_stac', 'A1', .4, .7, 0, .6))
# scale: small cube 25 s; big cube grows 26.5–27.5 s; labels 28 s; takeaway 29.5 s
add(bus, X.pop(.6), 25.0, .35)
for k, p in enumerate(['E3', 'A3', 'C4', 'E4']):
    E.append((26.5 + k * .125, 'tuba_stac' if k < 2 else 'trombone_stac', p, .3, .5, 0, .45))
E.append((28.0, 'xylophone', 'A5', .4, .5, -.2, .4))
E.append((28.25, 'xylophone', 'E5', .4, .45, .2, .4))
# species: gecko bar grows 34–35 s; "200×" at 35.2 s
for k, p in enumerate(['A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G#5', 'A5']):
    E.append((34.0 + k * .125, 'xylophone', p, .3, .35 + k * .03, -.3 + k * .08, .35))
E.append((35.2, 'timpani', 'A2', 1.2, .55, 0, .55))
# forty: fill rises 41–43 s → violins crescendo, lands at 43 s
for k, p in enumerate(['C5', 'E5', 'A5']):
    E.append(dict(t=41.0, inst='violins', pitch=p, dur=2.2, vel=.25 + .1 * k, pan=(-.3, 0, .3)[k], attack=1.6, gain=.38))
E.append((43.0, 'sus_cymbal', 'hit', None, .3, -.2, .3))
# shoe: "145" pops at 48.8 s; the shoe grows 50–51 s → comic tuba
E.append((48.8, 'xylophone', 'E5', .4, .45, 0, .4))
for k, p in enumerate(['E2', 'G#2', 'B2', 'E3']):
    E.append((50.0 + k * .25, 'tuba_stac', p, .3, .65, 0, .6))
# front (twist): 80% fill 55–57 s; climbing 58.5–62 s → pizz climbing up in 8ths, tremolo swell, riser into the cut
for k, p in enumerate(['E3', 'F3', 'G#3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G#4', 'A4', 'B4', 'C5', 'D5']):
    E.append(dict(t=58.5 + k * .25, inst='cellos_pizz' if k < 7 else 'violins_pizz', pitch=p, dur=.3, vel=.5, pan=-.3 + k * .045, gain=.5))
for k, p in enumerate(['E4', 'G#4', 'B4', 'D5']):
    E.append(dict(t=58.0, inst='violins_trem', pitch=p, dur=4.0, vel=.25 + .05 * k, pan=(-.4, -.1, .1, .4)[k], attack=3.2, gain=.32))
E.append((60.0, 'sus_cymbal', 'cresc', None, .45, 0, .35))
add(bus, X.whoosh(1.2, .6), 60.8, .45)

# ---------------------------------------------------------------- ending (62–71): cadence on the payoff, ring under
# the closing line, a button on its last word (69), then the Am rings out to the cut
hit(62, 1.15)
E.append((62.0, 'sus_cymbal', 'hit', None, .5, 0, .45))
E.append((62.0, 'tubular_bells', 'A4', 6.0, .5, 0, .45))
E.append((62.0, 'tubular_bells', 'E4', 6.0, .35, .2, .35))
pad(62, 'Am', 6.0, vel=.32, inst='violas', gain=.34)
pad(62, 'Am', 6.0, vel=.28, inst='cellos', gain=.28)
E.append(dict(t=62.0, inst='contrabass', pitch='A1', dur=6.0, vel=.48, pan=.1, attack=.1, gain=.48))
for k, p in enumerate(['A3', 'E4', 'A4', 'C5', 'E5']):
    E.append((62.0 + k * .06, 'marimba', p, .8, .5, -.3 + k * .15, .45))
for k, p in enumerate(['E5', 'A5', 'C6']):         # the 40% fill rises 63–64.5 s
    E.append((63.0 + k * .5, 'glockenspiel', p, .8, .3, (-.2, 0, .2)[k], .25))
for k, p in enumerate(['A3', 'E4', 'A4', 'C5', 'A4', 'E4', 'A4', 'C5']):  # under the closing line: the creeping marimba, quietly
    E.append((66.0 + k * .25, 'marimba', p, .3, .26 if k % 2 else .32, (-.3, .3)[k % 2], .36))
# button (69): "leave it to the geckos" → timpani + pizz Am + glockenspiel, then everything rings out
hit(69.0, .75)
E.append(dict(t=69.0, inst='contrabass_pizz', pitch='A1', dur=.6, vel=.65, pan=.1, gain=.75))
for k, p in enumerate(['A3', 'C4', 'E4', 'A4']):
    E.append(dict(t=69.0 + k * .012, inst='violins_pizz', pitch=p, dur=.4, vel=.5, pan=(-.3, -.1, .1, .3)[k], gain=.4))
for k, p in enumerate(['A5', 'A6']):
    E.append((69.0, 'glockenspiel', p, 1.5, .45, (-.2, .2)[k], .35))
E.append(dict(t=69.0, inst='cellos', pitch='A2', dur=1.7, vel=.3, pan=0, attack=.02, gain=.32))

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
