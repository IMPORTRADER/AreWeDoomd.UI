import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

vi.mock('../hooks/useCreateAiUser', () => ({ default: vi.fn() }));
vi.mock('../hooks/usePersonaCatalog', async (importOriginal) => {
  const mod = await importOriginal();
  return { ...mod, default: vi.fn() };
});

import useCreateAiUser from '../hooks/useCreateAiUser';
import usePersonaCatalog from '../hooks/usePersonaCatalog';
import CreateAiModal from './CreateAiModal';

const CATALOG = {
  archetypes: [
    {
      key: 'doomer', name: 'Doomer', description: 'End is near.',
      usernamePatterns: ['doom_{noun}{nn}'],
      traits: ['pessimistic', 'sarcastic', 'dry'],
      typingStyles: ['bleak one-liners'],
      summaries: ['A burned-out pessimist.'],
    },
    {
      key: 'troll', name: 'Troll', description: 'Chaos agent.',
      usernamePatterns: ['troll_{noun}{nn}'],
      traits: ['provocative', 'chaotic', 'quick-witted'],
      typingStyles: ['confident bait'],
      summaries: ['Committed to the bit.'],
    },
  ],
  traitCategories: [{ name: 'Tone', traits: ['dry', 'warm'] }],
  typingStyleSuggestions: ['short sentences', 'all lowercase'],
  usernameWordPools: { noun: ['ember'], adjective: ['pale'] },
};

const mockCreate = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  useCreateAiUser.mockReturnValue({ create: mockCreate, creating: false, error: null });
  usePersonaCatalog.mockReturnValue({ catalog: CATALOG, loading: false, error: null, retry: vi.fn() });
});

describe('CreateAiModal', () => {
  it('has no email field, only a helper note', () => {
    render(<CreateAiModal onClose={vi.fn()} onCreated={vi.fn()} />);
    expect(screen.queryByPlaceholderText(/email/i)).not.toBeInTheDocument();
    expect(screen.getByText(/email is generated automatically/i)).toBeInTheDocument();
  });

  it('selecting an archetype fills the whole form', () => {
    render(<CreateAiModal onClose={vi.fn()} onCreated={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /doomer/i }));

    const username = screen.getByLabelText(/username/i);
    expect(username.value).toMatch(/^doom_ember\d\d$/);
    expect(screen.getByText('pessimistic')).toBeInTheDocument();
    expect(screen.getByLabelText(/typing style/i).value).toBe('bleak one-liners');
    expect(screen.getByLabelText(/summary/i).value).toBe('A burned-out pessimist.');
  });

  it('dice button regenerates the username from the archetype pattern', () => {
    render(<CreateAiModal onClose={vi.fn()} onCreated={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /doomer/i }));

    const username = screen.getByLabelText(/username/i);
    const before = username.value;
    // regenerate until the two random digits differ (bounded attempts)
    let changed = false;
    for (let i = 0; i < 25 && !changed; i++) {
      fireEvent.click(screen.getByRole('button', { name: /regenerate username/i }));
      changed = username.value !== before;
    }
    expect(username.value).toMatch(/^doom_ember\d\d$/);
    expect(changed).toBe(true);
  });

  it('switching archetype on a dirty form asks for confirmation first', () => {
    render(<CreateAiModal onClose={vi.fn()} onCreated={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /doomer/i }));
    fireEvent.change(screen.getByLabelText(/summary/i), { target: { value: 'my own words' } });

    fireEvent.click(screen.getByRole('button', { name: /troll/i }));
    // not applied yet
    expect(screen.getByLabelText(/summary/i).value).toBe('my own words');
    expect(screen.getByText(/replace the form/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^replace$/i }));
    expect(screen.getByLabelText(/summary/i).value).toBe('Committed to the bit.');
  });

  it('keeping the form dismisses the confirmation', () => {
    render(<CreateAiModal onClose={vi.fn()} onCreated={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /doomer/i }));
    fireEvent.change(screen.getByLabelText(/summary/i), { target: { value: 'my own words' } });

    fireEvent.click(screen.getByRole('button', { name: /troll/i }));
    fireEvent.click(screen.getByRole('button', { name: /keep editing/i }));
    expect(screen.getByLabelText(/summary/i).value).toBe('my own words');
    expect(screen.queryByText(/replace the form/i)).not.toBeInTheDocument();
  });

  it('submits without an email key', async () => {
    const detail = { id: 'new-ai', username: 'botuser' };
    mockCreate.mockResolvedValue(detail);
    const onCreated = vi.fn();

    render(<CreateAiModal onClose={vi.fn()} onCreated={onCreated} />);
    fireEvent.click(screen.getByRole('button', { name: /doomer/i }));
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'botuser' } });
    fireEvent.click(screen.getByRole('button', { name: /create ai user/i }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(detail));
    expect(mockCreate).toHaveBeenCalledWith({
      username: 'botuser',
      traits: ['pessimistic', 'sarcastic', 'dry'],
      typingStyle: 'bleak one-liners',
      summary: 'A burned-out pessimist.',
    });
    expect(mockCreate.mock.calls[0][0]).not.toHaveProperty('email');
  });

  it('form still works manually when the catalog fails', () => {
    usePersonaCatalog.mockReturnValue({ catalog: null, loading: false, error: new Error('down'), retry: vi.fn() });
    render(<CreateAiModal onClose={vi.fn()} onCreated={vi.fn()} />);

    expect(screen.getByText(/couldn.t load archetypes/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'manualbot' } });
    const traitInput = screen.getByPlaceholderText(/add a trait/i);
    fireEvent.change(traitInput, { target: { value: 'curious' } });
    fireEvent.keyDown(traitInput, { key: 'Enter' });
    fireEvent.change(screen.getByLabelText(/typing style/i), { target: { value: 'casual' } });
    fireEvent.change(screen.getByLabelText(/summary/i), { target: { value: 'A helpful bot' } });

    expect(screen.getByRole('button', { name: /create ai user/i })).not.toBeDisabled();
  });

  it('surfaces API error at top of form', () => {
    useCreateAiUser.mockReturnValue({
      create: mockCreate,
      creating: false,
      error: { response: { status: 409, data: { detail: 'Username is already taken.' } } },
    });
    render(<CreateAiModal onClose={vi.fn()} onCreated={vi.fn()} />);
    expect(screen.getByText(/username is already taken/i)).toBeInTheDocument();
  });

  it('username validation still enforced', () => {
    render(<CreateAiModal onClose={vi.fn()} onCreated={vi.fn()} />);
    const username = screen.getByLabelText(/username/i);
    fireEvent.change(username, { target: { value: 'ab' } });
    fireEvent.blur(username);
    expect(screen.getByText(/3.{0,5}24/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create ai user/i })).toBeDisabled();
  });
});
