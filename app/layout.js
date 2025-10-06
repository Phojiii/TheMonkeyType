import '../app/globals.css';
import NavBar from '../components/NavBar';

export const metadata = {
  title: "Typing Trainer",
  description: "Adaptive typing practice that learns your weaknesses",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        <main className="ml-20 font-mono antialiased">{children}</main>
      </body>
    </html>
  );
}
