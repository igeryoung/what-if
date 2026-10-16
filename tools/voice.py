"""Narration: films/<id>/narration.json + score.wav → films/<id>/mix_<lang>.wav (the voice over the ducked score, −14 LUFS,
true peak −1.5 dB). The engine plays mix_<lang>.wav instead of score.wav for that language.
    sh tools/voice.sh <id> [--lang zh,en]          (run from the repo root, after sh tools/score.sh <id>)
narration.json = {"zh": [{"at": 0.4, "text": "如果你家的貓跟老虎一樣大？"}, ...], "en": [{"at": 0.4, "text": "What if…?"}, ...]}
  at    start in film seconds. Lines are spoken in order; each must end at least 0.25 s before the next one starts,
        and the last one at least 1 s before the end of the film (the replay cut stays clean).
  say   (optional) what the voice reads when it should differ from text, e.g. "百分之九十五點六" for "95.6%".
  rate  (optional) "+8%" faster or "-5%" slower for this line.
  voice (optional) override; the defaults are zh-TW-HsiaoChenNeural and en-US-AndrewNeural.
Voices come from Microsoft's online edge-tts service via lib/core/tts/tts_zh.py, cached in films/<id>/voice/<lang>/.cache,
so re-running after a small change only fetches the changed lines.
Prints one cue table per language (start, length, end, room before the next line). If any line is too long it exits 1
without writing that language's mix: shorten the line, move its `at`, or speed it up with "rate".
"""
import sys, os, json, re, subprocess, argparse
import numpy as np, soundfile as sf
from scipy.signal import resample_poly

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TTS = os.path.join(ROOT, 'lib', 'core', 'tts', 'tts_zh.py')
VOICES = {'zh': 'zh-TW-HsiaoChenNeural', 'en': 'en-US-AndrewNeural'}
SR = 48000
GAP, TAIL = 0.25, 1.0           # free seconds required after each line / at the end of the film
VOICE_LUFS = -16.0              # voice level before the final normalization
MUSIC_DB, DUCK_DB = -2.0, -10.0  # the score sits 2 dB lower overall and 10 dB lower again under the voice
DUCK_IN, DUCK_OUT = 0.15, 0.5    # ramp down before a line starts, back up after it ends


def ffmpeg_lufs(path):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True)
    i = re.findall(r'^\s+I:\s+(-?[\d.]+) LUFS', r.stderr, re.M)
    p = re.findall(r'^\s+Peak:\s+(-?[\d.inf]+) dBFS', r.stderr, re.M)
    return (float(i[-1]) if i else None), (p[-1] if p else '?')


def loudnorm(raw, out):
    """Two-pass loudnorm to −14 LUFS / −1.5 dBTP, same as tools/score.sh."""
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True)
    j = json.loads(r.stderr[r.stderr.rindex('{'):r.stderr.rindex('}') + 1])
    m = f"measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}"
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', f'loudnorm=I=-14:TP=-1.5:LRA=11:{m}:linear=true', '-ar', str(SR), out], check=True)


def speak(lang, lines, vdir):
    """Runs tts_zh.py for one language; returns the 48 kHz mono clips in line order."""
    os.makedirs(vdir, exist_ok=True)
    for n in os.listdir(vdir):
        if n.endswith('.wav'): os.remove(os.path.join(vdir, n))   # clips of lines that no longer exist
    req = []
    for k, L in enumerate(lines):
        q = {'id': f'{k + 1:02d}', 'text': L['text'], 'voice': L.get('voice', VOICES.get(lang, VOICES['en']))}
        for f in ('say', 'rate', 'pitch'):
            if f in L: q[f] = L[f]
        req.append(q)
    lj = os.path.join(vdir, 'lines.json')
    json.dump(req, open(lj, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    r = subprocess.run([sys.executable, '-I', TTS, lj, vdir], capture_output=True, text=True)
    if r.returncode:
        sys.stderr.write(r.stdout[-2000:] + r.stderr[-2000:])
        sys.exit(r.returncode)
    clips = []
    for q in req:
        y, sr = sf.read(os.path.join(vdir, q['id'] + '.wav'), dtype='float32')
        clips.append(resample_poly(y, SR, sr).astype(np.float32) if sr != SR else y)
    return clips


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('id'); ap.add_argument('--lang')
    a = ap.parse_args()
    if not re.fullmatch(r'[a-z0-9-]+', a.id): sys.exit(f'voice: bad film id {a.id!r}')
    film = os.path.join(ROOT, 'films', a.id)
    nj, score = os.path.join(film, 'narration.json'), os.path.join(film, 'score.wav')
    if not os.path.exists(nj): sys.exit(f'voice: no {os.path.relpath(nj, ROOT)}')
    if not os.path.exists(score): sys.exit(f'voice: no {os.path.relpath(score, ROOT)}; run sh tools/score.sh {a.id} first')
    narr = json.load(open(nj, encoding='utf-8'))
    langs = a.lang.split(',') if a.lang else [k for k in narr if re.fullmatch(r'[a-z]{2}', k)]
    music, sr = sf.read(score, dtype='float32', always_2d=True)
    if sr != SR: music = resample_poly(music, SR, sr, axis=0).astype(np.float32)
    total = len(music) / SR
    failed = False
    for lang in langs:
        lines = narr.get(lang)
        if not lines: sys.exit(f'voice: narration.json has no "{lang}" lines')
        ats = [float(L['at']) for L in lines]
        if any(b <= x for x, b in zip(ats, ats[1:])) or ats[0] < 0: sys.exit(f'voice: "{lang}" lines must be in order of "at", starting at 0 or later')
        clips = speak(lang, lines, os.path.join(film, 'voice', lang))
        print(f'{lang}   #     at    len    end   room  text')
        bad = 0
        for k, (L, y) in enumerate(zip(lines, clips)):
            end = ats[k] + len(y) / SR
            room = (ats[k + 1] - GAP if k + 1 < len(lines) else total - TAIL) - end
            flag = '' if room >= 0 else ('  ← overlaps the next line' if k + 1 < len(lines) else '  ← runs into the last second')
            bad += room < 0
            print(f'    {k + 1:2d} {ats[k]:6.2f} {len(y) / SR:6.2f} {end:6.2f} {room:+6.2f}  {L["text"].replace(chr(10), " ")[:60]}{flag}')
        if bad:
            print(f'{lang}: {bad} line(s) too long; shorten them, move "at", or add "rate": "+8%". mix_{lang}.wav not written.\n')
            failed = True; continue
        voice = np.zeros(len(music), np.float32)
        duck = np.zeros(len(music), np.float32)
        t = np.arange(len(music)) / SR
        for at, y in zip(ats, clips):
            i = int(round(at * SR)); y = y[:max(0, len(music) - i)]
            voice[i:i + len(y)] += y
            b = at + len(y) / SR
            w = np.clip((t - (at - DUCK_IN)) / DUCK_IN, 0, 1) * np.clip(((b + DUCK_OUT) - t) / DUCK_OUT, 0, 1)
            duck = np.maximum(duck, w.astype(np.float32))
        tmp = os.path.join(film, 'voice', lang, 'track.wav')
        sf.write(tmp, voice, SR, subtype='FLOAT')
        v_lufs, _ = ffmpeg_lufs(tmp)
        voice *= 10 ** ((VOICE_LUFS - v_lufs) / 20)
        g = 10 ** (DUCK_DB / 20)
        env = 10 ** (MUSIC_DB / 20) * (1 - (1 - g) * duck)
        mix = music * env[:, None] + voice[:, None]
        raw = os.path.join(film, 'voice', lang, 'mix_raw.wav')
        sf.write(raw, mix, SR, subtype='FLOAT')
        out = os.path.join(film, f'mix_{lang}.wav')
        loudnorm(raw, out)
        os.remove(raw)
        i, p = ffmpeg_lufs(out)
        print(f'{os.path.relpath(out, ROOT)}  {total:.2f} s  I: {i} LUFS  Peak: {p} dBFS  ({len(lines)} lines, voice {sum(len(y) for y in clips) / SR:.1f} s)\n')
    sys.exit(1 if failed else 0)


if __name__ == '__main__':
    main()
