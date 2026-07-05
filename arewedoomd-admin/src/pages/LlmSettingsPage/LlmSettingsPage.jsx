import useLlmSettings from '../../features/llm-settings/hooks/useLlmSettings';
import LlmSettingsForm from '../../features/llm-settings/components/LlmSettingsForm';

function extractApiError(err) {
  if (!err) return null;
  const data = err?.response?.data;
  if (!data) return err?.message ?? 'Bir hata oluştu.';
  if (typeof data === 'string') return data;
  if (data.errors) {
    const msgs = Object.values(data.errors).flat();
    return msgs.join(' ');
  }
  return data.detail ?? data.error ?? data.message ?? 'Bir hata oluştu.';
}

export default function LlmSettingsPage() {
  const { settings, loading, error, save, saving } = useLlmSettings();
  const apiError = extractApiError(error);

  return (
    <div className="max-w-xl flex flex-col gap-4">
      <h1 className="text-xl font-bold text-[var(--color-text-heading)]">LLM Ayarları</h1>
      <p className="text-sm text-[var(--color-text-secondary)]">
        Model, düşünme (thinking) ve token bütçeleri tüm LLM akışlarına uygulanır:
        planlama puanlama/kompozisyon, toplu AI hesap üretimi ve agent cevapları.
      </p>

      {apiError && (
        <div className="px-3.5 py-3 bg-red-500/[0.08] border border-red-500/25 rounded-[var(--radius-md)] text-red-400 text-[13px] leading-relaxed">
          {apiError}
        </div>
      )}

      {!loading && settings && (
        <LlmSettingsForm settings={settings} onSave={save} saving={saving} />
      )}
    </div>
  );
}
