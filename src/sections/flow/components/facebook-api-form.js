/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';

// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

import eventBus from 'src/sections/script/event-bus';
import PositionedMenu from 'src/components/list-click';
import Variables from 'src/components/variable';
import { useBoolean } from 'src/hooks/use-boolean';
import {
  Autocomplete,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  MenuItem,
  Tooltip,
} from '@mui/material';
import { Fragment, useMemo, useState } from 'react';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { FB_PAGE_CATEGORIES } from 'src/utils/constance';

// ----------------------------------------------------------------------

const FA_API_OPTIONS = [
  { label: 'Đổi ngôn ngữ', value: 'changeLanguage' },
  { label: 'Chuyển sang Trang hoặc Trang cá nhân', value: 'switchProfilePage' },
  { label: 'Lấy dữ liệu người dùng hiện tại', value: 'getCurrentUserData' },
  { label: 'Quét video xu hướng trên Reels', value: 'fetchReelPosts' },
  { label: 'Quét thành viên mới tham gia nhóm', value: 'fetchNewGroupMember' },
  { label: 'Quét trang theo từ khóa', value: 'fetchPagesByKeyword' },
  { label: 'Quét nhóm theo từ khóa', value: 'fetchGroupsByKeyword' },
  { label: 'Quét bài viết trong nhóm', value: 'fetchPostsInGroup' },
  { label: 'Quét người tương tác bài viết', value: 'fetchPostInteractions' },
  { label: 'Quét bài viết trên tường cá nhân hoặc trang', value: 'fetchPostOnPage' },
  { label: 'Quét danh sách trang của tài khoản', value: 'fetchPagesOnAccount' },
  { label: 'Tự động chấp nhận lời mời kết bạn', value: 'autoAcceptFriendRequest' },
  {
    label: 'Quét danh sách tài khoản đang theo dõi của tài khoản',
    value: 'fetchFollowingOfAccount',
  },
  { label: 'Kết bạn theo UID', value: 'addFriendByUid' },
  {
    label: 'Quét danh sách nhóm mà tài khoản đã tham gia',
    value: 'fetchJoinedGroupsOfAccount',
  },
  {
    label: 'Đăng xuất tài khoản trên các thiết bị khác, trừ thiết bị hiện tại ra',
    value: 'logoutSessionOtherDevice',
  },
  {
    label: 'Đổi tên tài khoản',
    value: 'renameAccount',
  },
  {
    label: 'Tạo trang',
    value: 'createPage',
  },
  {
    label: 'Quét bài viết mới nhất theo từ khóa',
    value: 'fetchNewPostsByKeyWord',
  },
  {
    label: 'Quét bạn bè của tài khoản',
    value: 'fetchFriendsOfAccount',
  },
  {
    label: 'Mời bạn bè tham gia nhóm',
    value: 'inviteFriendsJoinGroup',
  },
];

// ----------------------------------------------------------------------

export default function FacebookApiForm({ formData, IdNode }) {
  const variableModal = useBoolean();
  const dataVariableModal = useBoolean();
  const { variableFlow } = useAuthContext();
  const [isUpdateSelectVariable, setIsUpdateSelectVariable] = useState(false);

  const handleChangeNumberSecond = (event) => {
    const { name, value, type, checked } = event.target;
    eventBus.emit('updateNode', {
      data: { [name]: type === 'checkbox' ? checked : value },
      idNode: IdNode,
    });
  };

  const getVariable = (name, item) => {
    eventBus.emit('updateNode', { data: { [name]: `\${${item.key}}` }, idNode: IdNode });
  };

  const fetchVariables = useMemo(() => {
    if (variableFlow?.list === null || variableFlow?.list?.length === 0) return [];

    return variableFlow?.list.map((i, index) => ({
      ...i,
      lastItem: index + 1 === variableFlow.list.length,
    }));
  }, [variableFlow?.list]);

  return (
    <Stack>
      <Typography
        sx={{
          fontSize: 16,
          fontStyle: 'italic',
        }}
        color="text.secondary"
      >
        {formData?.data?.description}
      </Typography>
      <Stack spacing={3} mt={2}>
        <Autocomplete
          onChange={(_, newValue) => {
            let newTimeDelay = {};
            switch (newValue?.value) {
              case 'fetchReelPosts':
              case 'fetchNewGroupMember':
                newTimeDelay = {
                  min_time_delay: 3,
                  max_time_delay: 8,
                };
                break;
              case 'fetchPagesByKeyword':
                newTimeDelay = {
                  min_time_delay: 3,
                  max_time_delay: 5,
                };
                break;
              case 'fetchGroupsByKeyword':
                newTimeDelay = {
                  min_time_delay: 3,
                  max_time_delay: 10,
                };
                break;
              case 'fetchPostsInGroup':
              case 'fetchPostInteractions':
              case 'autoAcceptFriendRequest':
              case 'fetchFollowingOfAccount':
              case 'fetchNewPostsByKeyWord':
              case 'inviteFriendsJoinGroup':
                newTimeDelay = {
                  min_time_delay: 10,
                  max_time_delay: 15,
                };
                break;
              case 'addFriendByUid':
                newTimeDelay = {
                  min_time_delay: 15,
                  max_time_delay: 30,
                };
                break;
              case 'fetchFriendsOfAccount':
                newTimeDelay = {
                  min_time_delay: 5,
                  max_time_delay: 10,
                };
                break;
              default:
                newTimeDelay = {};
            }
            eventBus.emit('updateNode', {
              data: { api_type: newValue?.value, ...newTimeDelay },
              idNode: IdNode,
            });
          }}
          fullWidth
          // disablePortal
          // disableClearable
          value={formData?.dataFields?.api_type ?? ''}
          options={FA_API_OPTIONS}
          getOptionLabel={(option) =>
            option?.label ?? FA_API_OPTIONS.find((item) => item.value === option)?.label ?? option
          }
          isOptionEqualToValue={(option, value) => option.value === value}
          noOptionsText={<Typography variant="body2">No options</Typography>}
          renderInput={(params) => (
            <TextField
              {...params}
              InputProps={{
                ...params.InputProps,
              }}
              label="Gói API"
            />
          )}
          renderOption={(props, option) => (
            <MenuItem {...props} key={option?.value}>
              {option?.label}
            </MenuItem>
          )}
        />

        {formData?.dataFields?.api_type === 'changeLanguage' && (
          <TextField
            select
            fullWidth
            name="lang"
            label="Ngôn ngữ"
            value={formData?.dataFields?.lang ?? 'en_US'}
            onChange={handleChangeNumberSecond}
          >
            {[
              { label: 'Tiếng Anh - Mỹ', value: 'en_US' },
              { label: 'Tiếng Việt', value: 'vi_VN' },
            ].map((item) => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </TextField>
        )}

        {formData?.dataFields?.api_type === 'switchProfilePage' && (
          <TextField
            onChange={handleChangeNumberSecond}
            value={formData?.dataFields?.profile_id ?? ''}
            name="profile_id"
            label="ID Trang hoặc Trang Cá Nhân"
            InputProps={{
              endAdornment: (
                <PositionedMenu
                  name="profile_id"
                  getVariable={getVariable}
                  openVariableModal={variableModal.onTrue}
                />
              ),
            }}
          />
        )}

        {formData?.dataFields?.api_type === 'fetchReelPosts' && (
          <TextField
            onChange={handleChangeNumberSecond}
            value={formData?.dataFields?.max_post ?? 30}
            name="max_post"
            label="Số lượng bài viết quét tối đa"
            InputProps={{
              endAdornment: (
                <PositionedMenu
                  name="max_post"
                  getVariable={getVariable}
                  openVariableModal={variableModal.onTrue}
                />
              ),
            }}
          />
        )}

        {formData?.dataFields?.api_type === 'fetchNewGroupMember' && (
          <>
            <TextField
              onChange={handleChangeNumberSecond}
              value={formData?.dataFields?.group_id ?? ''}
              name="group_id"
              label="ID Nhóm"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="group_id"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />
            <TextField
              onChange={handleChangeNumberSecond}
              value={formData?.dataFields?.max_member ?? 50}
              name="max_member"
              label="Số lượng thành viên quét tối đa"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="max_member"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />
          </>
        )}

        {['fetchPagesByKeyword', 'fetchGroupsByKeyword'].includes(
          formData?.dataFields?.api_type
        ) && (
          <>
            <TextField
              onChange={handleChangeNumberSecond}
              value={formData?.dataFields?.keyword ?? ''}
              name="keyword"
              label="Từ khóa"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="keyword"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />
            <TextField
              onChange={handleChangeNumberSecond}
              value={formData?.dataFields?.location ?? ''}
              name="location"
              label="Vị trí"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="location"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />
          </>
        )}

        {formData?.dataFields?.api_type === 'fetchPagesByKeyword' && (
          <TextField
            onChange={handleChangeNumberSecond}
            value={formData?.dataFields?.max_page ?? 50}
            name="max_page"
            label="Số lượng trang quét tối đa"
            InputProps={{
              endAdornment: (
                <PositionedMenu
                  name="max_page"
                  getVariable={getVariable}
                  openVariableModal={variableModal.onTrue}
                />
              ),
            }}
          />
        )}

        {formData?.dataFields?.api_type === 'fetchGroupsByKeyword' && (
          <>
            <Stack direction="row" spacing={3}>
              <FormControlLabel
                name="is_near_me"
                control={<Checkbox checked={formData?.dataFields?.is_near_me ?? false} />}
                onChange={handleChangeNumberSecond}
                label="Gần tôi"
                sx={{
                  width: 'fit-content',
                }}
              />
              <FormControlLabel
                name="is_group_public"
                control={<Checkbox checked={formData?.dataFields?.is_group_public ?? false} />}
                onChange={handleChangeNumberSecond}
                label="Nhóm công khai"
                sx={{
                  width: 'fit-content',
                }}
              />
            </Stack>
            <TextField
              onChange={handleChangeNumberSecond}
              value={formData?.dataFields?.max_group ?? 50}
              name="max_group"
              label="Số lượng nhóm quét tối đa"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="max_group"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />
          </>
        )}

        {formData?.dataFields?.api_type === 'fetchPostsInGroup' && (
          <>
            <TextField
              onChange={handleChangeNumberSecond}
              value={formData?.dataFields?.group_id ?? ''}
              name="group_id"
              label="ID Nhóm"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="group_id"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />
            <TextField
              onChange={handleChangeNumberSecond}
              value={formData?.dataFields?.max_post ?? 20}
              name="max_post"
              label="Số lượng bài viết quét tối đa"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="max_post"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />
          </>
        )}

        {formData?.dataFields?.api_type === 'fetchPostInteractions' && (
          <>
            <TextField
              onChange={handleChangeNumberSecond}
              value={formData?.dataFields?.post_id ?? ''}
              name="post_id"
              label="ID Bài viết"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="post_id"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />
            <TextField
              onChange={handleChangeNumberSecond}
              value={formData?.dataFields?.max_reaction ?? 50}
              name="max_reaction"
              label="Số lượng quét tối đa"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="max_reaction"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />
          </>
        )}

        {formData?.dataFields?.api_type === 'fetchPostOnPage' && (
          <>
            <TextField
              onChange={handleChangeNumberSecond}
              value={formData?.dataFields?.page_profile_id ?? ''}
              name="page_profile_id"
              label="ID Trang"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="page_profile_id"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />
            <TextField
              onChange={handleChangeNumberSecond}
              value={formData?.dataFields?.max_post_on_page ?? 20}
              name="max_post_on_page"
              label="Số lượng bài viết quét tối đa"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="max_post_on_page"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />
          </>
        )}

        {formData?.dataFields?.api_type === 'autoAcceptFriendRequest' && (
          <TextField
            onChange={handleChangeNumberSecond}
            value={formData?.dataFields?.max_accept ?? 10}
            name="max_accept"
            label="Số lượng chấp nhận tối đa"
            InputProps={{
              endAdornment: (
                <PositionedMenu
                  name="max_accept"
                  getVariable={getVariable}
                  openVariableModal={variableModal.onTrue}
                />
              ),
            }}
          />
        )}

        {formData?.dataFields?.api_type === 'fetchFollowingOfAccount' && (
          <TextField
            onChange={handleChangeNumberSecond}
            value={formData?.dataFields?.max_account ?? 1000}
            name="max_account"
            label="Số lượng quét tối đa"
            InputProps={{
              endAdornment: (
                <PositionedMenu
                  name="max_account"
                  getVariable={getVariable}
                  openVariableModal={variableModal.onTrue}
                />
              ),
            }}
          />
        )}

        {formData?.dataFields?.api_type === 'addFriendByUid' && (
          <TextField
            onChange={handleChangeNumberSecond}
            value={formData?.dataFields?.uid ?? ''}
            name="uid"
            label="UID"
            InputProps={{
              endAdornment: (
                <PositionedMenu
                  name="uid"
                  getVariable={getVariable}
                  openVariableModal={variableModal.onTrue}
                />
              ),
            }}
          />
        )}

        {formData?.dataFields?.api_type === 'fetchJoinedGroupsOfAccount' && (
          <TextField
            onChange={handleChangeNumberSecond}
            value={formData?.dataFields?.max_group ?? 100}
            name="max_group"
            label="Số lượng nhóm quét tối đa"
            InputProps={{
              endAdornment: (
                <PositionedMenu
                  name="max_group"
                  getVariable={getVariable}
                  openVariableModal={variableModal.onTrue}
                />
              ),
            }}
          />
        )}

        {formData?.dataFields?.api_type === 'renameAccount' && (
          <>
            <TextField
              onChange={handleChangeNumberSecond}
              value={formData?.dataFields?.last_name ?? ''}
              name="last_name"
              label="Họ"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="last_name"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />
            <TextField
              onChange={handleChangeNumberSecond}
              value={formData?.dataFields?.first_name ?? ''}
              name="first_name"
              label="Tên"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="first_name"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />
          </>
        )}

        {formData?.dataFields?.api_type === 'createPage' && (
          <>
            <TextField
              onChange={handleChangeNumberSecond}
              value={formData?.dataFields?.name ?? ''}
              name="name"
              label="Tên trang"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="name"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />

            <FormControlLabel
              name="is_random_category"
              control={<Checkbox checked={formData?.dataFields?.is_random_category ?? false} />}
              onChange={handleChangeNumberSecond}
              label="Lấy danh mục ngẫu nhiên"
              sx={{
                width: 'fit-content',
              }}
            />

            {!formData?.dataFields?.is_random_category && (
              <Autocomplete
                fullWidth
                multiple
                value={formData?.dataFields?.category_ids ?? []}
                onChange={(_, newValue) => {
                  eventBus.emit('updateNode', {
                    data: { category_ids: newValue },
                    idNode: IdNode,
                  });
                }}
                options={FB_PAGE_CATEGORIES}
                disableCloseOnSelect
                isOptionEqualToValue={(option, value) => option.category_id === value.category_id}
                getOptionLabel={(option) => option.category_name}
                renderInput={(params) => <TextField {...params} label="Danh mục trang" />}
                // renderOption={(props, option, { selected }) => (
                //   <li {...props} key={option.category_id}>
                //     <Checkbox
                //       key={option.category_id}
                //       size="small"
                //       disableRipple
                //       checked={selected}
                //     />
                //     {option.category_name}
                //   </li>
                // )}
                renderOption={(props, option) => (
                  <MenuItem {...props} key={option?.category_id}>
                    {option?.category_name}
                  </MenuItem>
                )}
                renderTags={(selected, getTagProps) =>
                  selected.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.category_id}
                      label={option.category_name}
                      size="small"
                    />
                  ))
                }
              />
            )}

            <TextField
              multiline
              rows={4}
              onChange={handleChangeNumberSecond}
              value={formData?.dataFields?.description ?? ''}
              name="description"
              label="Mô tả trang"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="description"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />
          </>
        )}

        {formData?.dataFields?.api_type === 'fetchNewPostsByKeyWord' && (
          <>
            <TextField
              onChange={handleChangeNumberSecond}
              value={formData?.dataFields?.keyword ?? ''}
              name="keyword"
              label="Từ khóa"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="keyword"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />

            <TextField
              onChange={handleChangeNumberSecond}
              value={formData?.dataFields?.max_post ?? 30}
              name="max_post"
              label="Số lượng bài viết quét tối đa"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="max_post"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />
          </>
        )}

        {formData?.dataFields?.api_type === 'fetchFriendsOfAccount' && (
          <TextField
            onChange={handleChangeNumberSecond}
            value={formData?.dataFields?.max_friend ?? 200}
            name="max_friend"
            label="Số lượng bạn bè quét tối đa"
            InputProps={{
              endAdornment: (
                <PositionedMenu
                  name="max_friend"
                  getVariable={getVariable}
                  openVariableModal={variableModal.onTrue}
                />
              ),
            }}
          />
        )}

        {formData?.dataFields?.api_type === 'inviteFriendsJoinGroup' && (
          <>
            <TextField
              onChange={handleChangeNumberSecond}
              value={formData?.dataFields?.group_id ?? ''}
              name="group_id"
              label="ID Nhóm"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="group_id"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />
            <Autocomplete
              name="friend_ids"
              id="combo-box-demo"
              onChange={(_, newValue) => {
                eventBus.emit('updateNode', {
                  data: { friend_ids: newValue?.key },
                  idNode: IdNode,
                });
              }}
              value={formData?.dataFields?.friend_ids ?? null}
              getOptionLabel={(option) => option.key || option || ''}
              options={fetchVariables || []}
              isOptionEqualToValue={(option, value) => option.key === value}
              renderInput={(params) => (
                <TextField label="Biến chứa danh sách UID bạn bè" {...params} />
              )}
              renderOption={(props, option) => (
                <Fragment key={option.id}>
                  <Tooltip
                    title={option?.type === 'list' ? '' : 'Chỉ có thể chọn biến có kiểu danh sách'}
                    arrow
                    // placement="bottom-start"
                    slotProps={{
                      popper: {
                        modifiers: [
                          {
                            name: 'offset',
                            options: {
                              offset: [0, -14],
                            },
                          },
                        ],
                      },
                    }}
                  >
                    <span>
                      <Stack
                        component="li"
                        {...props}
                        direction="row"
                        justifyContent="flex-start"
                        disabled={option?.type !== 'list'}
                        sx={{
                          ...(option?.type !== 'list' && {
                            color: 'text.disabled',
                            pointerEvents: 'none',
                          }),
                        }}
                      >
                        {option.key}
                      </Stack>
                    </span>
                  </Tooltip>
                  <Stack className="add-new-element-variable" p={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      width="100px"
                      onClick={() => {
                        setIsUpdateSelectVariable(true);
                        dataVariableModal.onTrue();
                      }}
                      startIcon={<Iconify icon="ion:create-outline" width={16} />}
                    >
                      Tạo biến mới
                    </Button>
                  </Stack>
                </Fragment>
              )}
              noOptionsText={
                <Stack spacing={1}>
                  <Typography variant="body2">No options</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    width="100px"
                    onClick={() => {
                      setIsUpdateSelectVariable(true);
                      dataVariableModal.onTrue();
                    }}
                    startIcon={<Iconify icon="ion:create-outline" />}
                  >
                    Tạo biến mới
                  </Button>
                </Stack>
              }
            />
            <TextField
              onChange={handleChangeNumberSecond}
              value={formData?.dataFields?.num_friend_per_invite ?? 10}
              name="num_friend_per_invite"
              label="Số lượng bạn bè mỗi lần mời"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="num_friend_per_invite"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />
          </>
        )}

        {[
          'fetchReelPosts',
          'fetchNewGroupMember',
          'fetchPagesByKeyword',
          'fetchGroupsByKeyword',
          'fetchPostsInGroup',
          'fetchPostInteractions',
          'fetchPostOnPage',
          'autoAcceptFriendRequest',
          'fetchFollowingOfAccount',
          'addFriendByUid',
          'fetchJoinedGroupsOfAccount',
          'fetchNewPostsByKeyWord',
          'fetchFriendsOfAccount',
          'inviteFriendsJoinGroup',
        ].includes(formData?.dataFields?.api_type) && (
          <Stack spacing={2}>
            <Typography color="text.secondary">{`Khoảng cách nhẫu nhiên giữa các lần ${
              formData?.dataFields?.api_type === 'addFriendByUid'
                ? 'kết bạn'
                : formData?.dataFields?.api_type === 'autoAcceptFriendRequest'
                  ? 'chấp nhận'
                  : formData?.dataFields?.api_type === 'inviteFriendsJoinGroup'
                    ? 'mời'
                    : 'quét'
            }`}</Typography>
            <Stack direction="row" spacing={3}>
              <TextField
                fullWidth
                onChange={handleChangeNumberSecond}
                value={formData?.dataFields?.min_time_delay ?? 3}
                name="min_time_delay"
                label="Số giây tối thiểu"
                InputProps={{
                  endAdornment: (
                    <PositionedMenu
                      name="min_time_delay"
                      getVariable={getVariable}
                      openVariableModal={variableModal.onTrue}
                    />
                  ),
                }}
              />
              <TextField
                fullWidth
                onChange={handleChangeNumberSecond}
                value={formData?.dataFields?.max_time_delay ?? 8}
                name="max_time_delay"
                label="Số giây tối đa"
                InputProps={{
                  endAdornment: (
                    <PositionedMenu
                      name="max_time_delay"
                      getVariable={getVariable}
                      openVariableModal={variableModal.onTrue}
                    />
                  ),
                }}
              />
            </Stack>
          </Stack>
        )}

        {[
          'getCurrentUserData',
          'fetchReelPosts',
          'fetchNewGroupMember',
          'fetchPagesByKeyword',
          'fetchGroupsByKeyword',
          'fetchPostsInGroup',
          'fetchPostInteractions',
          'fetchPostOnPage',
          'fetchPagesOnAccount',
          'fetchFollowingOfAccount',
          'fetchJoinedGroupsOfAccount',
          'fetchNewPostsByKeyWord',
          'fetchFriendsOfAccount',
        ].includes(formData?.dataFields?.api_type) && (
          <Autocomplete
            name="variable_name"
            id="combo-box-demo"
            onChange={(_, newValue) => {
              eventBus.emit('updateNode', {
                data: { variable_name: newValue?.key },
                idNode: IdNode,
              });
            }}
            value={formData?.dataFields?.variable_name ?? null}
            getOptionLabel={(option) => option.key || option || ''}
            options={fetchVariables || []}
            isOptionEqualToValue={(option, value) => option.key === value}
            renderInput={(params) => <TextField label="Biến nhận dữ liệu" {...params} />}
            renderOption={(props, option) => (
              <Fragment key={option.id}>
                <Stack component="li" {...props} direction="row" justifyContent="flex-start">
                  {option.key}
                </Stack>
                <Stack className="add-new-element-variable" p={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    width="100px"
                    onClick={() => {
                      setIsUpdateSelectVariable(false);
                      dataVariableModal.onTrue();
                    }}
                    startIcon={<Iconify icon="ion:create-outline" width={16} />}
                  >
                    Tạo biến mới
                  </Button>
                </Stack>
              </Fragment>
            )}
            noOptionsText={
              <Stack spacing={1}>
                <Typography variant="body2">No options</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  width="100px"
                  onClick={() => {
                    setIsUpdateSelectVariable(false);
                    dataVariableModal.onTrue();
                  }}
                  startIcon={<Iconify icon="ion:create-outline" />}
                >
                  Tạo biến mới
                </Button>
              </Stack>
            }
          />
        )}
      </Stack>
      <Variables addOne open={variableModal.value} onClose={variableModal.onFalse} />

      <Variables
        addOne
        open={dataVariableModal.value}
        onClose={dataVariableModal.onFalse}
        defaultType={isUpdateSelectVariable ? 'list' : 'text'}
        updateVariableAction={(key) => {
          eventBus.emit('updateNode', {
            data: { [isUpdateSelectVariable ? 'friend_ids' : 'variable_name']: key },
            idNode: IdNode,
          });
        }}
      />
    </Stack>
  );
}

FacebookApiForm.propTypes = {
  formData: PropTypes.object,
  IdNode: PropTypes.string,
};
