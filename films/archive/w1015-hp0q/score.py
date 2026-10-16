"""Score for 如果台北一年的雨全部變成雪. 90 BPM 4/4 → beat 0.667 s, bar 2.667 s, D minor.
Cuts (= timeline.ts, in bars): 0 2 5 8 12 15 18 21 25 → s: 0 5.33 13.33 21.33 32 40 48 56 66.67.
Rain noise on the rainy street (hook, rain scene, and the last second, so the replay is seamless);
one note per month as the tank fills; one vibraphone note per floor as the snow rises; a tonic cadence on the payoff;
the last bar is an A pickup back into bar 1's Dm."""
import sys, os
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt

LIB = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'lib'))
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio import sfx as X
from core.audio.sfx import SR, add

S.seed(15)
BEAT = 60 / 90
BAR = 4 * BEAT
DUR = 25 * BAR
E = []
bus = np.zeros((int(DUR * SR), 2), np.float32)
b = lambda n: n * BAR  # bar → seconds
F = lambda fr: fr / 30  # frames → seconds

CH = {  # bass root, pad voicing
    'Dm': ('D2', ['D4', 'F4', 'A4']),
    'Bb': ('Bb1', ['D4', 'F4', 'Bb4']),
    'F': ('F2', ['C4', 'F4', 'A4']),
    'C': ('C2', ['C4', 'E4', 'G4']),
    'Gm': ('G1', ['D4', 'G4', 'Bb4']),
    'A': ('A1', ['C#4', 'E4', 'A4']),
}
ARP = {  # upright 8th-note arpeggio, two octaves
    'Dm': ['D3', 'A3', 'D4', 'F4', 'A4', 'F4', 'D4', 'A3'],
    'Bb': ['Bb2', 'F3', 'Bb3', 'D4', 'F4', 'D4', 'Bb3', 'F3'],
    'F': ['F2', 'C3', 'F3', 'A3', 'C4', 'A3', 'F3', 'C3'],
    'C': ['C3', 'G3', 'C4', 'E4', 'G4', 'E4', 'C4', 'G3'],
    'Gm': ['G2', 'D3', 'G3', 'Bb3', 'D4', 'Bb3', 'G3', 'D3'],
    'A': ['A2', 'E3', 'A3', 'C#4', 'E4', 'C#4', 'A3', 'E3'],
}
PROG = ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'Gm', 'A',  # hook, rain, fluff
        'Dm', 'Bb', 'Dm', 'Bb',  # rise (bar 10 = floor 8 lands)
        'Dm', 'F', 'C', 'Dm', 'Bb', 'C',  # aomori, record
        'Gm', 'Bb', 'A',  # twist
        'A', 'Dm', 'Dm', 'A']  # end: riser, payoff cadence, ring, pickup back to bar 1


def pad(t, ch, d, vel=.3, inst='violas', gain=.5):
    for i, p in enumerate(CH[ch][1]):
        E.append(dict(t=t, inst=inst, pitch=p, dur=d, vel=vel, pan=(-.4, 0, .4)[i], attack=.6, gain=gain))


def low(t, ch, d, vel=.45, inst='contrabass', gain=.6):
    E.append(dict(t=t, inst=inst, pitch=CH[ch][0], dur=d, vel=vel, pan=.1, attack=.25, gain=gain))


def arp(t, ch, vel=.32, gain=.5, upto=8):
    for k, p in enumerate(ARP[ch][:upto]):
        E.append((t + k * BEAT / 2, 'upright', p, .6, vel * (1.1 if k == 0 else .9), (-.25, .25)[k % 2], gain))


def hit(t, v=1.0, pitch='D3'):
    E.append((t, 'timpani', pitch, 2.0, .9 * v, 0, .9))
    E.append((t, 'gran_cassa', None, None, .8 * v, 0, .8))


# ---------- hook + rain + fluff (bars 0–7) ----------
for i in range(8):
    t, ch = b(i), PROG[i]
    pad(t, ch, BAR + .25, vel=.26 if i < 5 else .3)
    low(t, ch, BAR + .15, vel=.38)
    if i not in (3,):  # bar 3 belongs to the month drops
        arp(t, ch, vel=.3 if i < 5 else .26, upto=8 if i != 2 else 4)
# question lands: a little glint
E.append((F(22), 'glockenspiel', 'A6', 1.0, .35, .2, .45))
E.append((F(22) + BEAT / 2, 'glockenspiel', 'D7', 1.2, .3, -.2, .4))
# rain scene: one marimba note per month (8th notes), louder for the wetter months
MONTHS = [90.5, 143.2, 157.2, 152.5, 239.9, 345.0, 226.1, 337.8, 315.2, 150.2, 83.2, 88.7]
SCALE = ['D4', 'E4', 'F4', 'G4', 'A4', 'Bb4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5']
for m, (mm, p) in enumerate(zip(MONTHS, SCALE)):
    t = b(2) + F(40 + 10 * m)
    v = .25 + .45 * (mm / 345)
    E.append((t, 'marimba', p, .5, v, (-.3, .3)[m % 2], .55))
    E.append((t, 'harp', p, .8, v * .6, 0, .35))
E.append((b(2) + F(170), 'hand_chimes', 'A5', 2.0, .35, 0, .45))  # "taller than a person"
# fluff: the snow column grows (f 48–118), × 10 pops on beat 6
for k in range(10):
    E.append((b(5) + F(48) + k * BEAT / 3, 'glockenspiel', ['A5', 'D6', 'F6', 'A6', 'D7'][k % 5], .6, .22 + .02 * k, (-.3, .3)[k % 2], .4))
E.append((b(5) + F(120), 'sus_cymbal', 'stick', None, .35, 0, .4))
for p in ['D5', 'F5', 'A5']:
    E.append((b(5) + F(120), 'vibraphone_hard', p, 2.0, .5, 0, .5))
for t in (b(2), b(5)):
    hit(t, .45)

# ---------- rise (bars 8–11) ----------
for i in range(8, 12):
    t, ch = b(i), PROG[i]
    pad(t, ch, BAR + .25, vel=.42, inst='violins', gain=.45)
    pad(t, ch, BAR + .25, vel=.38, inst='violas', gain=.4)
    low(t, ch, BAR + .15, vel=.55)
    for k in range(8):  # driving cello spiccato 8ths
        E.append((t + k * BEAT / 2, 'cellos_spic', CH[ch][0].replace('1', '2') if k % 2 == 0 else CH[ch][1][0].replace('4', '3'), .3, .45, -.2, .45))
FLOORS = ['D5', 'E5', 'F5', 'G5', 'A5', 'Bb5', 'C6', 'D6']
for n, p in enumerate(FLOORS):  # floor n+1 is entered at RISE0 + n·BEAT (= every beat from 22.0 s)
    t = b(8) + F(20 + 20 * n)
    E.append((t, 'vibraphone_hard', p, 1.2, .45 + .04 * n, .15, .55))
    if n >= 3:
        E.append((t, 'glockenspiel', p, 1.0, .3 + .03 * n, -.15, .35))
E.append((b(8) + F(20), 'sus_cymbal', 'cresc', None, .5, 0, .45))
hit(b(8), .8)
hit(b(10), 1.0)  # floor 8
E.append((b(10), 'tubular_bells', 'D5', 3.0, .4, 0, .35))
for p in ['D3', 'A3', 'D4']:
    E.append((b(10), 'horn', p, BAR * 1.5, .45, 0, .45))

# ---------- aomori + record (bars 12–17) ----------
MEL = {12: ['A4', 'D5', 'E5', 'F5'], 13: ['E5', 'C5', 'A4', None], 14: ['G4', 'C5', 'E5', 'G5'],
       15: ['F5', 'E5', 'D5', 'A4'], 16: ['Bb4', 'D5', 'F5', 'D5'], 17: ['E5', 'G5', 'E5', None]}
for i in range(12, 18):
    t, ch = b(i), PROG[i]
    pad(t, ch, BAR + .25, vel=.38)
    pad(t, ch, BAR + .25, vel=.3, inst='cellos', gain=.35)
    low(t, ch, BAR + .15, vel=.5)
    arp(t, ch, vel=.32)
    for k, p in enumerate(MEL[i]):
        if p:
            E.append(dict(t=t + k * BEAT, inst='flute', pitch=p, dur=BEAT * (1.9 if MEL[i][min(3, k + 1)] is None and k < 3 else .95), vel=.42, pan=.1, attack=.04, gain=.45))
hit(b(12), .7)
hit(b(15), .7)
E.append((b(12) + F(56), 'sus_cymbal', 'cresc', None, .35, 0, .35))  # Taipei bar grows past Aomori
E.append((b(12) + F(140), 'timpani', 'A2', 1.5, .6, 0, .7))  # "4×"
E.append((b(12) + F(140), 'glockenspiel', 'A6', 1.0, .35, 0, .4))
E.append((b(15) + F(10), 'sus_cymbal', 'cresc', None, .35, 0, .35))  # Mt. Baker bar
E.append((b(15) + F(120), 'timpani', 'D3', 1.5, .6, 0, .7))  # "80%"
E.append((b(15) + F(120), 'glockenspiel', 'D7', 1.0, .35, 0, .4))

# ---------- twist (bars 18–20): it thins out, then the cold ----------
for i in range(18, 21):
    t, ch = b(i), PROG[i]
    pad(t, ch, BAR + .25, vel=.24, inst='violins', gain=.35)
    low(t, ch, BAR + .15, vel=.4, inst='cellos', gain=.45)
    for k in (0, 3, 4, 6):
        E.append((t + k * BEAT / 2, 'violins_pizz', ARP[ch][2 + k % 4], .4, .35, (-.3, .3)[k % 2], .4))
E.append((b(18), 'timpani', 'G2', 2.0, .5, 0, .6))
E.append((b(18), 'gran_cassa', None, None, .4, 0, .5))
for k, p in enumerate(['E5', 'A5', 'C#6', 'E6']):  # "缺的只是冷": glassy, cold
    E.append((b(18) + F(128) + k * .06, 'hand_chimes', p, 2.5, .4, (-.3, -.1, .1, .3)[k], .45))
    E.append((b(18) + F(128) + k * .06, 'vibraphone_bowed', p, 2.5, .3, 0, .35))

# ---------- end (bars 21–24) ----------
# bar 21: the snow shoots up: A pedal, strings tremolo crescendo, riser
for p in ['C#4', 'E4', 'A4']:
    E.append(dict(t=b(21), inst='violins_trem', pitch=p, dur=BAR + .1, vel=.5, pan=0, attack=1.2, gain=.45))
low(b(21), 'A', BAR + .1, vel=.55)
E.append((b(21), 'timpani', 'A2', 1.0, .5, 0, .6))
E.append((b(21) + .4, 'sus_cymbal', 'cresc', None, .55, 0, .5))
E.append((b(21) + BAR - 1.4, 'gran_cassa', 'roll', None, .45, 0, .45))
add(bus, X.whoosh(1.4, .5), b(21) + BAR - 1.3, .35)
# bar 22: payoff — tonic cadence with a hit, left to ring through bar 23
T0 = b(22)
hit(T0, 1.2)
E.append((T0, 'crash', None, None, .55, 0, .45))
E.append((T0, 'tubular_bells', 'D5', 5.5, .5, 0, .5))
E.append((T0, 'tubular_bells', 'A4', 5.5, .35, .2, .35))
for p in ['D3', 'A3', 'D4', 'F4']:
    E.append((T0, 'horn', p, 4.6, .55, 0, .45))
pad(T0, 'Dm', 5.2, vel=.45, inst='violins', gain=.5)
pad(T0, 'Dm', 5.2, vel=.4)
low(T0, 'Dm', 5.2, vel=.6)
for k, p in enumerate(['D4', 'F4', 'A4', 'D5', 'F5', 'A5', 'D6']):
    E.append((T0 + k * .05, 'harp', p, 3.0, .45, (-.3 + .1 * k), .45))
for k, p in enumerate(['D7', 'A6', 'F6', 'D6']):  # a quiet glint while it holds
    E.append((T0 + BAR + k * BEAT, 'glockenspiel', p, .8, .2, (-.2, .2)[k % 2], .3))
# bar 24: it melts back to rain — soft A pickup into bar 1's Dm
pad(b(24), 'A', BAR, vel=.24)
low(b(24), 'A', BAR, vel=.35)
arp(b(24), 'A', vel=.27)
for k, p in enumerate(['A5', 'E5', 'C#5', 'A4', 'E4']):  # melt: descending harp (f 284–314)
    E.append((b(21) + F(284) + k * .2, 'harp', p, 1.2, .35, (.3 - .15 * k), .4))

mix = S.render(E, dur=DUR, master=False)
mix = S.room(mix, size=.65, mix=.22)
n = min(len(mix), len(bus))
mix = mix[:n] + bus[:n]

# rain: band-passed noise with droplet flicker. Full at 0 s, fades under the fluff cut; returns over the last second.
rng = np.random.default_rng(7)
N = n
noise = rng.standard_normal((N, 2)).astype(np.float32)
noise = sosfilt(butter(2, [700, 7000], btype='band', fs=SR, output='sos'), noise, axis=0)
flick = sosfilt(butter(1, 30, fs=SR, output='sos'), np.abs(rng.standard_normal(N)))
noise *= (0.7 + 0.6 * flick / max(1e-9, flick.std() * 3))[:, None]
tt = np.arange(N) / SR
env = np.interp(tt, [0, b(4.5), b(5), b(21) + F(290), DUR], [1, 1, 0, 0, 1])
noise *= env[:, None]
peak = np.abs(mix).max()
mix = mix + noise / max(1e-9, np.abs(noise).max()) * peak * .13

f = int(0.02 * SR)
mix[-f:] *= np.linspace(1, 0, f)[:, None]  # tiny declick only: the cadence is the ending, not a fade
mix = mix / max(1e-9, np.abs(mix).max()) * .9  # tools/score.sh sets loudness and true peak
out = sys.argv[1] if len(sys.argv) > 1 else 'score.wav'
sf.write(out, mix.astype(np.float32), SR)
print('wrote', out, f'{n / SR:.2f}s', sorted({e['inst'] if isinstance(e, dict) else e[1] for e in E}))
