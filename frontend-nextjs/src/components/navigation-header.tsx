'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Home, LayoutDashboard, BookOpen, User, Settings } from 'lucide-react';
import { useAuth } from '@/lib/hooks';

interface NavigationHeaderProps {
  currentPage?: string;
  showUserMenu?: boolean;
}

export function NavigationHeader({ currentPage, showUserMenu = true }: NavigationHeaderProps) {
  const { data: authData } = useAuth();

  const navigationItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/modules', label: 'Modules', icon: BookOpen },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-primary-purple/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/dashboard" className="flex items-center">
              <Image
                src="/logo1.webp"
                alt="BenkoFY logo"
                width={60}
                height={36}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                style={{ width: "auto", height: "auto" }}
                priority
              />
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = currentPage === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary-purple bg-primary-purple/10'
                      : 'text-primary-foreground/80 hover:text-primary-purple hover:bg-primary-purple/5'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* User Menu */}
            {showUserMenu && authData?.user && (
              <div className="flex items-center gap-2">
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-purple">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-purple">
                    <Settings className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 bg-background/95 backdrop-blur-sm border-t border-primary-purple/20">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentPage === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive
                    ? 'text-primary-purple bg-primary-purple/10'
                    : 'text-primary-foreground/80 hover:text-primary-purple hover:bg-primary-purple/5'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
