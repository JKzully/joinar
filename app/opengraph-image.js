import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Picked — Get picked by teams hiring this window";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#E8E5DC",
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              backgroundColor: "#B85A3F",
            }}
          />
          <div
            style={{
              fontSize: 34,
              fontWeight: 800,
              color: "#13110E",
              letterSpacing: 1,
            }}
          >
            Picked
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 92,
              fontWeight: 700,
              color: "#13110E",
              lineHeight: 1.02,
              letterSpacing: -4,
              maxWidth: 980,
            }}
          >
            Get picked by teams hiring this window.
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 28,
              color: "#3A332B",
              maxWidth: 820,
              lineHeight: 1.4,
            }}
          >
            One coach-ready basketball profile. Film, stats, availability —
            and direct messages from teams in Europe.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid rgba(19,17,14,0.12)",
            paddingTop: 28,
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#8F4029",
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            Basketball recruiting for Europe
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#13110E" }}>
            getpicked.co
          </div>
        </div>
      </div>
    ),
    size
  );
}
