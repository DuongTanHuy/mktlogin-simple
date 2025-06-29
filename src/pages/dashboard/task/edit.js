import { Helmet } from 'react-helmet-async';
import { useGetTaskById } from 'src/api/task.api';
import { useAuthContext } from 'src/auth/hooks';
import { useParams } from 'src/routes/hooks';
// sections
import { EditTaskView } from 'src/sections/task/view';

// ----------------------------------------------------------------------

export default function EditMarketplacePage() {
  const { taskId } = useParams();
  const { workspace_id, app_version } = useAuthContext();
  const { task, refetchTaskDetail } = useGetTaskById(workspace_id, taskId);

  return (
    <>
      <Helmet>
        <title>MKTLogin {app_version}</title>
      </Helmet>

      <EditTaskView currentData={task} refetchTaskDetail={refetchTaskDetail} />
    </>
  );
}
