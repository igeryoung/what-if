"""Score for the CPR short. 120 BPM = 2 beats/s = the CPR compression rate, so the
kick in the "how" section is literally the rhythm to press at.

    ../../lib/.venv/bin/python music/score.py public/score.wav

Timeline (seconds) must match src/timeline.ts.
"""
import sys, os
import numpy as np, soundfile as sf

LIB = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'lib'))
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio import sfx as X
from core.audio.sfx import SR, add, limit

S.seed(7)
DUR = 63.0
BEAT = 0.5
BAR = 2.0

CH = {  # voicings: (bass, pad triad, piano arp notes)
    'Am': ('A1', ['A3', 'C4', 'E4'], ['A3', 'E4', 'A4', 'C5', 'E5', 'C5', 'A4', 'E4']),
    'F':  ('F1', ['A3', 'C4', 'F4'], ['F3', 'C4', 'F4', 'A4', 'C5', 'A4', 'F4', 'C4']),
    'C':  ('C2', ['G3', 'C4', 'E4'], ['C4', 'G4', 'C5', 'E5', 'G5', 'E5', 'C5', 'G4']),
    'G':  ('G1', ['G3', 'B3', 'D4'], ['G3', 'D4', 'G4', 'B4', 'D5', 'B4', 'G4', 'D4']),
    'Fmaj7': ('F1', ['A3', 'C4', 'E4'], ['F3', 'C4', 'E4', 'A4', 'C5', 'A4', 'E4', 'C4']),
}

ev = []          # sampler events
buf = np.zeros((int(DUR * SR), 2), np.float32)   # sfx bus


def pad(t, ch, dur, vel=.32, inst='violas', oct_up=False):
    for i, p in enumerate(CH[ch][1]):
        if oct_up:
            p = p[:-1] + str(int(p[-1]) + 1)
        ev.append(dict(t=t, inst=inst, pitch=p, dur=dur, vel=vel, pan=(-.35, 0, .35)[i], attack=.6, gain=.55))


def cello(t, ch, dur, vel=.4):
    b = CH[ch][0]
    ev.append(dict(t=t, inst='cellos', pitch=b[:-1] + str(int(b[-1]) + 1), dur=dur, vel=vel, pan=-.1, attack=.4, gain=.7))


def arp(t, ch, bars=1, vel=.42, every=0.25, gain=.55):
    notes = CH[ch][2]
    n = int(bars * BAR / every)
    for k in range(n):
        v = vel * (1.0 if k % 4 == 0 else .78)
        ev.append((t + k * every, 'upright', notes[k % len(notes)], every * 2.2, v, .15 * np.sin(k), gain))


# ── 0–4.5 s  heartbeat, then it stops ───────────────────────────────────────
for k, t in enumerate([0.25, 1.25, 2.25, 3.25]):
    add(buf, X.heartbeat(.9 - .12 * k), t, .9)
ev.append((0.0, 'upright', 'E5', 3.0, .30, .2, .5))
ev.append((2.0, 'upright', 'C5', 3.0, .26, -.2, .5))
# flatline at ~4.4 s: a thin held tone (violins harmonic-ish high note)
ev.append(dict(t=4.3, inst='violins', pitch='A5', dur=1.8, vel=.25, pan=0, attack=.05, gain=.35))

# ── 6–22 s  "you'll most likely save family" — tender, building ──────────────
prog = ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G']
for i, ch in enumerate(prog):
    t = 6 + i * BAR
    arp(t, ch, vel=.36 + .02 * i, gain=.5)
    cello(t, ch, BAR + .3, vel=.35 + .02 * i)
    if i >= 2:
        pad(t, ch, BAR + .3, vel=.28 + .015 * i)
    if i >= 4:
        ev.append(dict(t=t, inst='contrabass', pitch=CH[ch][0], dur=BAR, vel=.45, pan=0, attack=.1, gain=.6))
# soft pulse from 14 s (half-time heartbeat feel)
for k in range(16):
    t = 14 + k * BEAT * 2
    add(buf, X.thump(.35, 60), t, .45)

# ── 22–26 s  breath before the instructions ─────────────────────────────────
pad(22, 'Am', 2.3, vel=.3)
pad(24, 'F', 2.2, vel=.32)
cello(22, 'Am', 4.2, .38)
ev.append((22.0, 'upright', 'A4', 2, .38, 0, .55))
ev.append((24.0, 'upright', 'C5', 2, .40, 0, .55))
ev.append((24.0, 'snare', 'roll', 2.0, .25, 0, .25))
add(buf, X.whoosh(.9, .5), 25.15, .5)

# ── 26–50 s  THE RHYTHM: kick on every beat = press on every beat ───────────
how = ['F', 'C', 'G', 'Am'] * 3
for i, ch in enumerate(how):
    t = 26 + i * BAR
    for b in range(4):
        tb = t + b * BEAT
        ev.append((tb, 'bass_drum', None, None, .78 if b % 2 == 0 else .66, 0, .9))
        ev.append((tb + .25, 'hihat', None, None, .32, .25, .4))
        if b in (1, 3):
            ev.append((tb, 'claps', None, None, .35, -.1, .32))
    ev.append(dict(t=t, inst='contrabass_pizz', pitch=CH[ch][0][:-1] + str(int(CH[ch][0][-1]) + 1), dur=.5, vel=.6, pan=0, gain=.8))
    ev.append(dict(t=t + 1.0, inst='contrabass_pizz', pitch=CH[ch][0][:-1] + str(int(CH[ch][0][-1]) + 1), dur=.5, vel=.5, pan=0, gain=.8))
    arp(t, ch, vel=.40, gain=.42)
    pad(t, ch, BAR + .2, vel=.30 + (.06 if i >= 4 else 0), inst='violins' if i >= 8 else 'violas', oct_up=i >= 8)
    cello(t, ch, BAR + .2, .42)
add(buf, X.whoosh(.6, .4), 49.4, .4)

# ── 50–55 s  "don't" list: same pulse, lighter ──────────────────────────────
for i, ch in enumerate(['F', 'G', 'Am']):
    t = 50 + i * BAR
    if t >= 55:
        break
    for b in range(4):
        tb = t + b * BEAT
        if tb < 55:
            ev.append((tb, 'bass_drum', None, None, .55, 0, .7))
    pad(t, ch, BAR + .2, vel=.32)
    cello(t, ch, BAR + .2, .4)
    ev.append((t, 'upright', CH[ch][2][4], 1.5, .45, 0, .55))

# ── 55–58.5 s  the law: held, calm ──────────────────────────────────────────
pad(55, 'F', 3.5, vel=.34)
cello(55, 'F', 3.5, .4)
ev.append((55.0, 'upright', 'A4', 2.5, .38, -.1, .55))
ev.append((56.5, 'upright', 'C5', 2.5, .36, .1, .55))

# ── 58.5–63 s  resolve to C, ring out ───────────────────────────────────────
for p, pan in [('C3', -.2), ('G3', .1), ('E4', -.1), ('G4', .2), ('C5', 0), ('D5', .3)]:
    ev.append((58.5, 'upright', p, 4.4, .5, pan, .55))
pad(58.5, 'C', 4.3, vel=.38, inst='violins', oct_up=True)
pad(58.5, 'C', 4.3, vel=.34)
cello(58.5, 'C', 4.3, .45)
ev.append(dict(t=58.5, inst='contrabass', pitch='C2', dur=4.3, vel=.45, pan=0, attack=.1, gain=.6))
ev.append((58.5, 'sus_cymbal', None, None, .3, 0, .35))

mix = S.render(ev, dur=DUR, master=False)
mix = S.room(mix, size=.55, mix=.2)
n = min(len(mix), len(buf))
mix = mix[:n] + buf[:n]
# fade tail
f = int(1.2 * SR)
mix[-f:] *= np.linspace(1, 0, f)[:, None]
mix = limit(mix / max(1e-9, np.abs(mix).max()) * .89)
out = sys.argv[1] if len(sys.argv) > 1 else 'score.wav'
os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
sf.write(out, mix.astype(np.float32), SR)
used = sorted({e['inst'] if isinstance(e, dict) else e[1] for e in ev})
open(os.path.join(os.path.dirname(os.path.abspath(out)), 'music_credits.txt'), 'w').write('\n'.join(S.credits(used)) if isinstance(S.credits(used), list) else str(S.credits(used)))
print('wrote', out, f'{n / SR:.2f}s', used)
