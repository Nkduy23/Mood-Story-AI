"use client";

import { type FC, useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/editorStore";
import { getMoodPack } from "@/features/mood-engine";
import type { MusicTrack } from "@/features/mood-engine/types";

// ── Icons ────────────────────────────────────────────────────────────────────

const PlayIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7L8 5z" />
  </svg>
);

const PauseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const MusicIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

// ── Track Item ────────────────────────────────────────────────────────────────

interface TrackItemProps {
  track: MusicTrack;
  isSelected: boolean;
  isPlaying: boolean;
  onSelect: (id: string) => void;
  onTogglePlay: (track: MusicTrack) => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function TrackItem({ track, isSelected, isPlaying, onSelect, onTogglePlay }: TrackItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-2xl",
        "border transition-all duration-200",
        isSelected ? "bg-[var(--brand-purple-dim)] border-[var(--brand-purple-border)]" : "bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--border-card)]",
      )}
    >
      {/* Play/Pause preview button */}
      <button
        onClick={() => onTogglePlay(track)}
        className={cn(
          "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
          "transition-all duration-150 active:scale-90",
          isSelected ? "bg-[var(--brand-purple)] text-white" : "bg-[var(--bg-elevated)] text-[var(--text-muted)]",
        )}
        aria-label={isPlaying ? "Pause" : "Play preview"}
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>

      {/* Track info */}
      <button className="flex-1 text-left min-w-0" onClick={() => onSelect(track.id)}>
        <p className={cn("text-sm font-medium truncate", isSelected ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]")}>{track.name}</p>
        <p className="text-[10px] text-[var(--text-muted)] mt-0.5 font-mono">
          {track.bpm} BPM · {formatDuration(track.duration)}
        </p>
      </button>

      {/* Selected indicator */}
      {isSelected && <span className="w-2 h-2 rounded-full shrink-0 bg-[var(--brand-purple)]" style={{ boxShadow: "0 0 6px var(--brand-purple)" }} />}
    </div>
  );
}

// ── MusicSelector ────────────────────────────────────────────────────────────

const MusicSelector: FC = () => {
  const selectedMoodPackId = useEditorStore((s) => s.selectedMoodPackId);
  const selectedMusicId = useEditorStore((s) => s.selectedMusicId);
  const selectMusic = useEditorStore((s) => s.selectMusic);

  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Lấy tracks từ mood pack hiện tại
  const tracks: MusicTrack[] = selectedMoodPackId ? getMoodPack(selectedMoodPackId).musicPool : [];

  // Cleanup audio khi unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const handleTogglePlay = (track: MusicTrack) => {
    // Đang play track này → pause
    if (playingId === track.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    // Pause track cũ nếu có
    audioRef.current?.pause();

    // Play track mới (preview 5s đầu)
    const audio = new Audio(`/music/${track.filename}`);
    audio.volume = 0.6;

    // Stop sau 5s
    const stopTimer = setTimeout(() => {
      audio.pause();
      setPlayingId(null);
    }, 5000);

    audio.onended = () => {
      clearTimeout(stopTimer);
      setPlayingId(null);
    };

    audio.onerror = () => {
      clearTimeout(stopTimer);
      setPlayingId(null);
    };

    audio.play().catch(() => setPlayingId(null));
    audioRef.current = audio;
    setPlayingId(track.id);
  };

  const handleSelect = (id: string) => {
    selectMusic(id);
    // Nếu đang play track khác → stop
    if (playingId && playingId !== id) {
      audioRef.current?.pause();
      setPlayingId(null);
    }
  };

  if (tracks.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MusicIcon />
        <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest font-mono">{tracks.length === 1 ? "Nhạc nền" : `Nhạc nền · ${tracks.length} track`}</p>
        {playingId && (
          <span className="ml-auto flex items-center gap-1 text-[10px] text-[var(--brand-purple)] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-purple)] animate-pulse" />
            đang phát · 5s
          </span>
        )}
      </div>

      {/* Track list */}
      <div className="flex flex-col gap-2">
        {tracks.map((track) => (
          <TrackItem key={track.id} track={track} isSelected={selectedMusicId === track.id} isPlaying={playingId === track.id} onSelect={handleSelect} onTogglePlay={handleTogglePlay} />
        ))}
      </div>
    </div>
  );
};

export { MusicSelector };
