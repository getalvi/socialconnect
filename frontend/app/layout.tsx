import "./globals.css";

export const metadata = {
  title: "FlowAI — automation for people, not invoices",
  description: "A free, self-hostable workflow automation platform with a built-in AI agent node.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
