import PropTypes from 'prop-types';

import {
  alpha,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  InputAdornment,
  Stack,
  Tab,
  Tabs,
  TextField,
} from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { useBoolean } from 'src/hooks/use-boolean';
import { CustomTooltip } from 'src/components/custom-tooltip';
import { useLocales } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import { getWorkgroupMemberApi } from 'src/api/workgroup.api';
import AddEditMemberDialog from './action-dialog/add-edit-member';
import List from './list-tab';
import Permission from './permission-tab';
import Invited from './invited-tab';

const MemberView = React.memo(
  ({
    currentGroup,
    permissions,
    handlePermissions,
    workspaceRole,
    workspaceId,
    listGroupLoading,
  }) => {
    const { t } = useLocales();

    const { workspace_id } = useAuthContext();
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(true);

    const TABS = [
      {
        value: 'member',
        label: t('member.list.title'),
      },
      {
        value: 'invited',
        label: t('member.invited.title'),
      },
      {
        value: 'permission',
        label: t('member.accessPermission'),
      },
    ];

    const settings = useSettingsContext();
    const confirm = useBoolean();
    const actionsPermission = useMemo(
      () => ({
        canInviteMember: handlePermissions('inviteMember'),
        canEditPermission: handlePermissions('editPermission'),
      }),
      [handlePermissions]
    );

    const [currentTab, setCurrentTab] = useState('member');

    const handleChangeTab = (_, newValue) => {
      setCurrentTab(newValue);
    };

    const fetchData = useCallback(async () => {
      try {
        if (!listGroupLoading) {
          if (currentGroup?.id) {
            setLoading(true);

            const response = await getWorkgroupMemberApi(workspaceId, currentGroup.id);
            setTableData(response.data.data);
            setLoading(false);
          } else {
            setTableData([]);
            setLoading(false);
          }
        }
      } catch (error) {
        //
        setLoading(false);
      }
    }, [currentGroup?.id, listGroupLoading, workspaceId]);

    useEffect(() => {
      fetchData();
    }, [fetchData]);

    const renderDialog = (
      <AddEditMemberDialog
        currentGroup={currentGroup}
        open={confirm.value}
        onClose={confirm.onFalse}
        workspaceRole={workspaceRole}
        handelChangeTabAfterInvite={() => setCurrentTab('invited')}
      />
    );

    useEffect(() => {
      setCurrentTab('member');
    }, [workspace_id]);

    return (
      <>
        <Container
          maxWidth={settings.themeStretch ? false : 'lg'}
          sx={{
            height: 1,
            pr: '0px!important',
          }}
        >
          <Stack height={1} spacing={3}>
            <TextField
              type="search"
              placeholder={`${t('member.search')}...`}
              size="small"
              sx={{
                width: {
                  xs: 1,
                  lg: 0.5,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
            />
            <Card
              sx={{
                height: 1,
                bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                border: (theme) => `dashed 1px ${theme.palette.divider}`,
                boxShadow: 'none',
              }}
            >
              <CardHeader
                sx={{
                  position: 'absolute',
                  right: -6,
                  top: -12,
                  zIndex: 10,
                }}
                action={
                  currentTab === 'member' && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Button
                        startIcon={<Iconify icon="tabler:reload" />}
                        variant="contained"
                        onClick={fetchData}
                        size="small"
                      >
                        Làm mới
                      </Button>
                      <CustomTooltip
                        title={
                          (!actionsPermission.canInviteMember &&
                            t('member.tooltips.notPermission')) ||
                          (!currentGroup?.id && t('member.tooltips.notInvite')) ||
                          ''
                        }
                        status={!currentGroup?.id || !actionsPermission.canInviteMember}
                      >
                        <Button
                          startIcon={<Iconify icon="fluent:add-12-filled" />}
                          disabled={!currentGroup?.id || !actionsPermission.canInviteMember}
                          variant="contained"
                          color="primary"
                          onClick={confirm.onTrue}
                          size="small"
                        >
                          {t('member.actions.invite')}
                        </Button>
                      </CustomTooltip>
                    </Stack>
                  )
                }
              />
              <Tabs
                value={currentTab}
                onChange={handleChangeTab}
                sx={{
                  px: 3,
                  boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
                  bgcolor: 'transparent',
                  '& .MuiButtonBase-root.MuiTabScrollButton-root.MuiTabScrollButton-horizontal.MuiTabs-scrollButtons':
                    {
                      display: 'none',
                    },
                }}
              >
                {TABS.map((tab) => (
                  <Tab
                    sx={{
                      '&.MuiButtonBase-root ': {
                        fontSize: '16px',
                        fontWeight: 'bold',
                      },
                    }}
                    disabled={!currentGroup?.id}
                    key={tab.value}
                    label={tab.label}
                    icon={tab.icon}
                    value={tab.value}
                  />
                ))}
              </Tabs>

              <CardContent
                sx={{
                  height: 'calc(100% - 48px)',
                  '&.MuiCardContent-root': {
                    pb: 0,
                    pr: 1,
                  },
                }}
              >
                {currentTab === 'member' && (
                  <List
                    currentGroup={currentGroup}
                    workspaceId={workspaceId}
                    listGroupLoading={listGroupLoading}
                    loading={loading}
                    tableData={tableData}
                    fetchData={fetchData}
                  />
                )}

                {currentTab === 'invited' && <Invited currentGroup={currentGroup} />}

                {currentTab === 'permission' && (
                  <Permission
                    currentGroup={currentGroup}
                    permissions={permissions}
                    editPermission={actionsPermission.canEditPermission}
                  />
                )}
              </CardContent>
            </Card>
          </Stack>
        </Container>
        {renderDialog}
      </>
    );
  },
  (prevProps, nextProps) =>
    prevProps.currentGroup === nextProps.currentGroup &&
    prevProps.permissions === nextProps.permissions &&
    prevProps.workspaceRole === nextProps.workspaceRole
);

export default MemberView;

MemberView.propTypes = {
  currentGroup: PropTypes.object,
  permissions: PropTypes.array,
  handlePermissions: PropTypes.func,
  workspaceRole: PropTypes.string,
  workspaceId: PropTypes.string,
  listGroupLoading: PropTypes.bool,
};
