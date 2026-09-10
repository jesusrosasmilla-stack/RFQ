import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          borderRadius: 96,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 220,
            fontWeight: 700,
            color: "#f59e0b",
            letterSpacing: -8,
          }}
        >
          CP
        </div>
      </div>
    ),
    { ...size }
  );
}
