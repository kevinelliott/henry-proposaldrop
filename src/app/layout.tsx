import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProposalDrop — Win More Jobs with Professional Proposals",
  description: "Create professional proposals in 60 seconds. Track when clients view them. Close more deals. $9/mo — not $35.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-950 text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
