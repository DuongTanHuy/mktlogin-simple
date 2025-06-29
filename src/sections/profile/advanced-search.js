import PropTypes from 'prop-types';
import { cloneDeep } from 'lodash';

import {
  Autocomplete,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Popover,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocales } from 'src/locales';
import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import { useAuthContext } from 'src/auth/hooks';
import { getListGroupProfileApi } from 'src/api/profile-group.api';
import Iconify from 'src/components/iconify';
import { getListTagApi } from 'src/api/tags.api';

//----------------------------------------------------------------

const COLUMN_OPTIONS = [
  { label: 'Profile ID', value: 'profile_id' },
  { label: 'Group', value: 'profile_group_id' },
  { label: 'Tags', value: 'tag_id' },
];

const COND_OPTIONS = {
  profile_id: [{ label: 'isAny', value: '_in' }],
  profile_group_id: [{ label: 'isAny', value: '_in' }],
  tag_id: [
    { label: 'anyOf', value: '_in' },
    { label: 'allOf', value: '_in_all' },
  ],
};

//----------------------------------------------------------------

export default function AdvancedSearch({
  anchorEl,
  handleClose,
  advancedSearch,
  setAdvancedSearch,
  resetPage,
  path = paths.dashboard.profile,
  onClear,
}) {
  const getId = () => `${Date.now()}${Math.floor(Math.random() * 10000)}`;
  const { workspace_id } = useAuthContext();
  const { t } = useLocales();
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  const [value, setValue] = useState([]);
  const [errors, setErrors] = useState([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [listGroup, setListGroup] = useState([]);
  const [listTags, setListTags] = useState([]);

  const handleChangeAdvanceSearch = (idSearch, event) => {
    const { name, value: eValue } = event.target;

    const _clone = cloneDeep(value);
    const _find = _clone.findIndex((i) => i.id === idSearch);

    if (_find !== -1) {
      _clone[_find] = {
        ..._clone[_find],
        [name]: eValue,
      };
      if (name === 'type') {
        _clone[_find].condition = '_in';
        if (eValue === 'profile_id') {
          _clone[_find].value = '';
        } else {
          _clone[_find].value = [];
        }
      }
      setValue(_clone);
    }
  };

  const handleAddAdvanceSearch = () => {
    setValue((prev) => [
      ...prev,
      {
        id: getId(),
        type: 'profile_id',
        condition: '_in',
        value: '',
      },
    ]);
  };

  const handleSearch = () => {
    const newErrors = value.map((i) => ({
      id: i?.id,
      type: i?.type,
      condition: !i?.condition,
      value: i.type === 'profile_id' ? !i?.value : i?.value.length === 0,
    }));
    setErrors(newErrors);

    const continueSubmit = newErrors.every(
      (obj) => obj.type !== '' && Object.values(obj).every((i) => i !== true)
    );

    if (!continueSubmit) return;

    resetPage();
    setAdvancedSearch(value);
    searchParams.delete('page');
    router.push(`${path}?${searchParams}`);
    setErrors([]);
    handleClear();
  };

  const handleClear = () => {
    setErrors([]);
    handleClose();
  };

  useEffect(() => {
    if (advancedSearch.length === 0) {
      setValue([
        {
          id: getId(),
          type: 'profile_id',
          condition: '_in',
          value: '',
        },
      ]);
    } else {
      setValue(advancedSearch);
    }
  }, [advancedSearch]);

  useEffect(() => {
    const fetchProfileGroup = async () => {
      try {
        if (workspace_id) {
          const [responseGroup, responseTag] = await Promise.all([
            getListGroupProfileApi(workspace_id),
            getListTagApi(workspace_id),
          ]);

          setListGroup(responseGroup.data.data);
          setListTags(responseTag.data);
        }
      } catch (error) {
        /* empty */
      }
    };

    if (open) {
      fetchProfileGroup();
    }
  }, [open, workspace_id]);

  useEffect(() => {
    const fetchProfileGroup = async () => {
      try {
        if (workspace_id) {
          const response = await getListGroupProfileApi(workspace_id);
          if (response.data) {
            setListGroup(response.data.data);
          }
        }
      } catch (error) {
        /* empty */
      }
    };

    if (open) {
      fetchProfileGroup();
    }
  }, [open, workspace_id]);

  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={handleClear}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
    >
      <Stack p={2} spacing={2}>
        <Stack spacing={1}>
          {value.map((item, index) => (
            <Stack direction="row" spacing={1.5} key={index} alignItems="center">
              <TextField
                name="type"
                select
                fullWidth
                size="small"
                value={item?.type ?? ''}
                sx={{
                  width: 110,
                }}
                onChange={(event) => {
                  handleChangeAdvanceSearch(item.id, event);
                }}
              >
                {COLUMN_OPTIONS.map((i) => (
                  <MenuItem key={i.value} value={i.value}>
                    {i.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                name="condition"
                select
                fullWidth
                size="small"
                value={item?.condition ?? ''}
                error={errors.find((i) => i.id === item.id)?.condition}
                onChange={(event) => {
                  handleChangeAdvanceSearch(item.id, event);
                }}
                sx={{
                  width: 'fit-content',
                }}
              >
                {(COND_OPTIONS?.[item?.type] ?? []).map((i) => (
                  <MenuItem key={i.value} value={i.value}>
                    {t(`form.placeholder.${i.label}`)}
                  </MenuItem>
                ))}
              </TextField>
              {item?.type === 'profile_id' && (
                <TextField
                  name="value"
                  size="small"
                  multiline
                  rows={1}
                  value={item?.value ?? ''}
                  error={errors.find((i) => i.id === item?.id)?.value}
                  onChange={(event) => {
                    if (errors.find((i) => i.id === item?.id)?.value) {
                      const newErrors = errors.map((i) => {
                        if (i.id === item?.id) {
                          return {
                            ...i,
                            value: false,
                          };
                        }
                        return i;
                      });
                      setErrors(newErrors);
                    }
                    handleChangeAdvanceSearch(item.id, event);
                  }}
                  onPaste={(event) => {
                    event.preventDefault();
                    const paste = (event.clipboardData || window.Clipboard).getData('text');

                    const finalValue = paste
                      .split('\n')
                      .filter((line) => line.trim() !== '')
                      .map((line) => line.trim());

                    const _clone = cloneDeep(value);
                    const _find = _clone.findIndex((i) => i.id === item.id);
                    if (_find === -1) {
                      _clone.push({
                        type: item?.type,
                        value: finalValue.join(' '),
                      });
                    } else {
                      _clone[_find] = {
                        ..._clone[_find],
                        value: (_clone[_find].value || '') + finalValue.join(' '),
                      };
                    }
                    setValue(_clone);
                  }}
                  placeholder={t('form.placeholder.advanceSearch')}
                  sx={{
                    width: 300,
                  }}
                />
              )}

              {item?.type === 'profile_group_id' && (
                <Autocomplete
                  multiple
                  size="small"
                  name="value"
                  disableCloseOnSelect
                  options={listGroup.map((group) => ({
                    id: group.id,
                    name: group.name,
                  }))}
                  isOptionEqualToValue={(option, oValue) => option.id === oValue.id}
                  getOptionLabel={(option) => option.name}
                  renderOption={(props, group) => (
                    <li {...props} key={group.id} value={group.id}>
                      {group.name}
                    </li>
                  )}
                  value={item?.value || []}
                  onChange={(_, newValue) => {
                    if (errors.find((i) => i.id === item.id)?.value) {
                      const newErrors = errors.map((i) => {
                        if (i.id === item?.id) {
                          return {
                            ...i,
                            value: false,
                          };
                        }
                        return i;
                      });
                      setErrors(newErrors);
                    }
                    handleChangeAdvanceSearch(item.id, {
                      target: {
                        name: 'value',
                        value: newValue,
                      },
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      placeholder={t('quickAction.selectGroup')}
                      {...params}
                      error={errors.find((i) => i.id === item.id)?.value}
                    />
                  )}
                  renderTags={(selected, getTagProps) =>
                    selected.map((option, ind) => (
                      <Chip
                        {...getTagProps({ ind })}
                        key={option.id}
                        label={option.name}
                        size="small"
                        color="primary"
                        variant="soft"
                      />
                    ))
                  }
                  sx={{
                    width: 300,
                  }}
                />
              )}

              {item?.type === 'tag_id' && (
                <Autocomplete
                  multiple
                  size="small"
                  name="value"
                  disableCloseOnSelect
                  options={listTags.map((tag) => ({
                    id: tag.id,
                    name: tag.name,
                  }))}
                  isOptionEqualToValue={(option, oValue) => option.id === oValue.id}
                  getOptionLabel={(option) => option.name}
                  renderOption={(props, tag) => (
                    <li {...props} key={tag.id} value={tag.id}>
                      {tag.name}
                    </li>
                  )}
                  value={item?.value || []}
                  onChange={(_, newValue) => {
                    if (errors.find((i) => i.id === item.id)?.value) {
                      const newErrors = errors.map((i) => {
                        if (i.id === item?.id) {
                          return {
                            ...i,
                            value: false,
                          };
                        }
                        return i;
                      });
                      setErrors(newErrors);
                    }
                    handleChangeAdvanceSearch(item.id, {
                      target: {
                        name: 'value',
                        value: newValue,
                      },
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      placeholder={t('dialog.setTag.label')}
                      {...params}
                      error={errors.find((i) => i.id === item.id)?.value}
                    />
                  )}
                  renderTags={(selected, getTagProps) =>
                    selected.map((option, ind) => (
                      <Chip
                        {...getTagProps({ ind })}
                        key={option.id}
                        label={option.name}
                        size="small"
                        color="primary"
                        variant="soft"
                      />
                    ))
                  }
                  sx={{
                    width: 300,
                  }}
                />
              )}

              {value.length > 1 && (
                <IconButton
                  sx={{
                    p: 0.2,
                    borderRadius: 1,
                    width: 33,
                    height: 33,
                  }}
                  onClick={() => {
                    const _clone = cloneDeep(value);
                    const _find = _clone.findIndex((i) => i.id === item.id);
                    if (_find !== -1) {
                      _clone.splice(_find, 1);
                      setValue(_clone);
                    }
                  }}
                >
                  <Iconify icon="ic:round-clear" />
                </IconButton>
              )}
            </Stack>
          ))}
          <Button
            startIcon={<Iconify icon="material-symbols:add-rounded" />}
            variant="text"
            size="small"
            onClick={handleAddAdvanceSearch}
            sx={{
              width: 'fit-content',
              color: 'text.secondary',
              '& .MuiButton-startIcon': {
                mr: 0,
              },
              display: 'none',
            }}
          >
            Add filter
          </Button>
          {errors.some((i) => i.value) && (
            <Typography
              color="error"
              variant="caption"
              sx={{
                fontStyle: 'italic',
              }}
            >
              {t('quickAction.advancedSearch')}
            </Typography>
          )}
        </Stack>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" color="primary" size="small" onClick={handleSearch}>
            {t('actions.search')}
          </Button>
          {typeof onClear === 'function' && (
            <Button variant="outlined" color="error" size="small" onClick={onClear}>
              {t('actions.clear')}
            </Button>
          )}
          <Button onClick={handleClear} size="small" variant="outlined">
            {t('actions.close')}
          </Button>
        </Stack>
      </Stack>
    </Popover>
  );
}

AdvancedSearch.propTypes = {
  anchorEl: PropTypes.any,
  handleClose: PropTypes.func,
  advancedSearch: PropTypes.array,
  setAdvancedSearch: PropTypes.func,
  resetPage: PropTypes.func,
  onClear: PropTypes.func,
  path: PropTypes.string,
};
