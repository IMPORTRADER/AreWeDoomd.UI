import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TraitInput from './TraitInput';

const SUGGESTIONS = ['sarcastic', 'supportive', 'suspicious', 'warm', 'dry', 'dramatic', 'gentle'];

function setup(props = {}) {
  const onChange = vi.fn();
  render(
    <TraitInput
      traits={props.traits ?? []}
      onChange={onChange}
      disabled={props.disabled ?? false}
      suggestions={props.suggestions ?? SUGGESTIONS}
    />,
  );
  return { onChange, input: screen.getByPlaceholderText(/add a trait/i) };
}

describe('TraitInput', () => {
  it('commits free text on Enter', () => {
    const { onChange, input } = setup();
    fireEvent.change(input, { target: { value: 'homemade' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['homemade']);
  });

  it('commits on comma', () => {
    const { onChange, input } = setup();
    fireEvent.change(input, { target: { value: 'stoic,' } });
    fireEvent.keyDown(input, { key: ',' });
    expect(onChange).toHaveBeenCalledWith(['stoic']);
  });

  it('rejects traits shorter than 2 chars with an error message', () => {
    const { onChange, input } = setup();
    fireEvent.change(input, { target: { value: 'a' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText(/2.{0,5}60/)).toBeInTheDocument();
  });

  it('rejects duplicates', () => {
    const { onChange, input } = setup({ traits: ['warm'] });
    fireEvent.change(input, { target: { value: 'warm' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText(/already added/i)).toBeInTheDocument();
  });

  it('filters the dropdown by input and picks with keyboard', () => {
    const { onChange, input } = setup();
    fireEvent.change(input, { target: { value: 'su' } });
    // dropdown shows matches containing 'su'
    expect(screen.getByRole('option', { name: 'supportive' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'suspicious' })).toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['supportive']);
  });

  it('adds a suggestion chip on click', () => {
    const { onChange } = setup();
    fireEvent.click(screen.getByRole('button', { name: /add trait sarcastic/i }));
    expect(onChange).toHaveBeenCalledWith(['sarcastic']);
  });

  it('removes a trait via its × button', () => {
    const { onChange } = setup({ traits: ['warm', 'dry'] });
    fireEvent.click(screen.getByRole('button', { name: /remove warm/i }));
    expect(onChange).toHaveBeenCalledWith(['dry']);
  });

  it('hides suggestion chips already added and works with empty suggestions', () => {
    setup({ traits: ['sarcastic'], suggestions: [] });
    expect(screen.queryByRole('button', { name: /add trait/i })).not.toBeInTheDocument();
  });

  it('disables input at 10 traits', () => {
    const ten = ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9', 't10'];
    const { input } = setup({ traits: ten });
    expect(input).toBeDisabled();
  });
});
