"use client";

import { useState, useRef } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { VideoPanel } from '@/components/video-panel';
import { WaveformPanel } from '@/components/waveform-panel';
import { TimelinePanel } from '@/components/timeline-panel';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

interface TimelineItem {
  id: string;
  timestamp: number;
  description: string;
}

export default function VideoEditor() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeChange = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleWaveformClick = (time: number) => {
    handleTimeChange(time);
    addTimelineItem(time);
  };

  const addTimelineItem = (timestamp: number) => {
    const newItem: TimelineItem = {
      id: Date.now().toString(),
      timestamp,
      description: '',
    };
    setTimelineItems([...timelineItems, newItem]);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Video Timeline Editor</h1>
          <ThemeToggle />
        </div>
        
        <ResizablePanelGroup direction="horizontal" className="min-h-[calc(100vh-8rem)]">
          <ResizablePanel defaultSize={70} minSize={30}>
            <div className="h-full p-4 space-y-4">
              <VideoPanel
                videoUrl={videoUrl}
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                onTimeUpdate={setCurrentTime}
                onDurationChange={setDuration}
                onPlayPause={togglePlayPause}
                onFileChange={handleFileChange}
                videoRef={videoRef}
              />
              <WaveformPanel
                videoUrl={videoUrl}
                currentTime={currentTime}
                duration={duration}
                onTimeChange={handleTimeChange}
                onWaveformClick={handleWaveformClick}
                markers={timelineItems}
              />
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={30} minSize={20}>
            <TimelinePanel
              items={timelineItems}
              onItemsChange={setTimelineItems}
              onAddItem={addTimelineItem}
              currentTime={currentTime}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}