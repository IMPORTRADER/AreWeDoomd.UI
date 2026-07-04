import { useCallback, useRef, useState } from 'react';
import FleetStatsBar from '../../features/ai-management/components/FleetStatsBar';
import AiUserTable from '../../features/ai-management/components/AiUserTable';
import PersonaEditModal from '../../features/ai-management/components/PersonaEditModal';
import DecisionFeed from '../../features/ai-management/components/DecisionFeed';
import useAiUsers from '../../features/ai-management/hooks/useAiUsers';

export default function DashboardPage() {
  const [selectedUser, setSelectedUser] = useState(null);
  const tableRefreshRef = useRef(null);
  const { users: aiUsers } = useAiUsers();

  const handleRowClick = (user) => setSelectedUser(user);

  const handleSaved = useCallback(() => {
    if (tableRefreshRef.current) tableRefreshRef.current();
    setSelectedUser(null);
  }, []);

  const handleClose = useCallback(() => setSelectedUser(null), []);

  return (
    <>
      <FleetStatsBar />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-4">
        <AiUserTable onRowClick={handleRowClick} refreshRef={tableRefreshRef} />
        <DecisionFeed aiUsers={aiUsers} />
      </div>

      {selectedUser && (
        <PersonaEditModal
          userId={selectedUser.id}
          onClose={handleClose}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
