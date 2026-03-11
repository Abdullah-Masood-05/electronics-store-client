import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "ElectroStore",
  description: "ElectroStore — Premium electronics shopping experience",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
