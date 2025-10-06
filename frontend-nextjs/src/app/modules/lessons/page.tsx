'use client';

import { AuthGuard } from '@/components/auth-guard';
import { FloatingElements } from '@/components/floating-elements';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';

export default function LessonsPage() {
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
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Lessons</h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-6 pb-6">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 text-center bg-background/10 backdrop-blur-sm border-primary-foreground/20">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="w-8 h-8 text-primary-foreground" />
              </div>
              
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Structured Japanese Lessons
              </h2>
              
              <p className="text-foreground/80 mb-6 max-w-2xl mx-auto">
                Comprehensive lessons covering grammar, vocabulary, and cultural context. 
                Learn Japanese systematically with expert-designed curriculum.
              </p>
              
              <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg inline-block mb-6">
                Coming Soon - Currently in Development
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="text-2xl mb-2">📚</div>
                  <h3 className="font-semibold text-foreground mb-2">Grammar Focus</h3>
                  <p className="text-sm text-foreground/70">Learn Japanese grammar systematically</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">🎯</div>
                  <h3 className="font-semibold text-foreground mb-2">Progressive Learning</h3>
                  <p className="text-sm text-foreground/70">Build knowledge step by step</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">🌏</div>
                  <h3 className="font-semibold text-foreground mb-2">Cultural Context</h3>
                  <p className="text-sm text-foreground/70">Understand Japanese culture</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
