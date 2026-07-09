export default function RateLimitBanner() {
  return (
    <div
      className="mt-4 flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-md)] border text-[13px]"
      style={{
        color: 'var(--color-warning)',
        borderColor: 'var(--color-warning)',
        background: 'color-mix(in srgb, var(--color-warning) 10%, transparent)',
      }}
      role="alert"
    >
      <span className="font-bold shrink-0">429</span>
      <span>
        LLM provider rate limited (Too Many Requests) — agent istekleri reddediliyor olabilir.
        Ayrıntı için Agent Logs&apos;a bakın.
      </span>
    </div>
  );
}
