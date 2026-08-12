export function MetricCard({
  label,
  value,
  unit,
  delta,
  deltaPositive,
  series,
}: {
  label: string;
  value: string;
  unit?: string;
  delta: string;
  deltaPositive: boolean;
  series: number[];
}) {
  const max = Math.max(...series.map(Math.abs), 0.001);
  const points = series
    .map((v, i) => {
      const x = (i / (series.length - 1)) * 100;
      const y = 100 - (Math.abs(v) / max) * 85 - 5;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="rag-glass p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--rag-muted)]">
          {label}
        </p>
        <span
          className={`rag-mono text-[11px] ${
            deltaPositive
              ? "text-[var(--rag-success)]"
              : "text-[var(--rag-warn)]"
          }`}
        >
          {delta}
        </span>
      </div>
      <p className="mt-2 flex items-baseline gap-1">
        <span className="rag-mono text-2xl font-medium tracking-tight text-[var(--rag-ink)]">
          {value}
        </span>
        {unit ? (
          <span className="text-xs text-[var(--rag-muted)]">{unit}</span>
        ) : null}
      </p>
      <svg
        viewBox="0 0 100 100"
        className="mt-3 h-10 w-full"
        preserveAspectRatio="none"
        aria-hidden
      >
        <polyline
          fill="none"
          stroke="var(--rag-accent)"
          strokeWidth="2"
          strokeOpacity="0.7"
          points={points}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
