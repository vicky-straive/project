"use client";

import { useRef, useEffect, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { formatTimestamp } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WaveformPanelProps {
  videoUrl: string | null;
  currentTime: number;
  duration: number;
  onTimeChange: (time: number) => void;
  onWaveformClick: (time: number) => void;
  markers: { timestamp: number }[];
}

export function WaveformPanel({
  videoUrl,
  currentTime,
  duration,
  onTimeChange,
  onWaveformClick,
  markers,
}: WaveformPanelProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!waveformRef.current || !videoUrl) return;

    // Cleanup previous instance and abort controller
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
      wavesurferRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: 'var(--waveform-color)',
      progressColor: 'var(--waveform-progress-color)',
      cursorColor: 'var(--waveform-cursor-color)',
      height: 80,
      normalize: true,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      interact: true,
      minPxPerSec: 50,
      scrollParent: true,
      autoScroll: true,
      fillParent: false,
      media: new Audio(videoUrl),
    });

    // Handle ready state
    const handleReady = () => {
      if (signal.aborted) return;
      setIsReady(true);
    };

    // Handle interaction
    const handleInteraction = (timestamp: number) => {
      if (signal.aborted) return;
      onTimeChange(timestamp);
      onWaveformClick(timestamp);
    };

    wavesurfer.on('ready', handleReady);
    wavesurfer.on('interaction', handleInteraction);

    // Store instance
    wavesurferRef.current = wavesurfer;

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
      setIsReady(false);
    };
  }, [videoUrl, onWaveformClick, onTimeChange]);

  // Handle time updates
  useEffect(() => {
    if (wavesurferRef.current && duration > 0 && isReady) {
      try {
        wavesurferRef.current.seekTo(currentTime / duration);
      } catch (error) {
        console.debug('Seeking not available yet');
      }
    }
  }, [currentTime, duration, isReady]);

  const handleSliderChange = (value: number[]) => {
    const newTime = (value[0] / 100) * duration;
    onTimeChange(newTime);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Audio Waveform</h3>
      </div>
      <ScrollArea className="w-full h-[120px] rounded-lg bg-card">
        <div className="relative min-w-full">
          <div ref={waveformRef} className="w-full p-4" />
          {markers.map((marker, index) => (
            <div
              key={index}
              className="absolute top-0 w-0.5 h-full bg-primary"
              style={{
                left: `${(marker.timestamp / duration) * 100}%`,
                transform: 'translateX(-50%)',
              }}
            >
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-primary text-primary-foreground rounded text-xs">
                {formatTimestamp(marker.timestamp)}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono text-muted-foreground min-w-[80px]">
          {formatTimestamp(currentTime)}
        </span>
        <Slider
          value={[currentTime ? (currentTime / duration) * 100 : 0]}
          onValueChange={handleSliderChange}
          max={100}
          step={0.1}
          className="flex-1"
        />
        <span className="text-sm font-mono text-muted-foreground min-w-[80px] text-right">
          {formatTimestamp(duration)}
        </span>
      </div>
    </div>
  );
}