import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LlmSettingsForm from './LlmSettingsForm';

const SETTINGS = {
  model: 'openai/gpt-oss-120b:free',
  scoringModel: '',
  thinkingEnabled: false,
  scoringTokensPerAccount: 512,
  compositionTokensPerPost: 800,
  replyMaxTokens: 1024,
  updatedAt: '2026-07-06T12:00:00Z',
};

const settingsWithProviders = {
  model: 'm',
  scoringModel: '',
  thinkingEnabled: false,
  provider: 'openrouter',
  scoringTokensPerAccount: 512,
  compositionTokensPerPost: 800,
  replyMaxTokens: 1024,
  availableProviders: [
    { name: 'gemini', isConfigured: false },
    { name: 'openrouter', isConfigured: true },
  ],
};

describe('LlmSettingsForm', () => {
  it('renders current values', () => {
    render(<LlmSettingsForm settings={SETTINGS} onSave={vi.fn()} saving={false} />);

    expect(screen.getByLabelText(/^Model$/i)).toHaveValue('openai/gpt-oss-120b:free');
    expect(screen.getByLabelText(/Thinking/i)).not.toBeChecked();
    expect(screen.getByLabelText(/Puanlama bütçesi/i)).toHaveValue(512);
  });

  it('submits numeric fields as numbers and thinking as boolean', () => {
    const onSave = vi.fn();
    render(<LlmSettingsForm settings={SETTINGS} onSave={onSave} saving={false} />);

    fireEvent.click(screen.getByLabelText(/Thinking/i));
    fireEvent.change(screen.getByLabelText(/Puanlama bütçesi/i), { target: { value: '256' } });
    fireEvent.click(screen.getByRole('button', { name: /Kaydet/i }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      thinkingEnabled: true,
      scoringTokensPerAccount: 256,
      model: 'openai/gpt-oss-120b:free',
    }));
  });

  it('renders provider dropdown with unconfigured providers disabled', () => {
    render(<LlmSettingsForm settings={settingsWithProviders} onSave={vi.fn()} saving={false} />);
    const select = screen.getByLabelText(/provider/i);
    expect(select).toHaveValue('openrouter');
    expect(screen.getByRole('option', { name: /gemini/i })).toBeDisabled();
  });

  it('includes provider in the save payload', () => {
    const onSave = vi.fn();
    render(<LlmSettingsForm settings={settingsWithProviders} onSave={onSave} saving={false} />);
    fireEvent.change(screen.getByLabelText(/provider/i), { target: { value: '' } });
    fireEvent.submit(screen.getByRole('button', { name: /Kaydet/i }).closest('form'));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ provider: '' }));
  });
});
