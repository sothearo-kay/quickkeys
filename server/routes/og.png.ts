import { Buffer } from "node:buffer";
import { SITE_DESCRIPTION, SITE_NAME } from "#shared/constants";
import { ImageResponse } from "@vercel/og";

const OG_BORDER_SVG = "<svg width=\"1120\" height=\"550\" viewBox=\"0 0 1120 550\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M 2 29 L 2 2 L 29 2\" stroke=\"#000000\" stroke-width=\"2.5\" fill=\"none\" stroke-opacity=\"0.2\" stroke-linecap=\"square\"/><line x1=\"41\" y1=\"2\" x2=\"1085\" y2=\"2\" stroke=\"#000000\" stroke-width=\"2.5\" stroke-opacity=\"0.2\" stroke-dasharray=\"18 12\" stroke-linecap=\"square\"/><path d=\"M 1091 2 L 1118 2 L 1118 29\" stroke=\"#000000\" stroke-width=\"2.5\" fill=\"none\" stroke-opacity=\"0.2\" stroke-linecap=\"square\"/><line x1=\"1118\" y1=\"41\" x2=\"1118\" y2=\"515\" stroke=\"#000000\" stroke-width=\"2.5\" stroke-opacity=\"0.2\" stroke-dasharray=\"18 12\" stroke-linecap=\"square\"/><path d=\"M 1118 521 L 1118 548 L 1091 548\" stroke=\"#000000\" stroke-width=\"2.5\" fill=\"none\" stroke-opacity=\"0.2\" stroke-linecap=\"square\"/><line x1=\"1079\" y1=\"548\" x2=\"35\" y2=\"548\" stroke=\"#000000\" stroke-width=\"2.5\" stroke-opacity=\"0.2\" stroke-dasharray=\"18 12\" stroke-linecap=\"square\"/><path d=\"M 29 548 L 2 548 L 2 521\" stroke=\"#000000\" stroke-width=\"2.5\" fill=\"none\" stroke-opacity=\"0.2\" stroke-linecap=\"square\"/><line x1=\"2\" y1=\"509\" x2=\"2\" y2=\"35\" stroke=\"#000000\" stroke-width=\"2.5\" stroke-opacity=\"0.2\" stroke-dasharray=\"18 12\" stroke-linecap=\"square\"/></svg>";
const LOGO_SVG = "<svg width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"3\" y=\"3\" width=\"26\" height=\"26\" rx=\"5\" fill=\"#3b82f6\"/><path d=\"M 19.5 9 L 11 16 L 14.5 16 L 14.5 17.5 L 11.5 23 L 20 16 L 16.5 16 L 16.5 14.5 Z\" fill=\"#ffffff\"/></svg>";

export default defineEventHandler(async (_event) => {
  const [manropeFontSemiBold, manropeFontBold] = await Promise.all([
    loadGoogleFont("Manrope:wght@600", SITE_DESCRIPTION),
    loadGoogleFont("Manrope:wght@700", `${SITE_NAME} Typing Speed Test`),
  ]);

  const ogBorderDataUri = `data:image/svg+xml;base64,${Buffer.from(OG_BORDER_SVG).toString("base64")}`;
  const logoDataUri = `data:image/svg+xml;base64,${Buffer.from(LOGO_SVG).toString("base64")}`;

  return new ImageResponse(
    {
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#ffffff",
          padding: "40px",
          position: "relative",
        },
        children: [
          {
            type: "img",
            props: {
              src: ogBorderDataUri,
              style: {
                position: "absolute",
                top: 40,
                left: 40,
                width: 1120,
                height: 550,
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                flex: "1",
                display: "flex",
                flexDirection: "column",
                padding: "80px",
                justifyContent: "center",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                    },
                    children: [
                      {
                        type: "img",
                        props: {
                          src: logoDataUri,
                          width: 80,
                          height: 80,
                        },
                      },
                      {
                        type: "span",
                        props: {
                          style: {
                            fontSize: "48px",
                            fontWeight: 700,
                            color: "#3b82f6",
                            fontFamily: "Manrope",
                          },
                          children: SITE_NAME,
                        },
                      },
                    ],
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      flex: "1",
                      flexDirection: "column",
                      justifyContent: "center",
                    },
                    children: [
                      {
                        type: "div",
                        props: {
                          style: {
                            fontSize: "56px",
                            fontWeight: 700,
                            color: "#1f1f1f",
                            marginBottom: "20px",
                            lineHeight: 1.2,
                            fontFamily: "Manrope",
                          },
                          children: "Typing Speed Test",
                        },
                      },
                      {
                        type: "div",
                        props: {
                          style: {
                            fontSize: "40px",
                            fontWeight: 600,
                            color: "rgba(0, 0, 0, 0.6)",
                            fontFamily: "Manrope",
                          },
                          children: SITE_DESCRIPTION,
                        },
                      },
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
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Manrope",
          data: manropeFontSemiBold,
          weight: 600,
          style: "normal",
        },
        {
          name: "Manrope",
          data: manropeFontBold,
          weight: 700,
          style: "normal",
        },
      ],
    },
  );
});
