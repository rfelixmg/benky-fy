'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { FuriganaText } from './FuriganaText';

interface SwipeableCardProps {
  question: string;
  answer: string;
  onAnswer: (isCorrect: boolean) => void;
  showAnswer?: boolean;
  onShowAnswer?: () => void;
  furiganaHtml?: string;
  furiganaText?: string;
  furiganaStyle?: 'html' | 'text';
}

export function SwipeableCard({
  question,
  answer,
  onAnswer,
  showAnswer = false,
  onShowAnswer,
  furiganaHtml,
  furiganaText,
  furiganaStyle = 'html'
}: SwipeableCardProps) {
  const [isFramerMotionAvailable, setIsFramerMotionAvailable] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<number | null>(null);
  const controls = useAnimation();

  useEffect(() => {
    controls.start({ scale: 1 }).catch(() => {
      setIsFramerMotionAvailable(false);
    });
  }, [controls]);

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (Math.abs(offset) > 100 || Math.abs(velocity) > 500) {
      const direction = offset > 0 ? 1 : -1;
      await controls.start({
        x: direction * window.innerWidth,
        transition: { duration: 0.2 },
      });
      onAnswer(direction > 0);
    } else {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isFramerMotionAvailable) {
      touchStart.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isFramerMotionAvailable && touchStart.current !== null) {
      const touch = e.changedTouches[0];
      const diff = touch.clientX - touchStart.current;
      if (Math.abs(diff) > 100) {
        onAnswer(diff > 0);
      }
      touchStart.current = null;
    }
  };

  const handleTap = () => {
    if (!showAnswer && onShowAnswer) {
      onShowAnswer();
    }
  };

  const CardComponent = isFramerMotionAvailable ? motion.div : 'div';
  const motionProps = isFramerMotionAvailable ? {
    drag: "x",
    dragConstraints: { left: 0, right: 0 },
    onDragEnd: handleDragEnd,
    animate: controls,
    whileTap: { scale: 0.98 }
  } : {};

  return (
    <CardComponent
      ref={cardRef}
      {...motionProps}
      onClick={handleTap}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="touch-none select-none"
    >
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg mx-auto">
        <div className="text-center mb-4 text-sm text-gray-500">
          {!showAnswer ? 'Tap to reveal answer • Swipe to respond' : 'Swipe right if correct, left if incorrect'}
        </div>

        <div className="text-2xl font-bold mb-4 text-center">
          {furiganaHtml || furiganaText ? (
            <FuriganaText
              html={furiganaHtml}
              text={furiganaText}
              style={furiganaStyle}
            />
          ) : (
            question
          )}
        </div>

        {showAnswer && (
          <div
            className={`text-xl text-center text-blue-600 mt-4 ${
              isFramerMotionAvailable ? 'animate-fade-in' : ''
            }`}
          >
            {answer}
          </div>
        )}

        <div className="flex justify-between mt-6 text-sm text-gray-400">
          <span>← Incorrect</span>
          <span>Correct →</span>
        </div>
      </div>
    </CardComponent>
  );
}