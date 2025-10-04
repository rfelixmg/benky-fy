'use client';

import { useState } from 'react';
import { AuthGuard, UserMenu } from '@/components/auth-guard';
import { useAuth } from '@/lib/hooks';
import { FloatingElements } from '@/components/floating-elements';
import { RomajiInput } from '@/components/japanese/romaji-input';
import { Button } from '@/components/ui/button';
import { BookOpen, Brain, Target, TrendingUp, Clock, Award, Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const recentModules = [
  { id: 'hiragana', name: 'Hiragana', progress: 75, lastStudied: '2 hours ago' },
  { id: 'verbs', name: 'Japanese Verbs', progress: 45, lastStudied: '1 day ago' },
  { id: 'katakana', name: 'Katakana', progress: 20, lastStudied: '3 days ago' },
];

const stats = [
  { label: 'Total Cards Studied', value: '156', icon: BookOpen, color: 'text-blue-500' },
  { label: 'Current Streak', value: '7 days', icon: TrendingUp, color: 'text-green-500' },
  { label: 'Study Time Today', value: '25 min', icon: Clock, color: 'text-purple-500' },
  { label: 'Accuracy Rate', value: '87%', icon: Award, color: 'text-orange-500' },
];

export default function DashboardPage() {
  const { data: authData } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [useRomajiInput, setUseRomajiInput] = useState(false);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-primary-purple to-secondary-purple relative overflow-hidden">
        <FloatingElements />
        
        {/* Header */}
        <div className="relative z-10 p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Image
                src="/logo1.webp"
                alt="BenkoFY logo"
                width={80}
                height={48}
                className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                priority
                style={{ width: "auto", height: "auto" }}
              />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-primary-foreground">
                Welcome back, {authData?.user?.name?.split(' ')[0] || 'Student'}!
              </h1>
              <p className="text-primary-foreground/80">Ready to continue your Japanese learning journey?</p>
            </div>
          </div>
          
          {authData?.user && (
            <UserMenu user={authData.user} />
          )}
        </div>
        
        {/* Quick Search */}
        <div className="relative z-10 px-6 pb-6">
          <div className="max-w-6xl mx-auto mb-6">
            <div className="bg-background/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-4 h-4 text-primary-foreground" />
                <h3 className="text-sm font-semibold text-primary-foreground">Quick Search</h3>
              </div>
              
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-primary-foreground/80 text-sm">
                  <input
                    type="checkbox"
                    checked={useRomajiInput}
                    onChange={(e) => setUseRomajiInput(e.target.checked)}
                    className="rounded border-white/30 bg-white/20 text-white focus:ring-white/50"
                  />
                  Romaji
                </label>
                
                {useRomajiInput ? (
                  <RomajiInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search modules..."
                    showPreview={true}
                    outputType="auto"
                    className="text-sm flex-1"
                  />
                ) : (
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search modules..."
                    className="flex-1 px-3 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-sm"
                  />
                )}
                
                {searchTerm && (
                  <Link href={`/modules?search=${encodeURIComponent(searchTerm)}`}>
                    <Button size="sm" className="bg-white text-primary hover:bg-white/90">
                      Go
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 px-6 pb-6">
          <div className="max-w-6xl mx-auto">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat) => {
                const IconComponent = stat.icon;
                return (
                  <div key={stat.label} className="bg-background/10 backdrop-blur-sm rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                      <IconComponent className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className="text-2xl font-bold text-primary-foreground mb-1">{stat.value}</div>
                    <div className="text-sm text-primary-foreground/70">{stat.label}</div>
                  </div>
                );
              })}
            </div>
            
            {/* Recent Modules */}
            <div className="bg-background/10 backdrop-blur-sm rounded-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-primary-foreground">Continue Learning</h2>
                <Link href="/modules">
                  <Button variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                    View All Modules
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentModules.map((module) => (
                  <Link
                    key={module.id}
                    href={`/flashcards/${module.id}`}
                    className="group"
                  >
                    <div className="bg-background/5 rounded-lg p-4 hover:bg-background/10 transition-all duration-300">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-primary-foreground">{module.name}</h3>
                        <span className="text-sm text-primary-foreground/60">{module.progress}%</span>
                      </div>
                      
                      <div className="w-full bg-primary-foreground/20 rounded-full h-2 mb-2">
                        <div
                          className="bg-primary-foreground h-2 rounded-full transition-all duration-300"
                          style={{ width: `${module.progress}%` }}
                        />
                      </div>
                      
                      <div className="text-xs text-primary-foreground/60">
                        Last studied: {module.lastStudied}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-background/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-lg font-semibold text-primary-foreground mb-4">Quick Start</h3>
                <div className="space-y-3">
                  <Link href="/flashcards/hiragana">
                    <Button className="w-full justify-start bg-background text-primary hover:bg-background/90">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Practice Hiragana
                    </Button>
                  </Link>
                  <Link href="/flashcards/verbs">
                    <Button className="w-full justify-start bg-background text-primary hover:bg-background/90">
                      <Target className="w-4 h-4 mr-2" />
                      Practice Verbs
                    </Button>
                  </Link>
                  <Link href="/modules">
                    <Button variant="outline" className="w-full justify-start border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                      <Brain className="w-4 h-4 mr-2" />
                      Browse All Modules
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="bg-background/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-lg font-semibold text-primary-foreground mb-4">Today&apos;s Goals</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-primary-foreground/80">Study 20 cards</span>
                    <span className="text-sm text-primary-foreground/60">12/20</span>
                  </div>
                  <div className="w-full bg-primary-foreground/20 rounded-full h-2">
                    <div className="bg-primary-foreground h-2 rounded-full w-3/5" />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-primary-foreground/80">Maintain streak</span>
                    <span className="text-sm text-green-400">✓ Done</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-primary-foreground/80">Practice for 15 min</span>
                    <span className="text-sm text-primary-foreground/60">8/15 min</span>
                  </div>
                  <div className="w-full bg-primary-foreground/20 rounded-full h-2">
                    <div className="bg-primary-foreground h-2 rounded-full w-1/2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
