'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

/**
 * ThemeToggle Component
 * 
 * A reusable theme toggle button that supports both inline and floating variants.
 * The floating variant is positioned at the bottom-right of the screen and appears
 * on all pages through the root layout.
 * 
 * Features:
 * - Hydration-safe rendering
 * - Accessibility support (aria-label, title)
 * - Smooth transitions and hover effects
 * - Backdrop blur for better visibility
 * - Responsive design
 */

interface ThemeToggleProps {
  variant?: 'default' | 'floating';
  className?: string;
}

export function ThemeToggle({ variant = 'default', className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className={`border-primary-purple/30 text-primary-purple hover:bg-primary-purple/10 ${className || ''}`}
      >
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const baseClasses = variant === 'floating' 
    ? "fixed bottom-6 right-6 z-50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border-primary-purple/30 text-primary-purple hover:bg-primary-purple/10 dark:border-primary-purple/50 dark:text-primary-purple dark:hover:bg-primary-purple/20 bg-background/90 dark:bg-background/90 backdrop-blur-sm"
    : "border-primary-purple/30 text-primary-purple hover:bg-primary-purple/10 dark:border-primary-purple/50 dark:text-primary-purple dark:hover:bg-primary-purple/20";

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className={`${baseClasses} ${className || ''}`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  );
}

// Floating theme toggle component for global use
export function FloatingThemeToggle() {
  return <ThemeToggle variant="floating" />;
}
