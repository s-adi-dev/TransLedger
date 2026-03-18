import { Font } from "@react-pdf/renderer";
import { Roboto } from "next/font/google";

export const registerFonts = () => {
  Font.register({
    family: "Revue",
    fonts: [
      {
        src: "/fonts/revue.ttf",
        fontWeight: "normal",
        fontStyle: "normal",
      },
    ],
  });

  Font.register({
    family: "Roboto",
    fonts: [
      {
        src: "/fonts/Roboto/Roboto-Regular.ttf",
        fontWeight: "normal",
        fontStyle: "normal",
      },
      {
        src: "/fonts/Roboto/Roboto-Bold.ttf",
        fontWeight: "bold",
        fontStyle: "normal",
      },
      {
        src: "/fonts/Roboto/Roboto-SemiBold.ttf",
        fontWeight: "semibold",
        fontStyle: "normal",
      },
    ],
  });
};
