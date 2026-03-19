import { Buffer } from "node:buffer";
import { SITE_NAME } from "#shared/constants";
import { ImageResponse } from "@vercel/og";

const W = 1200;
const H = 630;
const PAD = 60;
const CONTENT_W = W - PAD * 2;

const CHART_H = 250;
const CHART_VPAD = 10;
const CHART_HPAD = 0;

interface Theme { primary: string; highlight: string; background: string; foreground: string }

function oklchToHex(l: number, c: number, h: number): string {
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;
  const ll = l_ ** 3;
  const mm = m_ ** 3;
  const ss = s_ ** 3;
  const toSrgb = (x: number) => {
    x = Math.max(0, Math.min(1, x));
    return x <= 0.0031308 ? x * 12.92 : 1.055 * x ** (1 / 2.4) - 0.055;
  };
  const r = Math.round(toSrgb(4.0767416621 * ll - 3.3077115913 * mm + 0.2309699292 * ss) * 255);
  const g = Math.round(toSrgb(-1.2684380046 * ll + 2.6097574011 * mm - 0.3413193965 * ss) * 255);
  const bv = Math.round(toSrgb(-0.0041960863 * ll - 0.7034186147 * mm + 1.6956082560 * ss) * 255);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bv.toString(16).padStart(2, "0")}`;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const THEMES: Record<string, Theme> = {
  default: {
    primary: oklchToHex(0.5, 0.24, 255),
    highlight: oklchToHex(0.52, 0.22, 20),
    background: oklchToHex(0.99, 0, 0),
    foreground: oklchToHex(0.15, 0, 0),
  },
  latte: {
    primary: oklchToHex(0.52, 0.2, 270),
    highlight: oklchToHex(0.5, 0.22, 15),
    background: oklchToHex(0.95, 0.01, 270),
    foreground: oklchToHex(0.32, 0.04, 270),
  },
  ayu: {
    primary: oklchToHex(0.68, 0.2, 75),
    highlight: oklchToHex(0.55, 0.2, 12),
    background: oklchToHex(0.98, 0, 0),
    foreground: oklchToHex(0.32, 0.02, 240),
  },
  solarized: {
    primary: oklchToHex(0.49, 0.18, 210),
    highlight: oklchToHex(0.54, 0.22, 25),
    background: oklchToHex(0.97, 0.04, 88),
    foreground: oklchToHex(0.3, 0.05, 192),
  },
  flexoki: {
    primary: oklchToHex(0.58, 0.1, 188),
    highlight: oklchToHex(0.44, 0.16, 26),
    background: oklchToHex(0.99, 0.01, 88),
    foreground: oklchToHex(0.09, 0.01, 60),
  },
  dark: {
    primary: oklchToHex(0.73, 0.18, 195),
    highlight: oklchToHex(0.65, 0.2, 20),
    background: oklchToHex(0.13, 0, 0),
    foreground: oklchToHex(0.9, 0, 0),
  },
  serika: {
    primary: oklchToHex(0.82, 0.17, 85),
    highlight: oklchToHex(0.62, 0.2, 25),
    background: oklchToHex(0.22, 0.03, 68),
    foreground: oklchToHex(0.82, 0.03, 75),
  },
  vscode: {
    primary: oklchToHex(0.72, 0.16, 238),
    highlight: oklchToHex(0.78, 0.16, 65),
    background: oklchToHex(0.17, 0.01, 265),
    foreground: oklchToHex(0.87, 0.01, 265),
  },
  rosepine: {
    primary: oklchToHex(0.72, 0.14, 350),
    highlight: oklchToHex(0.62, 0.2, 355),
    background: oklchToHex(0.14, 0.02, 300),
    foreground: oklchToHex(0.9, 0.02, 285),
  },
  tokyonight: {
    primary: oklchToHex(0.72, 0.16, 255),
    highlight: oklchToHex(0.7, 0.18, 8),
    background: oklchToHex(0.15, 0.02, 265),
    foreground: oklchToHex(0.84, 0.05, 270),
  },
  catppuccin: {
    primary: oklchToHex(0.75, 0.17, 292),
    highlight: oklchToHex(0.72, 0.18, 350),
    background: oklchToHex(0.2, 0.025, 270),
    foreground: oklchToHex(0.88, 0.03, 270),
  },
};

function xScale(i: number, len: number) {
  return len < 2 ? CHART_HPAD : CHART_HPAD + (i / (len - 1)) * (CONTENT_W - CHART_HPAD * 2);
}

function yScale(val: number, yMin: number, yMax: number) {
  const range = yMax - yMin || 1;
  return CHART_VPAD + (CHART_H - CHART_VPAD * 2) - ((val - yMin) / range) * (CHART_H - CHART_VPAD * 2);
}

function buildChart(data: number[], primary: string): string {
  if (data.length < 2)
    return "";
  const yMin = Math.floor(Math.min(...data) / 10) * 10;
  const yMax = Math.max(...data) + 4;
  const pts: [number, number][] = data.map((v, i) => [xScale(i, data.length), yScale(v, yMin, yMax)]);
  let d = `M ${pts[0]![0].toFixed(1)} ${pts[0]![1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[Math.min(pts.length - 1, i + 2)]!;
    const cp1x = Math.max(p1[0], Math.min(p2[0], p1[0] + (p2[0] - p0[0]) / 6));
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = Math.max(p1[0], Math.min(p2[0], p2[0] - (p3[0] - p1[0]) / 6));
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  const lastX = xScale(data.length - 1, data.length).toFixed(1);
  const area = `${d} L ${lastX} ${CHART_H} L 0 ${CHART_H} Z`;
  return `<svg width="${CONTENT_W}" height="${CHART_H}" viewBox="0 0 ${CONTENT_W} ${CHART_H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${primary}" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="${primary}" stop-opacity="0"/>
      </linearGradient>
      <clipPath id="clip">
        <rect width="${CONTENT_W}" height="${CHART_H}"/>
      </clipPath>
    </defs>
    <path d="${area}" fill="url(#g)" clip-path="url(#clip)"/>
    <path d="${d}" fill="none" stroke="${primary}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" clip-path="url(#clip)"/>
  </svg>`;
}

const LABEL_STYLE = { fontSize: "14px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase" as const };

function statBlock(label: string, value: string, valueColor: string, valueSize: number, muted: string, align: "left" | "right" = "left") {
  return {
    type: "div",
    props: {
      style: { display: "flex", flexDirection: "column", gap: "4px", alignItems: align === "right" ? "flex-end" : "flex-start" },
      children: [
        { type: "span", props: { style: { ...LABEL_STYLE, color: muted }, children: label } },
        {
          type: "span",
          props: {
            style: {
              lineHeight: 1,
              fontSize: `${valueSize}px`,
              fontWeight: valueSize > 40 ? 700 : 600,
              color: valueColor,
              letterSpacing: valueSize > 40 ? "-3px" : "0",
            },
            children: value,
          },
        },
      ],
    },
  };
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const wpm = Number(query.wpm) || 0;
  const acc = Number(query.acc) || 0;
  const correct = Number(query.correct) || 0;
  const incorrect = Number(query.incorrect) || 0;
  const history: number[] = query.history
    ? String(query.history).split(",").map(Number).filter(n => !Number.isNaN(n))
    : [];

  const themeName = String(query.theme || "default");
  const theme = THEMES[themeName] ?? THEMES.default!;
  const muted = hexToRgba(theme.foreground, 0.45);

  const storage = useStorage("assets:server");
  const [logoMonoSvg, manropeSemiBold, manropeBold] = await Promise.all([
    storage.getItem<string>("logo-mono.svg"),
    loadGoogleFont("Manrope:wght@600", `WPM ACC correct incorrect wpm trend wpm.sothearo.dev ${wpm} ${acc} ${correct} ${incorrect}`),
    loadGoogleFont("Manrope:wght@700", `0123456789%${SITE_NAME}`),
  ]);

  const coloredLogoSvg = logoMonoSvg!.replace(/fill="[^"]*"/g, `fill="${theme.primary}"`);
  const logoDataUri = `data:image/svg+xml;base64,${Buffer.from(coloredLogoSvg).toString("base64")}`;

  const chartSvg = buildChart(history, theme.primary);
  const chartDataUri = chartSvg
    ? `data:image/svg+xml;base64,${Buffer.from(chartSvg).toString("base64")}`
    : null;

  return new ImageResponse(
    {
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: theme.background,
          padding: `${PAD}px`,
          fontFamily: "Manrope",
        },
        children: [
          {
            type: "div",
            props: {
              style: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" },
              children: [
                { type: "img", props: { src: logoDataUri, width: 48, height: 48 } },
                { type: "span", props: { style: { fontSize: "36px", fontWeight: 700, color: theme.foreground }, children: SITE_NAME } },
              ],
            },
          },
          {
            type: "div",
            props: {
              style: { display: "flex", alignItems: "flex-end", gap: "32px" },
              children: [
                statBlock("wpm", String(wpm), theme.primary, 96, muted),
                {
                  type: "div",
                  props: {
                    style: { display: "flex", flexDirection: "column", gap: "4px", paddingBottom: "10px" },
                    children: [
                      { type: "span", props: { style: { ...LABEL_STYLE, color: muted }, children: "acc" } },
                      { type: "span", props: { style: { fontSize: "48px", fontWeight: 700, color: theme.foreground, lineHeight: 1 }, children: `${acc}%` } },
                    ],
                  },
                },
                {
                  type: "div",
                  props: {
                    style: { display: "flex", gap: "28px", marginLeft: "auto", paddingBottom: "10px" },
                    children: [
                      statBlock("correct", String(correct), theme.primary, 28, muted, "right"),
                      statBlock("incorrect", String(incorrect), theme.highlight, 28, muted, "right"),
                    ],
                  },
                },
              ],
            },
          },
          ...(chartDataUri
            ? [{ type: "img", props: { src: chartDataUri, width: CONTENT_W, height: CHART_H, style: { display: "block" } } }]
            : [{ type: "div", props: { style: { display: "flex", flex: "1" }, children: [] } }]),
          {
            type: "div",
            props: {
              style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: "12px" },
              children: [
                { type: "span", props: { style: { fontSize: "16px", fontWeight: 600, color: muted }, children: "wpm.sothearo.dev" } },
                { type: "span", props: { style: { fontSize: "16px", fontWeight: 600, color: muted }, children: "wpm trend" } },
              ],
            },
          },
        ],
      },
    },
    {
      width: W,
      height: H,
      fonts: [
        { name: "Manrope", data: manropeSemiBold, weight: 600, style: "normal" },
        { name: "Manrope", data: manropeBold, weight: 700, style: "normal" },
      ],
    },
  );
});
