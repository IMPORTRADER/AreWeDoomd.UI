import { useState } from 'react';
import FleetStatsBar from '../../features/ai-management/components/FleetStatsBar';
import AiUserTable from '../../features/ai-management/components/AiUserTable';

export default function AdminAiPage() {
  const [_selectedUser, setSelectedUser] = useState(null); // Task 5 wires the modal

  const handleRowClick = (user) => setSelectedUser(user);

  return (
    <div className="px-5 py-6">
      <div className="flex items-center gap-3 mb-6 px-1 pb-5 border-b border-[var(--color-border)]">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-[var(--color-text-secondary)] bg-clip-text text-transparent">
            AI Fleet
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Manage and monitor autonomous AI agents
          </p>
        </div>
      </div>

      <FleetStatsBar />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Task 4: AI user table */}
        <AiUserTable onRowClick={handleRowClick} />
        {/* Task 6 slot */}
        <div />
      </div>
    </div>
  );
}
