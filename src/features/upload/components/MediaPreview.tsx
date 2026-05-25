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

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = files.findIndex((f) => f.id === active.id);
    const toIndex = files.findIndex((f) => f.id === over.id);
    if (fromIndex !== -1 && toIndex !== -1) onReorder(fromIndex, toIndex);
  };

  if (files.length === 0) return null;

  return (
    <div className="w-full">
      {isDraggable && <p className="text-[10px] text-[var(--text-muted)] text-center mb-2 font-mono">≡ kéo để sắp xếp thứ tự</p>}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={files.map((f) => f.id)} strategy={rectSortingStrategy}>
          {/*
            Luôn dùng 3 cols — thumbnail nhỏ, nhìn vừa 6 ảnh trong 2 hàng.
            aspect-square thay vì 9/16 — compact hơn nhiều.
            Nếu có nhiều hơn 6 ảnh thì scroll xuống tự nhiên.
          */}
          <div className={cn("grid gap-2", files.length === 1 ? "grid-cols-1 max-w-[120px] mx-auto" : "grid-cols-3")}>
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
