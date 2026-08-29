import type { ReactNode } from "react";
import { Nav } from "./nav";

export const metadata = {
  title: "Arşiv",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0 }}>
        <Nav />
        {children}
      </body>
    </html>
  );
}
