"use client";

import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { formatTimestamp } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TimelineItem {
  id: string;
  timestamp: number;
  description: string;
}

interface TimelinePanelProps {
  items: TimelineItem[];
  onItemsChange: (items: TimelineItem[]) => void;
  onAddItem: (timestamp: number) => void;
  currentTime: number;
}

const SortableTimelineItem = ({ item, onDelete, onDescriptionChange }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 bg-background rounded-lg mb-2 group hover:bg-accent"
    >
      <div {...attributes} {...listeners}>
        <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-mono text-muted-foreground">
            {formatTimestamp(item.timestamp)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <Input
          value={item.description}
          onChange={(e) => onDescriptionChange(item.id, e.target.value)}
          className="w-full"
          placeholder="Enter audio description..."
        />
      </div>
    </div>
  );
};

export function TimelinePanel({
  items,
  onItemsChange,
  onAddItem,
  currentTime,
}: TimelinePanelProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      onItemsChange(arrayMove(items, oldIndex, newIndex));
    }
  };

  const sortedItems = [...items].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <div className="bg-card rounded-lg p-4 border h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Audio Descriptions</h2>
        <Button onClick={() => onAddItem(currentTime)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add AD
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sortedItems} strategy={verticalListSortingStrategy}>
            {sortedItems.map((item) => (
              <SortableTimelineItem
                key={item.id}
                item={item}
                onDelete={(id) => {
                  onItemsChange(items.filter((item) => item.id !== id));
                }}
                onDescriptionChange={(id, description) => {
                  onItemsChange(
                    items.map((item) =>
                      item.id === id ? { ...item, description } : item
                    )
                  );
                }}
              />
            ))}
          </SortableContext>
        </DndContext>
      </ScrollArea>
    </div>
  );
}