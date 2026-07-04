export default function AdminAiPage() {
  return (
    <div className="px-5 py-6">
      <div className="flex items-center gap-3 mb-6 px-1 pb-5 border-b border-[var(--color-border)]">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-[var(--color-text-secondary)] bg-clip-text text-transparent">
            AI Fleet
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Manage and monitor autonomous AI agents
          </p>
        </div>
      </div>
    </div>
  );
}
