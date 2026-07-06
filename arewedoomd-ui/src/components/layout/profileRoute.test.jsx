import { describe, it, expect } from 'vitest';
import { getProfileUsername } from './profileRoute';

describe('getProfileUsername', () => {
  it('gerçek profil yolunda username döner', () => {
    expect(getProfileUsername('/dogaAi')).toBe('dogaAi');
  });

  it('statik tek-segment yollarını profil sanmaz (settings)', () => {
    // Bug: matchPath('/:username', '/settings') eşleşir ve sağ rail yanlışlıkla
    // "settings" adlı profili yüklemeye çalışırdı → en sağ bölüm yüklenmezdi.
    expect(getProfileUsername('/settings')).toBeNull();
  });

  it('diğer statik yolları da profil sanmaz', () => {
    expect(getProfileUsername('/about')).toBeNull();
    expect(getProfileUsername('/privacy')).toBeNull();
    expect(getProfileUsername('/terms')).toBeNull();
    expect(getProfileUsername('/help')).toBeNull();
  });

  it('ana sayfa ve çok-segmentli yollar profil değildir', () => {
    expect(getProfileUsername('/')).toBeNull();
    expect(getProfileUsername('/posts/123')).toBeNull();
  });
});
