import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import clouds from '../assets/clouds.jpg';
import earth from '../assets/earth.jpg';
import ocean from '../assets/ocean.png';

/** Pixel data of the textures, loaded once per tab. */
type Tex = {w: number; h: number; d: Uint8ClampedArray};
let cache: Promise<{earth: Tex; ocean: Tex; clouds: Tex}> | null = null;

const loadTex = (src: string) =>
	new Promise<Tex>((res, rej) => {
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
		img.src = src;
	});

const loadAll = () => {
	if (!cache) {
		cache = Promise.all([loadTex(earth), loadTex(ocean), loadTex(clouds)]).then(([earth, ocean, clouds]) => ({earth, ocean, clouds}));
	}
	return cache;
};

export type GlobeState = {
	rot: number; // radians of spin (longitude offset)
	flat: number; // 0 = sphere, 0.3 = very oblate (screen-space squash)
	drain: number; // 0..1 polar oceans drain + equatorial flood
	bands: number; // 0..1 Jupiter-like banded clouds
	clouds: number; // 0..1 cloud opacity
	equator: number; // 0..1 highlight the equator line
	tilt?: number; // view latitude in radians (default 0.32)
};

const DEG = Math.PI / 180;
const smooth = (a: number, b: number, x: number) => {
	const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
	return t * t * (3 - 2 * t);
};

/** Renders the globe into a square canvas of `size` px (the globe's equatorial diameter = size * 0.84). */
export const Globe: React.FC<{size: number; state: GlobeState; t: number}> = ({size, state, t}) => {
	const ref = useRef<HTMLCanvasElement>(null);
	const [tex, setTex] = useState<Awaited<ReturnType<typeof loadAll>> | null>(null);
	const [handle] = useState(() => delayRender('globe textures'));
	useEffect(() => {
		loadAll().then((x) => {
			setTex(x);
			continueRender(handle);
		});
	}, [handle]);

	useLayoutEffect(() => {
		if (!tex || !ref.current) return;
		draw(ref.current, size, state, t, tex);
	});

	return <canvas ref={ref} width={size} height={size} style={{width: size, height: size, display: 'block'}} />;
};

function draw(cv: HTMLCanvasElement, S: number, st: GlobeState, time: number, tex: {earth: Tex; ocean: Tex; clouds: Tex}) {
	const g = cv.getContext('2d')!;
	const img = g.createImageData(S, S);
	const out = img.data;
	const R = S * 0.42; // equatorial radius in px
	const cx = S / 2;
	const cy = S / 2;
	const ky = 1 - st.flat; // polar squash
	const tilt = st.tilt ?? 0.32;
	const ct = Math.cos(tilt);
	const stt = Math.sin(tilt);
	// light from upper-left-front
	let lx = -0.55,
		ly = 0.45,
		lz = 0.7;
	const ln = Math.hypot(lx, ly, lz);
	lx /= ln;
	ly /= ln;
	lz /= ln;
	const E = tex.earth,
		O = tex.ocean,
		Cl = tex.clouds;
	const phiC = (90 - 56 * st.drain) * DEG; // beyond this latitude oceans are gone
	const flood = 16 * st.drain * DEG; // within this latitude land is under water
	const cloudShift = time * 0.02;

	for (let py = 0; py < S; py++) {
		const y0 = -(py + 0.5 - cy) / R / ky;
		for (let px = 0; px < S; px++) {
			const x = (px + 0.5 - cx) / R;
			const r2 = x * x + y0 * y0;
			const o = (py * S + px) * 4;
			if (r2 > 1.0) {
				out[o + 3] = 0;
				continue;
			}
			const z = Math.sqrt(1 - r2);
			// world coords (Y north)
			const Y = y0 * ct + z * stt;
			const Z = -y0 * stt + z * ct;
			const lat = Math.asin(Math.max(-1, Math.min(1, Y)));
			let lon = Math.atan2(x, Z) + st.rot;
			lon = ((lon % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI); // 0..2π, 0 = -180°
			const u = lon / (2 * Math.PI);
			const v = 0.5 - lat / Math.PI;

			const ex = Math.min(E.w - 1, (u * E.w) | 0);
			const ey = Math.min(E.h - 1, (v * E.h) | 0);
			const ei = (ey * E.w + ex) * 4;
			let r = E.d[ei],
				gg = E.d[ei + 1],
				b = E.d[ei + 2];
			const oc = O.d[(Math.min(O.h - 1, (v * O.h) | 0) * O.w + Math.min(O.w - 1, (u * O.w) | 0)) * 4] / 255;
			const alat = Math.abs(lat);

			if (st.drain > 0) {
				// exposed seabed toward the poles
				const dry = oc * smooth(phiC - 3 * DEG, phiC + 3 * DEG, alat);
				if (dry > 0) {
					const depth = 1 - Math.min(1, (b - 20) / 140); // darker blue = deeper
					const sr = 150 - 70 * depth,
						sg = 128 - 64 * depth,
						sb = 100 - 50 * depth;
					r += (sr - r) * dry;
					gg += (sg - gg) * dry;
					b += (sb - b) * dry;
				}
				// equatorial flood + deeper water band
				const wet = (1 - oc) * (1 - smooth(flood - 4 * DEG, flood + 2 * DEG, alat)) * Math.min(1, st.drain * 1.4);
				if (wet > 0) {
					r += (18 - r) * wet;
					gg += (52 - gg) * wet;
					b += (110 - b) * wet;
				}
				// the piled-up equatorial ocean: saturated, brighter blue belt
				const deep = (1 - smooth(flood + 4 * DEG, flood + 16 * DEG, alat)) * Math.min(1, st.drain * 1.2) * Math.max(oc, wet);
				r += (20 - r) * 0.7 * deep;
				gg += (110 - gg) * 0.7 * deep;
				b += (235 - b) * 0.7 * deep;
			}

			// clouds
			let ca = 0;
			if (st.clouds > 0 || st.bands > 0) {
				const cu = (((u + cloudShift) % 1) + 1) % 1;
				const ci = (Math.min(Cl.h - 1, (v * Cl.h) | 0) * Cl.w + Math.min(Cl.w - 1, (cu * Cl.w) | 0)) * 4;
				const real = Cl.d[ci] / 255;
				ca = real * real * 0.85 * st.clouds;
				if (st.bands > 0) {
					// zonal bands with a little turbulence; more, tighter bands = stronger Coriolis
					const warp = 0.06 * Math.sin(lon * 3 + lat * 7 + time * 0.6) + 0.03 * Math.sin(lon * 11 - lat * 13 - time * 1.1) + 0.12 * (real - 0.3);
					const bandv = 0.5 + 0.5 * Math.sin((lat + warp) * 22);
					const bandA = (0.25 + 0.6 * bandv * bandv) * (0.75 + 0.25 * real);
					ca = ca * (1 - st.bands) + bandA * st.bands;
					// band tint: alternating cream / ochre
					const tint = 0.5 + 0.5 * Math.sin((lat + warp) * 11);
					const cr = 245 - 25 * tint,
						cg = 238 - 45 * tint,
						cb = 225 - 80 * tint;
					const k = Math.min(1, ca);
					r += (cr - r) * k * st.bands + (255 - r) * k * (1 - st.bands);
					gg += (cg - gg) * k * st.bands + (255 - gg) * k * (1 - st.bands);
					b += (cb - b) * k * st.bands + (255 - b) * k * (1 - st.bands);
				} else {
					r += (255 - r) * ca;
					gg += (255 - gg) * ca;
					b += (255 - b) * ca;
				}
			}

			// equator highlight
			if (st.equator > 0) {
				const e = Math.exp(-((lat / (1.1 * DEG)) ** 2)) * st.equator;
				r += (255 - r) * e;
				gg += (190 - gg) * e;
				b += (60 - b) * e;
			}

			// lighting (screen-space normal, squash ignored for shading)
			const nd = x * lx + y0 * ky * ly + z * lz;
			const diff = Math.max(0, nd);
			const lit = 0.1 + 1.05 * Math.pow(diff, 0.85);
			// ocean specular
			let spec = 0;
			if (oc > 0.5 && ca < 0.4) {
				const hz = nd * 2 * z - lz; // reflect-ish toward viewer
				spec = Math.pow(Math.max(0, hz), 40) * 90 * (1 - ca);
			}
			// limb darkening + atmosphere tint
			const limb = Math.pow(1 - z, 3);
			r = r * lit + spec + 60 * limb * diff;
			gg = gg * lit + spec + 110 * limb * diff;
			b = b * lit + spec + 200 * limb * (0.3 + diff);
			// anti-aliased edge
			const edge = Math.min(1, (1 - Math.sqrt(r2)) * R * 1.2);
			out[o] = r;
			out[o + 1] = gg;
			out[o + 2] = b;
			out[o + 3] = 255 * edge;
		}
	}
	g.clearRect(0, 0, S, S);
	// atmosphere glow behind
	g.save();
	g.translate(cx, cy);
	g.scale(1, ky);
	const glow = g.createRadialGradient(0, 0, R * 0.96, 0, 0, R * 1.14);
	glow.addColorStop(0, 'rgba(110,170,255,0.55)');
	glow.addColorStop(0.35, 'rgba(80,140,255,0.18)');
	glow.addColorStop(1, 'rgba(60,120,255,0)');
	g.fillStyle = glow;
	g.beginPath();
	g.arc(0, 0, R * 1.14, 0, Math.PI * 2);
	g.fill();
	g.restore();
	const tmp = getTmp(S);
	tmp.getContext('2d')!.putImageData(img, 0, 0);
	g.drawImage(tmp, 0, 0);
}

let tmpC: HTMLCanvasElement | null = null;
const getTmp = (S: number) => {
	if (!tmpC || tmpC.width !== S) {
		tmpC = document.createElement('canvas');
		tmpC.width = S;
		tmpC.height = S;
	}
	return tmpC;
};
