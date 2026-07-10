import { useEffect, useRef, useState } from 'react';
import Widget from '../../../components/ui/Widget';
import Button from '../../../components/ui/Button';

const LATE_POLICY_OPTIONS = [
  { value: 0, label: 'Süresi dolsun' },
  { value: 1, label: 'Yine de paylaş' },
];

const STRATEGY_OPTIONS = [
  { value: 0, label: 'İki aşamalı (ekonomik)' },
  { value: 1, label: 'Tek çağrı (eşik altını da üret)' },
];

const FIELD_COUNT = 6;

// ── Skeleton: same field-row shape as the real form so the widget's height
// doesn't change when settings finish loading (avoids a layout jump).
function SkeletonForm() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: FIELD_COUNT }).map((_, i) => (
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

export default function ThresholdControl({ settings, onSave, saving }) {
  const [form, setForm] = useState({
    desireThreshold: 60,
    maxPostsPerDay:  3,
    postLengthGuide: 500,
    latePolicy:      0,
    lateGraceHours:  3,
    strategy:        0,
  });

  // Seed the form once settings arrive — the widget is mounted immediately
  // (with a skeleton) rather than waiting on the parent to gate rendering.
  const seededRef = useRef(false);
  useEffect(() => {
    if (settings && !seededRef.current) {
      seededRef.current = true;
      setForm({
        desireThreshold: settings.desireThreshold ?? 60,
        maxPostsPerDay:  settings.maxPostsPerDay  ?? 3,
        postLengthGuide: settings.postLengthGuide ?? 500,
        latePolicy:      settings.latePolicy      ?? 0,
        lateGraceHours:  settings.lateGraceHours  ?? 3,
        strategy:        settings.strategy        ?? 0,
      });
    }
  }, [settings]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (saving) return;
    onSave({
      ...form,
      desireThreshold: Number(form.desireThreshold),
      maxPostsPerDay: Number(form.maxPostsPerDay),
      postLengthGuide: Number(form.postLengthGuide),
      latePolicy: Number(form.latePolicy),
      lateGraceHours: Number(form.lateGraceHours),
      strategy: Number(form.strategy),
    });
  };

  if (!settings) {
    return (
      <Widget title="Planlama Ayarları">
        <SkeletonForm />
      </Widget>
    );
  }

  return (
    <Widget title="Planlama Ayarları">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        {/* Desire Threshold */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="desireThreshold"
            className="text-sm font-medium text-[var(--color-text-primary)]"
          >
            İstek eşiği (0-100)
          </label>
          <input
            id="desireThreshold"
            type="number"
            min={0}
            max={100}
            value={form.desireThreshold}
            onChange={(e) => setField('desireThreshold', Number(e.target.value))}
            disabled={saving}
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-input-focus-border)] disabled:opacity-50"
          />
        </div>

        {/* Max Posts Per Day */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="maxPostsPerDay"
            className="text-sm font-medium text-[var(--color-text-primary)]"
          >
            Günlük maksimum gönderi
          </label>
          <input
            id="maxPostsPerDay"
            type="number"
            min={1}
            value={form.maxPostsPerDay}
            onChange={(e) => setField('maxPostsPerDay', Number(e.target.value))}
            disabled={saving}
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-input-focus-border)] disabled:opacity-50"
          />
        </div>

        {/* Post Length Guide */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="postLengthGuide"
            className="text-sm font-medium text-[var(--color-text-primary)]"
          >
            Gönderi uzunluğu kılavuzu (karakter)
          </label>
          <input
            id="postLengthGuide"
            type="number"
            min={1}
            value={form.postLengthGuide}
            onChange={(e) => setField('postLengthGuide', Number(e.target.value))}
            disabled={saving}
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-input-focus-border)] disabled:opacity-50"
          />
        </div>

        {/* Late Policy */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="latePolicy"
            className="text-sm font-medium text-[var(--color-text-primary)]"
          >
            Geç gönderim politikası
          </label>
          <select
            id="latePolicy"
            value={form.latePolicy}
            onChange={(e) => setField('latePolicy', Number(e.target.value))}
            disabled={saving}
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-input-focus-border)] disabled:opacity-50"
          >
            {LATE_POLICY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Late Grace Hours */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="lateGraceHours"
            className="text-sm font-medium text-[var(--color-text-primary)]"
          >
            Geç tolerans süresi (saat)
          </label>
          <input
            id="lateGraceHours"
            type="number"
            min={0}
            value={form.lateGraceHours}
            onChange={(e) => setField('lateGraceHours', Number(e.target.value))}
            disabled={saving}
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-input-focus-border)] disabled:opacity-50"
          />
        </div>

        {/* Strategy */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="strategy"
            className="text-sm font-medium text-[var(--color-text-primary)]"
          >
            Strateji
          </label>
          <select
            id="strategy"
            value={form.strategy}
            onChange={(e) => setField('strategy', Number(e.target.value))}
            disabled={saving}
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-input-focus-border)] disabled:opacity-50"
          >
            {STRATEGY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end pt-1">
          <Button type="submit" variant="primary" disabled={saving}>
            Kaydet
          </Button>
        </div>
      </form>
    </Widget>
  );
}
