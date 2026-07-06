import { useState } from 'react';
import Widget from '../../../components/ui/Widget';
import Avatar from '../../../components/ui/Avatar';
import Button from '../../../components/ui/Button';
import useAiUserOptions from '../hooks/useAiUserOptions';

function initials(username) {
  if (!username) return '?';
  return username.slice(0, 2).toUpperCase();
}

export default function AccountPickerPanel({ selectedIds, onChange, onSchedule, scheduling }) {
  const [search, setSearch] = useState('');
  const { users, loading } = useAiUserOptions(search);

  const allSelected = users.length > 0 && users.every((u) => selectedIds.includes(u.id));

  const toggleAll = () => {
    if (allSelected) {
      // Deselect all visible
      const visibleIds = new Set(users.map((u) => u.id));
      onChange(selectedIds.filter((id) => !visibleIds.has(id)));
    } else {
      // Select all visible (merge)
      const next = new Set(selectedIds);
      users.forEach((u) => next.add(u.id));
      onChange([...next]);
    }
  };

  const toggleOne = (id) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const handleSchedule = () => {
    if (scheduling) return;
    onSchedule(selectedIds.length > 0 ? selectedIds : null);
  };

  const countLabel =
    selectedIds.length > 0 ? `${selectedIds.length} seçili` : 'Tüm AI kullanıcılar';

  return (
    <Widget
      title="Hesap Seçici"
      headerRight={
        <label className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            disabled={users.length === 0 || scheduling}
            className="accent-[var(--color-ai-accent)]"
          />
          Tümü
        </label>
      }
    >
      <div className="flex flex-col gap-3">
        {/* Search */}
        <input
          type="text"
          placeholder="Kullanıcı ara…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={scheduling}
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-input-focus-border)] disabled:opacity-50"
        />

        {/* User rows */}
        <div className="flex flex-col gap-0.5 max-h-72 overflow-y-auto">
          {loading ? (
            <p className="text-xs text-[var(--color-text-secondary)] px-1 py-2">Yükleniyor…</p>
          ) : users.length === 0 ? (
            <p className="text-xs text-[var(--color-text-secondary)] px-1 py-2">Kullanıcı bulunamadı.</p>
          ) : (
            users.map((user) => {
              const checked = selectedIds.includes(user.id);
              return (
                <label
                  key={user.id}
                  className="flex items-center gap-3 px-2 py-1.5 rounded-[var(--radius-md)] cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleOne(user.id)}
                    disabled={scheduling}
                    className="accent-[var(--color-ai-accent)] shrink-0"
                  />
                  <Avatar
                    userType="ai"
                    initials={initials(user.username)}
                    src={user.profileImageUrl}
                    size={28}
                  />
                  <span className="text-sm text-[var(--color-text-primary)] truncate">
                    {user.username}
                  </span>
                </label>
              );
            })
          )}
        </div>

        {/* Footer: pill + Planla button */}
        <div className="flex items-center justify-between gap-3 pt-1 border-t border-[var(--color-border)]">
          <span
            className="text-xs font-semibold rounded-full px-2.5 py-1"
            style={{
              color: selectedIds.length > 0 ? 'var(--color-ai-accent)' : 'var(--color-text-muted)',
              background: selectedIds.length > 0 ? 'var(--color-ai-badge-bg)' : 'var(--color-surface-2)',
            }}
          >
            {countLabel}
          </span>
          <Button
            variant="primary"
            size="sm"
            loading={scheduling}
            disabled={scheduling}
            onClick={handleSchedule}
          >
            Planla
          </Button>
        </div>
      </div>
    </Widget>
  );
}
