import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import night from './night.jpg';

/** Night-side Earth from NASA Black Marble 2016. City lights can be switched off/on per region. */
type Tex = {w: number; h: number; d: Uint8ClampedArray};
let cache: Promise<Tex> | null = null;
const load = () => {
	if (!cache) {
		cache = new Promise<Tex>((res, rej) => {
			const img = new Image();
			img.onload = () => {
				const c = document.createElement('canvas');
				c.width = img.naturalWidth;
				c.height = img.naturalHeight;
				const g = c.getContext('2d', {willReadFrequently: true})!;
				g.drawImage(img, 0, 0);
				res({w: c.width, h: c.height, d: g.getImageData(0, 0, c.width, c.height).data});
			};
			img.onerror = rej;
			img.src = night;
		});
	}
	return cache;
};

export type NightState = {
	rot: number; // longitude at screen centre, radians (0 = Greenwich)
	tilt: number; // view latitude, radians
	/** 0..1 how lit a city at (lonDeg, latDeg) is. */
	lights: (lonDeg: number, latDeg: number) => number;
	/** extra brightness on lights (flicker), default 1 */
	gain?: number;
};

export const NightGlobe: React.FC<{size: number; state: NightState}> = ({size, state}) => {
	const ref = useRef<HTMLCanvasElement>(null);
	const [tex, setTex] = useState<Tex | null>(null);
	const [handle] = useState(() => delayRender('night texture'));
	useEffect(() => {
		load().then((t) => {
			setTex(t);
			continueRender(handle);
		});
	}, [handle]);
	useLayoutEffect(() => {
		if (tex && ref.current) draw(ref.current, size, state, tex);
	});
	return <canvas ref={ref} width={size} height={size} style={{width: size, height: size, display: 'block'}} />;
};

const DEG = 180 / Math.PI;

function draw(cv: HTMLCanvasElement, S: number, st: NightState, T: Tex) {
	const g = cv.getContext('2d')!;
	const img = g.createImageData(S, S);
	const out = img.data;
	const R = S * 0.42;
	const c = S / 2;
	const ct = Math.cos(st.tilt),
		sn = Math.sin(st.tilt);
	const gain = st.gain ?? 1;
	// lights() is evaluated on a coarse 2° grid and cached for this frame
	const grid = new Float32Array(180 * 90);
	for (let j = 0; j < 90; j++) for (let i = 0; i < 180; i++) grid[j * 180 + i] = st.lights(-179 + i * 2, 89 - j * 2);
	for (let py = 0; py < S; py++) {
		const y = -(py + 0.5 - c) / R;
		for (let px = 0; px < S; px++) {
			const x = (px + 0.5 - c) / R;
			const r2 = x * x + y * y;
			const o = (py * S + px) * 4;
			if (r2 > 1) {
				out[o + 3] = 0;
				continue;
			}
			const z = Math.sqrt(1 - r2);
			const Y = y * ct + z * sn;
			const Z = -y * sn + z * ct;
			const lat = Math.asin(Math.max(-1, Math.min(1, Y)));
			let lon = Math.atan2(x, Z) + st.rot; // radians, 0 = Greenwich
			lon = ((lon + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
			const u = (lon + Math.PI) / (2 * Math.PI);
			const v = 0.5 - lat / Math.PI;
			const ti = (Math.min(T.h - 1, (v * T.h) | 0) * T.w + Math.min(T.w - 1, (u * T.w) | 0)) * 4;
			const r0 = T.d[ti],
				g0 = T.d[ti + 1],
				b0 = T.d[ti + 2];
			// city lights = luminance above the moonlit ground; "off" replaces them with the dark ground colour
			const lum = 0.3 * r0 + 0.59 * g0 + 0.11 * b0;
			const L = Math.min(1, Math.max(0, (lum - 48) / 90));
			const gi = Math.min(89, Math.max(0, ((90 - lat * DEG) / 2) | 0)) * 180 + Math.min(179, Math.max(0, ((lon * DEG + 180) / 2) | 0));
			const on = grid[gi] * gain;
			const br = r0 * (1 - L) + 26 * L,
				bg = g0 * (1 - L) + 28 * L,
				bb = b0 * (1 - L) + 52 * L;
			const glowv = L * on * (70 + lum * 1.6);
			let r = br + glowv;
			let gg = bg + glowv * 0.8;
			let b = bb + glowv * 0.5;
			// soft limb shading + thin atmosphere
			const limb = Math.pow(1 - z, 2.4);
			const shade = 0.55 + 0.45 * z;
			r = r * shade + 20 * limb;
			gg = gg * shade + 50 * limb;
			b = b * shade + 120 * limb;
			const edge = Math.min(1, (1 - Math.sqrt(r2)) * R * 1.2);
			out[o] = r;
			out[o + 1] = gg;
			out[o + 2] = b;
			out[o + 3] = 255 * edge;
		}
	}
	g.clearRect(0, 0, S, S);
	const glow = g.createRadialGradient(c, c, R * 0.97, c, c, R * 1.12);
	glow.addColorStop(0, 'rgba(70,110,220,0.45)');
	glow.addColorStop(0.4, 'rgba(50,90,200,0.12)');
	glow.addColorStop(1, 'rgba(40,80,200,0)');
	g.fillStyle = glow;
	g.beginPath();
	g.arc(c, c, R * 1.12, 0, Math.PI * 2);
	g.fill();
	const tmp = document.createElement('canvas');
	tmp.width = S;
	tmp.height = S;
	tmp.getContext('2d')!.putImageData(img, 0, 0);
	g.drawImage(tmp, 0, 0);
}
