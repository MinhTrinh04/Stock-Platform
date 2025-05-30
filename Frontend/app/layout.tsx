import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finance View",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body>{children}</body>
    </html>
  );
}
