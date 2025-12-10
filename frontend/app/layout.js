// app/layout.js (Server component)
import '../globals.css';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'Shopify WA Admin',
  description: 'Admin panel for Shopify WhatsApp Automation'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="p-4 max-w-7xl mx-auto">{children}</main>
      </body>
    </html>
  );
}
