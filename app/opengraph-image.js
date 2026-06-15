import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Picked — The European basketball player market";
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
          backgroundColor: "#F3F6FA",
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
              backgroundColor: "#FF4D1D",
            }}
          />
          <div
            style={{
              fontSize: 34,
              fontWeight: 800,
              color: "#05070A",
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
              color: "#05070A",
              lineHeight: 1.02,
              letterSpacing: 0,
              maxWidth: 980,
            }}
          >
            The European basketball player market.
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 28,
              color: "#232932",
              maxWidth: 820,
              lineHeight: 1.4,
            }}
          >
            Players enter. Clubs search. Interest moves through a professional
            roster market.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid rgba(5,7,10,0.12)",
            paddingTop: 28,
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#D7370A",
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            Player profiles / Availability / Roster search
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#05070A" }}>
            getpicked.co
          </div>
        </div>
      </div>
    ),
    size
  );
}
