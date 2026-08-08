import './globals.css';
import Header from '@/components/Header';
import ChatWidget from '@/components/ChatWidget';

export const metadata = {
  title: 'GadgetBD — Bangladesh\'s Tech Gadget Store',
  description: 'Shop smartphones, laptops, audio, smartwatches and more with fast delivery across Bangladesh.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <footer className="footer">
          <div className="container">
            © {new Date().getFullYear()} GadgetBD · Made for Bangladesh · Cash on Delivery, bKash & Nagad accepted
          </div>
        </footer>
        <ChatWidget />
      </body>
    </html>
  );
}
