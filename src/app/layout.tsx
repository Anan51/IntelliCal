import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IntelliCal",
  description: "Syllabus → calendar + friend free-time overlap for UCLA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, background: "#0b1020", color: "#e8eeff" }}>
        {children}
      </body>
    </html>
  );
}
