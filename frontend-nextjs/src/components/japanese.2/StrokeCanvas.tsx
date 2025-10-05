'use client';

import { useRef, useEffect, useState } from 'react';
import { textStyles, layoutStyles } from '@/styles/components';

interface Point {
  x: number;
  y: number;
  time: number;
}

interface Stroke {
  points: Point[];
}

interface StrokeCanvasProps {
  character: string;
  onStrokeComplete: (strokeData: {
    strokes: number[][];
    timing: number[];
  }) => void;
  width?: number;
  height?: number;
}

export function StrokeCanvas({
  character,
  onStrokeComplete,
  width = 200,
  height = 200,
}: StrokeCanvasProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke>({ points: [] });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and set up canvas
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw guide character
    ctx.font = '48px serif';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(character, width / 2, height / 2);

    // Draw existing strokes
    strokes.forEach(stroke => {
      if (stroke.points.length < 2) return;
      
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      
      ctx.stroke();
    });
  }, [character, strokes, width, height]);

  const startStroke = (x: number, y: number) => {
    setIsDrawing(true);
    setCurrentStroke({
      points: [{ x, y, time: Date.now() }],
    });
  };

  const continueStroke = (x: number, y: number) => {
    if (!isDrawing) return;

    setCurrentStroke(prev => ({
      points: [...prev.points, { x, y, time: Date.now() }],
    }));

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const points = currentStroke.points;
    if (points.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endStroke = () => {
    if (!isDrawing) return;

    setIsDrawing(false);
    setStrokes(prev => [...prev, currentStroke]);

    // Convert strokes to API format
    const strokeData = {
      strokes: strokes.map(stroke =>
        stroke.points.map(point => [Math.round(point.x), Math.round(point.y)])
      ).flat(),
      timing: strokes.map(stroke =>
        stroke.points.map(point => point.time)
      ).flat(),
    };

    onStrokeComplete(strokeData);
  };

  const handleClear = () => {
    setStrokes([]);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
  };

  return (
    <div className={`${layoutStyles.col} ${layoutStyles.gap.sm}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-white/20 rounded-lg bg-white/5"
        onMouseDown={e => {
          const rect = e.currentTarget.getBoundingClientRect();
          startStroke(
            e.clientX - rect.left,
            e.clientY - rect.top
          );
        }}
        onMouseMove={e => {
          const rect = e.currentTarget.getBoundingClientRect();
          continueStroke(
            e.clientX - rect.left,
            e.clientY - rect.top
          );
        }}
        onMouseUp={endStroke}
        onMouseLeave={endStroke}
        onTouchStart={e => {
          const rect = e.currentTarget.getBoundingClientRect();
          const touch = e.touches[0];
          startStroke(
            touch.clientX - rect.left,
            touch.clientY - rect.top
          );
        }}
        onTouchMove={e => {
          const rect = e.currentTarget.getBoundingClientRect();
          const touch = e.touches[0];
          continueStroke(
            touch.clientX - rect.left,
            touch.clientY - rect.top
          );
        }}
        onTouchEnd={endStroke}
      />
      <button
        onClick={handleClear}
        className={`${textStyles.sm} ${textStyles.secondary} hover:${textStyles.primary} transition-colors`}
      >
        Clear
      </button>
    </div>
  );
}
