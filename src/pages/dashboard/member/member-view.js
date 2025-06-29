import { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';
import SplitPane, { Pane } from 'split-pane-react';

// mui
import { alpha, Button, List, Stack, Typography } from '@mui/material';
import Iconify from 'src/components/iconify';
import { useMultiBoolean } from 'src/hooks/use-multiple-boolean';
import AddEditWorkgroupDialog from 'src/sections/member/action-dialog/add-edit-workgroup';
import MemberView from 'src/sections/member/view';
import { getListWorkgroupApi } from 'src/api/workgroup.api';
import { getWorkPermissionsApi } from 'src/api/cms.api';
import DeleteWorkgroupDialog from 'src/sections/member/action-dialog/delete-workgroup';
import { useAuthContext } from 'src/auth/hooks';
import Scrollbar from 'src/components/scrollbar';
import { CustomTooltip } from 'src/components/custom-tooltip';
import { useLocales } from 'src/locales';
import WorkGroupButton from './work-group-button';
import useWorkspaceRole from './hooks/use-workspace-role';

//----------------------------------------------------------------

const Member = () => {
  const { t } = useLocales();
  const { workspace_id, app_version } = useAuthContext();
  const [currentGroup, setCurrentGroup] = useState({});
  const [listWorkgroup, setListWorkgroup] = useState([]);
  const { workspace_role } = useWorkspaceRole(currentGroup?.id);
  const [sizes, setSizes] = useState([260, 'auto']);

  const [listTab, setListTab] = useState([]);
  const [listItem, setListItem] = useState([]);
  const [listPermissions, setListPermissions] = useState([]);
  const [actionData, setActionData] = useState({});
  const fetchListGroup = useRef();
  const confirm = useMultiBoolean({
    add: false,
    edit: false,
    delete: false,
  });

  const [loading, setLoading] = useState(true);

  const actionsPermission = useMemo(
    () => ({
      canCreateWorkgroup: handlePermissions('createWorkgroup', workspace_role),
    }),
    [workspace_role]
  );

  fetchListGroup.current = async (updateCurrentGroup = true) => {
    try {
      setLoading(true);
      const response = await getListWorkgroupApi(workspace_id);
      if (updateCurrentGroup) {
        setCurrentGroup(response?.data?.data[0]);
      }
      setListWorkgroup(response?.data?.data);
    } catch (error) {
      /* empty */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListGroup.current();
  }, [workspace_id]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await getWorkPermissionsApi();
        setListTab(response.data.filter((item) => item.parent === null));
        setListItem(response.data.filter((item) => item.parent !== null));
      } catch (error) {
        /* empty */
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    const list = listTab.map((item) => {
      const listOptions = listItem
        .filter((i) => i.parent === item.id)
        .map((i) => ({
          value: i.id,
          label: i.name,
        }));
      return {
        key: item.slug,
        label: item.name,
        options: listOptions,
      };
    });
    setListPermissions(list);
  }, [listItem, listTab]);

  const renderDialog = (
    <>
      <AddEditWorkgroupDialog
        open={confirm.value.add}
        onClose={() => confirm.onFalse('add')}
        type="add"
        permissions={listPermissions}
        handleResetData={fetchListGroup.current}
        setCurrentGroup={setCurrentGroup}
      />
      <AddEditWorkgroupDialog
        open={confirm.value.edit}
        onClose={() => confirm.onFalse('edit')}
        type="edit"
        permissions={listPermissions}
        handleResetData={fetchListGroup.current}
        groupData={actionData}
      />
      <DeleteWorkgroupDialog
        groupData={actionData}
        open={confirm.value.delete}
        onClose={() => confirm.onFalse('delete')}
        handleResetData={fetchListGroup.current}
        modeAPI="workgroup"
        currentGroup={currentGroup}
      />
    </>
  );

  return (
    <>
      <Helmet>
        <title>MKTLogin {app_version}</title>
      </Helmet>
      <Stack direction="row" spacing={2} height="100%">
        <SplitPane
          split="vertical"
          sizes={sizes}
          onChange={(values) => {
            if (values?.[0] <= 120) {
              setSizes([0, 'auto']);
            } else if (values?.[0] >= 160) {
              setSizes(values);
            }
          }}
        >
          <Pane maxSize="35%">
            <Stack
              sx={{
                flexBasis: '150px',
                padding: '10px',
                pb: 0,
                paddingRight: 0,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                border: (theme) => `dashed 1px ${theme.palette.divider}`,
                height: 'calc(100% - 8px)',
              }}
            >
              <Stack height={1}>
                <Stack direction="row" justifyContent="space-between" paddingRight="10px">
                  <Typography variant="h6">{t('member.userGroup.title')}</Typography>
                  <CustomTooltip
                    status={!actionsPermission.canCreateWorkgroup}
                    title={t('member.tooltips.notPermission')}
                  >
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<Iconify icon="solar:add-circle-linear" width={20} />}
                      onClick={() => confirm.onTrue('add')}
                      disabled={!actionsPermission.canCreateWorkgroup}
                    >
                      {t('member.actions.new')}
                    </Button>
                  </CustomTooltip>
                </Stack>
                <Scrollbar
                  sx={{
                    height: 1,
                    pr: '10px',
                  }}
                >
                  <List component="nav" aria-label="secondary mailbox folder">
                    {listWorkgroup.map((button) => (
                      <WorkGroupButton
                        key={button.id}
                        currentGroup={currentGroup?.id}
                        setCurrentGroup={() => setCurrentGroup(button)}
                        data={button}
                        confirm={confirm}
                        setActionData={setActionData}
                        handlePermissions={(actionName) =>
                          handlePermissions(actionName, workspace_role)
                        }
                      />
                    ))}
                  </List>
                </Scrollbar>
              </Stack>
            </Stack>
          </Pane>
          <Pane>
            <Stack sx={{ width: 1, height: 1, overflow: 'hidden' }} pb={1}>
              <MemberView
                currentGroup={currentGroup}
                permissions={listPermissions}
                handlePermissions={(actionName) => handlePermissions(actionName, workspace_role)}
                workspaceRole={workspace_role}
                workspaceId={workspace_id}
                listGroupLoading={loading}
              />
            </Stack>
          </Pane>
        </SplitPane>
      </Stack>
      {renderDialog}
    </>
  );
};

export default Member;

//----------------------------------------------------------------
function handlePermissions(actionName, role) {
  const permissions = {
    host: ['createWorkgroup', 'deleteWorkgroup', 'editWorkgroup', 'inviteMember', 'editPermission'],
    admin: [
      'createWorkgroup',
      'deleteWorkgroup',
      'editWorkgroup',
      'inviteMember',
      'editPermission',
    ],
    manager: ['inviteMember'],
    member: [],
  };
  return permissions[role]?.includes(actionName) || false;
}

handlePermissions.propTypes = {
  role: PropTypes.oneOf(['host', 'admin', 'manager', 'member']),
  actionName: PropTypes.oneOf([
    'createWorkgroup',
    'actionsWorkgroup',
    'inviteMember',
    'editPermission',
  ]),
};
