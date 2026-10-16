"""Score for 如果你的手機掉進馬里亞納海溝. 96 BPM 4/4 → beat 0.625 s, bar 2.5 s, A minor.
Cuts (= timeline.ts): 0 5 10 17.5 25 32.5 45 52.5 67.
Hook plinks above the water → pizz pulse that sinks lower and darker with depth → heavy ostinato at the bottom →
the music drops out for the plastic bag → a rising rewind → Am cadence on the payoff (55 s) that rings →
the closing line (61.95–64.6) → a button on its last word (65), then the Am rings out to the cut (no pickup)."""
import sys, os
import numpy as np, soundfile as sf

LIB = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'lib'))
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio import sfx as X
from core.audio.sfx import SR, add

S.seed(15)
DUR, BEAT, BAR = 67.0, 0.625, 2.5
E = []                                          # note events
bus = np.zeros((int(DUR * SR), 2), np.float32)  # sfx bus

CH = {  # bass root (contrabass F#1–B3), triad
    'Am': ('A1', ['C4', 'E4', 'A4']),
    'F': ('F2', ['C4', 'F4', 'A4']),
    'Dm': ('D2', ['D4', 'F4', 'A4']),
    'E': ('E2', ['B3', 'E4', 'G#4']),
}
LOW = {  # the same chords an octave down, for the dark water
    'Am': ['A2', 'C3', 'E3'], 'F': ['F2', 'A2', 'C3'], 'Dm': ['D3', 'F3', 'A3'], 'E': ['E2', 'G#2', 'B2'],
}
ARP = {  # kalimba / harp figures (kalimba F3–C#5)
    'Am': ['A3', 'C4', 'E4', 'A4'], 'F': ['F3', 'A3', 'C4', 'F4'], 'Dm': ['D4', 'F4', 'A4', 'D4'], 'E': ['E4', 'G#4', 'B4', 'E4'],
}


def pad(t, ch, d, vel=.3, inst='violas', gain=.5, low=False):
    notes = LOW[ch] if low else CH[ch][1]
    for i, p in enumerate(notes):
        E.append(dict(t=t, inst=inst, pitch=p, dur=d, vel=vel, pan=(-.4, 0, .4)[i], attack=.6, gain=gain))


def bass(t, ch, d, vel=.45, gain=.6):
    E.append(dict(t=t, inst='contrabass', pitch=CH[ch][0], dur=d, vel=vel, pan=.1, attack=.2, gain=gain))


def pulse(t, ch, vel=.5, gain=.55):  # pizz quarter notes on the root
    for b in range(4):
        E.append((t + b * BEAT, 'contrabass_pizz', CH[ch][0], .5, vel * (1 if b == 0 else .75), .1, gain))


def hit(t, v=1.0, gong=False):  # on scene cuts
    E.append((t, 'timpani', 'A2', 2.0, .9 * v, 0, .8))
    E.append((t, 'gran_cassa', None, None, .8 * v, 0, .75))
    if gong:
        E.append((t, 'gong', None, None, .6 * v, 0, .5))


def ping(t, p='E5', v=.5):  # sonar
    E.append((t, 'glass', p, 2.5, v, .3, .45))
    E.append((t + .9, 'glass', p, 2.0, v * .45, -.3, .3))


def bar(i):
    return i * BAR


# ── hook (bars 0–1): plinks above the water, splash at 1.15 s ─────────────────────────────────────────
for i, ch in enumerate(['Am', 'F']):
    t = bar(i)
    pad(t, ch, BAR + .3, vel=.22, gain=.4)
    for b in range(8):
        E.append((t + b * BEAT / 2, 'kalimba', ARP[ch][b % 4], .5, .45 if b % 2 == 0 else .32, (-.3, .3)[b % 2], .5))
add(bus, X.whoosh(.45, .5), 0.75, .35, 0)
add(bus, X.thump(.7, 85), 1.15, .5, 0)
add(bus, X.whoosh(.9, .35), 1.15, .3, .1)
for k in range(6):  # bubbles
    add(bus, X.pop(.35), 1.3 + k * .17, .14, (-.3, .3)[k % 2])

# ── descent (bars 2–12): pizz pulse, pads sinking an octave, sonar pings on the milestones ─────────────
DESC = ['Dm', 'E', 'Am', 'F', 'E', 'Dm', 'Am', 'E', 'F', 'Dm', 'E']
for k, ch in enumerate(DESC):
    i = k + 2
    t = bar(i)
    deep = i >= 4
    pulse(t, ch, vel=.5 if not deep else .55)
    pad(t, ch, BAR + .3, vel=.28, inst='cellos' if deep else 'violas', gain=.45, low=deep)
    bass(t, ch, BAR + .1, vel=.4, gain=.45)
    if i < 4:
        for b in range(8):
            E.append((t + b * BEAT / 2, 'harp', ARP[ch][b % 4], .6, .35, (-.25, .25)[b % 2], .4))
    else:
        E.append(dict(t=t, inst='vibraphone_bowed', pitch=ARP[ch][2], dur=BAR, vel=.3, pan=-.3, attack=.8, gain=.3))
for t in (5, 10, 17.5, 25):
    hit(t, .55)
E.append((7.5, 'tubular_bells', 'E4', 2.0, .35, -.2, .35))   # passing 6 m
for t0, t1 in ((10.2, 12.2), (18.0, 20.0), (25.5, 27.5)):     # each plunge: a falling whoosh
    add(bus, X.whoosh(t1 - t0, .5), t0, .3, 0)
ping(12.2, 'E5')            # 1,000 m
for k in range(5):          # the anglerfish lure
    E.append((13.4 + k * 0.9, 'glockenspiel', ('E6', 'C6', 'A5', 'C6', 'E6')[k], .8, .25, .4, .25))
ping(20.0, 'C5')            # 3,800 m, the Titanic
E.append(dict(t=20.0, inst='horn', pitch='A2', dur=4.5, vel=.4, pan=0, attack=.8, gain=.45))
E.append(dict(t=20.0, inst='horn', pitch='E3', dur=4.5, vel=.35, pan=.2, attack=.8, gain=.4))
E.append((25.8, 'gran_cassa', 'roll', None, .45, 0, .45))   # Everest rises
E.append((27.5, 'timpani', 'D3', 2.0, .7, 0, .6))
for p in ('D3', 'F3', 'A3'):
    E.append(dict(t=27.5, inst='trombone', pitch=p, dur=4.0, vel=.4, pan=0, attack=.4, gain=.35))
add(bus, X.whoosh(1.4, .5), 31.1, .4, 0)                    # riser into the bottom

# ── bottom (bars 13–17): landing, then a heavy ostinato under the pressure numbers ──────────────────────
BOT = ['Am', 'Am', 'F', 'Dm', 'E']
for k, ch in enumerate(BOT):
    t = bar(13 + k)
    bass(t, ch, BAR + .1, vel=.55, gain=.6)
    E.append(dict(t=t, inst='tuba', pitch=CH[ch][0].replace('1', '2') if ch == 'Am' else CH[ch][0], dur=BAR, vel=.4, pan=0, attack=.3, gain=.35))
    if k >= 1:
        for b in range(8):
            E.append((t + b * BEAT / 2, 'cellos_spic', LOW[ch][0], .3, .5 if b % 2 == 0 else .38, -.15, .45))
        pad(t, ch, BAR + .3, vel=.3, inst='violas', gain=.4)
hit(32.5, .5)
E.append((34.0, 'timpani', 'A2', 2.5, 1.0, 0, .9))           # the phone hits the floor
E.append((34.0, 'gran_cassa', None, None, 1.0, 0, .9))
E.append((34.0, 'gong', None, None, .55, 0, .45))
add(bus, X.rumble(1.8, .6), 34.0, .35, 0)
hit(35.0, .7)                                                # 1.1 t per cm²
add(bus, X.thump(.8, 60), 35.25, .55, 0)                      # the car presses down
E.append((35.6, 'tubular_bells', 'A4', 2.0, .35, .2, .3))
hit(40.0, .8)                                                # 120 t
for i in range(11):                                          # cars piling up
    for j in range(2):
        add(bus, X.clack(1.4 - i * .05 + j * .1, .5), 40.1 + i * .13 + j * .05, .12, (-.4, .4)[j])

# ── the bag (bars 18–20): almost nothing; a cold high pad, a chime when the bag appears ─────────────────
hit(45.0, .45)
for k, ch in enumerate(['Am', 'F', 'E']):
    t = bar(18 + k)
    E.append(dict(t=t, inst='violins', pitch=('E5', 'F5', 'E5')[k], dur=BAR + .2, vel=.22, pan=-.2, attack=.9, gain=.35))
    E.append(dict(t=t, inst='violins', pitch=('A5', 'A5', 'G#5')[k], dur=BAR + .2, vel=.2, pan=.2, attack=.9, gain=.3))
    bass(t, ch, BAR + .1, vel=.3, gain=.35)
E.append((46.25, 'glass', 'A5', 3.0, .55, .2, .5))
E.append((46.25, 'harp', 'A3', 2.5, .5, -.2, .45))
E.append((48.75, 'glass', 'E5', 2.5, .4, -.2, .4))

# ── rewind (bar 21): a fast rising harp run and a reversed whoosh back to the surface ───────────────────
hit(52.5, .4)
run = ['A2', 'C3', 'E3', 'A3', 'C4', 'E4', 'A4', 'B4', 'C5', 'E5', 'G#5', 'A5', 'B5', 'C6', 'E6']
for k, p in enumerate(run):
    E.append((53.0 + k * 0.1, 'harp', p, .8, .45, -.4 + .8 * k / len(run), .45))
pad(52.5, 'E', BAR + .1, vel=.3, inst='violas', gain=.45)
bass(52.5, 'E', BAR, vel=.45)
add(bus, X.whoosh(1.4, .7)[::-1].copy(), 53.0, .5, 0)
add(bus, X.whoosh(.5, .5)[::-1].copy(), 54.45, .3, 0)

# ── payoff (bar 22, 55 s): the Am cadence lands and rings through the hold ───────────────────────────────
hit(55.0, 1.0)
E.append((55.0, 'tubular_bells', 'A4', 6.0, .5, 0, .45))
E.append((55.0, 'harp', 'A2', 4.0, .6, -.2, .5))
pad(55.0, 'Am', 7.2, vel=.4, inst='violins', gain=.45)
pad(55.0, 'Am', 7.2, vel=.35, inst='cellos', gain=.45, low=True)
bass(55.0, 'Am', 7.2, vel=.55, gain=.6)
E.append(dict(t=55.0, inst='horn', pitch='A3', dur=6.0, vel=.4, pan=0, attack=.3, gain=.4))
for b, p in enumerate(['A3', 'C4', 'E4', 'A4']):
    E.append((56.25 + b * BEAT, 'kalimba', p, .6, .3, (-.3, .3)[b % 2], .4))
# under the closing line (62.5–64.4): the kalimba once more, softly, settling on A
for b, p in enumerate(['E4', 'C4', 'B3', 'A3']):
    E.append((62.5 + b * BEAT, 'kalimba', p, .6, .26, (-.3, .3)[b % 2], .36))
# button (65): "hold on tight to your phone" → timpani + pizz A + glass ping, then everything rings out to 67
hit(65.0, .75)
E.append(dict(t=65.0, inst='contrabass_pizz', pitch='A1', dur=.6, vel=.65, pan=.1, gain=.75))
for k, p in enumerate(['A3', 'C4', 'E4', 'A4']):
    E.append(dict(t=65.0 + k * .012, inst='violins_pizz', pitch=p, dur=.4, vel=.5, pan=(-.3, -.1, .1, .3)[k], gain=.4))
for k, p in enumerate(['A5', 'A6']):
    E.append((65.0, 'glockenspiel', p, 1.5, .42, (-.2, .2)[k], .33))
E.append(dict(t=65.0, inst='cellos', pitch='A2', dur=1.7, vel=.3, pan=0, attack=.02, gain=.32))

mix = S.render(E, dur=DUR, master=False)
mix = S.room(mix, size=.65, mix=.24)
n = min(len(mix), len(bus))
mix = mix[:n] + bus[:n]
f = int(0.3 * SR)
mix[-f:] *= np.linspace(1, 0, f)[:, None]  # 0.3 s declick only: the button is the ending, not a fade
mix = mix / max(1e-9, np.abs(mix).max()) * .9  # tools/score.sh sets loudness and true peak
out = sys.argv[1] if len(sys.argv) > 1 else 'score.wav'
sf.write(out, mix.astype(np.float32), SR)
print('wrote', out, f'{n / SR:.2f}s', sorted({e['inst'] if isinstance(e, dict) else e[1] for e in E}))
