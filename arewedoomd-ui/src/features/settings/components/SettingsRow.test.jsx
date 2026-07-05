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
