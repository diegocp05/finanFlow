import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";


const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  // Remove any other options that might be causing issues
});

export const metadata = {
  title: "FinanFlow",
  description: "Aplicativo de finanças pessoais",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <html lang="pt-br">
      <body className={`${inter.className}`}>
        <Toaster richColors/>
      {children}
      <Header/>
      </body>
    </html>
    </ClerkProvider>
  );
}
