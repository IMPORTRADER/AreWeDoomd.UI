import { useEffect, useRef, useState } from 'react';
import Widget from '../../../components/ui/Widget';
import Button from '../../../components/ui/Button';

const INPUT_CLASS =
  'w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-input-focus-border)] disabled:opacity-50';

const NUMERIC_FIELDS = [
  { key: 'scoringTokensPerAccount',  label: 'Puanlama bütçesi (token / hesap)' },
  { key: 'compositionTokensPerPost', label: 'Kompozisyon bütçesi (token / gönderi)' },
  { key: 'replyMaxTokens',           label: 'Cevap bütçesi (token / cevap)' },
];

// ── Skeleton: mirrors the real form's field rows so the widget's height
// doesn't change once settings finish loading (avoids a layout jump).
function SkeletonForm() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 3 + NUMERIC_FIELDS.length }).map((_, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <div className="skeleton h-3 w-32 rounded" />
          <div className="skeleton h-[42px] w-full rounded-[var(--radius-md)]" />
        </div>
      ))}
      <div className="flex justify-end pt-1">
        <div className="skeleton h-9 w-20 rounded-[var(--radius-md)]" />
      </div>
    </div>
  );
}

export default function LlmSettingsForm({ settings, onSave, saving }) {
  const [form, setForm] = useState({
    model:                    '',
    scoringModel:             '',
    thinkingEnabled:          false,
    provider:                 '',
    scoringTokensPerAccount:  512,
    compositionTokensPerPost: 800,
    replyMaxTokens:           1024,
  });

  // Seed the form once settings arrive — the widget is mounted immediately
  // (with a skeleton) rather than waiting on the parent to gate rendering.
  const seededRef = useRef(false);
  useEffect(() => {
    if (settings && !seededRef.current) {
      seededRef.current = true;
      setForm({
        model:                    settings.model ?? '',
        scoringModel:             settings.scoringModel ?? '',
        thinkingEnabled:          settings.thinkingEnabled ?? false,
        provider:                 settings.provider ?? '',
        scoringTokensPerAccount:  settings.scoringTokensPerAccount ?? 512,
        compositionTokensPerPost: settings.compositionTokensPerPost ?? 800,
        replyMaxTokens:           settings.replyMaxTokens ?? 1024,
      });
    }
  }, [settings]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (saving) return;
    onSave({
      ...form,
      scoringTokensPerAccount:  Number(form.scoringTokensPerAccount),
      compositionTokensPerPost: Number(form.compositionTokensPerPost),
      replyMaxTokens:           Number(form.replyMaxTokens),
    });
  };

  if (!settings) {
    return (
      <Widget title="LLM Ayarları">
        <SkeletonForm />
      </Widget>
    );
  }

  const providers = settings.availableProviders ?? [];

  return (
    <Widget title="LLM Ayarları">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="llmProvider" className="text-sm font-medium text-[var(--color-text-primary)]">
            Provider
            <span className="ml-1 text-xs font-normal text-[var(--color-text-secondary)]">(boş = env varsayılanı)</span>
          </label>
          <select
            id="llmProvider"
            value={form.provider}
            onChange={(e) => setField('provider', e.target.value)}
            disabled={saving}
            className={INPUT_CLASS}
          >
            <option value="">(env varsayılanı)</option>
            {providers.map((p) => (
              <option key={p.name} value={p.name} disabled={!p.isConfigured}>
                {p.name}{p.isConfigured ? '' : ' (API key tanımlı değil)'}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="llmModel" className="text-sm font-medium text-[var(--color-text-primary)]">
            Model
          </label>
          <input
            id="llmModel"
            type="text"
            value={form.model}
            onChange={(e) => setField('model', e.target.value)}
            disabled={saving}
            placeholder="openai/gpt-oss-120b:free"
            className={INPUT_CLASS}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="llmScoringModel" className="text-sm font-medium text-[var(--color-text-primary)]">
            Puanlama modeli
            <span className="ml-1 text-xs font-normal text-[var(--color-text-secondary)]">(boş = Model kullanılır)</span>
          </label>
          <input
            id="llmScoringModel"
            type="text"
            value={form.scoringModel}
            onChange={(e) => setField('scoringModel', e.target.value)}
            disabled={saving}
            className={INPUT_CLASS}
          />
        </div>

        <div className="flex items-center gap-2.5">
          <input
            id="llmThinking"
            type="checkbox"
            checked={form.thinkingEnabled}
            onChange={(e) => setField('thinkingEnabled', e.target.checked)}
            disabled={saving}
            className="w-4 h-4 accent-[var(--color-ai-accent)]"
          />
          <label htmlFor="llmThinking" className="text-sm font-medium text-[var(--color-text-primary)]">
            Thinking (model düşünme adımı)
          </label>
        </div>
        <p className="text-xs text-[var(--color-text-secondary)] -mt-2">
          Kapalıyken düşünme token&apos;ı harcanmaz; bütçeler doğrudan çıktıya gider. Reasoning
          desteklemeyen modellerde bu ayar yok sayılabilir.
        </p>

        {NUMERIC_FIELDS.map(({ key, label }) => (
          <div key={key} className="flex flex-col gap-1.5">
            <label htmlFor={key} className="text-sm font-medium text-[var(--color-text-primary)]">
              {label}
              <span className="ml-1 text-xs font-normal text-[var(--color-text-secondary)]">(128–8192)</span>
            </label>
            <input
              id={key}
              type="number"
              min={128}
              max={8192}
              value={form[key]}
              onChange={(e) => setField(key, Number(e.target.value))}
              disabled={saving}
              className={INPUT_CLASS}
            />
          </div>
        ))}

        <div className="flex justify-end pt-1">
          <Button type="submit" variant="primary" disabled={saving}>
            Kaydet
          </Button>
        </div>
      </form>
    </Widget>
  );
}
