/** @jsxImportSource react */
import { AppConfig } from "@/lib/config";
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  const revueFont = await fetch(
    new URL("../public/fonts/revue.ttf", import.meta.url),
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          backgroundColor: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Revue",
          fontSize: 18,
          fontWeight: 700,
          color: "#fff",
          borderRadius: 6,
        }}
      >
        <span>{AppConfig.company.initials}</span>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Revue", data: revueFont, style: "normal", weight: 700 }],
    },
  );
}
