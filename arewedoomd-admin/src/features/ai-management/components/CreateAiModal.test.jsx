import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateAiModal from './CreateAiModal';

vi.mock('../hooks/useCreateAiUser', () => ({
  default: vi.fn(),
}));

import useCreateAiUser from '../hooks/useCreateAiUser';

const mockCreate = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  useCreateAiUser.mockReturnValue({
    create: mockCreate,
    creating: false,
    error: null,
  });
});

describe('CreateAiModal', () => {
  it('renders username, email, traits, typingStyle, summary fields', () => {
    render(<CreateAiModal onClose={vi.fn()} onCreated={vi.fn()} />);
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/add a trait/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/typing/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/description/i)).toBeInTheDocument();
  });

  it('shows inline error when username is too short and save is disabled', () => {
    render(<CreateAiModal onClose={vi.fn()} onCreated={vi.fn()} />);
    const usernameInput = screen.getByPlaceholderText(/username/i);
    fireEvent.change(usernameInput, { target: { value: 'ab' } });
    fireEvent.blur(usernameInput);
    expect(screen.getByText(/3.{0,5}24/i)).toBeInTheDocument();
    const saveBtn = screen.getByRole('button', { name: /create/i });
    expect(saveBtn).toBeDisabled();
  });

  it('shows inline error when username has invalid characters', () => {
    render(<CreateAiModal onClose={vi.fn()} onCreated={vi.fn()} />);
    const usernameInput = screen.getByPlaceholderText(/username/i);
    fireEvent.change(usernameInput, { target: { value: 'bad-user!' } });
    fireEvent.blur(usernameInput);
    expect(screen.getByText(/letters.*numbers.*underscore|[a-z].*[0-9].*_/i)).toBeInTheDocument();
  });

  it('save button is disabled when form is invalid', () => {
    render(<CreateAiModal onClose={vi.fn()} onCreated={vi.fn()} />);
    const saveBtn = screen.getByRole('button', { name: /create/i });
    expect(saveBtn).toBeDisabled();
  });

  it('save button enabled when username, trait, typingStyle, summary are valid', () => {
    render(<CreateAiModal onClose={vi.fn()} onCreated={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'validuser' } });

    const traitInput = screen.getByPlaceholderText(/add a trait/i);
    fireEvent.change(traitInput, { target: { value: 'curious' } });
    fireEvent.keyDown(traitInput, { key: 'Enter' });

    fireEvent.change(screen.getByPlaceholderText(/typing/i), { target: { value: 'casual' } });
    fireEvent.change(screen.getByPlaceholderText(/description/i), { target: { value: 'A helpful bot' } });

    const saveBtn = screen.getByRole('button', { name: /create/i });
    expect(saveBtn).not.toBeDisabled();
  });

  it('surfaces 409 conflict error message at top of form', async () => {
    const conflictErr = {
      response: { status: 409, data: { message: 'Username is already taken.' } },
    };
    useCreateAiUser.mockReturnValue({
      create: mockCreate,
      creating: false,
      error: conflictErr,
    });

    render(<CreateAiModal onClose={vi.fn()} onCreated={vi.fn()} />);
    expect(screen.getByText(/username is already taken/i)).toBeInTheDocument();
  });

  it('calls onCreated with detail and closes on success', async () => {
    const detail = { id: 'new-ai', username: 'botuser' };
    mockCreate.mockResolvedValue(detail);
    const onCreated = vi.fn();
    const onClose = vi.fn();

    render(<CreateAiModal onClose={onClose} onCreated={onCreated} />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'botuser' } });

    const traitInput = screen.getByPlaceholderText(/add a trait/i);
    fireEvent.change(traitInput, { target: { value: 'curious' } });
    fireEvent.keyDown(traitInput, { key: 'Enter' });

    fireEvent.change(screen.getByPlaceholderText(/typing/i), { target: { value: 'casual' } });
    fireEvent.change(screen.getByPlaceholderText(/description/i), { target: { value: 'A helpful bot' } });

    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(onCreated).toHaveBeenCalledWith(detail);
      expect(onClose).toHaveBeenCalled();
    });
  });
});
