"""Score for 如果蚊子跟鴿子一樣大 / What if mosquitoes were pigeon-sized?
120 BPM 4/4 → beat 0.5 s, bar 2 s, A minor. Cuts (= timeline.ts): 0 6 14 22 32 42 48 58 67.
Hook: a mosquito whine that drops into a giant's low buzz. Beats: pizzicato + marimba, sneaky and light.
Bag: the big hit lands on "one bite ≈ one bag of blood" (26.5 s). Body: a thud per bite (34.5–38.5).
See: the music stops, a bassoon tiptoes, the swatter SMACKs at 46.0. Tiny: a thin real whine, then a low
gong under 610,000 (52.0). End: Am cadence on the payoff (58), a soft ring under the closing line
(61.8–64.4), a button on its last word (65), then the Am rings out to the cut (no pickup)."""
import sys, os
import numpy as np, soundfile as sf

LIB = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'lib'))
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio import sfx as X
from core.audio.sfx import SR, add

S.seed(29)
DUR, BEAT, BAR = 67.0, 0.5, 2.0
E = []                                          # note events
bus = np.zeros((int(DUR * SR), 2), np.float32)  # sfx bus

CH = {  # bass root (contrabass F#1–B3), triad for pads, arpeggio tones
    'Am': ('A1', ['C4', 'E4', 'A4'], ['A3', 'C4', 'E4', 'C4']),
    'F': ('F2', ['C4', 'F4', 'A4'], ['F3', 'A3', 'C4', 'A3']),
    'Dm': ('D2', ['D4', 'F4', 'A4'], ['D3', 'F3', 'A3', 'F3']),
    'C': ('C2', ['C4', 'E4', 'G4'], ['C3', 'E3', 'G3', 'E3']),
    'E': ('E2', ['B3', 'E4', 'G#4'], ['E3', 'G#3', 'B3', 'G#3']),
}


_LV = {}


def lv(inst, p, ref=-26.0):
    """Gain that evens out sample loudness across pitches (contrabass E2 is ~20 dB quieter than A1)."""
    if (inst, p) not in _LV:
        x = S.note(inst, p, 1.0, .5, attack=.05)
        r = 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-9)
        _LV[inst, p] = float(np.clip(10 ** ((ref - r) / 20), .25, 6.0))
    return _LV[inst, p]


def pad(t, ch, d, vel=.3, inst='violas', gain=.5, attack=.5):
    for i, p in enumerate(CH[ch][1]):
        E.append(dict(t=t, inst=inst, pitch=p, dur=d, vel=vel, pan=(-.4, 0, .4)[i], attack=attack, gain=gain))


def low(t, ch, d, vel=.45, inst='contrabass', gain=.6):
    p = CH[ch][0]
    E.append(dict(t=t, inst=inst, pitch=p, dur=d, vel=vel, pan=.1, attack=.15, gain=gain * lv(inst, p)))


def pizz(t, ch, vel=.5, gain=.45, beats=8):
    """Eighth-note pizzicato arpeggio for one bar (sneaky mosquito steps)."""
    arp = CH[ch][2]
    for k in range(beats):
        inst = 'violins_pizz' if k % 2 else 'cellos_pizz'
        p = arp[k % 4]
        E.append((t + k * BEAT / 2, inst, p, .3, vel * (1 if k % 4 == 0 else .75), (-.3, .3)[k % 2], gain * lv(inst, p, -24)))


def hit(t, v=1.0, pitch='A2'):  # on scene cuts
    E.append((t, 'timpani', pitch, 2.0, .9 * v, 0, .9))
    E.append((t, 'gran_cassa', None, None, .8 * v, 0, .8))


def add_pan(buf, x, at, gain, pans):
    """Like sfx.add, but the pan follows `pans` (array over the sound, -1..1)."""
    i = int(at * SR)
    n = min(len(x), len(buf) - i)
    p = np.interp(np.arange(n), np.linspace(0, n, len(pans)), pans)
    buf[i:i + n, 0] += (x[:n] * gain * np.sqrt((1 - p) / 2)).astype(np.float32)
    buf[i:i + n, 1] += (x[:n] * gain * np.sqrt((1 + p) / 2)).astype(np.float32)


def buzz(d, f_start, f_end, glide=(0.0, 1.0), wob=.04, seed=0):
    """A wingbeat buzz: a harmonic-rich tone with a wandering pitch. f glides from f_start to f_end between
    the `glide` fractions of the duration. Returns mono."""
    r = np.random.default_rng(seed)
    n = int(d * SR)
    tt = np.arange(n) / SR
    g = np.clip((tt / d - glide[0]) / max(1e-6, glide[1] - glide[0]), 0, 1)
    g = g * g * (3 - 2 * g)
    f = f_start * (f_end / f_start) ** g
    wander = np.interp(tt, np.linspace(0, d, 12), r.uniform(-1, 1, 12))
    f = f * (1 + wob * wander + .012 * np.sin(2 * np.pi * 7 * tt))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = sum(np.sin(k * ph) / k ** 1.1 for k in range(1, 9))
    env = np.minimum(1, tt / .15) * np.minimum(1, (d - tt) / .35)
    return (x * env / 3).astype(np.float32)


# ---------- Hook 0–6: whine → the giant's low buzz; sneaky pizzicato over Am ----------
add_pan(bus, buzz(2.0, 610, 610, seed=1), 0.0, .10, [-.8, .2, .7])
add_pan(bus, buzz(4.0, 610, 82, glide=(0, .35), wob=.06, seed=2), 1.6, .16, [.6, .4])
for i, ch in enumerate(['Am', 'Am', 'F']):
    t = i * BAR
    low(t, ch, BAR, vel=.4, inst='contrabass_pizz', gain=.6)
    pizz(t, ch, vel=.45)
add(bus, X.whoosh(1.0, .5), 5.0, .4)

# ---------- Weight 6–14: playful; a rising glockenspiel sprinkle while the pigeon fills with dots ----------
hit(6, .55)
for i, ch in enumerate(['Am', 'F', 'C', 'E']):
    t = 6 + i * BAR
    low(t, ch, BAR, vel=.45, inst='contrabass_pizz', gain=.65)
    pizz(t, ch, vel=.5)
    for b in range(4):
        E.append((t + b * BEAT, 'marimba', CH[ch][1][b % 3], .4, .38, (-.3, .3)[b % 2], .32))
scale = ['A5', 'B5', 'C6', 'D6', 'E6', 'F6', 'G6', 'A6', 'B6', 'C7']
for k in range(20):                             # 8.33 → 11.67 s, dense then thinning like the count's ease-out
    tk = 8.33 + 3.3 * (k / 19) ** 1.7
    E.append((tk, 'glockenspiel', scale[min(9, k // 2)], .3, .25 + .01 * k, (-.5, .5)[k % 2], .22))
E.append((11.87, 'vibraphone', 'A5', 1.5, .45, 0, .35))

# ---------- Bite 14–22: the belly fills; cellos creep up, a slurp-like tremolo ----------
hit(14, .6)
for i, ch in enumerate(['Am', 'Am', 'F', 'E']):
    t = 14 + i * BAR
    low(t, ch, BAR + .1, vel=.5)
    pizz(t, ch, vel=.42, gain=.38)
for k, p in enumerate(['A3', 'C4', 'E4', 'G#4']):  # rising tremolo while the abdomen swells
    E.append(dict(t=15.0 + k * 1.5, inst='violins_trem', pitch=p, dur=1.6, vel=.3 + .05 * k, pan=.2, attack=.3, gain=.3))
E.append((14.8, 'xylophone', 'E6', .3, .5, 0, .35))
add(bus, X.pop(.5), 14.8, .3)
add(bus, X.whoosh(1.0, .7), 21.0, .55)       # riser into the big reveal

# ---------- Bag 22–32: full strings; the big hit on "one bite ≈ one bag of blood" at 26.5 ----------
hit(22, .85)
for i, ch in enumerate(['Am', 'Am', 'F', 'Dm', 'E']):
    t = 22 + i * BAR
    low(t, ch, BAR + .1, vel=.55)
    pad(t, ch, BAR + .2, vel=.32, inst='violins', gain=.42)
    pad(t, ch, BAR + .2, vel=.3, inst='violas', gain=.38)
    if i >= 2:
        pizz(t, ch, vel=.4, gain=.32)
for k in range(7):                              # counting up 22.5 → 25.7: marimba ticks
    E.append((22.5 + k * .5, 'marimba', ['A4', 'C5', 'E5', 'A5', 'C6', 'E6', 'A6'][k], .3, .42, (-.2, .2)[k % 2], .3))
E.append((26.5, 'timpani', 'A2', 2.5, 1.0, 0, 1.0))
E.append((26.5, 'gran_cassa', None, None, .95, 0, .9))
E.append((26.5, 'tubular_bells', 'A4', 4.0, .55, 0, .5))
E.append((26.5, 'sus_cymbal', 'hit', None, .5, 0, .4))
for p in ['A3', 'C4', 'E4']:
    E.append(dict(t=26.5, inst='horn', pitch=p, dur=3.0, vel=.5, pan=0, attack=.05, gain=.45))

# ---------- Body 32–42: a thud per bite, low strings tighten; danger at 39.0 ----------
hit(32, .6, pitch='D3')
for i, ch in enumerate(['Am', 'F', 'Dm', 'E', 'E']):
    t = 32 + i * BAR
    low(t, ch, BAR + .1, vel=.55)
    pad(t, ch, BAR + .2, vel=.28, inst='cellos', gain=.45)
for k, b in enumerate([34.5, 35.5, 36.5, 37.5, 38.5]):
    E.append((b, 'timpani', 'A2', 1.2, .55 + .08 * k, 0, .7))
    add(bus, X.heartbeat(.5 + .08 * k), b, .35 + .05 * k)
    E.append((b, 'violins_pizz', ['E5', 'F5', 'G#5', 'A5', 'B5'][k], .3, .5, .3, .35))
E.append(dict(t=39.0, inst='violins_trem', pitch='G#5', dur=2.8, vel=.45, pan=0, attack=.05, gain=.35))
E.append(dict(t=39.0, inst='violins_trem', pitch='B4', dur=2.8, vel=.4, pan=-.3, attack=.05, gain=.3))
E.append((39.0, 'gran_cassa', None, None, .7, 0, .6))
E.append((39.0, 'sus_cymbal', 'hit', None, .45, 0, .35))

# ---------- See 42–48: the music stops; a bassoon tiptoes; SMACK at 46.0 ----------
add_pan(bus, buzz(3.2, 78, 86, wob=.08, seed=3), 42.0, .16, [-.9, 0, .1])
for k, p in enumerate(['A2', 'G2', 'F2', 'E2']):
    E.append((42.0 + k * .5, 'bassoon_stac', p, .3, .5, 0, .5))
E.append((44.0, 'bassoon_stac', 'E3', .3, .4, 0, .45))
E.append((44.75, 'bassoon_stac', 'E3', .3, .4, 0, .45))
add(bus, X.whoosh(.55, .9), 45.47, .7)
add(bus, X.thump(1.0, 60), 46.0, .9)
add(bus, X.crash(1.0), 46.0, .6)
E.append((46.0, 'clash', 'short', None, .7, 0, .5))
E.append((46.0, 'gran_cassa', None, None, .9, 0, .8))
E.append((46.0, 'toms', 'low', None, .8, 0, .6))

# ---------- Tiny 48–58: a thin real whine, a speck; a low gong under 610,000 at 52.0 ----------
add_pan(bus, buzz(3.6, 590, 640, wob=.05, seed=4), 48.2, .05, [-.6, .7, -.3, .5])
low(48, 'Am', 4.0, vel=.35)
for k, (tk, p) in enumerate([(48.5, 'E6'), (49.5, 'C6'), (50.5, 'A5'), (51.0, 'B5')]):
    E.append((tk, 'glockenspiel', p, .4, .25, (-.3, .3)[k % 2], .2))
E.append((52.0, 'gong', None, None, .7, 0, .7))
E.append((52.0, 'timpani', 'A2', 2.5, .8, 0, .8))
for i, ch in enumerate(['Am', 'F', 'Dm']):
    t = 52 + i * BAR
    low(t, ch, BAR + .1, vel=.5)
    pad(t, ch, BAR + .2, vel=.3, inst='violins', gain=.4)
    pad(t, ch, BAR + .2, vel=.28, inst='cellos', gain=.35)
low(56, 'E', 2.1, vel=.55)
pad(56, 'E', 2.2, vel=.36, inst='violins', gain=.45)
for k, p in enumerate(['E4', 'G#4', 'B4', 'D5']):  # dominant run into the cadence
    E.append((56.0 + k * .5, 'marimba', p, .4, .45, (-.2, .2)[k % 2], .35))
add(bus, X.whoosh(1.0, .7), 57.0, .5)

# ---------- End 58–67: Am cadence on the payoff, ring under the closing line, button at 65, ring to the cut ----------
hit(58, 1.0)
E.append((58.0, 'tubular_bells', 'A4', 6.0, .6, 0, .5))
E.append((58.0, 'sus_cymbal', 'hit', None, .55, 0, .4))
pad(58, 'Am', 6.5, vel=.34, inst='violins', gain=.42, attack=.08)
pad(58, 'Am', 6.5, vel=.31, inst='violas', gain=.38, attack=.08)
low(58, 'Am', 6.5, vel=.5)
for p in ['A2', 'E3', 'A3']:
    E.append(dict(t=58.0, inst='horn', pitch=p, dur=4.0, vel=.48, pan=0, attack=.05, gain=.4))
E.append((59.13, 'xylophone', 'A5', .4, .4, .2, .3))     # second payoff line lands
for k, p in enumerate(['A3', 'C4', 'E4', 'C4', 'A3', 'C4', 'E4', 'C4']):  # under the closing line: the hook's pizzicato, softly
    E.append((62.0 + k * .25, 'violins_pizz' if k % 2 else 'cellos_pizz', p, .3, .28, (-.3, .3)[k % 2], .28))
# button (65): the slap line lands → timpani + pizz Am + glockenspiel, then everything rings out
hit(65.0, .75)
low(65.0, 'Am', .6, vel=.6, inst='contrabass_pizz', gain=.65)
for k, p in enumerate(['A3', 'C4', 'E4', 'A4']):
    E.append((65.0 + k * .012, 'violins_pizz', p, .4, .5, (-.3, -.1, .1, .3)[k], .4))
for k, p in enumerate(['A5', 'A6']):
    E.append((65.0, 'glockenspiel', p, 1.5, .45, (-.2, .2)[k], .35))
E.append(dict(t=65.0, inst='cellos', pitch='A2', dur=1.7, vel=.3, pan=0, attack=.02, gain=.35))

mix = S.render(E, dur=DUR, master=False)
mix = S.room(mix, size=.6, mix=.22)
n = min(len(mix), len(bus))
peak_music = np.abs(mix[:n]).max()
mix = mix[:n] + bus[:n] * peak_music       # sfx gains above are relative to the music's peak
f = int(0.3 * SR)
mix[-f:] *= np.linspace(1, 0, f)[:, None]  # 0.3 s declick only: the cadence is the ending, not a fade
mix = mix / max(1e-9, np.abs(mix).max()) * .9  # tools/score.sh sets loudness and true peak
out = sys.argv[1] if len(sys.argv) > 1 else 'score.wav'
sf.write(out, mix.astype(np.float32), SR)
print('wrote', out, f'{n / SR:.2f}s', sorted({e['inst'] if isinstance(e, dict) else e[1] for e in E}))
