import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Импортируем наше новое меню
import BottomNav from "./components/BottomNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FitAdmin",
  description: "Приложение для тренера и клиентов",
  manifest: "/manifest.json", 
};

// Блокируем увеличение пальцами (чтобы было как нативное приложение)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#111827",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        {/* Обертка с отступом снизу (pb-24), чтобы контент не прятался за меню */}
        <div className="pb-24">
          {children}
        </div>
        
        {/* Наша навигация всегда внизу */}
        <BottomNav />
      </body>
    </html>
  );
}