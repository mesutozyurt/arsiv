import type { ReactNode } from "react";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import { Nav } from "./nav";
import "./globals.css";

const sans = Source_Sans_3({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Source_Serif_4({
  subsets: ["latin", "latin-ext"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata = {
  title: "Kurum arşivi",
  description: "Fiziksel ve elektronik kurum arşivi",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <a className="atla" href="#icerik">
          İçeriğe geç
        </a>
        <Nav />
        <div id="icerik">{children}</div>
      </body>
    </html>
  );
}
