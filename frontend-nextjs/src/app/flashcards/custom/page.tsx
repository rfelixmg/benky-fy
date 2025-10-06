"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/common/auth";
import { UserMenu } from "@/components/common/layout/navigation/user-menu";
import { useAuth } from "@/core/hooks";
import { FloatingElements } from "@/components/common/layout/background";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Settings,
  Play,
  BarChart3,
  Target,
  Zap,
  BookOpen,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { CustomFlashcardSettingsModal, type CustomFlashcardSettings } from "@/components/flashcard/core/settings";

export default function CustomFlashcardPage() {
  const { data: authData } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<CustomFlashcardSettings | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);

  const handleSaveSettings = (newSettings: CustomFlashcardSettings) => {
    setSettings(newSettings);
    setShowSettings(false);
  };

  const startSession = () => {
    if (!settings) {
      setShowSettings(true);
      return;
    }
    setIsSessionActive(true);
    // TODO: Implement session logic
  };

  const getEnabledWordTypes = () => {
    if (!settings) return [];
    return Object.entries(settings.wordTypes)
      .filter(([_, enabled]) => enabled)
      .map(([type, _]) => type);
  };

  const getEnabledDisplayModes = () => {
    if (!settings) return [];
    return Object.entries(settings.displayModes)
      .filter(([_, enabled]) => enabled)
      .map(([mode, _]) => mode);
  };

  const getEnabledInputModes = () => {
    if (!settings) return [];
    return Object.entries(settings.inputModes)
      .filter(([_, enabled]) => enabled)
      .map(([mode, _]) => mode);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-primary-purple to-secondary-purple relative overflow-hidden">
        <FloatingElements />

        {/* Header */}
        <div className="relative z-10 p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/flashcards" className="flex items-center">
              <Image
                src="/logo1.webp"
                alt="BenkoFY logo"
                width={60}
                height={36}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                unoptimized
                priority
              />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-primary-foreground">
                Custom Flashcards
              </h1>
              <p className="text-primary-foreground/80">
                Personalized learning experience
              </p>
            </div>
          </div>

          {authData?.user && <UserMenu user={authData.user} />}
        </div>

        {/* Main Content */}
        <div className="relative z-10 px-6 pb-6">
          <div className="max-w-4xl mx-auto">
            
            {/* Configuration Status */}
            <Card className="bg-background/10 backdrop-blur-sm border-white/20 mb-6">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-primary-foreground">
                        Configuration Status
                      </h2>
                      <p className="text-primary-foreground/80 text-sm">
                        {settings ? "Ready to start" : "Configure your custom flashcards"}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowSettings(true)}
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {settings ? "Edit Settings" : "Configure"}
                  </Button>
                </div>

                {settings ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/10 rounded-lg p-4">
                      <h4 className="font-medium text-white mb-2">Word Types</h4>
                      <div className="flex flex-wrap gap-1">
                        {getEnabledWordTypes().map((type) => (
                          <span
                            key={type}
                            className="px-2 py-1 bg-blue-500/20 text-blue-200 text-xs rounded"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <h4 className="font-medium text-white mb-2">Display Modes</h4>
                      <div className="flex flex-wrap gap-1">
                        {getEnabledDisplayModes().map((mode) => (
                          <span
                            key={mode}
                            className="px-2 py-1 bg-green-500/20 text-green-200 text-xs rounded"
                          >
                            {mode}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <h4 className="font-medium text-white mb-2">Input Modes</h4>
                      <div className="flex flex-wrap gap-1">
                        {getEnabledInputModes().map((mode) => (
                          <span
                            key={mode}
                            className="px-2 py-1 bg-purple-500/20 text-purple-200 text-xs rounded"
                          >
                            {mode}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-white/40 mx-auto mb-4" />
                    <p className="text-white/60 mb-4">
                      Configure your custom flashcard settings to get started
                    </p>
                    <Button
                      onClick={() => setShowSettings(true)}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Configure Settings
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Session Controls */}
            {settings && (
              <Card className="bg-background/10 backdrop-blur-sm border-white/20 mb-6">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                        <Play className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-primary-foreground">
                          Session Controls
                        </h2>
                        <p className="text-primary-foreground/80 text-sm">
                          Start your personalized learning session
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={startSession}
                      disabled={isSessionActive}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {isSessionActive ? "Session Active" : "Start Session"}
                    </Button>
                  </div>

                  {isSessionActive ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Zap className="w-8 h-8 text-green-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Session Active
                      </h3>
                      <p className="text-white/60 mb-4">
                        Your custom flashcard session is running
                      </p>
                      <Button
                        onClick={() => setIsSessionActive(false)}
                        variant="outline"
                        className="border-red-500/30 text-red-300 hover:bg-red-500/10"
                      >
                        End Session
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/10 rounded-lg p-4">
                        <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Session Preview
                        </h4>
                        <p className="text-white/70 text-sm mb-3">
                          Based on your configuration, this session will include:
                        </p>
                        <ul className="text-white/60 text-sm space-y-1">
                          <li>• {getEnabledWordTypes().length} word types</li>
                          <li>• {getEnabledDisplayModes().length} display modes</li>
                          <li>• {getEnabledInputModes().length} input methods</li>
                          <li>• Adaptive difficulty based on performance</li>
                        </ul>
                      </div>
                      <div className="bg-white/10 rounded-lg p-4">
                        <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          Expected Benefits
                        </h4>
                        <p className="text-white/70 text-sm mb-3">
                          Your personalized approach will help you:
                        </p>
                        <ul className="text-white/60 text-sm space-y-1">
                          <li>• Focus on your weak areas</li>
                          <li>• Practice preferred input methods</li>
                          <li>• Learn at your optimal pace</li>
                          <li>• Track detailed progress</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-background/10 backdrop-blur-sm border-white/20">
                <div className="p-4 text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Settings className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Customize</h3>
                  <p className="text-white/60 text-sm mb-3">
                    Configure word types, display modes, and input methods
                  </p>
                  <Button
                    onClick={() => setShowSettings(true)}
                    variant="outline"
                    size="sm"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    Configure
                  </Button>
                </div>
              </Card>

              <Card className="bg-background/10 backdrop-blur-sm border-white/20">
                <div className="p-4 text-center">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Play className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Practice</h3>
                  <p className="text-white/60 text-sm mb-3">
                    Start a personalized learning session
                  </p>
                  <Button
                    onClick={startSession}
                    disabled={!settings}
                    variant="outline"
                    size="sm"
                    className="border-white/30 text-white hover:bg-white/10 disabled:opacity-50"
                  >
                    Start Session
                  </Button>
                </div>
              </Card>

              <Card className="bg-background/10 backdrop-blur-sm border-white/20">
                <div className="p-4 text-center">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Track Progress</h3>
                  <p className="text-white/60 text-sm mb-3">
                    View detailed analytics and performance metrics
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    View Stats
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <CustomFlashcardSettingsModal
            onClose={() => setShowSettings(false)}
            onSave={handleSaveSettings}
          />
        )}
      </div>
    </AuthGuard>
  );
}
