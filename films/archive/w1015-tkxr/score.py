"""Score for 如果蟑螂跟人一樣大. 120 BPM 4/4 → beat 0.5 s, bar 2 s.
Cuts (= timeline.ts): 0 6 14 24 34 42 52 64.
A-minor scuttle: pizzicato + marimba ostinato, clicks for legs. Hits on the cuts, the 230 km/h needle lands on 20.0,
the start gun at 25.0, the rear-up headline at 46.0, the V–i cadence on the payoff at 52.0, and the last bar (E7)
is a pickup back into bar 1's A minor for the replay."""
import sys, os
import numpy as np, soundfile as sf

LIB = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'lib'))
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio import sfx as X
from core.audio.sfx import SR, add

S.seed(23)
DUR, BEAT, BAR = 64.0, 0.5, 2.0
E = []
bus = np.zeros((int(DUR * SR), 2), np.float32)

# root (contrabass), fifth, pad triad, ostinato cell
CH = {
    'Am': ('A1', 'E2', ['C4', 'E4', 'A4'], ['A4', 'C5', 'E5', 'C5']),
    'F': ('F2', 'C3', ['C4', 'F4', 'A4'], ['A4', 'C5', 'F5', 'C5']),
    'Dm': ('D2', 'A2', ['D4', 'F4', 'A4'], ['A4', 'D5', 'F5', 'D5']),
    'E': ('E2', 'B2', ['B3', 'E4', 'G#4'], ['G#4', 'B4', 'E5', 'B4']),
}
TIMP = {'Am': 'A2', 'F': 'F2', 'Dm': 'D3', 'E': 'E3'}
#        hook          real                  scale                       race                         hide                  twist                       end
BARS = ['Am', 'Am', 'E', 'Am', 'F', 'Dm', 'E', 'Am', 'F', 'E', 'Am', 'E', 'Am', 'F', 'Dm', 'E', 'Am', 'Am', 'F', 'Dm', 'E', 'Am', 'F', 'Dm', 'E', 'E',
        'Am', 'Am', 'F', 'Am', 'Am', 'E']
assert len(BARS) == 32


def ev(t, inst, pitch, d, vel, pan=0, gain=1.0, attack=None):
    e = dict(t=t, inst=inst, pitch=pitch, dur=d, vel=vel, pan=pan, gain=gain)
    if attack is not None:
        e['attack'] = attack
    E.append(e)


def pad(t, ch, d, vel=.3, inst='violas', gain=.45):
    for i, p in enumerate(CH[ch][2]):
        ev(t, inst, p, d, vel, (-.4, 0, .4)[i], gain, attack=.4)


def low(t, ch, d, vel=.45, gain=.55):
    ev(t, 'contrabass', CH[ch][0], d, vel, .1, gain, attack=.15)


def pizz_bass(t, ch, vel=.55):  # 8ths: root root fifth root ...
    r, f5 = CH[ch][0], CH[ch][1]
    for b, p in enumerate([r, r, f5, r, r, f5, r, f5]):
        ev(t + b * BEAT / 2, 'contrabass_pizz', p, .3, vel * (1 if b % 2 == 0 else .75), .1, .7)


def scuttle(t, ch, vel=.32, inst='marimba', sixteenths=False):
    cell = CH[ch][3]
    step = BEAT / 4 if sixteenths else BEAT / 2
    for k in range(int(BAR / step)):
        ev(t + k * step, inst, cell[k % 4], .25, vel * (1 if k % 2 == 0 else .8), (-.3, .3)[k % 2], .4)


def clicks(t, vel=.25):  # legs on lino
    for k in range(16):
        if k % 4 != 2:
            E.append((t + k * BEAT / 4, 'woodblock', ('a', 'b', 'c')[k % 3], None, vel * (1 if k % 4 == 0 else .7), (-.4, .4)[k % 2], .35))


def hit(t, ch='Am', v=1.0):
    E.append((t, 'timpani', TIMP[ch], 2.0, .9 * v, 0, .9))
    E.append((t, 'gran_cassa', None, None, .8 * v, 0, .8))


def backbeat(t, vel=.5):
    for b in range(4):
        E.append((t + b * BEAT, 'bass_drum' if b % 2 == 0 else 'snare', None if b % 2 == 0 else 'on', None, vel, 0, .55))


# ---- hook 0–6: low, mysterious; the roach swells up the wall ----
for i in range(3):
    t, ch = i * BAR, BARS[i]
    low(t, ch, BAR + .1, vel=.5)
    pad(t, ch, BAR + .2, vel=.22, inst='cellos', gain=.4)
    for k, p in enumerate(CH[ch][3][:2] * 2):
        ev(t + k * BEAT, 'violins_pizz', p, .3, .35, (-.2, .2)[k % 2], .4)
E.append((0.0, 'timpani', 'A2', 2.0, .55, 0, .7))
add(bus, X.whoosh(1.2, .5), 0.25, .45)
E.append((1.5, 'sus_cymbal', 'hit', None, .35, .2, .35))
for k, p in enumerate(['E4', 'G#4', 'B4', 'D5']):  # bar 3 (E) climbs into the real-roach scene
    ev(4.0 + k * BEAT, 'marimba', p, .4, .35, (-.2, .2)[k % 2], .4)

# ---- real 6–14: the scuttle starts; dash at 9.0, the 1.5 m/s pops at 9.5 ----
for i in range(3, 7):
    t, ch = i * BAR, BARS[i]
    pizz_bass(t, ch, .5)
    scuttle(t, ch, .3)
    clicks(t, .2)
    pad(t, ch, BAR + .2, vel=.2, gain=.3)
hit(6.0, 'Am', .7)
add(bus, X.whoosh(.45, .7), 8.8, .6, .4)
for k, p in enumerate(['G5', 'A5', 'C6', 'E6', 'G6', 'A6']):
    ev(8.95 + k * .03, 'xylophone', p, .2, .45, .5, .35)
add(bus, X.ding(.6), 9.47, .35)

# ---- scale 14–24: build while the needle sweeps 17→20; it lands on 20.0 ----
for i in range(7, 12):
    t, ch = i * BAR, BARS[i]
    low(t, ch, BAR + .1, vel=.5)
    pizz_bass(t, ch, .45)
    scuttle(t, ch, .3, sixteenths=(i in (8, 9)))
    pad(t, ch, BAR + .2, vel=.28 if i < 10 else .35, gain=.45)
hit(14.0, 'Am', .8)
for k in range(12):  # 17–20 tremolo swell
    ev(17.0 + k * .25, 'violins_trem', ['E4', 'G#4', 'B4'][k % 3], .3, .2 + k * .04, (-.3, .3)[k % 2], .4)
E.append((18.0, 'snare', 'roll', None, .55, 0, .5))
E.append((18.0, 'timpani', 'E3', 2.0, .5, 0, .6))
add(bus, X.whoosh(1.2, .8), 18.85, .55)
hit(20.0, 'Am', 1.1)
E.append((20.0, 'crash', None, None, .7, .1, .6))
for i, p in enumerate(['A4', 'C5', 'E5']):
    ev(20.0, 'trumpet', p, 1.4, .55, (-.3, 0, .3)[i], .45, attack=.02)
ev(20.0, 'tubular_bells', 'A4', 3.0, .4, 0, .35)

# ---- race 24–34: groove; gun at 25.0, finish at 26.57 ----
for i in range(12, 17):
    t, ch = i * BAR, BARS[i]
    pizz_bass(t, ch, .55)
    scuttle(t, ch, .32, sixteenths=(i == 12))
    clicks(t, .22)
    if i >= 13:
        backbeat(t, .45)
    pad(t, ch, BAR + .2, vel=.22, gain=.3)
hit(24.0, 'Am', .8)
E.append((25.0, 'snare', 'on', None, 1.0, 0, .8))
E.append((25.0, 'claps', 'group', None, .8, 0, .6))
add(bus, X.whoosh(1.6, .9), 25.0, .6, .3)
add(bus, X.ding(.8), 26.57, .45)
E.append((26.57, 'glockenspiel', 'E6', .8, .5, .3, .4))

# ---- hide 34–42: sneaky, thinner; squash at 36.2, slide 37.2–40 ----
for i in range(17, 21):
    t, ch = i * BAR, BARS[i]
    pizz_bass(t, ch, .42)
    for k in range(4):
        ev(t + k * BEAT, 'cellos_pizz', CH[ch][3][k], .3, .4, (-.25, .25)[k % 2], .45)
    ev(t, 'vibraphone_bowed', CH[ch][2][2], BAR, .3, -.2, .35)
hit(34.0, 'Am', .6)
add(bus, X.creak(.6), 36.2, .5)
for k, p in enumerate(['E3', 'D3', 'C3', 'B2', 'A2']):  # sliding under: low glide down
    ev(37.2 + k * .55, 'cellos', p, .6, .35, -.2, .4, attack=.1)
E.append((40.0, 'sus_cymbal', 'scrape', None, .3, .3, .35))

# ---- twist 42–52: tension, rear-up at 44.33, headline hit at 46.0, dominant build into the cadence ----
for i in range(21, 26):
    t, ch = i * BAR, BARS[i]
    low(t, ch, BAR + .1, vel=.55)
    pizz_bass(t, ch, .55)
    scuttle(t, ch, .34, sixteenths=(i >= 22))
    clicks(t, .25)
    pad(t, ch, BAR + .2, vel=.3, inst='violins' if i >= 23 else 'violas', gain=.4)
    if i >= 23:
        backbeat(t, .5)
hit(42.0, 'Am', .8)
add(bus, X.whoosh(.9, .7), 44.2, .5)
hit(46.0, 'Dm', .95)
E.append((46.0, 'crash', None, None, .65, -.1, .55))
for i, p in enumerate(['D4', 'F4', 'A4']):
    ev(46.0, 'horn', p, 1.6, .5, (-.3, 0, .3)[i], .45)
E.append((50.0, 'snare', 'roll', None, .6, 0, .5))
E.append((50.0, 'timpani', 'E3', 2.0, .6, 0, .7))
add(bus, X.whoosh(1.4, .8), 50.6, .5)

# ---- end 52–64: V–i cadence on the payoff; deflate at 54.2; rings; bar 32 (E7) leads back to bar 1 ----
hit(52.0, 'Am', 1.25)
E.append((52.0, 'crash', None, None, .7, 0, .6))
ev(52.0, 'tubular_bells', 'A4', 6.0, .5, 0, .45)
for i, p in enumerate(['A3', 'C4', 'E4', 'A4']):
    ev(52.0, 'upright', p, 6.0, .55, (-.3, -.1, .1, .3)[i], .5)
for i, p in enumerate(['A4', 'C5', 'E5']):
    ev(52.0, 'trumpet', p, 2.2, .62, (-.3, 0, .3)[i], .5, attack=.02)
for i, p in enumerate(['A3', 'C4', 'E4']):
    ev(52.0, 'horn', p, 4.0, .55, (-.2, 0, .2)[i], .5)
pad(52.0, 'Am', 8.0, vel=.32, gain=.5)
pad(52.0, 'Am', 8.0, vel=.25, inst='cellos', gain=.35)
low(52.0, 'Am', 8.0, vel=.55)
for k, p in enumerate(['C7', 'A6', 'E6', 'C6', 'A5', 'E5', 'C5', 'A4']):  # the roach shrinks back to 4 cm
    ev(54.2 + k * .07, 'xylophone', p, .2, .45 - k * .03, .35, .35)
add(bus, X.pop(.5), 54.8, .3, .35)
ev(55.5, 'glockenspiel', 'A6', 1.5, .35, .3, .3)
for k, p in enumerate(['A4', 'C5', 'E5', 'C5']):  # bars 29–31: quiet pizz keeps the pulse under the hold
    for b in (56.0, 58.0):
        ev(b + k * BEAT, 'violins_pizz', p, .3, .22, (-.2, .2)[k % 2], .3)
pad(60.0, 'Am', 2.0, vel=.2, gain=.35)
low(60.0, 'Am', 2.0, vel=.35)
# pickup bar (62–64): E7 climbs back into bar 1's A minor
low(62.0, 'E', 2.0, vel=.4)
pad(62.0, 'E', 2.0, vel=.2, inst='cellos', gain=.35)
for k, p in enumerate(['E4', 'G#4', 'B4', 'D5']):
    ev(62.0 + k * BEAT, 'marimba', p, .4, .45, (-.2, .2)[k % 2], .45)
    ev(62.0 + k * BEAT, 'violins_pizz', p, .3, .42, (.2, -.2)[k % 2], .4)
    ev(62.0 + k * BEAT, 'contrabass_pizz', ('E2', 'E2', 'B2', 'E2')[k], .3, .5, .1, .6)
E.append((63.5, 'woodblock', 'a', None, .25, .3, .3))

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
