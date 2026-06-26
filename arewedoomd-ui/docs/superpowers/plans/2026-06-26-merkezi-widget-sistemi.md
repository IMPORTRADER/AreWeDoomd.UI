# Merkezî Widget Sistemi + Profil Rail — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tüm panel/sidebar widget'larını tek bir `<Widget>` primitive'i + `.widget` CSS standardına bağlamak, tekrar eden avatar/rozet/count-up kodunu paylaşımlı parçalara çıkarmak ve profil sayfasının sağ rail'ini (Doom seviyesi · Rozetler · Kişileri keşfet) bu standartla kurmak.

**Architecture:** Kart görünümünün tek kaynağı `src/index.css`'teki `.widget*` sınıfları (gradient kenarlık mask hilesi dahil). `src/components/ui/Widget.jsx` bu sınıfları + standart başlık/gövde düzenini sarmalar. Paylaşımlı `Avatar`, `userType` (gradient + rozet) ve `useCountUp` tekrarları yok eder. ProfileRail ve AppShell'deki üç widget bu parçalar üzerine yeniden kurulur. `features → shared` bağımlılık yönü korunur.

**Tech Stack:** React 19 (JS), Vite, Tailwind CSS 4, Vitest + @testing-library/react (jsdom).

**Çalışılan dizin:** Tüm yollar `AreWeDoomd.UI/arewedoomd-ui/` köküne görelidir. Git repo kökü `AreWeDoomd.UI/`; branch `doga/profile-page`.

**Not (commit):** Bu repoda commit'leri engelleyen bir hook olabilir. Bir commit adımı hook tarafından bloke edilirse, executor commit'i atlamayıp kullanıcıya bildirmeli; kullanıcı manuel commit'ler. Komutlar repo kökünden (`AreWeDoomd.UI/`) çalıştırılır, bu yüzden yollar `arewedoomd-ui/...` ile başlar.

---

## Dosya Yapısı

**Oluşturulacak:**
- `src/hooks/useCountUp.js` — count-up animasyon hook'u + `easeOutCubic` saf fonksiyonu
- `src/hooks/useCountUp.test.js` — `easeOutCubic` testleri
- `src/components/ui/userType.js` — `avatarGradient()` + `userTypeBadge()`
- `src/components/ui/userType.test.js` — testler
- `src/components/ui/Avatar.jsx` — AI/Human gradyan avatarı
- `src/components/ui/Avatar.test.jsx` — testler
- `src/components/ui/Widget.jsx` — merkezî widget primitive'i
- `src/components/ui/Widget.test.jsx` — testler

**Değiştirilecek:**
- `src/index.css` — widget token'ları + `.widget*` sınıfları + animasyon keyframe'leri
- `src/features/profile/components/ProfileRail.jsx` — `<Widget>` + paylaşımlı parçalarla yeniden yazım
- `src/components/layout/AppShell.jsx` — Last Activities / Going Viral / Doomed-O-Meter `<Widget>`'e taşınır; `useCountUp` paylaşımlı hook'tan
- `docs/ai/component-architecture.md` — Widget kuralı
- `docs/ai/css-guidelines.md` — `.widget*` belgelenir
- `AreWeDoomd.UI/CLAUDE.md` — kurala tek satır işaret

---

## Task 1: Widget token'ları + `.widget` CSS (tek kaynak görünüm)

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Widget token'larını `:root`'a ekle**

`src/index.css` içinde `--color-scrollbar: #3a4456;` satırından hemen sonra şu bloğu ekle:

```css
  /* Widget (central card chrome) */
  --color-widget-bg-top: #10243a;   /* radyal yüzeyin üst tonu */
  --color-widget-border: #1f3a55;   /* taban kenarlık */
```

- [ ] **Step 2: `.widget` sınıflarını ekle**

`src/index.css` sonuna (dosyanın en altına) şu bloğu ekle:

```css
/* ── Central widget chrome ──────────────────────────────────────────────
   TEK KAYNAK: tüm panel/sidebar kartları bu görünümü kullanır (<Widget>).
   Renkli gradient kenarlık AI(mavi)↔Human(kırmızı) göndermesidir. */
.widget {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: radial-gradient(120% 90% at 50% 0%, var(--color-widget-bg-top) 0%, var(--color-surface) 55%);
  border: 1px solid var(--color-widget-border);
  box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.06), 0 24px 50px -30px #000;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

/* gradient kenarlık halkası (mask-composite hilesi) */
.widget::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(120deg, rgba(56, 189, 248, 0.5), rgba(245, 73, 73, 0.35), transparent 60%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
  opacity: 0.75;
  pointer-events: none;
}

/* içerik dekoratif halkanın üstünde kalsın */
.widget > * {
  position: relative;
  z-index: 1;
}

.widget--hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 30px 50px -24px #000, 0 0 0 1px rgba(56, 189, 248, 0.18);
}

/* ── Widget içerik giriş animasyonları (ilk render'da bir kez) ── */
@keyframes pop-in {
  0%   { opacity: 0; transform: scale(0.6); }
  60%  { opacity: 1; transform: scale(1.08); }
  100% { opacity: 1; transform: scale(1); }
}
.animate-pop-in { animation: pop-in 0.42s cubic-bezier(0.175, 0.885, 0.32, 1.275) both; }

@keyframes slide-in-right {
  from { opacity: 0; transform: translateX(10px); }
  to   { opacity: 1; transform: translateX(0); }
}
.animate-slide-in-right { animation: slide-in-right 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }

@media (prefers-reduced-motion: reduce) {
  .widget { transition: none; }
  .animate-pop-in,
  .animate-slide-in-right { animation: none; }
}
```

- [ ] **Step 3: Lint + build doğrula**

Run: `cd arewedoomd-ui && npm run lint && npm run build`
Expected: Hata yok; build başarılı (CSS geçerli).

- [ ] **Step 4: Commit**

```bash
git add arewedoomd-ui/src/index.css
git commit -m "feat(ui): merkezi .widget kart chrome'u ve token'lari"
```

---

## Task 2: `useCountUp` hook'u (paylaşımlı, `easeOutCubic` testli)

**Files:**
- Create: `src/hooks/useCountUp.js`
- Test: `src/hooks/useCountUp.test.js`

- [ ] **Step 1: Failing test yaz**

`src/hooks/useCountUp.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { easeOutCubic } from './useCountUp';

describe('easeOutCubic', () => {
  it('0 girişinde 0 döner', () => {
    expect(easeOutCubic(0)).toBe(0);
  });

  it('1 girişinde 1 döner', () => {
    expect(easeOutCubic(1)).toBe(1);
  });

  it('0.5 girişinde 0.875 döner (1 - 0.5^3)', () => {
    expect(easeOutCubic(0.5)).toBeCloseTo(0.875, 5);
  });

  it('monoton artan (ortada başlangıçtan büyük)', () => {
    expect(easeOutCubic(0.25)).toBeGreaterThan(easeOutCubic(0));
    expect(easeOutCubic(1)).toBeGreaterThan(easeOutCubic(0.75));
  });
});
```

- [ ] **Step 2: Test'in fail ettiğini doğrula**

Run: `cd arewedoomd-ui && npx vitest run src/hooks/useCountUp.test.js`
Expected: FAIL — `Failed to resolve import './useCountUp'` (dosya yok).

- [ ] **Step 3: Hook'u yaz**

`src/hooks/useCountUp.js`:

```js
import { useState, useEffect } from 'react';

// Saf easing — test edilebilir.
export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// 0'dan target'a animasyonlu sayaç. prefers-reduced-motion'da anında target.
export default function useCountUp(target, duration = 1200, delay = 300) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setValue(target);
      return undefined;
    }

    let raf = 0;
    const timeout = setTimeout(() => {
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        setValue(Math.round(easeOutCubic(progress) * target));
        if (progress < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [target, duration, delay]);

  return value;
}
```

- [ ] **Step 4: Test'in geçtiğini doğrula**

Run: `cd arewedoomd-ui && npx vitest run src/hooks/useCountUp.test.js`
Expected: PASS (4 test).

- [ ] **Step 5: Commit**

```bash
git add arewedoomd-ui/src/hooks/useCountUp.js arewedoomd-ui/src/hooks/useCountUp.test.js
git commit -m "feat(ui): paylasimli useCountUp hook'u"
```

---

## Task 3: `userType` yardımcıları (avatarGradient + userTypeBadge)

**Files:**
- Create: `src/components/ui/userType.js`
- Test: `src/components/ui/userType.test.js`

- [ ] **Step 1: Failing test yaz**

`src/components/ui/userType.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { avatarGradient, userTypeBadge } from './userType';

describe('avatarGradient', () => {
  it('ai için AI gradyan sınıflarını döner', () => {
    expect(avatarGradient('Ai')).toContain('--color-ai-from');
    expect(avatarGradient('ai')).toContain('--color-ai-to');
  });
  it('human için Human gradyan sınıflarını döner', () => {
    expect(avatarGradient('Human')).toContain('--color-human-from');
  });
  it('bilinmeyen/boş için nötr fallback döner', () => {
    expect(avatarGradient(undefined)).toContain('--color-surface-2');
    expect(avatarGradient('robot')).toContain('--color-surface-2');
  });
});

describe('userTypeBadge', () => {
  it('ai için AI etiketi döner', () => {
    expect(userTypeBadge('ai')).toMatchObject({ label: 'AI' });
    expect(userTypeBadge('ai').className).toContain('--color-ai-accent');
  });
  it('human için Human etiketi döner', () => {
    expect(userTypeBadge('Human')).toMatchObject({ label: 'Human' });
  });
  it('bilinmeyen için null döner', () => {
    expect(userTypeBadge('x')).toBeNull();
    expect(userTypeBadge(undefined)).toBeNull();
  });
});
```

- [ ] **Step 2: Test'in fail ettiğini doğrula**

Run: `cd arewedoomd-ui && npx vitest run src/components/ui/userType.test.js`
Expected: FAIL — import çözülemiyor.

- [ ] **Step 3: Yardımcıları yaz**

`src/components/ui/userType.js`:

```js
// AI/Human görsel kimliği — tek kaynak (CLAUDE.md: ai → --color-ai-*, human → --color-human-*).

export function avatarGradient(userType) {
  const t = userType?.toLowerCase();
  if (t === 'ai')    return 'from-[var(--color-ai-from)] to-[var(--color-ai-to)]';
  if (t === 'human') return 'from-[var(--color-human-from)] to-[var(--color-human-to)]';
  return 'from-[var(--color-surface-2)] to-[var(--color-border)]';
}

export function userTypeBadge(userType) {
  const t = userType?.toLowerCase();
  if (t === 'ai') {
    return {
      label: 'AI',
      className:
        'text-[var(--color-ai-accent)] bg-[var(--color-ai-badge-bg)] border-[var(--color-ai-badge-border)]',
    };
  }
  if (t === 'human') {
    return {
      label: 'Human',
      className:
        'text-[var(--color-human-accent)] bg-[var(--color-human-badge-bg)] border-[var(--color-human-badge-border)]',
    };
  }
  return null;
}
```

- [ ] **Step 4: Test'in geçtiğini doğrula**

Run: `cd arewedoomd-ui && npx vitest run src/components/ui/userType.test.js`
Expected: PASS (6 test).

- [ ] **Step 5: Commit**

```bash
git add arewedoomd-ui/src/components/ui/userType.js arewedoomd-ui/src/components/ui/userType.test.js
git commit -m "feat(ui): paylasimli userType gorsel yardimcilari"
```

---

## Task 4: `<Avatar>` bileşeni

**Files:**
- Create: `src/components/ui/Avatar.jsx`
- Test: `src/components/ui/Avatar.test.jsx`

- [ ] **Step 1: Failing test yaz**

`src/components/ui/Avatar.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Avatar from './Avatar';

describe('Avatar', () => {
  it('src yoksa baş harfleri gösterir', () => {
    render(<Avatar userType="ai" initials="SY" />);
    expect(screen.getByText('SY')).toBeInTheDocument();
  });

  it('ai için AI gradyan sınıfını uygular', () => {
    const { container } = render(<Avatar userType="ai" initials="AI" />);
    expect(container.firstChild.className).toContain('--color-ai-from');
  });

  it('src verilince img render eder (baş harf yok)', () => {
    render(<Avatar userType="human" initials="ME" src="/x.png" />);
    expect(screen.queryByText('ME')).not.toBeInTheDocument();
    expect(document.querySelector('img')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Test'in fail ettiğini doğrula**

Run: `cd arewedoomd-ui && npx vitest run src/components/ui/Avatar.test.jsx`
Expected: FAIL — import çözülemiyor.

- [ ] **Step 3: Bileşeni yaz**

`src/components/ui/Avatar.jsx`:

```jsx
import { avatarGradient } from './userType';

// AI/Human gradyan avatarı. src varsa görsel, yoksa baş harfler.
export default function Avatar({ userType, initials, src, size = 36, className = '' }) {
  const style = { width: size, height: size };

  if (src) {
    return (
      <img
        src={src}
        alt=""
        style={style}
        className={`rounded-full object-cover bg-[var(--color-surface-2)] shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      style={style}
      className={`rounded-full shrink-0 flex items-center justify-center font-bold text-white bg-gradient-to-br ${avatarGradient(
        userType,
      )} ${className}`}
    >
      <span style={{ fontSize: Math.round(size * 0.34) }}>{initials}</span>
    </div>
  );
}
```

- [ ] **Step 4: Test'in geçtiğini doğrula**

Run: `cd arewedoomd-ui && npx vitest run src/components/ui/Avatar.test.jsx`
Expected: PASS (3 test).

- [ ] **Step 5: Commit**

```bash
git add arewedoomd-ui/src/components/ui/Avatar.jsx arewedoomd-ui/src/components/ui/Avatar.test.jsx
git commit -m "feat(ui): paylasimli Avatar bileseni"
```

---

## Task 5: `<Widget>` primitive'i

**Files:**
- Create: `src/components/ui/Widget.jsx`
- Test: `src/components/ui/Widget.test.jsx`

- [ ] **Step 1: Failing test yaz**

`src/components/ui/Widget.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Widget from './Widget';

describe('Widget', () => {
  it('.widget chrome sınıfını uygular ve çocukları gösterir', () => {
    const { container } = render(<Widget>içerik</Widget>);
    expect(container.firstChild.className).toContain('widget');
    expect(screen.getByText('içerik')).toBeInTheDocument();
  });

  it('title verilince başlık, verilmeyince başlık yok', () => {
    const { rerender } = render(<Widget title="Rozetler">x</Widget>);
    expect(screen.getByRole('heading', { name: 'Rozetler' })).toBeInTheDocument();
    rerender(<Widget>x</Widget>);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('subtitle gösterir', () => {
    render(<Widget title="T" subtitle="alt metin">x</Widget>);
    expect(screen.getByText('alt metin')).toBeInTheDocument();
  });

  it('fill → flex-1, hover → widget--hover, scroll → sidebar-scroll sınıfları', () => {
    const { container } = render(<Widget fill hover scroll>x</Widget>);
    expect(container.firstChild.className).toContain('flex-1');
    expect(container.firstChild.className).toContain('widget--hover');
    expect(container.querySelector('.sidebar-scroll')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Test'in fail ettiğini doğrula**

Run: `cd arewedoomd-ui && npx vitest run src/components/ui/Widget.test.jsx`
Expected: FAIL — import çözülemiyor.

- [ ] **Step 3: Bileşeni yaz**

`src/components/ui/Widget.jsx`:

```jsx
// Merkezî widget primitive'i. TÜM panel/sidebar kartları bunu kullanır.
// Görünüm `.widget*` (index.css) ile gelir; bu bileşen başlık/gövde düzenini standartlaştırır.
//
// Props:
//   title         — opsiyonel başlık (yoksa başlık bloğu render edilmez)
//   subtitle      — opsiyonel alt metin
//   subtitleColor — alt metin rengi (örn. 'var(--color-ai-accent)')
//   headerRight   — başlığın sağına slot
//   scroll        — gövde kaydırılabilir (sidebar-scroll + flex-1 + overflow)
//   fill          — kök flex-1 ile rail yüksekliğini doldurur
//   hover         — hover kalkması
//   bare          — gövde varsayılan p-4 padding'ini KALDIRIR (kendi düzenini yöneten kartlar)
export default function Widget({
  title,
  subtitle,
  subtitleColor,
  headerRight,
  scroll = false,
  fill = false,
  hover = false,
  bare = false,
  className = '',
  bodyClassName = '',
  children,
}) {
  const root = [
    'widget',
    fill ? 'flex flex-col flex-1 min-h-0' : '',
    hover ? 'widget--hover' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const body = [
    scroll ? 'sidebar-scroll flex-1 min-h-0 overflow-y-auto' : '',
    bare ? '' : 'p-4',
    bodyClassName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={root}>
      {title && (
        <div className="shrink-0 px-4 pt-3.5 pb-3 border-b border-[var(--color-border)]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-[15px] font-extrabold text-[var(--color-text-heading)] leading-tight truncate">
                {title}
              </h2>
              {subtitle && (
                <p
                  className="text-[11px] font-semibold mt-0.5 text-[var(--color-text-secondary)]"
                  style={subtitleColor ? { color: subtitleColor } : undefined}
                >
                  {subtitle}
                </p>
              )}
            </div>
            {headerRight && <div className="shrink-0">{headerRight}</div>}
          </div>
        </div>
      )}
      <div className={body}>{children}</div>
    </div>
  );
}
```

- [ ] **Step 4: Test'in geçtiğini doğrula**

Run: `cd arewedoomd-ui && npx vitest run src/components/ui/Widget.test.jsx`
Expected: PASS (4 test).

- [ ] **Step 5: Commit**

```bash
git add arewedoomd-ui/src/components/ui/Widget.jsx arewedoomd-ui/src/components/ui/Widget.test.jsx
git commit -m "feat(ui): merkezi Widget primitive'i"
```

---

## Task 6: ProfileRail'i `<Widget>` + paylaşımlı parçalarla yeniden yaz

**Files:**
- Modify (tam yeniden yazım): `src/features/profile/components/ProfileRail.jsx`

Veri akışı korunur (`useProfile`, `usersApi.getFollowing`, `usersApi.getSuggestions`, `useFollow`). Sadece chrome `<Widget>`'e geçer, avatar/rozet/sayaç paylaşımlı parçalara bağlanır. Onaylanan görsel: gauge halkası kırmızı→mavi gradient stroke (dış glow YOK, pulse YOK), count-up bir kez, barlar AI=ai-accent / Human=human-accent, çipler `.animate-pop-in` stagger + yumuşak hover, kişi satırları `.animate-slide-in-right` stagger.

- [ ] **Step 1: Dosyanın tamamını şununla değiştir**

`src/features/profile/components/ProfileRail.jsx`:

```jsx
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import useProfile from '../hooks/useProfile';
import useFollow from '../hooks/useFollow';
import { usersApi } from '../../../api/usersApi';
import Widget from '../../../components/ui/Widget';
import Avatar from '../../../components/ui/Avatar';
import { userTypeBadge } from '../../../components/ui/userType';
import useCountUp from '../../../hooks/useCountUp';

/*
 * ProfileRail — profile özel sağ kolon. Merkezî <Widget> standardını kullanır.
 * Veri yalnızca API'de gerçekten var olan alanlardan:
 *   - profile.badges            → Rozetler
 *   - usersApi.getFollowing()   → "doom seviyesi" (takip edilenlerin AI oranı)
 *   - usersApi.getSuggestions() → "Kişileri keşfet" (henüz takip edilmeyenler)
 */

const BADGE_GLYPHS = {
  EarlyDoomer: '🕯️', Centurion: '💯', GoneViral: '🔥',
  HumanVerified: '🧬', VerifiedAi: '🤖', NightOwl: '🌙', TopLiked: '⚡',
};

export default function ProfileRail({ username }) {
  const { profile } = useProfile(username);

  if (!profile) return <ProfileRailSkeleton />;

  const badges = profile.badges ?? [];

  return (
    <aside className="sidebar-scroll hidden lg:flex flex-col w-[400px] shrink-0 sticky top-0 h-svh px-5 pt-6 pb-6 gap-4 overflow-y-auto">
      <FeedDoomLevel username={profile.username} />

      {badges.length > 0 && (
        <Widget title="Rozetler" className="shrink-0">
          <div className="flex flex-wrap gap-2">
            {badges.map((b, i) => (
              <span
                key={b.code}
                title={b.description}
                style={{ animationDelay: `${i * 0.07}s` }}
                className="animate-pop-in inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(56,189,248,0.06)] border border-[rgba(56,189,248,0.18)] transition-[background,border-color,transform,box-shadow] duration-200 hover:-translate-y-px hover:bg-[rgba(56,189,248,0.12)] hover:border-[rgba(56,189,248,0.42)] hover:shadow-[0_4px_14px_-6px_rgba(56,189,248,0.35)]"
              >
                <span className="text-sm leading-none">{BADGE_GLYPHS[b.code] ?? '◆'}</span>
                <span className="text-xs font-semibold text-[var(--color-text-primary)]">{b.label}</span>
              </span>
            ))}
          </div>
        </Widget>
      )}

      <DiscoverPeople username={profile.username} />
    </aside>
  );
}

/* ── Feed doom level: takip edilen hesapların AI oranı ── */

function FeedDoomLevel({ username }) {
  const [following, setFollowing] = useState(null);

  useEffect(() => {
    let cancelled = false;
    usersApi.getFollowing(username, { offset: 0, pageSize: 50 })
      .then((res) => { if (!cancelled) setFollowing(res.data.items ?? []); })
      .catch(() => { if (!cancelled) setFollowing([]); });
    return () => { cancelled = true; };
  }, [username]);

  const { aiPct, humanPct, total } = useMemo(() => {
    const list = following ?? [];
    const ai = list.filter((u) => u.userType?.toLowerCase() === 'ai').length;
    const t = list.length;
    const pct = t ? Math.round((ai / t) * 100) : 0;
    return { total: t, aiPct: pct, humanPct: t ? 100 - pct : 0 };
  }, [following]);

  if (following === null) return <CardSkeleton h={148} />;
  if (total === 0) return null;

  const status =
    aiPct >= 70 ? 'Akışın çoğu yapay zekâ. Doompilled.' :
    aiPct >= 50 ? 'Akışın yapay zekâya kayıyor.' :
    aiPct >= 30 ? 'Dengeli bir akış.' :
                  'Hâlâ çoğunlukla insan.';
  const statusColor = aiPct >= 50 ? 'var(--color-ai-accent)' : 'var(--color-human-accent)';

  return (
    <Widget title="Akışının doom seviyesi" subtitle={status} subtitleColor={statusColor} className="shrink-0">
      <div className="flex items-center gap-4">
        <DoomGauge aiPct={aiPct} />
        <div className="flex-1 min-w-0 flex flex-col gap-2.5">
          <DoomBar label="AI hesaplar"    pct={aiPct}    color="var(--color-ai-accent)" />
          <DoomBar label="İnsan hesaplar" pct={humanPct} color="var(--color-human-accent)" />
        </div>
      </div>
    </Widget>
  );
}

function DoomGauge({ aiPct }) {
  const C = 2 * Math.PI * 42; // r=42
  const animPct = useCountUp(aiPct, 1100, 200);
  return (
    <div className="relative w-[78px] h-[78px] shrink-0">
      <svg width="78" height="78" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id="doomGauge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--color-human-accent)" />
            <stop offset="1" stopColor="var(--color-ai-accent)" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-border)" strokeWidth="11" />
        <circle
          cx="50" cy="50" r="42" fill="none" stroke="url(#doomGauge)" strokeWidth="11" strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - aiPct / 100)}
          style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[19px] font-extrabold text-[var(--color-text-heading)] leading-none tabular-nums">{animPct}%</span>
        <span className="text-[9px] uppercase tracking-wide text-[var(--color-text-secondary)]">AI</span>
      </div>
    </div>
  );
}

function DoomBar({ label, pct, color }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-[var(--color-text-primary)]">{label}</span>
        <span className="text-[var(--color-text-secondary)] tabular-nums">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color, transition: 'width 1.1s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </div>
    </div>
  );
}

/* ── Discover people ── */

function DiscoverPeople() {
  const [people, setPeople] = useState(null);

  useEffect(() => {
    let cancelled = false;
    usersApi.getSuggestions({ offset: 0, pageSize: 10 })
      .then((res) => { if (!cancelled) setPeople(res.data.items ?? []); })
      .catch(() => { if (!cancelled) setPeople([]); });
    return () => { cancelled = true; };
  }, []);

  return (
    <Widget title="Kişileri keşfet" subtitle="Henüz takip etmediğin kişiler" scroll fill>
      <div className="flex flex-col gap-2.5">
        {people === null ? (
          <div className="flex items-center justify-center py-6">
            <span className="w-5 h-5 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-link)] animate-spin" />
          </div>
        ) : people.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)]">Şimdilik öneri yok.</p>
        ) : (
          people.map((p, i) => <PersonRow key={p.userId} person={p} index={i} />)
        )}
      </div>
    </Widget>
  );
}

function PersonRow({ person, index }) {
  const { following, pending, toggle } = useFollow(person.isFollowedByMe, person.username);
  const badge = userTypeBadge(person.userType);
  const initials = (person.username ?? '?').slice(0, 2).toUpperCase();

  return (
    <div className="animate-slide-in-right flex items-center gap-2.5" style={{ animationDelay: `${index * 0.06}s` }}>
      <Link to={`/profile/${person.username}`} className="shrink-0">
        <Avatar userType={person.userType} initials={initials} src={person.profileImageUrl} size={36} />
      </Link>
      <Link to={`/profile/${person.username}`} className="min-w-0 flex-1 no-underline">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-bold text-[var(--color-text-heading)] truncate">@{person.username}</span>
          {badge && (
            <span className={`shrink-0 rounded px-1 py-0.5 border text-[9px] font-bold uppercase leading-none ${badge.className}`}>
              {badge.label}
            </span>
          )}
        </div>
        {person.bio && <p className="text-[11px] text-[var(--color-text-secondary)] truncate">{person.bio}</p>}
      </Link>
      <button
        onClick={toggle}
        disabled={pending}
        className={[
          'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors disabled:opacity-60',
          following
            ? 'border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
            : 'bg-[var(--color-btn-primary)] text-white hover:bg-[var(--color-btn-primary-hover)]',
        ].join(' ')}
      >
        {following ? 'Takip ediliyor' : 'Takip et'}
      </button>
    </div>
  );
}

/* ── skeletons ── */

function CardSkeleton({ h }) {
  return <div className="widget shrink-0 animate-pulse" style={{ height: h }} />;
}
function ProfileRailSkeleton() {
  return (
    <aside className="hidden lg:flex flex-col w-[400px] shrink-0 sticky top-0 h-svh px-5 pt-6 pb-6 gap-4">
      <CardSkeleton h={148} />
      <CardSkeleton h={88} />
      <CardSkeleton h={260} />
    </aside>
  );
}
```

- [ ] **Step 2: Lint + build doğrula**

Run: `cd arewedoomd-ui && npm run lint && npm run build`
Expected: Hata yok; build başarılı.

- [ ] **Step 3: Görsel kontrol (manuel)**

Run: `cd arewedoomd-ui && npm run dev` → tarayıcıda bir profil sayfası aç (`/profile` veya `/profile/<kullanıcı>`).
Expected: Sağ rail 3 widget; gradient kenarlık + onaylanan görünüm; gauge bir kez dolar; çipler/satırlar kademeli açılır; sürekli animasyon yok; takip et/takip ediliyor çalışır.

- [ ] **Step 4: Commit**

```bash
git add arewedoomd-ui/src/features/profile/components/ProfileRail.jsx
git commit -m "feat(profile): ProfileRail'i merkezi Widget standardina tasi"
```

---

## Task 7: AppShell widget'larını standarda taşı

**Files:**
- Modify: `src/components/layout/AppShell.jsx`

Üç widget'ın **kabuğu** `<Widget>`'e geçer; iç içerik/veri korunur. `useCountUp` artık paylaşımlı hook'tan; AppShell'deki yerel `useCountUp` tanımı silinir. Avatarlar `<Avatar>`'a geçer.

- [ ] **Step 1: Import'ları ekle**

`src/components/layout/AppShell.jsx` üst kısmındaki import bloğuna ekle (mevcut `import Button from '../ui/Button';` satırından sonra):

```jsx
import Widget from '../ui/Widget';
import Avatar from '../ui/Avatar';
import useCountUp from '../../hooks/useCountUp';
```

- [ ] **Step 2: AppShell içindeki yerel `useCountUp` tanımını sil**

`src/components/layout/AppShell.jsx` içindeki şu fonksiyonun TAMAMINI sil (artık paylaşımlı hook kullanılıyor):

```jsx
function useCountUp(target, duration = 1200, delay = 300) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = performance.now();
      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * target));
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);
  return value;
}
```

- [ ] **Step 3: Sağ rail'deki "Last Activities" kartını `<Widget>`'e taşı**

`src/components/layout/AppShell.jsx`'te, sağ `<aside>` içindeki **Last Activities** bloğunu (yorumdan `</div>` kapanışına kadar olan dış sarmalayıcı `div`) şununla değiştir.

ESKİ (sil) — şu dış div ve içindeki header+scroll yapısı:

```jsx
          {/* Last Activities */}
          <div className="flex flex-col flex-1 min-h-0 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 overflow-hidden">
            {/* Header */}
            <div className="shrink-0 mb-3">
              <h2 className="text-base font-bold text-[var(--color-text-heading)]">
                Last Activities
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Recent actions from the community
              </p>
            </div>

            {/* Activity bubbles — scrollable */}
            <div className="sidebar-scroll flex flex-col flex-1 overflow-y-auto min-h-0 gap-3 pr-1">
              {ACTIVITIES.map(({ id, user: actUser, initials, type, action, time, preview }) => (
                <div
                  key={id}
                  className="flex items-start gap-3 rounded-[var(--radius-md)] p-3 hover:bg-[var(--color-surface-hover)] transition-colors duration-150 cursor-pointer"
                >
                  <div className={[
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5',
                    type === 'ai'
                      ? 'bg-gradient-to-br from-[var(--color-ai-from)] to-[var(--color-ai-to)]'
                      : 'bg-gradient-to-br from-[var(--color-human-from)] to-[var(--color-human-to)]',
                  ].join(' ')}>
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-bold text-[var(--color-text-heading)] leading-tight truncate">{actUser}</p>
                      <span className="text-xs text-[var(--color-text-secondary)] shrink-0">{time}</span>
                    </div>
                    <span className="flex items-center gap-1 mt-0.5">
                      <ActivityIcon action={action} />
                      <p className="text-xs text-[var(--color-text-secondary)]">{action}</p>
                    </span>
                    {preview && (
                      <div className="mt-2 px-3 py-2 bg-[var(--color-surface-2)] rounded-[var(--radius-md)]">
                        <p className="text-xs text-[var(--color-text-primary)] leading-relaxed line-clamp-2">{preview}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
```

YENİ (yapıştır):

```jsx
          {/* Last Activities */}
          <Widget title="Last Activities" subtitle="Recent actions from the community" scroll fill>
            <div className="flex flex-col gap-3">
              {ACTIVITIES.map(({ id, user: actUser, initials, type, action, time, preview }) => (
                <div
                  key={id}
                  className="flex items-start gap-3 rounded-[var(--radius-md)] p-3 hover:bg-[var(--color-surface-hover)] transition-colors duration-150 cursor-pointer"
                >
                  <Avatar userType={type} initials={initials} size={32} className="mt-0.5 text-xs" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-bold text-[var(--color-text-heading)] leading-tight truncate">{actUser}</p>
                      <span className="text-xs text-[var(--color-text-secondary)] shrink-0">{time}</span>
                    </div>
                    <span className="flex items-center gap-1 mt-0.5">
                      <ActivityIcon action={action} />
                      <p className="text-xs text-[var(--color-text-secondary)]">{action}</p>
                    </span>
                    {preview && (
                      <div className="mt-2 px-3 py-2 bg-[var(--color-surface-2)] rounded-[var(--radius-md)]">
                        <p className="text-xs text-[var(--color-text-primary)] leading-relaxed line-clamp-2">{preview}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Widget>
```

- [ ] **Step 4: Sağ rail'deki "Going Viral" kartını `<Widget>`'e taşı**

ESKİ (sil):

```jsx
          {/* Going Viral */}
          <div className="flex flex-col flex-1 min-h-0 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 overflow-hidden">
            {/* Header */}
            <div className="shrink-0 mb-3">
              <h2 className="text-base font-bold text-[var(--color-text-heading)]">
                Going Viral
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Posts blowing up right now
              </p>
            </div>

            {/* Viral posts — scrollable */}
            <div className="sidebar-scroll flex flex-col flex-1 overflow-y-auto min-h-0 gap-3 pr-1">
              {GOING_VIRAL.map(({ id, user: actUser, initials, type, content, likeCount, commentCount }) => (
                <div
                  key={id}
                  className="flex items-start gap-3 rounded-[var(--radius-md)] p-3 hover:bg-[var(--color-surface-hover)] transition-colors duration-150 cursor-pointer"
                >
                  <div className={[
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5',
                    type === 'ai'
                      ? 'bg-gradient-to-br from-[var(--color-ai-from)] to-[var(--color-ai-to)]'
                      : 'bg-gradient-to-br from-[var(--color-human-from)] to-[var(--color-human-to)]',
                  ].join(' ')}>
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-[var(--color-text-secondary)] leading-tight">{type.toUpperCase()} - Viral post</p>
                    <p className="text-sm font-bold text-[var(--color-text-heading)] leading-tight truncate mt-0.5">{actUser}</p>
                    <p className="text-xs text-[var(--color-text-primary)] leading-relaxed line-clamp-2 mt-1">{content}</p>
                    <div className="flex items-center gap-4 mt-1.5">
                      <span className="text-xs text-[var(--color-text-secondary)]">🔥 {likeCount.toLocaleString()}</span>
                      <span className="text-xs text-[var(--color-text-secondary)]">💬 {commentCount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
```

YENİ (yapıştır):

```jsx
          {/* Going Viral */}
          <Widget title="Going Viral" subtitle="Posts blowing up right now" scroll fill>
            <div className="flex flex-col gap-3">
              {GOING_VIRAL.map(({ id, user: actUser, initials, type, content, likeCount, commentCount }) => (
                <div
                  key={id}
                  className="flex items-start gap-3 rounded-[var(--radius-md)] p-3 hover:bg-[var(--color-surface-hover)] transition-colors duration-150 cursor-pointer"
                >
                  <Avatar userType={type} initials={initials} size={32} className="mt-0.5 text-xs" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-[var(--color-text-secondary)] leading-tight">{type.toUpperCase()} - Viral post</p>
                    <p className="text-sm font-bold text-[var(--color-text-heading)] leading-tight truncate mt-0.5">{actUser}</p>
                    <p className="text-xs text-[var(--color-text-primary)] leading-relaxed line-clamp-2 mt-1">{content}</p>
                    <div className="flex items-center gap-4 mt-1.5">
                      <span className="text-xs text-[var(--color-text-secondary)]">🔥 {likeCount.toLocaleString()}</span>
                      <span className="text-xs text-[var(--color-text-secondary)]">💬 {commentCount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Widget>
```

> Not: Sağ `<aside>`'ın kendi sınıflarındaki `overflow-hidden` aynen kalır; iki `<Widget>` `fill` ile yükseliği paylaşır.

- [ ] **Step 5: Doomed-O-Meter kabuğunu `<Widget>`'e taşı**

`DoomedOMeter` fonksiyonunda, en dıştaki sarmalayıcı `div`'i `<Widget>` ile değiştir (iç içerik birebir korunur, kendi padding'ini yönettiği için `bare`).

ESKİ (en dış div — aç ve kapa):

```jsx
    <div className="mt-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
```
…(içerik)…
```jsx
    </div>
  );
}
```

YENİ — açılışı şununla değiştir:

```jsx
    <Widget bare className="mt-4">
```
ve `DoomedOMeter`'ın `return`'ündeki **en dıştaki** kapanış `</div>`'ini şununla değiştir:

```jsx
    </Widget>
  );
}
```

> Dikkat: Yalnızca en dış sarmalayıcı değişir. İçerideki header/AI/Human/doom-bar `div`'leri ve `border-b`/`border-t` ayıraçları aynen kalır.

- [ ] **Step 6: Lint + build doğrula**

Run: `cd arewedoomd-ui && npm run lint && npm run build`
Expected: Hata yok; build başarılı. (Kullanılmayan `useState`/`useEffect` import'u kaldıysa lint uyarısı vermez çünkü AppShell onları başka yerde kullanıyor.)

- [ ] **Step 7: Görsel kontrol (manuel)**

Run: `cd arewedoomd-ui && npm run dev` → ana sayfa (`/`).
Expected: Sol nav'da Doomed-O-Meter ve sağ rail'de Last Activities + Going Viral artık gradient kenarlıklı widget standardında; count-up ve skull bar davranışı eskisi gibi; scroll containment korunur.

- [ ] **Step 8: Commit**

```bash
git add arewedoomd-ui/src/components/layout/AppShell.jsx
git commit -m "refactor(ui): AppShell widget'larini merkezi Widget standardina tasi"
```

---

## Task 8: Kuralı belgelendir

**Files:**
- Modify: `docs/ai/component-architecture.md`
- Modify: `docs/ai/css-guidelines.md`
- Modify: `../CLAUDE.md` (yani `AreWeDoomd.UI/CLAUDE.md`)

- [ ] **Step 1: `docs/ai/component-architecture.md` sonuna ekle**

```markdown
## Widget Kuralı (zorunlu)

Tüm panel/sidebar kartları **merkezî `<Widget>` bileşenini** (`src/components/ui/Widget.jsx`)
kullanmak ZORUNDADIR. Kart iskeletini (yüzey, gradient kenarlık, başlık, scroll'lu gövde)
elle yazmak yasaktır — görünümün tek kaynağı `index.css`'teki `.widget*` sınıflarıdır.

- Başlık/alt-başlık → `title` / `subtitle` / `subtitleColor` props.
- Kaydırılabilir gövde → `scroll`; rail yüksekliğini doldurma → `fill`; hover kalkması → `hover`.
- Kendi iç düzenini yöneten kart → `bare` (gövde padding'i kapanır).
- AI/Human avatarı → `<Avatar userType initials src size />` (`src/components/ui/Avatar.jsx`).
- AI/Human rozeti → `userTypeBadge(userType)` (`src/components/ui/userType.js`).
- Sayaç animasyonu → `useCountUp` (`src/hooks/useCountUp.js`).

Yeni bir widget eklerken bu parçaları kullan; kopyalama yapma.
```

- [ ] **Step 2: `docs/ai/css-guidelines.md` sonuna ekle**

```markdown
## Widget chrome (.widget)

Widget kartlarının görünümü TEK kaynaktan gelir: `src/index.css` içindeki `.widget`,
`.widget--hover` sınıfları ve `--color-widget-*` token'ları. Kart için yeni hex/kenarlık/gölge
tanımlama; `<Widget>` bileşenini kullan (bkz. component-architecture.md → Widget Kuralı).
Gradient kenarlık AI(`--color-ai-accent`)↔Human(`--color-human-accent`) renklerinden türer.
Giriş animasyonları: `.animate-pop-in`, `.animate-slide-in-right` (loop/sürekli animasyon kullanma).
```

- [ ] **Step 3: `AreWeDoomd.UI/CLAUDE.md` → "Component Rules" bölümüne ekle**

`## Component Rules` listesinin sonuna şu maddeyi ekle:

```markdown
- All panel/sidebar cards must use the central `<Widget>` (`src/components/ui/Widget.jsx`); never hand-roll card chrome. See `docs/ai/component-architecture.md` → Widget Kuralı.
```

- [ ] **Step 4: Commit**

```bash
git add arewedoomd-ui/docs/ai/component-architecture.md arewedoomd-ui/docs/ai/css-guidelines.md CLAUDE.md
git commit -m "docs: merkezi Widget kuralini belgelendir"
```

---

## Task 9: Tam doğrulama

**Files:** (yok — sadece doğrulama)

- [ ] **Step 1: Tüm testler**

Run: `cd arewedoomd-ui && npm run test`
Expected: Tüm test dosyaları PASS (yeni: useCountUp, userType, Avatar, Widget + mevcut notificationLinks).

- [ ] **Step 2: Lint**

Run: `cd arewedoomd-ui && npm run lint`
Expected: Hata yok.

- [ ] **Step 3: Build**

Run: `cd arewedoomd-ui && npm run build`
Expected: Başarılı.

- [ ] **Step 4: Görsel regresyon (manuel)**

Run: `cd arewedoomd-ui && npm run dev`
Kontrol listesi:
- `/` → sol Doomed-O-Meter + sağ Last Activities + Going Viral: hepsi gradient kenarlıklı widget standardı.
- `/profile` ve `/profile/<kullanıcı>` → sağ rail 3 widget (Doom seviyesi · Rozetler · Kişileri keşfet).
- Gauge bir kez dolar; çipler/satırlar kademeli açılır; **sürekli animasyon (tarama/nabız) YOK**.
- Rozet hover: yumuşak, tırtıksız.
- Takip et/Takip ediliyor çalışır; scroll containment korunur; loading/empty/error görünür.
- (İsteğe bağlı) OS'te "reduce motion" açıkken animasyonların kapandığını doğrula.

---

## Self-Review Notları

- **Spec kapsamı:** `.widget` tek kaynak (Task 1) ✓ · `<Widget>` (Task 5) ✓ · useCountUp/Avatar/userTypeBadge (Task 2–4) ✓ · ProfileRail 3 widget (Task 6) ✓ · AppShell 3 widget taşıma (Task 7) ✓ · kural dokümanı (Task 8) ✓ · doğrulama (Task 9) ✓.
- **Tip tutarlılığı:** `avatarGradient`/`userTypeBadge` (named export, userType.js) · `Avatar` (default) · `Widget` (default) · `useCountUp` (default) + `easeOutCubic` (named) — kullanım yerleriyle eşleşiyor.
- **Görsel uyum:** ProfileRail gauge'i onaylanan final ile birebir (gradient stroke, dış glow yok, pulse yok); çip hover onaylanan yumuşak haliyle (`scale` yok).
```
