import '@fontsource/noto-sans-tc/400.css';
import '@fontsource/noto-sans-tc/700.css';
import '@fontsource/noto-sans-tc/900.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';

export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const BEAT = 15; // frames; 120 BPM = 2 presses per second

export const C = {
	bg: '#0C0D10',
	bg2: '#15171C',
	ink: '#F4F1EC',
	dim: '#8C9099',
	faint: '#2A2D34',
	red: '#FF3B30',
	redDeep: '#B3161C',
	green: '#34C77B',
	amber: '#FFB020',
};

export const SANS = '"Noto Sans TC", "PingFang TC", sans-serif';
export const SANS_EN = 'Inter, "Noto Sans TC", sans-serif'; // body text of English versions
export const NUM = 'Inter, "Noto Sans TC", sans-serif';

// seconds → frames
export const s = (sec: number) => Math.round(sec * FPS);
