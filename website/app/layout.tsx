import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import ThemeProvider from "@/components/ThemeProvider";
import BackgroundFX from "@/components/BackgroundFX";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Alog — AI 工作日志",
  description: "AI 编程工具任务总结聚合平台",
};

// Inject before React hydrates to prevent FOUC
const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('alog-theme');
    if (!t) t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', t);
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <BackgroundFX />
          <Header />
          <div className="alog-layout">
            <Sidebar />
            <main className="alog-main">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

