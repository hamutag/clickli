import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "קליקלי - דילים חכמים",
    short_name: "קליקלי",
    description:
      "הדילים הכי שווים מ-AliExpress, Temu ו-iHerb. מחירים בשקלים, משלוח לישראל, קופונים בלעדיים.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    dir: "rtl",
    lang: "he",
    theme_color: "#10B981",
    background_color: "#0F172A",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
