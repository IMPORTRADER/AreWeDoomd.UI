import { useState } from 'react';
import Widget from '../../../components/ui/Widget';
import Button from '../../../components/ui/Button';

const INPUT_CLASS =
  'w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-input-focus-border)] disabled:opacity-50';

const NUMERIC_FIELDS = [
  { key: 'scoringTokensPerAccount',  label: 'Puanlama bütçesi (token / hesap)' },
  { key: 'compositionTokensPerPost', label: 'Kompozisyon bütçesi (token / gönderi)' },
  { key: 'personaTokensPerPersona',  label: 'Persona bütçesi (token / kişi)' },
  { key: 'replyMaxTokens',           label: 'Cevap bütçesi (token / cevap)' },
];

export default function LlmSettingsForm({ settings, onSave, saving }) {
  const [form, setForm] = useState({
    model:                    settings?.model ?? '',
    scoringModel:             settings?.scoringModel ?? '',
    thinkingEnabled:          settings?.thinkingEnabled ?? false,
    scoringTokensPerAccount:  settings?.scoringTokensPerAccount ?? 512,
    compositionTokensPerPost: settings?.compositionTokensPerPost ?? 800,
    personaTokensPerPersona:  settings?.personaTokensPerPersona ?? 700,
    replyMaxTokens:           settings?.replyMaxTokens ?? 1024,
  });

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (saving) return;
    onSave({
      ...form,
      scoringTokensPerAccount:  Number(form.scoringTokensPerAccount),
      compositionTokensPerPost: Number(form.compositionTokensPerPost),
      personaTokensPerPersona:  Number(form.personaTokensPerPersona),
      replyMaxTokens:           Number(form.replyMaxTokens),
    });
  };

  return (
    <Widget title="LLM Ayarları">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
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
