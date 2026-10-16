#!/bin/sh
# sh tools/score.sh <id>  : films/<id>/score.py → films/<id>/score.wav at -14 LUFS, true peak -1.5 dB (run from the repo root)
# Two-pass loudnorm: single-pass lands ~1 LU short of the target.
set -e
PY=lib/.venv/bin/python
dir=films/$1
raw=$dir/score_raw.wav
$PY -I $dir/score.py $raw
m=$(ffmpeg -hide_banner -i $raw -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p' |
	$PY -I -c "import json,sys; j=json.load(sys.stdin); print('measured_I=%s:measured_TP=%s:measured_LRA=%s:measured_thresh=%s:offset=%s' % (j['input_i'], j['input_tp'], j['input_lra'], j['input_thresh'], j['target_offset']))")
ffmpeg -v error -y -i $raw -af loudnorm=I=-14:TP=-1.5:LRA=11:$m:linear=true -ar 48000 $dir/score.wav
rm $raw
ffmpeg -hide_banner -i $dir/score.wav -af ebur128=peak=true -f null - 2>&1 | grep -E '^\s+(I|Peak):' | tail -2
