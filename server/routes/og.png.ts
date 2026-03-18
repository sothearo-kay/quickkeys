import { Buffer } from "node:buffer";
import { SITE_DESCRIPTION, SITE_NAME } from "#shared/constants";
import { ImageResponse } from "@vercel/og";

const W = 1200;
const H = 630;
const PAD = 40;

export default defineEventHandler(async (_event) => {
  const storage = useStorage("assets:server");
  const [ogBorderSvg, logoSvg, manropeSemiBold, manropeBold] = await Promise.all([
    storage.getItem<string>("og-border.svg"),
    storage.getItem<string>("logo.svg"),
    loadGoogleFont("Manrope:wght@600", SITE_DESCRIPTION),
    loadGoogleFont("Manrope:wght@700", `${SITE_NAME} Typing Speed Test`),
  ]);

  const ogBorderDataUri = `data:image/svg+xml;base64,${Buffer.from(ogBorderSvg!).toString("base64")}`;
  const logoDataUri = `data:image/svg+xml;base64,${Buffer.from(logoSvg!).toString("base64")}`;

  return new ImageResponse(
    {
      type: "div",
      props: {
        style: { width: "100%", height: "100%", display: "flex", backgroundColor: "#ffffff", padding: `${PAD}px`, position: "relative" },
        children: [
          {
            type: "img",
            props: { src: ogBorderDataUri, style: { position: "absolute", top: PAD, left: PAD, width: W - PAD * 2, height: H - PAD * 2 } },
          },
          {
            type: "div",
            props: {
              style: { flex: "1", display: "flex", flexDirection: "column", padding: "80px", justifyContent: "center" },
              children: [
                {
                  type: "div",
                  props: {
                    style: { display: "flex", alignItems: "center", gap: "32px" },
                    children: [
                      { type: "img", props: { src: logoDataUri, width: 80, height: 80, style: { borderRadius: "20px" } } },
                      { type: "span", props: { style: { fontSize: "48px", fontWeight: 700, color: "#3b82f6", fontFamily: "Manrope" }, children: SITE_NAME } },
                    ],
                  },
                },
                {
                  type: "div",
                  props: {
                    style: { display: "flex", flex: "1", flexDirection: "column", justifyContent: "center" },
                    children: [
                      { type: "div", props: { style: { fontSize: "56px", fontWeight: 700, color: "#1f1f1f", marginBottom: "20px", lineHeight: 1.2, fontFamily: "Manrope" }, children: "Typing Speed Test" } },
                      { type: "div", props: { style: { fontSize: "40px", fontWeight: 600, color: "rgba(0, 0, 0, 0.6)", fontFamily: "Manrope" }, children: SITE_DESCRIPTION } },
                    ],
                  },
                },
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
