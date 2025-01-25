import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className=''>
        <header className='header'>
          <nav className='nav'>
          </nav>
        </header>
        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}