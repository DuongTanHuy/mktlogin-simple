import { Helmet } from 'react-helmet-async';
import { useAuthContext } from 'src/auth/hooks';
import { useParams } from 'src/routes/hooks';
// sections
import { LogTaskView } from 'src/sections/task/view';
import { useGetTaskById } from '../../../api/task.api';

// ----------------------------------------------------------------------

export default function TaskLogPage() {
  const { app_version, workspace_id } = useAuthContext();
  const { taskId } = useParams();
  const { task } = useGetTaskById(workspace_id, taskId);

  return (
    <>
      <Helmet>
        <title>MKTLogin {app_version}</title>
      </Helmet>
      <LogTaskView taskData={task} />
    </>
  );
}
