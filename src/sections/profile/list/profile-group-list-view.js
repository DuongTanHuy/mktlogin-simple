import PropTypes from 'prop-types';
import {
  alpha,
  Button,
  IconButton,
  InputAdornment,
  List,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import concat from 'lodash/concat';
import { CustomTooltip } from 'src/components/custom-tooltip';
import { useLocales } from 'src/locales';
import { setStorage } from 'src/hooks/use-local-storage';
import { list_group_data } from 'src/utils/mock';
import Iconify from '../../../components/iconify';
import { useMultiBoolean } from '../../../hooks/use-multiple-boolean';
import { GROUP_INVISIBLE, ID_GROUP_ALL } from '../../../utils/constance';
import { useAuthContext } from '../../../auth/hooks';
import ProfileGroupItem from './profile-group-item';
import AddEditProfileGroupDialog from './add-edit-profile-group-dialog';
import ConfirmDeleteDialog from '../../profile-group/confirm-delete-dialog';
import Scrollbar from '../../../components/scrollbar';
import { useSettingsContext } from '../../../components/settings';

const ProfileGroupListView = React.memo(
  ({
    listGroup,
    groupSelected,
    setGroupSelected,
    setListGroup,
    onResetPage,
    setSidebarAble,
    defaultGroupVisible,
  }) => {
    const { t } = useLocales();
    const confirm = useMultiBoolean({
      addEdit: false,
      delete: false,
      move: false,
    });
    const [dataForEdit, setDataForEdit] = useState(null);
    const [dataForDelete, setDataForDelete] = useState(null);
    const fetchData = useRef();
    const { workspace_id: workspaceId, isHost } = useAuthContext();
    const { settingSystem } = useSettingsContext();
    const [search, setSearch] = useState('');
    const [listSuggestion, setListSuggestion] = useState([]);

    fetchData.current = async () => {
      try {
        if (workspaceId) {
          const response = list_group_data;
          const totalNumProfile = response.data.reduce(
            (total, item) => total + item.num_profiles,
            0
          );
          const defaultGroup = [
            {
              id: ID_GROUP_ALL,
              name: 'group.all',
              num_profile: totalNumProfile,
            },
          ];
          setListGroup(concat(defaultGroup, response.data));
        }
      } catch (error) {
        /* empty */
      }
    };
    useEffect(() => {
      fetchData.current();
    }, [workspaceId]);

    const handleClickEditProfileGroup = (profileGroup) => {
      setDataForEdit(profileGroup);
      confirm.onTrue('addEdit');
    };

    const handleClickDeleteProfileGroup = (profileGroup) => {
      setDataForDelete(profileGroup);
      confirm.onTrue('delete');
    };

    const handleClickAddProfileGroup = () => {
      setDataForEdit(null);
      confirm.onTrue('addEdit');
    };

    const handleFilters = (event) => {
      setSearch(event.target.value);
      const newList = [];
      for (let i = 0; i < listSuggestion.length; i += 1) {
        const item = {
          ...listSuggestion[i],
          display: listSuggestion[i].name.toLowerCase().includes(event.target.value.toLowerCase()),
        };
        newList.push(item);
      }
      setListSuggestion(newList);
    };

    const collapsedSidebar = useCallback(() => {
      setSidebarAble([0, 'auto']);
      setStorage(GROUP_INVISIBLE, { ...defaultGroupVisible, profile: true });
    }, [defaultGroupVisible, setSidebarAble]);

    const renderDialog = (
      <>
        <AddEditProfileGroupDialog
          data={dataForEdit}
          open={confirm.value.addEdit}
          closeDialog={() => {
            confirm.onFalse('addEdit');
          }}
          refreshProfileGroupList={fetchData.current}
        />
        <ConfirmDeleteDialog
          data={dataForDelete}
          open={confirm.value.delete}
          closeDialog={() => {
            confirm.onFalse('delete');
          }}
          refreshProfileGroupList={fetchData.current}
          setGroupSelected={setGroupSelected}
        />
      </>
    );

    useEffect(() => {
      setListSuggestion(listGroup.slice(2).map((item) => ({ ...item, display: true })));
    }, [listGroup]);

    return (
      <>
        <Stack
          className="app-sidebar"
          height={1}
          // onMouseDown={(e) => e.preventDefault()}
        >
          <Stack height={1}>
            <Stack direction="row" justifyContent="space-between" paddingRight="10px">
              <Typography variant="h6">{t('group.profile')}</Typography>
              <CustomTooltip
                status={!isHost && settingSystem?.authorization_method === 'profile'}
                title="Không thể tạo nhóm hồ sơ khi đang ở chế độ phân quyền theo hồ sơ"
              >
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Iconify icon="solar:add-circle-linear" width={20} />}
                  onClick={handleClickAddProfileGroup}
                  disabled={!isHost && settingSystem?.authorization_method === 'profile'}
                >
                  {t('group.new')}
                </Button>
              </CustomTooltip>
            </Stack>

            <Stack
              height={1}
              sx={{
                pr: '10px',
              }}
            >
              <List
                component="nav"
                aria-label="secondary mailbox folder"
                sx={{
                  height: 1,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} pt={2.5} pb={1}>
                  <TextField
                    size="small"
                    fullWidth
                    value={search}
                    onChange={handleFilters}
                    placeholder={`${t('actions.search')}...`}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <>
                          {search ? (
                            <Iconify
                              onClick={() => handleFilters({ target: { value: '' } })}
                              icon="carbon:close-outline"
                              sx={{
                                color: 'text.disabled',
                                '&:hover': { cursor: 'pointer', color: 'white' },
                              }}
                            />
                          ) : null}
                        </>
                      ),
                    }}
                  />

                  <Tooltip title="Ẩn danh sách nhóm" arrow placement="top">
                    <IconButton
                      aria-label="share"
                      size="small"
                      sx={{
                        border: '1px solid',
                        borderRadius: 1,
                        paddingX: '8px',
                        borderColor: (theme) => alpha(theme.palette.grey[500], 0.32),
                      }}
                      onClick={collapsedSidebar}
                    >
                      <Iconify
                        icon="lsicon:double-arrow-left-outline"
                        color="text.primary"
                        width={24}
                        height={24}
                      />
                    </IconButton>
                  </Tooltip>
                </Stack>
                {listGroup.slice(0, 2).map((value, index) => (
                  <Stack key={index} spacing={0.5} mt={0.5}>
                    <ProfileGroupItem
                      key={index}
                      profileGroup={value}
                      groupSelected={groupSelected}
                      setGroupSelected={(id) => {
                        setGroupSelected(id);
                        onResetPage();
                      }}
                      confirm={confirm}
                      handleClickEditProfileGroup={handleClickEditProfileGroup}
                      handleClickDeleteProfileGroup={handleClickDeleteProfileGroup}
                    />
                  </Stack>
                ))}

                <Scrollbar
                  autoHide={false}
                  sxRoot={{
                    overflow: 'unset',
                  }}
                  sx={{
                    height: 'calc(100% - 170px)',
                    '& .simplebar-track.simplebar-vertical': {
                      position: 'absolute',
                      right: '-10px',
                      pointerEvents: 'auto',
                      width: 10,
                    },
                  }}
                >
                  {listSuggestion
                    .filter((item) => item.display)
                    .map((value, index) => (
                      <ProfileGroupItem
                        key={index}
                        profileGroup={value}
                        groupSelected={groupSelected}
                        setGroupSelected={(id) => {
                          setGroupSelected(id);
                          onResetPage();
                        }}
                        confirm={confirm}
                        handleClickEditProfileGroup={handleClickEditProfileGroup}
                        handleClickDeleteProfileGroup={handleClickDeleteProfileGroup}
                      />
                    ))}
                </Scrollbar>
              </List>
            </Stack>
          </Stack>
        </Stack>
        {renderDialog}
      </>
    );
  },
  (prevProps, nextProps) =>
    prevProps.listGroup === nextProps.listGroup &&
    prevProps.defaultGroupInVisible === nextProps.defaultGroupInVisible &&
    prevProps.groupSelected === nextProps.groupSelected
);

export default ProfileGroupListView;

ProfileGroupListView.propTypes = {
  listGroup: PropTypes.array,
  groupSelected: PropTypes.number,
  setGroupSelected: PropTypes.func,
  setListGroup: PropTypes.func,
  onResetPage: PropTypes.func,
  setSidebarAble: PropTypes.func,
  defaultGroupVisible: PropTypes.object,
};
