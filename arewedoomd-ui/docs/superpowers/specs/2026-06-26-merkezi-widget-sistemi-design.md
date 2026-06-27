# Merkezî Widget Sistemi + Profil Rail — Tasarım Dokümanı

**Tarih:** 2026-06-26
**Kapsam:** `AreWeDoomd.UI/arewedoomd-ui`
**Durum:** Onay bekliyor

## 1. Amaç

Uygulamadaki tüm panel/sidebar "widget"larını **tek bir merkezî tasarım standardına** bağlamak.
Bugün kart iskeleti (yüzey + kenarlık + başlık + scroll'lu gövde), avatar gradyanı ve count-up
mantığı en az 5–6 yerde elle tekrarlanıyor; sayfanın farklı yerlerindeki widget'lar birbirinden
hafifçe farklı görünüyor. Bu çalışmadan sonra:

- Her widget aynı görünür (onaylanan **"Doom Reactor (sabit)"** tasarımı: kırmızı→mavi gradient
  kenarlık, üst radyal yüzey, derinlik gölgesi, yumuşak hover, kademeli içerik animasyonu).
- Görünüm **tek yerden** değişir (CSS `.widget` sınıfları + `<Widget>` bileşeni).
- Yeni widget eklerken kart iskeleti elle yazılmaz; `<Widget>` kullanılır — bu bir **kural**.
- Profil sayfasının sağ rail'i bu standartla 3 widget kazanır (Doom seviyesi · Rozetler · Kişileri keşfet).

## 2. Onaylanan görsel standart

Kullanıcı ile tarayıcı mockup'larında netleştirildi (final = `rail-B-static-doom.html`):

- **Kart yüzeyi:** `radial-gradient(120% 90% at 50% 0%, <widget-bg-top> 0%, surface 55%)`.
- **Gradient kenarlık halkası:** `linear-gradient(120deg, ai-accent .5α, human-accent .35α, transparent 60%)`
  mask-composite hilesiyle 1px ince ışıyan çerçeve. **Tüm widget'larda aynı** (AI↔Human göndermesi).
- **Gölge:** `0 0 0 1px rgba(ai,.06), 0 24px 50px -30px #000`.
- **Hover:** kart 1–3px yukarı yumuşak kalkar (yalnızca transform + shadow; `scale` YOK — kenarlık
  tırtıklanmasına yol açıyordu).
- **Başlık:** kalın başlık + opsiyonel renkli alt-başlık, altında ince ayıraç.
- **İçerik animasyonu:** ilk render'da bir kez — rozet çipleri `pop`, kişi satırları sağdan
  `slide-in`, sayılar count-up, barlar genişlik geçişi. **Sürekli/loop animasyon YOK**
  (tarama çizgisi ve nabız ışıması kullanıcı isteğiyle kaldırıldı).
- **Rozet çipi hover:** zemin/kenarlık renginde yumuşak geçiş + 1px kalkma + dağınık yumuşak gölge
  (sert neon glow ve `scale` kullanılmaz).

## 3. Mimari

Bağımlılık yönü ve klasör kuralları (UI `CLAUDE.md`) korunur: `features → shared`, `shared ↛ features`.
Widget primitive'i ve yardımcılar generic olduğundan **shared** (`src/components/ui`, `src/hooks`) altında yaşar.

### 3.1 Görünümün tek kaynağı — `src/index.css`

Yeni tasarım token'ları (`:root`) — hardcode hex yasağına uymak için:

```css
--color-widget-bg-top: #10243a;   /* radyal yüzeyin üst tonu */
--color-widget-border: #1f3a55;   /* taban kenarlık */
/* gradient kenarlık ai-accent + human-accent rgba'larından türetilir */
```

Yeni sınıflar (kart chrome'unun TEK kaynağı):

```css
.widget { position:relative; border-radius:var(--radius-lg); overflow:hidden;
  background:radial-gradient(120% 90% at 50% 0%, var(--color-widget-bg-top) 0%, var(--color-surface) 55%);
  border:1px solid var(--color-widget-border);
  box-shadow:0 0 0 1px rgba(56,189,248,.06), 0 24px 50px -30px #000;
  transition:transform .2s ease, box-shadow .2s ease; }
.widget::before { content:""; position:absolute; inset:0; border-radius:inherit; padding:1px;
  background:linear-gradient(120deg, rgba(56,189,248,.5), rgba(245,73,73,.35), transparent 60%);
  -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite:xor; mask-composite:exclude; opacity:.75; pointer-events:none; }
.widget > * { position:relative; z-index:1; }       /* içerik halkanın üstünde */
.widget--hover:hover { transform:translateY(-2px);
  box-shadow:0 30px 50px -24px #000, 0 0 0 1px rgba(56,189,248,.18); }
```

Yeni içerik-animasyonu yardımcı sınıfları (mevcut `animate-fade-in` vb. ile aynı dilde):
`.animate-pop-in` (çipler), `.animate-slide-in-right` (satırlar). Kademe (stagger) bileşende
inline `animation-delay` ile verilir. `prefers-reduced-motion` altında animasyonlar kapanır.

> Not: `mask-composite` tüm modern tarayıcılarda desteklenir; desteklenmeyen yerde halka
> görünmez ama taban `border` kalır (graceful degradation).

### 3.2 `<Widget>` primitive — `src/components/ui/Widget.jsx`

Kart yapısını + Tailwind düzenini sarmalar; tek `Button.jsx` ile aynı stil (varsayılan export, props).

```jsx
<Widget
  title="Akışının doom seviyesi"   // opsiyonel — yoksa başlık bloğu render edilmez
  subtitle="..."                    // opsiyonel
  subtitleColor="var(--color-ai-accent)"  // opsiyonel
  headerRight={<...>}               // opsiyonel sağ slot
  scroll                            // gövde kaydırılabilir (sidebar-scroll + min-h-0 + overflow-y-auto)
  fill                              // rail'de flex-1 ile yüksekliği doldurur
  hover                             // hover kalkması (varsayılan: kapalı; içerik kartlarında açılır)
  className=""                      // ekstra sınıf
>
  {/* gövde */}
</Widget>
```

Davranış:
- `.widget` (+ `fill` ise `flex flex-col flex-1 min-h-0`, + `hover` ise `widget--hover`).
- `title` varsa: `<div className="widget-header">` → `<h2>` + opsiyonel `subtitle` + `headerRight`.
- Gövde: `scroll` → `sidebar-scroll flex-1 overflow-y-auto min-h-0`, değilse normal `p-4` blok.
- Başlık/gövde boyutları **bileşen içinde sabit** (tek kaynak): başlık `13–15px font-extrabold`,
  alt-başlık `11px`, gövde `p-4`.

### 3.3 Tekrarı bitiren paylaşımlı yardımcılar

| Yardımcı | Yer | Çözdüğü tekrar |
|---|---|---|
| `useCountUp(target, duration, delay)` | `src/hooks/useCountUp.js` | AppShell'de tanımlı + mockup'ta tekrar; tek hook'a taşınır |
| `avatarGradient(userType)` + `<Avatar userType initials src size>` | `src/components/ui/Avatar.jsx` | ai/human gradyan avatarı ~6 kopya |
| `userTypeBadge(userType)` → `{ label, className }` | `src/components/ui/userType.js` | AI/Human rozeti ~4 kopya |

Hepsi token-tabanlı (`--color-ai-*`, `--color-human-*`), hardcode renk yok.

### 3.4 Widget'ların yeniden inşası

**Yeni `ProfileRail.jsx`** (mevcut dosya yeniden yazılır — veri/akış mantığı korunur, sadece chrome
`<Widget>`'e geçer):
- `FeedDoomLevel` — `<Widget title subtitle scroll? no>`; gauge halkası kırmızı→mavi gradient stroke
  (dış glow YOK, pulse YOK), count-up bir kez, barlar AI=`--color-ai-accent`/Human=`--color-human-accent`.
  Veri: `usersApi.getFollowing` (mevcut).
- `Badges` — `<Widget title>`; çipler `.animate-pop-in` stagger + onaylanan yumuşak hover. Veri: `profile.badges`.
- `DiscoverPeople` — `<Widget title subtitle scroll fill>`; satırlar `<Avatar>` + `userTypeBadge` +
  `useFollow`. Veri: `usersApi.getSuggestions` (mevcut).
- İskelet (skeleton) durumları `<Widget>` ile uyumlu güncellenir; loading/empty/error korunur.

**AppShell.jsx taşımaları** (3 widget — chrome `<Widget>`'e, iç içerik korunur):
- `Last Activities` → `<Widget title subtitle scroll fill>`; satır avatarları `<Avatar>`'a.
- `Going Viral` → `<Widget title subtitle scroll fill>`; avatarlar `<Avatar>`'a.
- `Doomed-O-Meter` (sol nav) → dış kabuk `<Widget>`'e; iç bölümler (AI/Human istatistik, kuru kafa
  doom bar) korunur; `useCountUp` artık paylaşımlı hook'tan. Gradient başlık metni korunabilir.

> Sol nav genişliği/yerleşimi değişmez; yalnızca Doomed-O-Meter'ın kart kabuğu standarda uyar.

### 3.5 Kural (dokümantasyon)

- `docs/ai/component-architecture.md`: "**Widget kuralı** — Tüm panel/sidebar kartları `<Widget>`
  (`src/components/ui/Widget.jsx`) kullanmak ZORUNDADIR. Kart iskeleti (yüzey/kenarlık/başlık/scroll)
  elle yazılmaz. Avatarlar `<Avatar>`, AI/Human rozeti `userTypeBadge` ile."
- `docs/ai/css-guidelines.md`: `.widget*` sınıfları ve widget token'ları belgelenir; "widget chrome
  için yeni hex/kenarlık tanımlama, `.widget` kullan."
- `AreWeDoomd.UI/CLAUDE.md` "Component Rules"a tek satır işaret.

## 4. Bileşen sınırları (isolation)

- `Widget` — ne yapar: standart kart chrome + başlık/gövde düzeni. Bağımlılığı yok (saf sunum).
- `Avatar` / `userTypeBadge` / `useCountUp` — saf, generic, feature bağımsız.
- `ProfileRail` — profile özel; `useProfile`, `useFollow`, `usersApi` + yukarıdaki shared parçalar.
- AppShell widget'ları — chrome dışarıdan (`Widget`), veri AppShell içinde (şimdilik mock sabitler;
  bu çalışma veri kaynağını değiştirmez).

## 5. Kapsam dışı (YAGNI)

- Last Activities / Going Viral / Doomed-O-Meter **verilerinin** gerçek API'ye bağlanması (ayrı iş).
- Yeni widget türleri, tema değiştirici, açık tema.
- Backend değişikliği (sözleşme zaten yeterli — `Discover-Backend-Entegrasyon.md`).

## 6. Test / doğrulama

- `npm run lint` temiz.
- `npm run build` başarılı.
- Görsel kontrol: profil sayfası sağ rail 3 widget; HomePage sağ rail 2 widget + sol Doomed-O-Meter —
  hepsi aynı kenarlık/animasyon diliyle, onaylanan mockup ile tutarlı.
- Davranış korunur: follow/unfollow, scroll containment, loading/empty/error, count-up.
- `prefers-reduced-motion: reduce` altında animasyonların kapandığı doğrulanır.

## 7. Riskler

- `mask-composite` eski tarayıcılarda halkayı göstermez → taban `border` ile graceful degrade (kabul).
- Gradient kenarlık + `overflow-hidden` + scroll'lu gövde birlikte: içerik z-index'i `.widget > *`
  ile halkanın üstünde tutulur (mockup'ta doğrulandı).
- Doomed-O-Meter görece özel; sadece kabuğu değişir, iç davranış birebir korunmalı (regresyon riski → görsel kontrol).
