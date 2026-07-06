# Settings Sayfası — Tasarım Dökümanı

**Tarih:** 2026-07-05
**Kapsam:** AreWeDoomd.UI (Settings sayfası) + AreWeDoomd.Api (2 yeni endpoint)
**Durum:** Onaylandı — implementasyon planı bekliyor

## Amaç

`/settings` route'u şu an `ComingSoon` gösteriyor. Bunu gerçek bir Settings
sayfasıyla değiştirmek. MVP kapsamı: hesap güvenliği (şifre/e-posta/hesap silme),
bilgi & destek sayfaları ve çıkış. Profil alanları burada **tekrar edilmeyecek** —
mevcut profil düzenleme akışına yönlendirilecek.

## Kapsam

### Dahil
- Profili Düzenle satırı (mevcut modala yönlendirme)
- Şifre değiştirme (backend hazır, sadece UI)
- E-posta değiştirme (yeni backend endpoint)
- Hesabı Sil satırı — **disabled ("Yakında")**; işlevsellik sonraki sürüme bırakıldı
- Bilgi & Destek statik sayfaları (placeholder içerik)
- Çıkış Yap

### Dahil değil (bu sürümde)
- **Hesap silmenin gerçek işlevi (backend).** Ertelendi. Not: SQL Server "çoklu
  cascade yolu" kısıtı nedeniyle DB-seviyesinde cascade (FK + `OnDelete.Cascade`)
  bu şemada mümkün değil (User→Comment hem doğrudan hem Post üzerinden = çift yol;
  UserFollows'ta iki FK aynı tabloya). Ele alınınca yaklaşım: handler içinde tek
  transaction'da elle silme — kullanıcının postlarını sil (mevcut Post→Comment/Like
  cascade'i otomatik temizler), kalan yetim yorum/beğeni/takip/bildirimleri elle sil.
- E-posta doğrulama / onay maili (SMTP yok — e-posta doğrulamasız değişir)
- Yumuşak silme / hesap dondurma / geri alma
- Bildirim tercihleri, tema seçimi, dil seçimi (gelecekte)
- Avatar yükleme (backend `PATCH /me/profile-image` var ama bu spec dışı)

## Sayfa Yapısı

Tek kolon, gruplara ayrılmış liste. Her satır ya bir aksiyon (modal) ya da bir
sayfaya yönlendirme.

```
Ayarlar
├─ Profil
│    └─ Profili Düzenle           → /{username}?edit=1
├─ Güvenlik
│    ├─ Şifre Değiştir            → modal
│    ├─ E-posta Değiştir          → modal
│    └─ Hesabı Sil                → DISABLED ("Yakında")
├─ Bilgi & Destek
│    ├─ Hakkımızda                → /about
│    ├─ Gizlilik & KVKK           → /privacy
│    ├─ Kullanım Koşulları        → /terms
│    └─ Yardım / Destek           → /help
└─ Çıkış Yap  (en altta, destructive stil)
```

## Bileşenler

Mevcut kod desenlerini takip eder (`src/features/*`, `components/ui/*`).

- `src/pages/SettingsPage/SettingsPage.jsx` — sayfa iskeleti, grup listesi.
- `src/features/settings/components/SettingsRow.jsx` — tek satır (ikon, başlık,
  chevron/aksiyon). Aksiyon satırları ve link satırları için tek bileşen.
- `src/features/settings/components/ChangePasswordModal.jsx`
- `src/features/settings/components/ChangeEmailModal.jsx`
- `src/features/settings/components/DeleteAccountModal.jsx`
- `src/features/settings/hooks/useChangePassword.js`
- `src/features/settings/hooks/useChangeEmail.js`
- `src/features/settings/hooks/useDeleteAccount.js`
- `src/features/settings/services/accountApi.js` — yeni API çağrıları. (Alternatif:
  mevcut `src/api/usersApi.js`'e ekle. Plan aşamasında karar verilecek.)
- Statik sayfalar: `src/pages/legal/{AboutPage,PrivacyPage,TermsPage,HelpPage}.jsx`
  — placeholder metin. Tek bir `StaticContentPage` bileşeni + içerik map'i ile de
  yapılabilir; plan aşamasında karar.

Modal kabuğu `EditProfileModal.jsx`'in desenini birebir takip eder (overlay,
Escape ile kapatma, header + form + primary/secondary butonlar, hata bandı).

## Güvenlik Akışları

Ortak kural: **e-posta değiştirme, işlem öncesi mevcut şifreyi ister.** Backend
`VerifyPassword` ile doğrular. (Hesap silme bu sürümde disabled — aşağıya bakın.)

### Şifre Değiştir (backend hazır)
- Endpoint: `PATCH /api/users/me/password` — body `{ currentPassword, newPassword }`
- Yanıt: `{ accessToken, message }` — **dönen yeni token `localStorage`'a yazılır.**
- UI: `currentPassword`, `newPassword`, `newPassword` tekrar. İstemci tarafı
  doğrulama: yeni şifre min uzunluk (backend kuralıyla uyumlu), iki alan eşit.

### E-posta Değiştir (yeni backend)
- Endpoint: **yeni** `PATCH /api/users/me/email` — body `{ currentPassword, newEmail }`
- Backend: `User.ChangeEmail(email, now)` domain metodu zaten var. Yeni
  `ChangeEmailCommand` + handler + endpoint, `PATCH /me/password` desenini
  birebir taklit eder. Eklenecekler: (1) şifre doğrulama, (2) e-posta benzersizlik
  kontrolü (başka kullanıcıda varsa 400).
- Doğrulama maili **yok** — e-posta doğrudan güncellenir.
- UI başarıda: `AuthContext` içindeki `user.email` güncellenir. Token değişmez.

### Hesabı Sil — bu sürümde DISABLED
- Güvenlik grubunda görünür ama **pasif** bir satır olarak durur; yanında
  "Yakında" rozeti, tıklanamaz (disabled stil). Backend işlevi yok.
- Gerekçe ve gelecekteki yaklaşım "Dahil değil" bölümünde (SQL Server cascade
  kısıtı → handler'da elle silme) belgelenmiştir.

## Bilgi & Destek

Statik içerik sayfaları — backend gerektirmez. Bu sürümde **placeholder metin**
ile iskele kurulur; gerçek hukuki metin (KVKK aydınlatma, gizlilik, koşullar)
sonradan yapıştırılır. Route'lar public (giriş gerektirmez).

- `/about`, `/privacy`, `/terms`, `/help`
- AppRouter'a eklenir; `ComingSoon` yerine gerçek statik sayfalar.

## Çıkış Yap

`AuthContext.logout` zaten mevcut (token sil + state temizle). Settings'in en
altında destructive stilde bir satır; tıklayınca `logout()` + ana sayfaya yönlendir.

## Veri Akışı & Hata Yönetimi

- Tüm çağrılar mevcut `axios` client'ından geçer (`/api` → Vite proxy → Docker API).
- Hata: her modal, mevcut `EditProfileModal` gibi bir hata bandı gösterir.
  Backend `ProblemDetails`/`HttpValidationProblemDetails` döndürür; mesaj
  kullanıcıya gösterilir (ör. "Mevcut şifre yanlış", "Bu e-posta kullanımda").
- Yükleme durumu: butonlar `loading` prop'u ile devre dışı (mevcut `Button` deseni).

## Test

- UI: her modal için form doğrulama + başarı/başarısızlık akışı (vitest +
  testing-library, mevcut `src/test/setup.js` düzeni).
- Backend: yeni ChangeEmail komut handler'ı için birim testleri (mevcut
  UpdateUserProfile/UsersController testleri deseni).
- Uçtan uca doğrulama: `verify` skill ile Docker API + Vite üzerinden gerçek akış.

## Backend Değişiklik Özeti (AreWeDoomd.Api)

1. `PATCH /api/users/me/email` — ChangeEmailCommand + validator + handler +
   e-posta benzersizlik kontrolü + şifre doğrulama + yeni token. (`User.ChangeEmail`
   domain metodu zaten var.) `PATCH /me/password` zincirinin birebir kardeşi.

(Hesap silme backend'i bu sürümde YOK — ertelendi.)

## Açık / Gelecek

- **Hesap silme işlevi** — B yaklaşımı (handler'da transaction ile elle silme).
  Detay "Dahil değil" bölümünde.
- Avatar yükleme (`PATCH /me/profile-image` backend'de hazır) — sonraki sürüm.
- Bildirim tercihleri, tema, dil — sonraki sürüm.
- E-posta doğrulama akışı — SMTP geldiğinde.
- `accountApi` ayrı dosya mı yoksa `usersApi`'ye ek mi — plan aşamasında.
- Statik sayfalar tek bileşen mi ayrı ayrı mı — plan aşamasında.
