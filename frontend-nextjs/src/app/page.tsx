import { FloatingElements } from '@/components/floating-elements';
import { Button } from '@/components/ui/button';
import { BookOpen, Brain, Target, Zap } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary relative overflow-hidden">
      <FloatingElements />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Logo and Title */}
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-4">
              Benky-Fy
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Your AI-powered Japanese learning companion
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
              <Brain className="w-8 h-8 mx-auto mb-3 text-white" />
              <h3 className="font-semibold mb-2">Smart Flashcards</h3>
              <p className="text-sm text-white/80">
                AI-driven spaced repetition for optimal learning
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
              <Target className="w-8 h-8 mx-auto mb-3 text-white" />
              <h3 className="font-semibold mb-2">Active Recall</h3>
              <p className="text-sm text-white/80">
                Type-based answers for real memory retention
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
              <BookOpen className="w-8 h-8 mx-auto mb-3 text-white" />
              <h3 className="font-semibold mb-2">Comprehensive</h3>
              <p className="text-sm text-white/80">
                Hiragana, Katakana, Verbs, and Grammar
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
              <Zap className="w-8 h-8 mx-auto mb-3 text-white" />
              <h3 className="font-semibold mb-2">Adaptive</h3>
              <p className="text-sm text-white/80">
                Learning path that grows with your progress
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                Start Learning
              </Button>
            </Link>
            <Link href="/modules">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                View Modules
              </Button>
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-16 text-white/70">
            <p className="text-sm">
              Join thousands of learners mastering Japanese with AI-powered flashcards
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}