import { SITE_DESCRIPTION, SITE_NAME } from "#shared/constants";
import { ImageResponse } from "@vercel/og";

export default defineEventHandler(async (event) => {
  const [manropeFontSemiBold, manropeFontBold] = await Promise.all([
    loadGoogleFont("Manrope:wght@600", SITE_DESCRIPTION),
    loadGoogleFont("Manrope:wght@700", `${SITE_NAME} Typing Speed Test`),
  ]);

  const url = getRequestURL(event);

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
          // Dashed border overlay
          {
            type: "img",
            props: {
              src: `${url.origin}/og-border.svg`,
              style: {
                position: "absolute",
                top: 40,
                left: 40,
                width: 1120,
                height: 550,
              },
            },
          },
          // Content
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
                          src: `${url.origin}/icons/logo.svg`,
                          width: 64,
                          height: 64,
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
