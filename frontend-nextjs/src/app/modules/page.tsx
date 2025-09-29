'use client';

import { AuthGuard, UserMenu } from '@/components/auth-guard';
import { useAuth } from '@/lib/hooks';
import { FloatingElements } from '@/components/floating-elements';
import { BookOpen, Brain, Target, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const modules = [
  {
    id: 'hiragana',
    name: 'Hiragana',
    description: 'Learn the basic Japanese syllabary',
    icon: BookOpen,
    color: 'from-blue-500 to-blue-600',
    difficulty: 'Beginner',
    cards: 46,
  },
  {
    id: 'katakana',
    name: 'Katakana',
    description: 'Master the katakana writing system',
    icon: Brain,
    color: 'from-green-500 to-green-600',
    difficulty: 'Beginner',
    cards: 46,
  },
  {
    id: 'verbs',
    name: 'Japanese Verbs',
    description: 'Essential verbs with conjugations',
    icon: Target,
    color: 'from-purple-500 to-purple-600',
    difficulty: 'Intermediate',
    cards: 50,
  },
  {
    id: 'adjectives',
    name: 'Adjectives',
    description: 'i-adjectives and na-adjectives',
    icon: Zap,
    color: 'from-orange-500 to-orange-600',
    difficulty: 'Intermediate',
    cards: 30,
  },
];

export default function ModulesPage() {
  const { data: authData } = useAuth();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary relative overflow-hidden">
        <FloatingElements />
        
        {/* Header */}
        <div className="relative z-10 p-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Learning Modules</h1>
            <p className="text-white/80">Choose a module to start learning</p>
          </div>
          
          {authData?.user && (
            <UserMenu user={authData.user} />
          )}
        </div>
        
        {/* Modules Grid */}
        <div className="relative z-10 px-6 pb-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {modules.map((module) => {
                const IconComponent = module.icon;
                return (
                  <Link
                    key={module.id}
                    href={`/flashcards/${module.id}`}
                    className="group"
                  >
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {module.name}
                      </h3>
                      
                      <p className="text-white/80 text-sm mb-4">
                        {module.description}
                      </p>
                      
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                          {module.difficulty}
                        </span>
                        <span className="text-xs text-white/60">
                          {module.cards} cards
                        </span>
                      </div>
                      
                      <div className="flex items-center text-white/60 text-sm group-hover:text-white transition-colors">
                        Start Learning
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            
            {/* Additional Info */}
            <div className="mt-12 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
                <h3 className="text-xl font-semibold text-white mb-4">
                  How it works
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/80">
                  <div>
                    <div className="font-medium text-white mb-2">1. Choose a Module</div>
                    <p>Select from Hiragana, Katakana, Verbs, or Adjectives</p>
                  </div>
                  <div>
                    <div className="font-medium text-white mb-2">2. Practice with Flashcards</div>
                    <p>Type your answers and get instant feedback</p>
                  </div>
                  <div>
                    <div className="font-medium text-white mb-2">3. Track Progress</div>
                    <p>Monitor your learning with detailed statistics</p>
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
