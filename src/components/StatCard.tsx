export default function StatCard({
  label,
  value,
  hint,
  live,
}: {
  label: string;
  value: number | string;
  hint?: string;
  live?: boolean;
}) {
  return (
    <div className="tf-card p-4">
      <p className="text-xs uppercase tracking-wider text-mute">{label}</p>
      <p className={`tf-title text-3xl mt-1 ${live && Number(value) > 0 ? 'text-cyan' : ''}`}>{value}</p>
      {hint && <p className="text-xs text-mute mt-1">{hint}</p>}
    </div>
  );
}
