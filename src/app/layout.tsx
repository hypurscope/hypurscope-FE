import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "HypurScope",
  description: "Real-time insights into HyperEVM and HyperCore data layers",

  // Favicon setup
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" }, // fallback for older browsers
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png", // optional for iOS home screen
  },

  // Open Graph for social sharing
  openGraph: {
    title: "HypurScope",
    description: "Real-time insights into HyperEVM and HyperCore data layers",
    url: "https://hypurscope.vercel.app/",
    siteName: "HypurScope",
    images: [
      {
        url: "https://res.cloudinary.com/dhvwthnzq/image/upload/f_auto,q_auto/v1755955314/hyperscope/Frame_247_zlamyk.png",
        width: 1200,
        height: 630,
        alt: "HypurScope OG Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Twitter card
  twitter: {
    card: "summary_large_image",
    title: "HypurScope",
    description: "Real-time insights into HyperEVM and HyperCore data layers",
    images: [
      "https://res.cloudinary.com/dhvwthnzq/image/upload/f_auto,q_auto,w_1200,h_630,c_fill/v1755956439/hyperscope/e244d187-992a-422c-adfb-1907049a0634.png",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} antialiased bg-white px-6 py-5 lg:py-8 lg:px-20`}
      >
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
