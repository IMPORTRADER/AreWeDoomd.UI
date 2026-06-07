import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-svh gap-4 bg-[var(--color-bg)] text-[var(--color-text-primary)]">
          <h2 className="text-[var(--color-text-heading)]">Something went wrong</h2>
          <p>Please refresh the page to try again.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2.5 text-sm font-semibold bg-[var(--color-btn-primary)] text-white rounded-[var(--radius-md)] hover:bg-[var(--color-btn-primary-hover)] transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
