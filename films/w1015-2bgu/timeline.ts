import {s} from '../../engine/kit/theme';

// 120 BPM 4/4 → bar = 2 s. Every cut is on a bar line; keep in sync with score.py.
export const T = {
	hook: [0, 6], // the pigeon-sized mosquito on the ledge + the question
	weight: [6, 14], // 2 mg vs 300 g → 150,000 mosquitoes fill a pigeon
	bite: [14, 22], // one bite ≈ 3 mg, more than its own weight
	bag: [22, 32], // × 150,000 → ≈ 425 mL ≈ one donated bag (450 mL)
	body: [32, 42], // 5 L of blood, 5 bites → over 40% gone
	see: [42, 48], // twist: one that big, you'd see it… SMACK
	tiny: [48, 58], // the real 2 mg ones: malaria, 610,000 deaths in 2024
	end: [58, 67], // back on the ledge: big ones take blood, small ones take lives; the closing line; button at 65
} as const;

export const TOTAL = s(T.end[1]);
export const dur = (k: keyof typeof T) => s(T[k][1]) - s(T[k][0]);
