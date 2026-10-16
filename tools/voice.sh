#!/bin/sh
# sh tools/voice.sh <id> [--lang zh,en] : films/<id>/narration.json + score.wav → films/<id>/mix_<lang>.wav (run from the repo root)
# The narration over the ducked score at -14 LUFS; see tools/voice.py for the narration.json format.
exec lib/.venv/bin/python -I tools/voice.py "$@"
