import "@/styles/globals.css";
import { inter } from '@/components/ui/fonts';
import { Footer } from "@/sections/footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={'${inter.className} antialiased'}>{children}
      <div className="w-full shrink-0">
        <Footer />
      </div>
      </body>
    </html>
  );
}
