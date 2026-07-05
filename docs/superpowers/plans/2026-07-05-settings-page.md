# Settings Sayfası — Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/settings` route'undaki `ComingSoon`'u gerçek bir Settings sayfasıyla değiştir: profili düzenlemeye yönlendirme, şifre/e-posta değiştirme, disabled "Hesabı Sil", bilgi & destek statik sayfaları, çıkış.

**Architecture:** İki repo. Backend (AreWeDoomd.Api): tek yeni endpoint `PATCH /api/users/me/email`, mevcut `ChangePassword` CQRS zincirinin birebir kardeşi. Frontend (AreWeDoomd.UI): `src/features/settings/` altında hook + servis + component katmanları (CLAUDE.md ayrımına uygun), `src/pages/SettingsPage/`, statik `src/pages/legal/`.

**Tech Stack:** Backend: .NET, MediatR, FluentValidation, custom `Result<T>`, xUnit + Moq + Shouldly. Frontend: React 19, Vite 8, react-router-dom 7, axios, Tailwind (CSS token'ları), vitest + @testing-library/react.

**İlgili spec:** `docs/superpowers/specs/2026-07-05-settings-page-design.md`

## Global Constraints

- **Frontend katman ayrımı (CLAUDE.md):** API çağrıları YALNIZCA `src/api/*` servislerinde; hook'lar request lifecycle'ı yönetir; component'ler yalnızca hook tüketir. Component içinde doğrudan API çağrısı yok.
- **Widget zorunluluğu:** Tüm kart/grup chrome'u `src/components/ui/Widget.jsx` ile; elle kart kenarlığı/gölgesi yazma.
- **Renkler:** Yalnızca `var(--color-*)` token'ları. Hardcode hex yok. Destructive UI için mevcut desen: `red-500/10 hover:text-red-400` (AppShell ProfileCard'daki gibi). `--color-danger:#ef4444` mevcut.
- **Durumlar:** loading/error/success her formda ele alınır (mevcut `useEditProfile` deseni: `{ saving, error, clearError }`).
- **Backend:** `Result<T>` factory'leri (`Success/NotFound/Failure/Conflict`); handler'lar assembly-scan ile otomatik DI; validator'lar `AbstractValidator<T>` ile otomatik. Şifre min uzunluk **8** (mevcut `ChangePasswordCommandValidator`). E-posta **normalize**: `Trim().ToLowerInvariant()`.
- **Yeni pattern yok:** Mevcut `ChangePassword` (backend) ve `useEditProfile` + `EditProfileModal` (frontend) desenleri referans alınır.

---

# PART A — Backend (AreWeDoomd.Api)

Çalışma dizini: `/Users/cansu/Documents/GitHub/AreWeDoomd/AreWeDoomd.Api`
Referans zincir (birebir kardeşini yazıyoruz): `src/AreWeDoomd.Application/Features/Users/Commands/ChangePassword/`

## Task A1: ChangeEmail application feature + handler unit tests

**Files:**
- Create: `src/AreWeDoomd.Application/Features/Users/Commands/ChangeEmail/ChangeEmailCommand.cs`
- Create: `src/AreWeDoomd.Application/Features/Users/Commands/ChangeEmail/ChangeEmailResult.cs`
- Create: `src/AreWeDoomd.Application/Features/Users/Commands/ChangeEmail/ChangeEmailCommandValidator.cs`
- Create: `src/AreWeDoomd.Application/Features/Users/Commands/ChangeEmail/ChangeEmailCommandHandler.cs`
- Test: `tests/AreWeDoomd.UnitTests/Features/Users/Commands/ChangeEmail/ChangeEmailCommandHandlerTests.cs`

**Interfaces:**
- Consumes: `IUserRepository.GetByIdAsync`, `IUserRepository.IsEmailTakenAsync(email, excludeUserId, ct)`, `IUserRepository.UpdateAsync`; `IPasswordHasher.Verify(hash, candidate)`; `IAccessTokenGenerator.Generate(user)`; `IDateTimeProvider.UtcNow`; `IUnitOfWork.SaveChangesAsync(ct)`; `User.ChangeEmail(email, now)`; `Result<T>` factory'leri.
- Produces: `ChangeEmailCommand(Guid UserId, string CurrentPassword, string NewEmail) : IRequest<Result<ChangeEmailResult>>`; `ChangeEmailResult(string AccessToken, string Message)` — Task A2 controller bunları kullanır.

- [ ] **Step 1: Handler test dosyasını yaz (failing)**

`tests/AreWeDoomd.UnitTests/Features/Users/Commands/ChangeEmail/ChangeEmailCommandHandlerTests.cs`:
```csharp
using AreWeDoomd.Application.Common.Interfaces;
using AreWeDoomd.Application.Common.Results;
using AreWeDoomd.Application.Features.Users.Commands.ChangeEmail;
using AreWeDoomd.Domain.Users;
using Moq;
using Shouldly;
using Xunit;

namespace AreWeDoomd.UnitTests.Features.Users.Commands.ChangeEmail;

public sealed class ChangeEmailCommandHandlerTests
{
    private static readonly DateTimeOffset Now = new(2026, 1, 1, 0, 0, 0, TimeSpan.Zero);

    private readonly Mock<IUserRepository> _userRepositoryMock = new();
    private readonly Mock<IPasswordHasher> _passwordHasherMock = new();
    private readonly Mock<IAccessTokenGenerator> _accessTokenGeneratorMock = new();
    private readonly Mock<IDateTimeProvider> _dateTimeProviderMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly ChangeEmailCommandHandler _handler;

    public ChangeEmailCommandHandlerTests()
    {
        _dateTimeProviderMock.Setup(d => d.UtcNow).Returns(Now);
        _handler = new ChangeEmailCommandHandler(
            _userRepositoryMock.Object,
            _passwordHasherMock.Object,
            _accessTokenGeneratorMock.Object,
            _dateTimeProviderMock.Object,
            _unitOfWorkMock.Object);
    }

    private static User CreateUser() =>
        new(Guid.NewGuid(), "testuser", "old@example.com", "hashedpassword_at_least_20_chars", UserType.Human, Now);

    [Fact]
    public async Task Handle_UserNotFound_ReturnsNotFound()
    {
        _userRepositoryMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);

        var result = await _handler.Handle(
            new ChangeEmailCommand(Guid.NewGuid(), "pw", "new@example.com"), CancellationToken.None);

        result.IsSuccess.ShouldBeFalse();
        result.ErrorType.ShouldBe(ErrorType.NotFound);
        result.Error!.Code.ShouldBe("user.not_found");
    }

    [Fact]
    public async Task Handle_WrongPassword_ReturnsFailure()
    {
        var user = CreateUser();
        _userRepositoryMock.Setup(r => r.GetByIdAsync(user.Id, It.IsAny<CancellationToken>())).ReturnsAsync(user);
        _passwordHasherMock.Setup(h => h.Verify(user.PasswordHash, "wrong")).Returns(false);

        var result = await _handler.Handle(
            new ChangeEmailCommand(user.Id, "wrong", "new@example.com"), CancellationToken.None);

        result.ErrorType.ShouldBe(ErrorType.Failure);
        result.Error!.Code.ShouldBe("user.invalid_password");
    }

    [Fact]
    public async Task Handle_EmailTaken_ReturnsConflict()
    {
        var user = CreateUser();
        _userRepositoryMock.Setup(r => r.GetByIdAsync(user.Id, It.IsAny<CancellationToken>())).ReturnsAsync(user);
        _passwordHasherMock.Setup(h => h.Verify(user.PasswordHash, "pw")).Returns(true);
        _userRepositoryMock.Setup(r => r.IsEmailTakenAsync("taken@example.com", user.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var result = await _handler.Handle(
            new ChangeEmailCommand(user.Id, "pw", "taken@example.com"), CancellationToken.None);

        result.ErrorType.ShouldBe(ErrorType.Conflict);
        result.Error!.Code.ShouldBe("user.email_taken");
    }

    [Fact]
    public async Task Handle_ValidRequest_NormalizesEmailAndReturnsToken()
    {
        var user = CreateUser();
        _userRepositoryMock.Setup(r => r.GetByIdAsync(user.Id, It.IsAny<CancellationToken>())).ReturnsAsync(user);
        _passwordHasherMock.Setup(h => h.Verify(user.PasswordHash, "pw")).Returns(true);
        _userRepositoryMock.Setup(r => r.IsEmailTakenAsync(It.IsAny<string>(), user.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _accessTokenGeneratorMock.Setup(t => t.Generate(It.IsAny<User>())).Returns("new-jwt");

        var result = await _handler.Handle(
            new ChangeEmailCommand(user.Id, "pw", "New@Example.com"), CancellationToken.None);

        result.IsSuccess.ShouldBeTrue();
        result.Value!.AccessToken.ShouldBe("new-jwt");
        user.Email.ShouldBe("new@example.com");
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
```

- [ ] **Step 2: Testin derlenmediğini/fail ettiğini gör**

Run: `dotnet test tests/AreWeDoomd.UnitTests --filter "FullyQualifiedName~ChangeEmailCommandHandler"`
Expected: FAIL — `ChangeEmailCommand`/`ChangeEmailResult`/`ChangeEmailCommandHandler` tipleri yok (derleme hatası).

- [ ] **Step 3: Command'ı yaz**

`ChangeEmailCommand.cs`:
```csharp
using AreWeDoomd.Application.Common.Attributes;
using AreWeDoomd.Application.Common.Results;
using MediatR;

namespace AreWeDoomd.Application.Features.Users.Commands.ChangeEmail;

[SensitiveProperties]
public sealed record ChangeEmailCommand(
    Guid UserId,
    string CurrentPassword,
    string NewEmail) : IRequest<Result<ChangeEmailResult>>;
```

- [ ] **Step 4: Result'ı yaz**

`ChangeEmailResult.cs`:
```csharp
namespace AreWeDoomd.Application.Features.Users.Commands.ChangeEmail;

public sealed record ChangeEmailResult(string AccessToken, string Message);
```

- [ ] **Step 5: Validator'ı yaz**

`ChangeEmailCommandValidator.cs`:
```csharp
using FluentValidation;

namespace AreWeDoomd.Application.Features.Users.Commands.ChangeEmail;

public sealed class ChangeEmailCommandValidator : AbstractValidator<ChangeEmailCommand>
{
    public ChangeEmailCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.CurrentPassword).NotEmpty();
        RuleFor(x => x.NewEmail).NotEmpty().EmailAddress();
    }
}
```

- [ ] **Step 6: Handler'ı yaz**

`ChangeEmailCommandHandler.cs`:
```csharp
using AreWeDoomd.Application.Common.Interfaces;
using AreWeDoomd.Application.Common.Results;
using MediatR;

namespace AreWeDoomd.Application.Features.Users.Commands.ChangeEmail;

public sealed class ChangeEmailCommandHandler(
    IUserRepository userRepository,
    IPasswordHasher passwordHasher,
    IAccessTokenGenerator accessTokenGenerator,
    IDateTimeProvider dateTimeProvider,
    IUnitOfWork unitOfWork)
    : IRequestHandler<ChangeEmailCommand, Result<ChangeEmailResult>>
{
    public async Task<Result<ChangeEmailResult>> Handle(ChangeEmailCommand request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(request.UserId, cancellationToken);

        if (user is null)
        {
            return Result<ChangeEmailResult>.NotFound("user.not_found", "User not found.");
        }

        if (!passwordHasher.Verify(user.PasswordHash, request.CurrentPassword))
        {
            return Result<ChangeEmailResult>.Failure("user.invalid_password", "Current password is incorrect.");
        }

        var normalizedEmail = request.NewEmail.Trim().ToLowerInvariant();

        if (await userRepository.IsEmailTakenAsync(normalizedEmail, user.Id, cancellationToken))
        {
            return Result<ChangeEmailResult>.Conflict("user.email_taken", "Email is already registered.");
        }

        var now = dateTimeProvider.UtcNow;
        user.ChangeEmail(normalizedEmail, now);

        await userRepository.UpdateAsync(user, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var accessToken = accessTokenGenerator.Generate(user);

        return Result<ChangeEmailResult>.Success(
            new ChangeEmailResult(accessToken, "Email changed successfully."));
    }
}
```

> Doğrulama notu: `using` namespace'leri `ChangePasswordCommandHandler.cs`'ten birebir. Farklı çözülürse IDE'nin önerdiği namespace'i kullan (ör. `IDateTimeProvider`'ın namespace'i). Derleme hataları burada çözülür.

- [ ] **Step 7: Testleri çalıştır, geçtiğini gör**

Run: `dotnet test tests/AreWeDoomd.UnitTests --filter "FullyQualifiedName~ChangeEmailCommandHandler"`
Expected: PASS (4/4).

- [ ] **Step 8: Commit**

```bash
cd /Users/cansu/Documents/GitHub/AreWeDoomd/AreWeDoomd.Api
git add src/AreWeDoomd.Application/Features/Users/Commands/ChangeEmail tests/AreWeDoomd.UnitTests/Features/Users/Commands/ChangeEmail
git commit -m "feat(users): ChangeEmail command + handler (password-verified, unique email)"
```

## Task A2: ChangeEmail API endpoint

**Files:**
- Create: `src/AreWeDoomd.Api/Contracts/Users/ChangeEmailRequest.cs`
- Create: `src/AreWeDoomd.Api/Contracts/Users/ChangeEmailResponse.cs`
- Modify: `src/AreWeDoomd.Api/Controllers/UsersController.cs` (ChangePassword action'dan, ~satır 140, hemen sonrasına yeni action ekle)

**Interfaces:**
- Consumes: `ChangeEmailCommand`, `ChangeEmailResult` (Task A1); `this.ToActionResult`; `TryGetCurrentUserId`.
- Produces: `PATCH /api/users/me/email` endpoint'i — body `{ currentPassword, newEmail }`, 200 `{ accessToken, message }`. Frontend (Task B1) bunu çağırır.

- [ ] **Step 1: Request DTO**

`ChangeEmailRequest.cs`:
```csharp
namespace AreWeDoomd.Api.Contracts.Users;

public sealed record ChangeEmailRequest(
    string CurrentPassword,
    string NewEmail);
```

- [ ] **Step 2: Response DTO**

`ChangeEmailResponse.cs`:
```csharp
namespace AreWeDoomd.Api.Contracts.Users;

public sealed record ChangeEmailResponse(string AccessToken, string Message);
```

- [ ] **Step 3: Controller action ekle**

`UsersController.cs` içinde `ChangePassword` action'ının hemen ardına (namespace `AreWeDoomd.Api.Contracts.Users` zaten using'lerde olmalı; değilse ekle):
```csharp
    [HttpPatch("me/email")]
    [ProducesResponseType(typeof(ChangeEmailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(HttpValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ChangeEmailResponse>> ChangeEmail(
        [FromBody] ChangeEmailRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized();
        }

        var result = await mediator.Send(
            new ChangeEmailCommand(userId, request.CurrentPassword, request.NewEmail),
            cancellationToken);

        return this.ToActionResult(result, r => new ChangeEmailResponse(r.AccessToken, r.Message));
    }
```

- [ ] **Step 4: Derle**

Run: `dotnet build src/AreWeDoomd.Api`
Expected: Build succeeded.

- [ ] **Step 5: Uçtan uca doğrula (Docker + curl)**

Docker ayakta (`docker compose up` — API `http://localhost:5188`). Geçerli bir kullanıcıyla login olup token al, sonra:
```bash
# TOKEN=<login'den gelen accessToken>
curl -s -X PATCH http://localhost:5188/api/users/me/email \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"currentPassword":"<doğru şifre>","newEmail":"changed@example.com"}' | head
```
Expected: 200 + `{ "accessToken": "...", "message": "Email changed successfully." }`. Yanlış şifreyle 400 `user.invalid_password`; başka kullanıcının e-postasıyla 409 `user.email_taken`.

- [ ] **Step 6: Commit**

```bash
cd /Users/cansu/Documents/GitHub/AreWeDoomd/AreWeDoomd.Api
git add src/AreWeDoomd.Api/Contracts/Users/ChangeEmailRequest.cs src/AreWeDoomd.Api/Contracts/Users/ChangeEmailResponse.cs src/AreWeDoomd.Api/Controllers/UsersController.cs
git commit -m "feat(api): PATCH /api/users/me/email endpoint"
```

---

# PART B — Frontend (AreWeDoomd.UI)

Çalışma dizini (git kökü): `/Users/cansu/Documents/GitHub/AreWeDoomd/AreWeDoomd.UI`
Uygulama kökü (npm): `arewedoomd-ui/`. Aşağıdaki tüm dosya yolları `arewedoomd-ui/` altındadır.
Testleri çalıştır: `cd arewedoomd-ui && npx vitest run <path>`.

## Task B1: Auth + API foundation

**Files:**
- Modify: `arewedoomd-ui/src/context/AuthContext.jsx` (updateUser ekle)
- Modify: `arewedoomd-ui/src/api/usersApi.js` (changePassword, changeEmail ekle)

**Interfaces:**
- Produces: `useAuth().updateUser(patch)` — `setUser(prev => ({...prev, ...patch}))`; `usersApi.changePassword(currentPassword, newPassword)` → `client.patch('/api/users/me/password', {...})`; `usersApi.changeEmail(currentPassword, newEmail)` → `client.patch('/api/users/me/email', {...})`. Task B3 hook'ları bunları tüketir.

- [ ] **Step 1: AuthContext'e updateUser ekle**

`AuthContext.jsx` — `logout` tanımından sonra ekle:
```jsx
  const updateUser = useCallback((patch) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);
```
Ve provider value'yu güncelle:
```jsx
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
```

- [ ] **Step 2: usersApi'ye metodları ekle**

`usersApi.js` — `updateMe` satırından sonra, obje içine ekle:
```js
  // PATCH /api/users/me/password → { accessToken, message } (auth)
  changePassword: (currentPassword, newPassword) =>
    client.patch('/api/users/me/password', { currentPassword, newPassword }),

  // PATCH /api/users/me/email → { accessToken, message } (auth)
  changeEmail: (currentPassword, newEmail) =>
    client.patch('/api/users/me/email', { currentPassword, newEmail }),
```

- [ ] **Step 3: Derleme/lint kontrolü**

Run: `cd arewedoomd-ui && npx vite build` (veya `npm run lint`)
Expected: Hata yok (henüz kullanılmıyorlar; yalnızca sözdizimi doğrulaması).

- [ ] **Step 4: Commit**

```bash
cd /Users/cansu/Documents/GitHub/AreWeDoomd/AreWeDoomd.UI
git add arewedoomd-ui/src/context/AuthContext.jsx arewedoomd-ui/src/api/usersApi.js
git commit -m "feat(settings): auth updateUser + usersApi changePassword/changeEmail"
```

## Task B2: Settings form validation helpers (pure, TDD)

Kod tabanının test deseni: saf fonksiyonlar birim test edilir (bkz. `src/hooks/useCountUp.test.js`). Doğrulama mantığını buraya çıkarıyoruz ki modallar ince kalsın ve test edilebilsin.

**Files:**
- Create: `arewedoomd-ui/src/features/settings/validation.js`
- Test: `arewedoomd-ui/src/features/settings/validation.test.js`

**Interfaces:**
- Produces: `validatePasswordForm({ currentPassword, newPassword, confirmPassword }) → string | null`; `validateEmailForm({ currentPassword, newEmail }) → string | null`. Null = geçerli. Task B5 modalları bunları kullanır.

- [ ] **Step 1: Failing test yaz**

`validation.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { validatePasswordForm, validateEmailForm } from './validation';

describe('validatePasswordForm', () => {
  it('boş alanlarda hata döner', () => {
    expect(validatePasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })).toBeTruthy();
  });
  it('yeni şifre 8 karakterden kısaysa hata döner', () => {
    expect(validatePasswordForm({ currentPassword: 'x', newPassword: 'short', confirmPassword: 'short' })).toBeTruthy();
  });
  it('şifreler eşleşmezse hata döner', () => {
    expect(validatePasswordForm({ currentPassword: 'x', newPassword: 'longenough1', confirmPassword: 'different1' })).toBeTruthy();
  });
  it('geçerli girdide null döner', () => {
    expect(validatePasswordForm({ currentPassword: 'x', newPassword: 'longenough1', confirmPassword: 'longenough1' })).toBeNull();
  });
});

describe('validateEmailForm', () => {
  it('boş şifrede hata', () => {
    expect(validateEmailForm({ currentPassword: '', newEmail: 'a@b.com' })).toBeTruthy();
  });
  it('geçersiz e-postada hata', () => {
    expect(validateEmailForm({ currentPassword: 'x', newEmail: 'not-an-email' })).toBeTruthy();
  });
  it('geçerli girdide null', () => {
    expect(validateEmailForm({ currentPassword: 'x', newEmail: 'a@b.com' })).toBeNull();
  });
});
```

- [ ] **Step 2: Fail'i doğrula**

Run: `cd arewedoomd-ui && npx vitest run src/features/settings/validation.test.js`
Expected: FAIL — `validation.js` yok.

- [ ] **Step 3: validation.js yaz**

```js
// Settings formları için saf doğrulama. null = geçerli, string = hata mesajı.
// Şifre min uzunluk backend ChangePasswordCommandValidator ile hizalı (8).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validatePasswordForm({ currentPassword, newPassword, confirmPassword }) {
  if (!currentPassword) return 'Mevcut şifreni gir.';
  if (!newPassword || newPassword.length < 8) return 'Yeni şifre en az 8 karakter olmalı.';
  if (newPassword !== confirmPassword) return 'Şifreler eşleşmiyor.';
  return null;
}

export function validateEmailForm({ currentPassword, newEmail }) {
  if (!currentPassword) return 'Mevcut şifreni gir.';
  if (!newEmail || !EMAIL_RE.test(newEmail.trim())) return 'Geçerli bir e-posta gir.';
  return null;
}
```

- [ ] **Step 4: Testi geç**

Run: `cd arewedoomd-ui && npx vitest run src/features/settings/validation.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd /Users/cansu/Documents/GitHub/AreWeDoomd/AreWeDoomd.UI
git add arewedoomd-ui/src/features/settings/validation.js arewedoomd-ui/src/features/settings/validation.test.js
git commit -m "feat(settings): pure form validation helpers"
```

## Task B3: useChangePassword + useChangeEmail hooks

`useEditProfile.js` desenini taklit eder. API çağrısı burada; component'ler yalnızca hook tüketir.

**Files:**
- Create: `arewedoomd-ui/src/features/settings/hooks/useChangePassword.js`
- Create: `arewedoomd-ui/src/features/settings/hooks/useChangeEmail.js`

**Interfaces:**
- Consumes: `usersApi.changePassword/changeEmail` (B1); `useAuth().updateUser` (B1).
- Produces: `useChangePassword({ onSuccess }) → { submit(currentPassword, newPassword), saving, error, clearError }`; `useChangeEmail({ onSuccess }) → { submit(currentPassword, newEmail), saving, error, clearError }`. Task B5 kullanır.

- [ ] **Step 1: useChangePassword.js yaz**

```js
import { useState, useCallback } from 'react';
import { usersApi } from '../../../api/usersApi';

// PATCH /api/users/me/password. Başarıda dönen yeni token localStorage'a yazılır.
export default function useChangePassword({ onSuccess } = {}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const submit = useCallback(async (currentPassword, newPassword) => {
    setSaving(true);
    setError(null);
    try {
      const res = await usersApi.changePassword(currentPassword, newPassword);
      if (res.data?.accessToken) {
        localStorage.setItem('accessToken', res.data.accessToken);
      }
      onSuccess?.(res.data);
      return res.data;
    } catch (err) {
      const status = err?.response?.status;
      if (status === 400 || status === 401) {
        setError(err?.response?.data?.detail ?? 'Mevcut şifre yanlış.');
      } else {
        setError(err?.response?.data?.detail ?? 'Şifre değiştirilemedi.');
      }
      return null;
    } finally {
      setSaving(false);
    }
  }, [onSuccess]);

  const clearError = useCallback(() => setError(null), []);
  return { submit, saving, error, clearError };
}
```

- [ ] **Step 2: useChangeEmail.js yaz**

```js
import { useState, useCallback } from 'react';
import { usersApi } from '../../../api/usersApi';
import { useAuth } from '../../../context/AuthContext';

// PATCH /api/users/me/email. Başarıda token yenilenir + auth user.email güncellenir.
export default function useChangeEmail({ onSuccess } = {}) {
  const { updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const submit = useCallback(async (currentPassword, newEmail) => {
    setSaving(true);
    setError(null);
    try {
      const res = await usersApi.changeEmail(currentPassword, newEmail);
      if (res.data?.accessToken) {
        localStorage.setItem('accessToken', res.data.accessToken);
      }
      updateUser({ email: newEmail.trim().toLowerCase() });
      onSuccess?.(res.data);
      return res.data;
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409) {
        setError('Bu e-posta zaten kullanımda.');
      } else if (status === 400 || status === 401) {
        setError(err?.response?.data?.detail ?? 'Mevcut şifre yanlış.');
      } else {
        setError(err?.response?.data?.detail ?? 'E-posta değiştirilemedi.');
      }
      return null;
    } finally {
      setSaving(false);
    }
  }, [onSuccess, updateUser]);

  const clearError = useCallback(() => setError(null), []);
  return { submit, saving, error, clearError };
}
```

- [ ] **Step 3: Lint/build**

Run: `cd arewedoomd-ui && npm run lint`
Expected: Hata yok.

- [ ] **Step 4: Commit**

```bash
cd /Users/cansu/Documents/GitHub/AreWeDoomd/AreWeDoomd.UI
git add arewedoomd-ui/src/features/settings/hooks
git commit -m "feat(settings): useChangePassword + useChangeEmail hooks"
```

## Task B4: SettingsRow component

Tek satır bileşeni. Aksiyon (`onClick`), link (`to`) veya `disabled` (rozetli). `destructive` kırmızı.

**Files:**
- Create: `arewedoomd-ui/src/features/settings/components/SettingsRow.jsx`
- Test: `arewedoomd-ui/src/features/settings/components/SettingsRow.test.jsx`

**Interfaces:**
- Produces: `<SettingsRow icon label description badge to onClick disabled destructive />`. Task B6 (SettingsPage) kullanır.

- [ ] **Step 1: SettingsRow.jsx yaz**

```jsx
import { Link } from 'react-router-dom';

// Tek settings satırı. to → Link, onClick → button, disabled → pasif (rozetli).
// destructive → kırmızı (çıkış/sil). Chevron yalnızca interaktif link/aksiyonda.
export default function SettingsRow({
  icon, label, description, badge, to, onClick,
  disabled = false, destructive = false,
}) {
  const base = [
    'w-full flex items-center gap-3.5 px-4 py-3 text-left transition-colors duration-150',
    disabled
      ? 'opacity-50 cursor-not-allowed'
      : destructive
        ? 'cursor-pointer hover:bg-red-500/10'
        : 'cursor-pointer hover:bg-[var(--color-surface-hover)]',
  ].join(' ');

  const labelColor = destructive ? 'text-red-400' : 'text-[var(--color-text-primary)]';
  const iconColor = destructive ? 'text-red-400' : 'text-[var(--color-text-secondary)]';

  const inner = (
    <>
      {icon && <span className={iconColor}>{icon}</span>}
      <span className="flex-1 min-w-0">
        <span className={`block text-sm font-medium ${labelColor}`}>{label}</span>
        {description && (
          <span className="block text-xs text-[var(--color-text-secondary)] mt-0.5 truncate">{description}</span>
        )}
      </span>
      {badge && (
        <span className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]">
          {badge}
        </span>
      )}
      {!badge && !disabled && (to || onClick) && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          className="w-4 h-4 shrink-0 text-[var(--color-text-secondary)]">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )}
    </>
  );

  if (disabled) return <div className={base} aria-disabled="true">{inner}</div>;
  if (to) return <Link to={to} className={base}>{inner}</Link>;
  return <button type="button" onClick={onClick} className={base}>{inner}</button>;
}
```

- [ ] **Step 2: Render testi yaz**

`SettingsRow.test.jsx`:
```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SettingsRow from './SettingsRow';

describe('SettingsRow', () => {
  it('label ve description gösterir', () => {
    render(<MemoryRouter><SettingsRow label="Şifre Değiştir" description="alt" onClick={() => {}} /></MemoryRouter>);
    expect(screen.getByText('Şifre Değiştir')).toBeInTheDocument();
    expect(screen.getByText('alt')).toBeInTheDocument();
  });
  it('onClick verilince buton render eder', () => {
    render(<MemoryRouter><SettingsRow label="X" onClick={() => {}} /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /X/ })).toBeInTheDocument();
  });
  it('to verilince link render eder', () => {
    render(<MemoryRouter><SettingsRow label="Hakkımızda" to="/about" /></MemoryRouter>);
    expect(screen.getByRole('link', { name: /Hakkımızda/ })).toHaveAttribute('href', '/about');
  });
  it('disabled ise buton/link değil, rozet gösterir', () => {
    render(<MemoryRouter><SettingsRow label="Hesabı Sil" badge="Yakında" disabled /></MemoryRouter>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('Yakında')).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Testi çalıştır**

Run: `cd arewedoomd-ui && npx vitest run src/features/settings/components/SettingsRow.test.jsx`
Expected: PASS (4/4).

- [ ] **Step 4: Commit**

```bash
cd /Users/cansu/Documents/GitHub/AreWeDoomd/AreWeDoomd.UI
git add arewedoomd-ui/src/features/settings/components/SettingsRow.jsx arewedoomd-ui/src/features/settings/components/SettingsRow.test.jsx
git commit -m "feat(settings): SettingsRow component"
```

## Task B5: ChangePasswordModal + ChangeEmailModal

`EditProfileModal.jsx` kabuğunu taklit eder (overlay, Escape, hata bandı, footer butonları). `Input type="password"` göz ikonunu otomatik verir.

**Files:**
- Create: `arewedoomd-ui/src/features/settings/components/ChangePasswordModal.jsx`
- Create: `arewedoomd-ui/src/features/settings/components/ChangeEmailModal.jsx`

**Interfaces:**
- Consumes: `useChangePassword`/`useChangeEmail` (B3); `validatePasswordForm`/`validateEmailForm` (B2); `Input`, `Button`, `IconAlert` (mevcut).
- Produces: `<ChangePasswordModal onClose />`, `<ChangeEmailModal onClose />`. Task B6 kullanır.

- [ ] **Step 1: ChangePasswordModal.jsx yaz**

```jsx
import { useEffect, useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { IconAlert } from '../../../components/icons';
import useChangePassword from '../hooks/useChangePassword';
import { validatePasswordForm } from '../validation';

export default function ChangePasswordModal({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState(null);

  const { submit, saving, error, clearError } = useChangePassword({ onSuccess: onClose });

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !saving) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, saving]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const v = validatePasswordForm({ currentPassword, newPassword, confirmPassword });
    if (v) { setLocalError(v); return; }
    setLocalError(null);
    clearError();
    submit(currentPassword, newPassword);
  };

  const shownError = localError ?? error;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => !saving && onClose()}>
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative z-10 w-full max-w-[440px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-bold text-[var(--color-text-heading)]">Şifre Değiştir</h2>
          <button
            onClick={() => !saving && onClose()}
            className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-white/10 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form className="px-6 py-6 flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
          {shownError && (
            <div className="flex items-center gap-2.5 px-3.5 py-3 bg-red-500/[0.08] border border-red-500/25 rounded-[var(--radius-md)] text-red-400 text-[13px] leading-relaxed">
              <IconAlert /><span>{shownError}</span>
            </div>
          )}
          <Input label="Mevcut şifre" type="password" name="currentPassword" value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />
          <Input label="Yeni şifre" type="password" name="newPassword" value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
          <Input label="Yeni şifre (tekrar)" type="password" name="confirmPassword" value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />

          <div className="flex items-center justify-end gap-3 pt-1">
            <Button type="button" variant="secondary" onClick={() => !saving && onClose()} disabled={saving}>İptal</Button>
            <Button type="submit" variant="primary" loading={saving}>Kaydet</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: ChangeEmailModal.jsx yaz**

```jsx
import { useEffect, useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { IconAlert, IconMail } from '../../../components/icons';
import useChangeEmail from '../hooks/useChangeEmail';
import { validateEmailForm } from '../validation';

export default function ChangeEmailModal({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [localError, setLocalError] = useState(null);

  const { submit, saving, error, clearError } = useChangeEmail({ onSuccess: onClose });

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !saving) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, saving]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const v = validateEmailForm({ currentPassword, newEmail });
    if (v) { setLocalError(v); return; }
    setLocalError(null);
    clearError();
    submit(currentPassword, newEmail);
  };

  const shownError = localError ?? error;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => !saving && onClose()}>
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative z-10 w-full max-w-[440px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-bold text-[var(--color-text-heading)]">E-posta Değiştir</h2>
          <button
            onClick={() => !saving && onClose()}
            className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-white/10 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form className="px-6 py-6 flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
          {shownError && (
            <div className="flex items-center gap-2.5 px-3.5 py-3 bg-red-500/[0.08] border border-red-500/25 rounded-[var(--radius-md)] text-red-400 text-[13px] leading-relaxed">
              <IconAlert /><span>{shownError}</span>
            </div>
          )}
          <Input label="Yeni e-posta" type="email" name="newEmail" value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)} icon={<IconMail />} autoComplete="email" />
          <Input label="Mevcut şifre" type="password" name="currentPassword" value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />

          <div className="flex items-center justify-end gap-3 pt-1">
            <Button type="button" variant="secondary" onClick={() => !saving && onClose()} disabled={saving}>İptal</Button>
            <Button type="submit" variant="primary" loading={saving}>Kaydet</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Lint**

Run: `cd arewedoomd-ui && npm run lint`
Expected: Hata yok.

- [ ] **Step 4: Commit**

```bash
cd /Users/cansu/Documents/GitHub/AreWeDoomd/AreWeDoomd.UI
git add arewedoomd-ui/src/features/settings/components/ChangePasswordModal.jsx arewedoomd-ui/src/features/settings/components/ChangeEmailModal.jsx
git commit -m "feat(settings): change password + change email modals"
```

## Task B6: SettingsPage + router wiring

**Files:**
- Create: `arewedoomd-ui/src/pages/SettingsPage/SettingsPage.jsx`
- Test: `arewedoomd-ui/src/pages/SettingsPage/SettingsPage.test.jsx`
- Modify: `arewedoomd-ui/src/router/AppRouter.jsx` (`/settings`'i AppShell içine, `/:username`'den önce taşı; ComingSoon import'u statik sayfalar eklenene dek kalır)

**Interfaces:**
- Consumes: `Widget`, `SettingsRow`, `ChangePasswordModal`, `ChangeEmailModal`, `useAuth`, icons `IconUser/IconLock/IconMail/IconLogout`.
- Produces: `SettingsPage` default export; `/settings` route'u AppShell içinde PrivateRoute ile.

- [ ] **Step 1: SettingsPage.jsx yaz**

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Widget from '../../components/ui/Widget';
import SettingsRow from '../../features/settings/components/SettingsRow';
import ChangePasswordModal from '../../features/settings/components/ChangePasswordModal';
import ChangeEmailModal from '../../features/settings/components/ChangeEmailModal';
import { IconUser, IconLock, IconMail, IconLogout } from '../../components/icons';

// Silme ikonu barrel'da yok — inline.
function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [modal, setModal] = useState(null); // 'password' | 'email' | null

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="max-w-[640px] mx-auto w-full px-4 py-6 flex flex-col gap-5">
      <h1 className="text-xl font-extrabold text-[var(--color-text-heading)] px-1">Ayarlar</h1>

      <Widget title="Profil" bare>
        <SettingsRow
          icon={<IconUser />}
          label="Profili Düzenle"
          description="Kullanıcı adı, bio ve fotoğraf"
          to={user ? `/${user.username}?edit=1` : '/'}
        />
      </Widget>

      <Widget title="Güvenlik" bare>
        <SettingsRow icon={<IconLock />} label="Şifre Değiştir" onClick={() => setModal('password')} />
        <SettingsRow icon={<IconMail />} label="E-posta Değiştir" description={user?.email} onClick={() => setModal('email')} />
        <SettingsRow icon={<IconTrash />} label="Hesabı Sil" badge="Yakında" disabled />
      </Widget>

      <Widget title="Bilgi & Destek" bare>
        <SettingsRow label="Hakkımızda" to="/about" />
        <SettingsRow label="Gizlilik & KVKK" to="/privacy" />
        <SettingsRow label="Kullanım Koşulları" to="/terms" />
        <SettingsRow label="Yardım / Destek" to="/help" />
      </Widget>

      <Widget bare>
        <SettingsRow icon={<IconLogout />} label="Çıkış Yap" onClick={handleLogout} destructive />
      </Widget>

      {modal === 'password' && <ChangePasswordModal onClose={() => setModal(null)} />}
      {modal === 'email' && <ChangeEmailModal onClose={() => setModal(null)} />}
    </div>
  );
}
```

- [ ] **Step 2: Render testi yaz**

`SettingsPage.test.jsx` — AuthContext'i sağlamak yerine mevcut test deseni (mock yok) gereği, sayfayı gerçek `AuthProvider` + `MemoryRouter` ile sar. Token yok → `user` null; sayfa yine grup başlıklarını render eder.
```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import SettingsPage from './SettingsPage';

function renderPage() {
  return render(
    <AuthProvider>
      <MemoryRouter><SettingsPage /></MemoryRouter>
    </AuthProvider>
  );
}

describe('SettingsPage', () => {
  it('grup başlıklarını render eder', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Güvenlik' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Bilgi & Destek' })).toBeInTheDocument();
  });
  it('Hesabı Sil satırı disabled ve "Yakında" rozetli', () => {
    renderPage();
    expect(screen.getByText('Hesabı Sil')).toBeInTheDocument();
    expect(screen.getByText('Yakında')).toBeInTheDocument();
  });
  it('Çıkış Yap satırını gösterir', () => {
    renderPage();
    expect(screen.getByText('Çıkış Yap')).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Testi çalıştır (fail beklenir — router henüz eski)**

Run: `cd arewedoomd-ui && npx vitest run src/pages/SettingsPage/SettingsPage.test.jsx`
Expected: PASS (sayfa kendi başına render olur; router değişikliğinden bağımsız).

- [ ] **Step 4: AppRouter'ı güncelle**

`AppRouter.jsx` — import ekle: `import SettingsPage from '../pages/SettingsPage/SettingsPage';`
AppShell bloğunu şu hale getir (settings'i `/:username`'den ÖNCE ekle):
```jsx
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/posts/:postId" element={<PostDetailPage />} />
          <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
          <Route path="/:username" element={<ProfilePage />} />
        </Route>
```
Ve eski standalone satırı sil:
```jsx
        <Route path="/settings"      element={<PrivateRoute><ComingSoon title="Settings" /></PrivateRoute>} />
```
(`/search`, `/notifications` ComingSoon satırları kalır; `ComingSoon` import'u onlar için durur.)

- [ ] **Step 5: Uygulamada doğrula**

Docker API + `npm run dev` ayakta. Giriş yaptıktan sonra `http://localhost:5173/settings` — sidebar'lı shell içinde Ayarlar sayfası; Şifre/E-posta modalları açılıp gerçek API'ye gidiyor (Task A tamamsa e-posta da çalışır), "Hesabı Sil" pasif+"Yakında", "Çıkış Yap" çıkışı yapıp ana sayfaya atıyor.

- [ ] **Step 6: Commit**

```bash
cd /Users/cansu/Documents/GitHub/AreWeDoomd/AreWeDoomd.UI
git add arewedoomd-ui/src/pages/SettingsPage arewedoomd-ui/src/router/AppRouter.jsx
git commit -m "feat(settings): SettingsPage + route inside AppShell"
```

## Task B7: ProfilePage `?edit=1` deep-link

"Profili Düzenle" satırı `/{username}?edit=1`'e gider; ProfilePage bu paramı görünce (ve kendi profiliyse) edit modalını otomatik açar.

**Files:**
- Modify: `arewedoomd-ui/src/pages/ProfilePage/ProfilePage.jsx`

**Interfaces:**
- Consumes: mevcut `editing` state + `setEditing` (ProfilePage.jsx:62), `useSearchParams`.

- [ ] **Step 1: useSearchParams ile modalı aç**

`ProfilePage.jsx` üstündeki router importuna `useSearchParams` ekle (mevcut `react-router-dom` importuna). `editing` state tanımından (satır 62) sonra, profilin yüklendiği ve sahibi olunduğu yerin yakınına bir effect ekle. `profile` ve "kendi profilim" kontrolünün mevcut adları korunarak:
```jsx
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    // Yalnızca kendi profilinde ?edit=1 gelince modalı bir kez aç, sonra paramı temizle.
    if (searchParams.get('edit') === '1' && profile && isOwnProfile) {
      setEditing(true);
      const next = new URLSearchParams(searchParams);
      next.delete('edit');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, profile, isOwnProfile, setSearchParams]);
```
> Not: `isOwnProfile` ProfilePage'de mevcut "kendi profilim" kontrolünün adıyla değiştirilecek (ör. `user?.username === profile?.username`). Executor mevcut değişkeni kullanır; yoksa `const isOwnProfile = user?.username === profile?.username;` tanımlar. `useEffect` zaten import edilmiş (dosya onu kullanıyor).

- [ ] **Step 2: Uygulamada doğrula**

`http://localhost:5173/settings` → "Profili Düzenle" tıkla → kendi profiline gider ve Edit Profile modalı otomatik açılır; URL'den `?edit=1` düşer.

- [ ] **Step 3: Commit**

```bash
cd /Users/cansu/Documents/GitHub/AreWeDoomd/AreWeDoomd.UI
git add arewedoomd-ui/src/pages/ProfilePage/ProfilePage.jsx
git commit -m "feat(profile): open edit modal via ?edit=1 deep-link"
```

## Task B8: Statik Bilgi & Destek sayfaları

Tek paylaşılan bileşen + 4 ince sayfa (placeholder metin). Route'lar public, AppShell içinde, `/:username`'den önce.

**Files:**
- Create: `arewedoomd-ui/src/pages/legal/StaticContentPage.jsx`
- Create: `arewedoomd-ui/src/pages/legal/AboutPage.jsx`
- Create: `arewedoomd-ui/src/pages/legal/PrivacyPage.jsx`
- Create: `arewedoomd-ui/src/pages/legal/TermsPage.jsx`
- Create: `arewedoomd-ui/src/pages/legal/HelpPage.jsx`
- Modify: `arewedoomd-ui/src/router/AppRouter.jsx` (4 route ekle)

**Interfaces:**
- Produces: `/about`, `/privacy`, `/terms`, `/help` route'ları.

- [ ] **Step 1: Paylaşılan bileşen**

`StaticContentPage.jsx`:
```jsx
import { Link } from 'react-router-dom';
import Widget from '../../components/ui/Widget';

// Placeholder içerikli statik sayfa. paragraphs: string[].
export default function StaticContentPage({ title, paragraphs = [] }) {
  return (
    <div className="max-w-[640px] mx-auto w-full px-4 py-6 flex flex-col gap-5">
      <Link to="/settings" className="text-sm text-[var(--color-link)] hover:underline px-1">← Ayarlar</Link>
      <Widget title={title}>
        <div className="flex flex-col gap-3">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-sm text-[var(--color-text-primary)] leading-relaxed">{p}</p>
          ))}
        </div>
      </Widget>
    </div>
  );
}
```

- [ ] **Step 2: Dört sayfa (placeholder metin)**

`AboutPage.jsx`:
```jsx
import StaticContentPage from './StaticContentPage';
export default function AboutPage() {
  return (
    <StaticContentPage title="Hakkımızda" paragraphs={[
      'AreWeDoomd hakkında placeholder metin. Gerçek içerik sonra eklenecek.',
    ]} />
  );
}
```
`PrivacyPage.jsx`:
```jsx
import StaticContentPage from './StaticContentPage';
export default function PrivacyPage() {
  return (
    <StaticContentPage title="Gizlilik & KVKK" paragraphs={[
      'Gizlilik politikası ve KVKK aydınlatma metni için placeholder. Gerçek hukuki metin sonra eklenecek.',
    ]} />
  );
}
```
`TermsPage.jsx`:
```jsx
import StaticContentPage from './StaticContentPage';
export default function TermsPage() {
  return (
    <StaticContentPage title="Kullanım Koşulları" paragraphs={[
      'Kullanım koşulları için placeholder metin. Gerçek içerik sonra eklenecek.',
    ]} />
  );
}
```
`HelpPage.jsx`:
```jsx
import StaticContentPage from './StaticContentPage';
export default function HelpPage() {
  return (
    <StaticContentPage title="Yardım / Destek" paragraphs={[
      'Yardım ve destek için placeholder metin. SSS ve iletişim bilgileri sonra eklenecek.',
    ]} />
  );
}
```

- [ ] **Step 3: Route'ları ekle**

`AppRouter.jsx` — importlar:
```jsx
import AboutPage from '../pages/legal/AboutPage';
import PrivacyPage from '../pages/legal/PrivacyPage';
import TermsPage from '../pages/legal/TermsPage';
import HelpPage from '../pages/legal/HelpPage';
```
AppShell bloğunda `/settings`'ten sonra, `/:username`'den önce:
```jsx
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/help" element={<HelpPage />} />
```

- [ ] **Step 4: Uygulamada doğrula**

`/settings` → her Bilgi & Destek satırı ilgili placeholder sayfayı açar; "← Ayarlar" geri döner.

- [ ] **Step 5: Tüm testleri çalıştır**

Run: `cd arewedoomd-ui && npm run test`
Expected: Tüm testler PASS.

- [ ] **Step 6: Commit**

```bash
cd /Users/cansu/Documents/GitHub/AreWeDoomd/AreWeDoomd.UI
git add arewedoomd-ui/src/pages/legal arewedoomd-ui/src/router/AppRouter.jsx
git commit -m "feat(settings): static About/Privacy/Terms/Help pages"
```

---

## Bitiş doğrulaması (tüm task'lar sonrası)

- [ ] Backend: `cd AreWeDoomd.Api && dotnet test` → yeşil.
- [ ] Frontend: `cd arewedoomd-ui && npm run test` → yeşil; `npm run lint` → temiz.
- [ ] Uçtan uca (`verify` skill): Docker API + Vite ile giriş → `/settings` → şifre değiştir (yeni şifreyle tekrar giriş), e-posta değiştir (profilde/oturmada yansıması), Profili Düzenle deep-link, statik sayfalar, çıkış.

## Notlar / bilinçli sınırlar

- **Hesap silme** disabled — backend işi ertelendi (SQL Server cascade kısıtı; spec'te B yaklaşımı belgeli).
- **E-posta doğrulama yok** (SMTP yok) — e-posta doğrudan değişir.
- **Statik sayfa metinleri placeholder** — gerçek KVKK/gizlilik/koşullar metni sonra yapıştırılacak.
- Testler kod tabanının mevcut konvansiyonuna uyar (saf fonksiyon + shallow render; API-mock yok). Hook'ların API davranışı uçtan uca (`verify`) ile doğrulanır, birim testle değil.
