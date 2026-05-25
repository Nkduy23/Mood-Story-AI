"use client";

import { type FC } from "react";
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { FileThumb } from "./FileThumb";
import type { UploadedFile } from "@/store/uploadStore";
import type { StoryType } from "@/features/mood-engine";
import { cn } from "@/lib/utils";

interface MediaPreviewProps {
  files: UploadedFile[];
  storyType: StoryType | null;
  onRemove: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

const MediaPreview: FC<MediaPreviewProps> = ({ files, storyType, onRemove, onReorder }) => {
  const isDraggable = storyType === "journey" && files.length > 1;

  // Pointer cho desktop, Touch cho mobile
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromIndex = files.findIndex((f) => f.id === active.id);
    const toIndex = files.findIndex((f) => f.id === over.id);
    if (fromIndex !== -1 && toIndex !== -1) {
      onReorder(fromIndex, toIndex);
    }
  };

  if (files.length === 0) return null;

  return (
    <div className="w-full">
      {/* Journey drag hint */}
      {isDraggable && <p className="text-[10px] text-[var(--text-muted)] text-center mb-2 font-mono">≡ kéo để sắp xếp thứ tự</p>}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={files.map((f) => f.id)} strategy={rectSortingStrategy}>
          <div
            className={cn(
              "grid gap-2",
              // Layout: 1 file → 1 col lớn, 2+ → 2 cols, 4+ → vẫn 2 col nhưng nhỏ hơn
              files.length === 1 ? "grid-cols-1 max-w-[160px] mx-auto" : "grid-cols-2",
            )}
          >
            {files.map((file, index) => (
              <FileThumb key={file.id} file={file} index={index} isDraggable={isDraggable} onRemove={onRemove} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export { MediaPreview };
