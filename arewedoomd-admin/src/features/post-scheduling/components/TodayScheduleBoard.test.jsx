import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TodayScheduleBoard from './TodayScheduleBoard';

const pendingPost = {
  id: 'p1', aiUserId: 'u1', content: 'merhaba dünya',
  scheduledAtUtc: '2026-07-05T12:00:00Z', status: 'Pending',
  wasTimeAdjusted: false, errorMessage: null,
};

describe('TodayScheduleBoard', () => {
  it('renders time in Turkey time (UTC+3)', () => {
    render(<TodayScheduleBoard posts={[pendingPost]} loading={false} error={null}
      onEdit={() => {}} onCancel={() => {}} onRetry={() => {}} />);
    expect(screen.getByText('15:00')).toBeInTheDocument();
  });

  it('shows edit/cancel only for pending posts', () => {
    render(<TodayScheduleBoard posts={[{ ...pendingPost, status: 'Published' }]} loading={false}
      error={null} onEdit={() => {}} onCancel={() => {}} onRetry={() => {}} />);
    expect(screen.queryByRole('button', { name: 'Düzenle' })).not.toBeInTheDocument();
  });

  it('fires onCancel with the post', () => {
    const onCancel = vi.fn();
    render(<TodayScheduleBoard posts={[pendingPost]} loading={false} error={null}
      onEdit={() => {}} onCancel={onCancel} onRetry={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'İptal' }));
    expect(onCancel).toHaveBeenCalledWith(pendingPost);
  });

  it('shows empty state when no posts', () => {
    render(<TodayScheduleBoard posts={[]} loading={false} error={null}
      onEdit={() => {}} onCancel={() => {}} onRetry={() => {}} />);
    expect(screen.getByText('Bugün için planlanmış gönderi yok.')).toBeInTheDocument();
  });
});
