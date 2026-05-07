import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "FileToURL - Upload & Share Files",
  description:
    "Upload files and get permanent URLs. No expiration, free file hosting with API support.",
};

function Navbar() {
  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-blue-400">&#9670;</span> FileToURL
        </Link>
        <div className="flex gap-6 text-sm">
          <Link
            href="/"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Upload
          </Link>
          <Link
            href="/gallery"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Gallery
          </Link>
          <Link
            href="/docs"
            className="text-gray-300 hover:text-white transition-colors"
          >
            API Docs
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
