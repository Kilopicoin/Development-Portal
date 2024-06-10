// use client
'use client';
import { Inter } from "next/font/google";
import { Provider } from "react-redux";
import store from '../store/store';  // Adjust the path according to your project structure
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider store={store}>
          {children}
        </Provider>
      </body>
    </html>
  );
}
