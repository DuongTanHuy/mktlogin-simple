import { useCallback, useEffect, useState } from 'react';
import { getWorkgroupMemberApi } from 'src/api/workgroup.api';
import { useAuthContext } from 'src/auth/hooks';
import eventBus from 'src/sections/script/event-bus';

function useWorkspaceRole(groupId) {
  const { user, isHost, workspace_id } = useAuthContext();
  const [workspaceRole, setWorkspaceRole] = useState('member');

  const checkWorkspaceRole = useCallback(async () => {
    try {
      const response = await getWorkgroupMemberApi(workspace_id, groupId);
      if (response?.data?.workspace_users) {
        const currentMember = response.data.workspace_users.find(
          (member) => member.user === user?.email
        );
        setWorkspaceRole(currentMember?.role);
        eventBus.emit('identifyRoles', currentMember?.role);
      }
    } catch (error) {
      //
    }
  }, [groupId, user?.email, workspace_id]);

  useEffect(() => {
    if (isHost) {
      setWorkspaceRole('host');
      eventBus.emit('identifyRoles', 'host');
    } else if (groupId) {
      checkWorkspaceRole();
    }
  }, [checkWorkspaceRole, groupId, isHost]);

  return {
    workspace_role: workspaceRole,
  };
}
export default useWorkspaceRole;
