import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Benky-Fy | Study Japanese',
  description: 'Study Japanese, one card at a time',
};

async function getUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');

  if (!session) return null;

  try {
    const response = await fetch('http://localhost:5000/api/auth/user', {
      credentials: 'include',
      headers: {
        Cookie: `session=${session.value}`,
      },
    });

    if (!response.ok) return null;

    return response.json();
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Header user={user} />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}