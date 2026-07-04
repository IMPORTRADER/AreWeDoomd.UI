import { useCallback, useRef, useState } from 'react';
import FleetStatsBar from '../../features/ai-management/components/FleetStatsBar';
import AiUserTable from '../../features/ai-management/components/AiUserTable';
import PersonaEditModal from '../../features/ai-management/components/PersonaEditModal';
import CreateAiModal from '../../features/ai-management/components/CreateAiModal';
import BulkCreateModal from '../../features/ai-management/components/BulkCreateModal';
import DecisionFeed from '../../features/ai-management/components/DecisionFeed';
import useAiUsers from '../../features/ai-management/hooks/useAiUsers';

export default function DashboardPage() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [createOpen, setCreateOpen]     = useState(false);
  const [bulkOpen, setBulkOpen]         = useState(false);
  const tableRefreshRef = useRef(null);
  const { users: aiUsers } = useAiUsers();

  const handleRowClick = (user) => setSelectedUser(user);

  const handleSaved = useCallback(() => {
    if (tableRefreshRef.current) tableRefreshRef.current();
    setSelectedUser(null);
  }, []);

  const handleClose = useCallback(() => setSelectedUser(null), []);

  const handleCreated = useCallback(() => {
    if (tableRefreshRef.current) tableRefreshRef.current();
    setCreateOpen(false);
  }, []);

  // Called by BulkCreateModal when the job reaches a terminal status with
  // at least one created user — refresh the table immediately so new AIs appear.
  const handleBulkTerminal = useCallback(() => {
    if (tableRefreshRef.current) tableRefreshRef.current();
  }, []);

  return (
    <>
      <FleetStatsBar />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-4">
        <AiUserTable
          onRowClick={handleRowClick}
          refreshRef={tableRefreshRef}
          onCreateClick={() => setCreateOpen(true)}
          onBulkClick={() => setBulkOpen(true)}
        />
        <DecisionFeed aiUsers={aiUsers} />
      </div>

      {selectedUser && (
        <PersonaEditModal
          userId={selectedUser.id}
          onClose={handleClose}
          onSaved={handleSaved}
        />
      )}

      {createOpen && (
        <CreateAiModal
          onClose={() => setCreateOpen(false)}
          onCreated={handleCreated}
        />
      )}

      {bulkOpen && (
        <BulkCreateModal
          onClose={() => setBulkOpen(false)}
          onJobTerminal={handleBulkTerminal}
        />
      )}
    </>
  );
}
