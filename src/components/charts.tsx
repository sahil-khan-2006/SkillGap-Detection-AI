"use client";

/**
 * Lightweight dependency-free SVG chart components (animated, responsive,
 * accessible). Used instead of a heavyweight charting bundle so the dashboard
 * stays fast and SSR-friendly.
 */

export function ScoreRing({
  value,
  size = 190,
  stroke = 13,
  label = "Match Score",
  sublabel,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;
  const tone = clamped >= 75 ? "#34d399" : clamped >= 50 ? "#fbbf24" : "#fb7185";

  return (
    <div className="ring-animate relative inline-flex items-center justify-center">
      <svg width={size} height={size} role="img" aria-label={`${label}: ${Math.round(clamped)} percent`}>
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="55%" stopColor={tone} />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          className="progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ filter: "drop-shadow(0 0 12px rgba(99,102,241,0.55))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-semibold tracking-tight text-white">{Math.round(clamped)}%</span>
        <span className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">{label}</span>
        {sublabel && <span className="mt-1 text-[11px] text-[var(--muted)]">{sublabel}</span>}
      </div>
    </div>
  );
}

export function DonutChart({
  data,
  size = 170,
  centerLabel,
}: {
  data: Array<{ label: string; value: number; color: string }>;
  size?: number;
  centerLabel?: string;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const radius = size / 2 - 12;
  const circumference = 2 * Math.PI * radius;
  const slices = data.reduce<Array<{ label: string; color: string; dash: number; gap: number; offset: number }>>(
    (items, slice) => {
      const previous = items.reduce((sum, item) => sum + item.dash / circumference, 0);
      const fraction = slice.value / total;
      const dash = circumference * fraction;
      return [
        ...items,
        {
          label: slice.label,
          color: slice.color,
          dash,
          gap: circumference - dash,
          offset: -circumference * previous,
        },
      ];
    },
    [],
  );

  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg width={size} height={size} role="img" aria-label="Skill match distribution">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={16} />
        {slices.map((slice) => (
          <circle
            key={slice.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={slice.color}
            strokeWidth={16}
            strokeDasharray={`${slice.dash} ${slice.gap}`}
            strokeDashoffset={slice.offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            className="transition-all duration-700"
          />
        ))}
        {centerLabel && (
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-white text-xl font-semibold"
          >
            {centerLabel}
          </text>
        )}
      </svg>
      <ul className="space-y-2 text-sm">
        {data.map((slice) => (
          <li key={slice.label} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm" style={{ background: slice.color }} />
            <span className="text-[var(--muted)]">{slice.label}</span>
            <span className="font-semibold text-white">{slice.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BarChart({
  data,
  height = 200,
  suffix = "%",
}: {
  data: Array<{ label: string; value: number; color?: string }>;
  height?: number;
  suffix?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-3">
      {data.map((row, index) => (
        <div key={row.label}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-[var(--muted)]">{row.label}</span>
            <span className="font-semibold text-white">
              {row.value}
              {suffix}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full transition-[width] duration-700 ease-out"
              style={{
                width: `${(row.value / max) * 100}%`,
                background: row.color ?? "linear-gradient(90deg,#6366f1,#22d3ee)",
                transitionDelay: `${index * 40}ms`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RadarChart({
  axes,
  size = 260,
}: {
  axes: Array<{ label: string; value: number; max?: number }>;
  size?: number;
}) {
  const count = axes.length || 1;
  const radius = size / 2 - 34;
  const center = size / 2;
  const angle = (i: number) => (Math.PI * 2 * i) / count - Math.PI / 2;
  const point = (i: number, r: number) => [center + Math.cos(angle(i)) * r, center + Math.sin(angle(i)) * r];

  const polygon = axes
    .map((axis, i) => {
      const ratio = Math.max(0, Math.min(1, axis.value / (axis.max ?? 100)));
      const [x, y] = point(i, radius * ratio);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={size} height={size} role="img" aria-label="Skill coverage by category">
      {[0.25, 0.5, 0.75, 1].map((level) => (
        <polygon
          key={level}
          points={axes.map((_, i) => point(i, radius * level).map((n) => n.toFixed(1)).join(",")).join(" ")}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
        />
      ))}
      {axes.map((axis, i) => {
        const [x, y] = point(i, radius);
        const [lx, ly] = point(i, radius + 20);
        return (
          <g key={axis.label}>
            <line x1={center} y1={center} x2={x} y2={y} stroke="rgba(255,255,255,0.08)" />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central" className="fill-slate-400 text-[10px]">
              {axis.label.split(" ")[0]}
            </text>
          </g>
        );
      })}
      <polygon points={polygon} fill="rgba(99,102,241,0.35)" stroke="#818cf8" strokeWidth={2} />
    </svg>
  );
}

export function CategoryBars({ data }: { data: Array<{ category: string; matched: number; missing: number }> }) {
  const max = Math.max(...data.map((d) => d.matched + d.missing), 1);
  return (
    <div className="space-y-4">
      {data.map((row) => (
        <div key={row.category}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-[var(--muted)]">{row.category}</span>
            <span className="text-white">
              <span className="font-semibold text-emerald-300">{row.matched}</span>
              <span className="text-[var(--muted)]"> / {row.matched + row.missing}</span>
            </span>
          </div>
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/8">
            <div
              className="bg-gradient-to-r from-emerald-400 to-emerald-500 transition-[width] duration-700"
              style={{ width: `${(row.matched / max) * 100}%` }}
            />
            <div
              className="bg-gradient-to-r from-rose-400/80 to-rose-500/80 transition-[width] duration-700"
              style={{ width: `${(row.missing / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
