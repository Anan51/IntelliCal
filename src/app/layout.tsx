import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IntelliCal",
  description: "Syllabus → calendar + friend free-time overlap for UCLA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
