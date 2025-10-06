'use client';

import { useUser } from '@/core/user-context';
import { FloatingElements } from '@/components/floating-elements';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import { User, Mail, Calendar, LogOut, Edit3 } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isLoading } = useUser();

  const handleLogout = () => {
    window.location.href = '/auth/logout';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-purple to-secondary-purple">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-foreground mx-auto mb-4"></div>
          <p className="text-primary-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-purple to-secondary-purple">
        <div className="text-center">
          <User className="w-16 h-16 text-primary-foreground/50 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary-foreground mb-4">No User Found</h2>
          <p className="text-primary-foreground/80 mb-6">Please log in to view your profile.</p>
          <Link href="/auth/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-purple to-secondary-purple relative overflow-hidden">
      <FloatingElements />
      
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary-foreground">Profile</h1>
            <p className="text-primary-foreground/80">Manage your account information</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Profile Content */}
        <div className="max-w-2xl mx-auto">
          <Card variant="primary" className="p-8">
            {/* Profile Picture and Basic Info */}
            <div className="flex items-center gap-6 mb-8">
              <div className="relative">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-24 h-24 rounded-full border-4 border-primary-purple/20"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary-purple/20 flex items-center justify-center border-4 border-primary-purple/20">
                    <User className="w-12 h-12 text-primary-purple" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-primary-foreground mb-2">
                  {user.name}
                </h2>
                <p className="text-primary-foreground/80 mb-4">
                  {user.email}
                </p>
                <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
                  <Calendar className="w-4 h-4" />
                  <span>Member since {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* User Details */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-primary-foreground/80">Full Name</label>
                  <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
                    <User className="w-4 h-4 text-primary-purple" />
                    <span className="text-primary-foreground">{user.name}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-primary-foreground/80">Email Address</label>
                  <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
                    <Mail className="w-4 h-4 text-primary-purple" />
                    <span className="text-primary-foreground">{user.email}</span>
                  </div>
                </div>
              </div>

              {/* Google Account Info */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-primary-foreground/80">Google Account</label>
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">G</span>
                    </div>
                    <span className="text-green-200 text-sm">Connected to Google</span>
                  </div>
                  <p className="text-green-200/70 text-xs mt-1">
                    Account ID: {user.id}
                  </p>
                </div>
              </div>

              {/* Learning Stats */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-primary-foreground/80">Learning Progress</label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary-purple">0</div>
                    <div className="text-xs text-primary-foreground/70">Cards Studied</div>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary-purple">0</div>
                    <div className="text-xs text-primary-foreground/70">Streak Days</div>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary-purple">0</div>
                    <div className="text-xs text-primary-foreground/70">Modules Completed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <Button className="flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </Button>
              <Link href="/dashboard">
                <Button variant="outline" className="flex items-center gap-2">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
