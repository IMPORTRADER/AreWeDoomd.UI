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
