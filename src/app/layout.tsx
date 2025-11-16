import './globals.css';
import Navbar from '@/components/navbar/navbar';
import Footer from '@/components/footer/footer';
import CookieBanner from '@/components/cookie-banner/cookie-banner';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased flex flex-col min-h-screen">
                <Navbar />

                <main className="flex-1">{children}</main>

                <Footer />
                <CookieBanner />
            </body>
        </html>
    );
}
