"use client";

import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { formatTimestamp } from '@/lib/utils';

interface VideoPanelProps {
  videoUrl: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onPlayPause: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export function VideoPanel({
  videoUrl,
  isPlaying,
  currentTime,
  duration,
  onTimeUpdate,
  onDurationChange,
  onPlayPause,
  onFileChange,
  videoRef,
}: VideoPanelProps) {
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      onDurationChange(videoRef.current.duration);
    }
  };

  return (
    <div className="space-y-4">
      {!videoUrl ? (
        <div className="aspect-video bg-card rounded-lg flex items-center justify-center border-2 border-dashed border-muted">
          <Label
            htmlFor="video-upload"
            className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
          >
            Click to upload video
            <Input
              id="video-upload"
              type="file"
              accept="video/*"
              className="hidden"
              onChange={onFileChange}
            />
          </Label>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full rounded-lg bg-black"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
        />
      )}

      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            if (videoRef.current) {
              videoRef.current.currentTime -= 5;
            }
          }}
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onPlayPause}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            if (videoRef.current) {
              videoRef.current.currentTime += 5;
            }
          }}
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}