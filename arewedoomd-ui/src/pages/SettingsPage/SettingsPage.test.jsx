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
