import "./globals.css";
import styles from './page.module.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className=''>
        <header className={styles['header']}>
          <nav className={styles['nav']}>
          </nav>
        </header>
        <main className={styles["main-content"]}>
          {children}
        </main>
      </body>
    </html>
  );
}
