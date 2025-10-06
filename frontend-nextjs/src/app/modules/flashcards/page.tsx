'use client';

import { AuthGuard } from '@/components/auth-guard';
import { FloatingElements } from '@/components/floating-elements';
import { Brain, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';

export default function FlashcardsModulePage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-primary-purple to-secondary-purple relative overflow-hidden">
        <FloatingElements />
        
        {/* Header */}
        <div className="relative z-10 p-6">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/modules">
              <Button variant="outline" className="border-border text-foreground hover:bg-accent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Modules
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Flashcards</h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-6 pb-6">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 text-center bg-background/10 backdrop-blur-sm border-primary-foreground/20">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-primary-foreground" />
              </div>
              
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Interactive Flashcards
              </h2>
              
              <p className="text-foreground/80 mb-6 max-w-2xl mx-auto">
                Practice with interactive flashcards covering Hiragana, Katakana, Numbers, 
                and more. Get instant feedback and track your progress.
              </p>
              
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg inline-block mb-6">
                Available Now
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="text-2xl mb-2">⚡</div>
                  <h3 className="font-semibold text-foreground mb-2">Instant Feedback</h3>
                  <p className="text-sm text-foreground/70">Get immediate results</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <h3 className="font-semibold text-foreground mb-2">Progress Tracking</h3>
                  <p className="text-sm text-foreground/70">Monitor your learning</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">🎯</div>
                  <h3 className="font-semibold text-foreground mb-2">Multiple Modules</h3>
                  <p className="text-sm text-foreground/70">Practice various topics</p>
                </div>
              </div>
              
              <div className="mt-8">
                <Button asChild size="lg" className="bg-background text-primary hover:bg-background/90">
                  <Link href="/flashcards">
                    Start Practicing Flashcards
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
