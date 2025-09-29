import Image from 'next/image';
import Link from 'next/link';
import { User } from '@/types/auth';

interface HeaderProps {
  user: User | null;
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Image
              src="/img/logo.png"
              alt="BenkyFY logo"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">Benky-fy</h1>
              <p className="text-sm text-gray-500">Study Japanese, one card at a time</p>
            </div>
          </div>

          <nav className="flex space-x-4">
            <Link
              href="/"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Home
            </Link>
            {user ? (
              <>
                <Link
                  href="/modules"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Modules
                </Link>
                <div className="flex items-center">
                  {user.picture && (
                    <Image
                      src={user.picture}
                      alt={user.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <span className="ml-2 text-sm text-gray-700">{user.name}</span>
                  <a
                    href="/api/auth/logout"
                    className="ml-4 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    onClick={async (e) => {
                      e.preventDefault();
                      try {
                        const response = await fetch('/api/auth/logout');
                        if (response.ok) {
                          window.location.href = '/login';
                        } else {
                          console.error('Logout failed');
                        }
                      } catch (error) {
                        console.error('Logout error:', error);
                      }
                    }}
                  >
                    Logout
                  </a>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
