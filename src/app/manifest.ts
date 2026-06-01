import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Opus – Job Search Tracker",
    short_name: "Opus",
    description: "Track your job applications with ease.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fdf6e3",
    theme_color: "#8da101",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
