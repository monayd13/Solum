"use client";

interface WaveformVisualizerProps {
  audioLevel: number;
  isActive: boolean;
  color?: string;
  bars?: number;
}

export function WaveformVisualizer({
  audioLevel,
  isActive,
  color = "var(--amber)",
  bars = 20,
}: WaveformVisualizerProps) {
  if (!isActive) return null;

  return (
    <div className="flex gap-1 items-end" style={{ height: "48px" }}>
      {Array.from({ length: bars }).map((_, i) => {
        const phase = (i / bars) * Math.PI * 2;
        const base = Math.sin(phase) * 0.4 + 0.6;
        const height = Math.max(8, base * audioLevel * 48);
        return (
          <div
            key={i}
            className="rounded-full transition-all"
            style={{
              width: "3px",
              height: `${height}px`,
              background: color,
              opacity: 0.7 + base * 0.3,
              transitionDuration: "75ms",
            }}
          />
        );
      })}
    </div>
  );
}
