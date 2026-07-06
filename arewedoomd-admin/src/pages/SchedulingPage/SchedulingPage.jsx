import { useCallback, useState } from 'react';
import AccountPickerPanel from '../../features/post-scheduling/components/AccountPickerPanel';
import ThresholdControl from '../../features/post-scheduling/components/ThresholdControl';
import ScheduleRunModal from '../../features/post-scheduling/components/ScheduleRunModal';
import TodayScheduleBoard from '../../features/post-scheduling/components/TodayScheduleBoard';
import EditScheduledPostModal from '../../features/post-scheduling/components/EditScheduledPostModal';
import useScheduleRun from '../../features/post-scheduling/hooks/useScheduleRun';
import useScheduledPosts from '../../features/post-scheduling/hooks/useScheduledPosts';
import useSchedulingSettings from '../../features/post-scheduling/hooks/useSchedulingSettings';
import usePostActions from '../../features/post-scheduling/hooks/usePostActions';
import { todayTurkeyDateString } from '../../features/post-scheduling/utils/formatTurkeyTime';

export default function SchedulingPage() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [runOpen, setRunOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [lastRequest, setLastRequest] = useState(null);

  const { settings, save, saving, loading: settingsLoading } = useSchedulingSettings();
  const { start, run, starting, polling, error: runError, conflict, reset } = useScheduleRun();
  const { posts, loading, error, refresh } = useScheduledPosts({ date: todayTurkeyDateString() });
  const { cancelPost, retryPost, actionError } = usePostActions();

  const handleSchedule = useCallback((aiUserIds) => {
    setLastRequest(aiUserIds);
    setRunOpen(true);
    start({ aiUserIds, overwriteExisting: false });
  }, [start]);

  const handleConfirmOverwrite = useCallback(() => {
    start({ aiUserIds: lastRequest, overwriteExisting: true });
  }, [start, lastRequest]);

  const handleRunClose = useCallback(() => {
    setRunOpen(false);
    reset();
    refresh();
  }, [reset, refresh]);

  const handleCancel = useCallback(async (post) => {
    await cancelPost(post.id);
    refresh();
  }, [cancelPost, refresh]);

  const handleRetry = useCallback(async (post) => {
    await retryPost(post.id);
    refresh();
  }, [retryPost, refresh]);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
        <div className="flex flex-col gap-4">
          <AccountPickerPanel
            selectedIds={selectedIds}
            onChange={setSelectedIds}
            onSchedule={handleSchedule}
            scheduling={starting || polling}
          />
          {!settingsLoading && settings && (
            <ThresholdControl settings={settings} onSave={save} saving={saving} />
          )}
        </div>

        <TodayScheduleBoard
          posts={posts}
          loading={loading}
          error={error || actionError}
          onEdit={setEditingPost}
          onCancel={handleCancel}
          onRetry={handleRetry}
        />
      </div>

      {runOpen && (
        <ScheduleRunModal
          run={run}
          starting={starting}
          polling={polling}
          error={runError}
          conflict={conflict}
          onConfirmOverwrite={handleConfirmOverwrite}
          onClose={handleRunClose}
        />
      )}

      {editingPost && (
        <EditScheduledPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSaved={() => { setEditingPost(null); refresh(); }}
        />
      )}
    </>
  );
}
