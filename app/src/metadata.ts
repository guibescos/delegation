import type { Metadata, Viewport } from "next";

export const metadata = {
  title: {
    default: "Gasless Trading Demo",
    template: "%s | Gasless Trading Demo",
  },
  applicationName: "Gasless Trading Demo",
  description: "A demo of gasless trading.",
  referrer: "strict-origin-when-cross-origin",
  openGraph: {
    type: "website",
  },
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        type: "image/x-icon",
        url: "/favicon.ico",
      },
      {
        media: "(prefers-color-scheme: dark)",
        type: "image/x-icon",
        url: "/favicon-light.ico",
      },
    ],
    apple: {
      url: "/apple-touch-icon.png",
      sizes: "180x180",
    },
  },
  robots: { index: false, follow: false },
} satisfies Metadata;

export const viewport = {
  themeColor: "#242235",
} satisfies Viewport;
