import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PersonaEditModal from './PersonaEditModal';

// Mock hooks
vi.mock('../hooks/useAiUserDetail', () => ({
  default: vi.fn(),
}));

vi.mock('../hooks/useEditPersonality', () => ({
  default: vi.fn(),
}));

vi.mock('../hooks/usePersonaCatalog', async (importOriginal) => {
  const mod = await importOriginal();
  return { ...mod, default: vi.fn() };
});

import useAiUserDetail from '../hooks/useAiUserDetail';
import useEditPersonality from '../hooks/useEditPersonality';
import usePersonaCatalog from '../hooks/usePersonaCatalog';

const MOCK_DETAIL = {
  id: 'u1',
  username: 'testbot',
  email: 'bot@ai.test',
  profileImageUrl: null,
  biography: 'I am a bot',
  createdAt: '2024-01-01T00:00:00Z',
  hasPersonality: true,
  traits: ['curious', 'witty'],
  typingStyle: 'casual and concise',
  summary: 'A friendly AI agent that loves to chat.',
  personaVersion: 2,
  personaUpdatedAt: '2024-06-01T00:00:00Z',
};

const mockSave = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();

  useAiUserDetail.mockReturnValue({
    detail: MOCK_DETAIL,
    loading: false,
    error: null,
  });

  useEditPersonality.mockReturnValue({
    save: mockSave,
    saving: false,
    error: null,
  });

  usePersonaCatalog.mockReturnValue({
    catalog: null,
    loading: false,
    error: null,
    retry: vi.fn(),
  });
});

describe('PersonaEditModal', () => {
  it('prefills traits from detail', () => {
    render(
      <PersonaEditModal userId="u1" onClose={vi.fn()} onSaved={vi.fn()} />
    );
    expect(screen.getByText('curious')).toBeInTheDocument();
    expect(screen.getByText('witty')).toBeInTheDocument();
  });

  it('prefills typingStyle and summary from detail', () => {
    render(
      <PersonaEditModal userId="u1" onClose={vi.fn()} onSaved={vi.fn()} />
    );
    expect(screen.getByDisplayValue('casual and concise')).toBeInTheDocument();
    expect(screen.getByDisplayValue('A friendly AI agent that loves to chat.')).toBeInTheDocument();
  });

  it('typing a trait and pressing Enter adds a chip', () => {
    render(
      <PersonaEditModal userId="u1" onClose={vi.fn()} onSaved={vi.fn()} />
    );
    const traitInput = screen.getByPlaceholderText(/add a trait/i);
    fireEvent.change(traitInput, { target: { value: 'empathetic' } });
    fireEvent.keyDown(traitInput, { key: 'Enter' });
    expect(screen.getByText('empathetic')).toBeInTheDocument();
  });

  it('typing a trait with comma adds a chip', () => {
    render(
      <PersonaEditModal userId="u1" onClose={vi.fn()} onSaved={vi.fn()} />
    );
    const traitInput = screen.getByPlaceholderText(/add a trait/i);
    fireEvent.change(traitInput, { target: { value: 'analytical,' } });
    fireEvent.keyDown(traitInput, { key: ',' });
    expect(screen.getByText('analytical')).toBeInTheDocument();
  });

  it('save button is disabled while saving', () => {
    useEditPersonality.mockReturnValue({
      save: mockSave,
      saving: true,
      error: null,
    });

    render(
      <PersonaEditModal userId="u1" onClose={vi.fn()} onSaved={vi.fn()} />
    );

    const saveBtn = screen.getByRole('button', { name: /save/i });
    expect(saveBtn).toBeDisabled();
  });

  it('renders empty form when hasPersonality is false', () => {
    useAiUserDetail.mockReturnValue({
      detail: { ...MOCK_DETAIL, hasPersonality: false, traits: [], typingStyle: '', summary: '' },
      loading: false,
      error: null,
    });

    render(
      <PersonaEditModal userId="u1" onClose={vi.fn()} onSaved={vi.fn()} />
    );

    // No trait chips should be visible (except possibly placeholder)
    expect(screen.queryByText('curious')).not.toBeInTheDocument();
    expect(screen.queryByText('witty')).not.toBeInTheDocument();
  });

  it('shows loading state while detail is fetching', () => {
    useAiUserDetail.mockReturnValue({
      detail: null,
      loading: true,
      error: null,
    });

    render(
      <PersonaEditModal userId="u1" onClose={vi.fn()} onSaved={vi.fn()} />
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('calls onClose when ESC is pressed and not saving', () => {
    const onClose = vi.fn();
    render(
      <PersonaEditModal userId="u1" onClose={onClose} onSaved={vi.fn()} />
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose on ESC when saving', () => {
    useEditPersonality.mockReturnValue({
      save: mockSave,
      saving: true,
      error: null,
    });

    const onClose = vi.fn();
    render(
      <PersonaEditModal userId="u1" onClose={onClose} onSaved={vi.fn()} />
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows inline error when trait is too short', () => {
    render(
      <PersonaEditModal userId="u1" onClose={vi.fn()} onSaved={vi.fn()} />
    );
    const traitInput = screen.getByPlaceholderText(/add a trait/i);
    fireEvent.change(traitInput, { target: { value: 'a' } });
    fireEvent.keyDown(traitInput, { key: 'Enter' });
    expect(screen.getByText(/2.{0,5}60 char/i)).toBeInTheDocument();
  });

  it('calls save and onSaved on successful submission', async () => {
    const updatedDetail = { ...MOCK_DETAIL, personaVersion: 3 };
    mockSave.mockResolvedValue(updatedDetail);
    const onSaved = vi.fn();

    render(
      <PersonaEditModal userId="u1" onClose={vi.fn()} onSaved={onSaved} />
    );

    const saveBtn = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith('u1', {
        traits: ['curious', 'witty'],
        typingStyle: 'casual and concise',
        summary: 'A friendly AI agent that loves to chat.',
      });
    });

    await waitFor(() => {
      expect(onSaved).toHaveBeenCalledWith(updatedDetail);
    });
  });

  it('shows error state when persona detail fails to load', () => {
    useAiUserDetail.mockReturnValue({
      detail: null,
      loading: false,
      error: new Error('boom'),
    });

    render(
      <PersonaEditModal userId="u1" onClose={vi.fn()} onSaved={vi.fn()} />
    );

    // Should show error message
    expect(screen.getByText(/couldn't load|failed to load/i)).toBeInTheDocument();
    // Should NOT render form
    expect(screen.queryByPlaceholderText(/add a trait/i)).not.toBeInTheDocument();
  });

  it('shows typing style suggestions when catalog is available', async () => {
    usePersonaCatalog.mockReturnValue({
      catalog: {
        archetypes: [], traitCategories: [],
        typingStyleSuggestions: ['short sentences'],
        usernameWordPools: {},
      },
      loading: false, error: null, retry: vi.fn(),
    });

    render(
      <PersonaEditModal userId="u1" onClose={vi.fn()} onSaved={vi.fn()} />
    );

    expect(await screen.findByRole('button', { name: /short sentences/i })).toBeInTheDocument();
  });
});
