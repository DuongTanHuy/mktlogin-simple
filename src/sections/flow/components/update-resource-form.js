import PropTypes from 'prop-types';

// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import eventBus from 'src/sections/script/event-bus';
import { Button, Checkbox, FormControlLabel, MenuItem } from '@mui/material';
import Iconify from 'src/components/iconify';
import { RESOURCE_OPTIONS } from 'src/utils/constance';
import cloneDeep from 'lodash/cloneDeep';
import PositionedMenu from 'src/components/list-click';
import { useEffect, useState } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import Variables from 'src/components/variable';

// ----------------------------------------------------------------------

const styleOptions = {
  border: '1px solid #eeeeee24',
  padding: '8px',
  borderRadius: '4px',
  gap: 0,
};

const OPTIONS = [
  { label: 'UID', value: 'uid', isDisabled: false },
  { label: 'User name', value: 'username', isDisabled: false },
  { label: 'Password', value: 'password', isDisabled: false },
  { label: 'Two fa', value: 'two_fa', isDisabled: false },
  { label: 'Email', value: 'email', isDisabled: false },
  { label: 'Email password', value: 'pass_email', isDisabled: false },
  { label: 'Token', value: 'token', isDisabled: false },
  { label: 'Cookie', value: 'cookie', isDisabled: false },
  { label: 'Email recovery', value: 'mail_recovery', isDisabled: false },
  { label: 'Phone', value: 'phone', isDisabled: false },
  { label: 'Status', value: 'status', isDisabled: false },
  { label: 'Activity log', value: 'activity_log', isDisabled: false },
];

// ----------------------------------------------------------------------

export default function UpdateResourceForm({ formData, IdNode }) {
  const [options, setOptions] = useState(OPTIONS);
  const variableModal = useBoolean();
  const [itemClicking, setItemClicking] = useState(null);

  const pushEventChange = (data) => {
    eventBus.emit('updateNode', { data: { data }, idNode: IdNode });
  };

  const handleChangeNumberSecond = (event) => {
    const { name, value, type, checked } = event.target;
    eventBus.emit('updateNode', {
      data: { [name]: type === 'checkbox' ? checked : value },
      idNode: IdNode,
    });
  };

  const addNewResourceData = () => {
    const _clone = cloneDeep(formData?.dataFields?.data);
    _clone.push({ id: _clone.length + Math.random(), key: '', value: '' });

    pushEventChange(_clone);
  };

  const updateResourceData = (name, event, id) => {
    const _clone = cloneDeep(formData?.dataFields?.data);
    const _find = _clone?.findIndex((i) => i.id === id);
    _clone[_find][name] = event.target.value;

    pushEventChange(_clone);
  };

  const deleteCustomerHeader = (id) => {
    const _find = formData?.dataFields?.data?.findIndex((i) => i.id === id);
    const _clone = cloneDeep(formData?.dataFields?.data);
    _clone.splice(_find, 1);

    pushEventChange(_clone);
  };

  const getCustomerVariable = (name, value, id) => {
    if (value) {
      const _clone = cloneDeep(formData?.dataFields?.data);
      const _find = _clone?.findIndex((i) => i.id === id);
      _clone[_find][name] = value;
      pushEventChange(_clone);
    }
  };

  useEffect(() => {
    if (formData?.dataFields?.data?.length !== 0) {
      setOptions(
        OPTIONS.map((item) => {
          const _find = formData?.dataFields?.data?.findIndex((i) => i.key === item.value);
          return {
            ...item,
            isDisabled: _find !== -1,
          };
        })
      );
    }
  }, [formData?.dataFields?.data]);

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
      <Stack spacing={2} mt={2}>
        <TextField
          name="platform_type"
          fullWidth
          select
          value={formData?.dataFields?.platform_type || ''}
          label="Loại tài nguyên"
          onChange={handleChangeNumberSecond}
        >
          {RESOURCE_OPTIONS.map((item, index) => (
            <MenuItem key={item.id} value={item.value}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Iconify
                  icon={item.icon}
                  sx={{
                    flexShrink: 0,
                  }}
                />
                <Typography>{item.label}</Typography>
              </Stack>
            </MenuItem>
          ))}
        </TextField>

        <Stack sx={styleOptions} spacing={1} mt={1}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2">Dữ liệu tài nguyên</Typography>
            <Button
              size="small"
              variant="contained"
              startIcon={<Iconify icon="solar:add-circle-linear" width={20} />}
              onClick={() => addNewResourceData()}
              disabled={options?.length === 0 || formData?.dataFields?.data?.length >= 12}
            >
              Thêm
            </Button>
          </Stack>
          <Stack spacing={1.5} pt={formData?.dataFields?.data?.length > 0 ? 2 : 0}>
            {formData?.dataFields?.data?.map((item) => (
              <Stack spacing={0.5} key={item.id} justifyContent="flex-start" alignItems="center">
                <Stack
                  direction="row"
                  justifyContent="flex-start"
                  alignItems="center"
                  spacing={2}
                  width={1}
                >
                  <TextField
                    select
                    fullWidth
                    name="key"
                    label="Key"
                    size="small"
                    value={item.key}
                    onChange={(e) => updateResourceData('key', e, item.id)}
                    SelectProps={{
                      MenuProps: {
                        PaperProps: {
                          sx: {
                            maxHeight: 200,
                          },
                        },
                      },
                    }}
                  >
                    {options?.map((option) => (
                      <MenuItem
                        key={option.value}
                        value={option.value}
                        sx={{
                          display: option.isDisabled ? 'none' : 'block',
                        }}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    fullWidth
                    value={item.value}
                    error={false}
                    label="Value"
                    onChange={(e) => updateResourceData('value', e, item.id)}
                    size="small"
                    InputProps={{
                      endAdornment: (
                        <PositionedMenu
                          getVariable={(value) => getCustomerVariable('value', value, item.id)}
                          openVariableModal={() => {
                            variableModal.onTrue();
                            setItemClicking(item.id);
                          }}
                        />
                      ),
                    }}
                  />
                  <Iconify
                    onClick={() => deleteCustomerHeader(item.id)}
                    icon="carbon:close-outline"
                    sx={{
                      width: '35px',
                      color: 'text.disabled',
                      '&:hover': { cursor: 'pointer', color: 'white' },
                    }}
                  />
                </Stack>
                {item.key === 'status' && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    width={1}
                    fontStyle="italic"
                    pl={1}
                  >
                    Chỉ chấp nhận các trạng thái sau: live, die, checkpoint, not_logged_in,
                    wrong_password
                  </Typography>
                )}
              </Stack>
            ))}
          </Stack>
        </Stack>

        <FormControlLabel
          name="is_create_when_not_exists"
          control={<Checkbox checked={formData?.dataFields?.is_create_when_not_exists ?? false} />}
          onChange={handleChangeNumberSecond}
          label="Tạo tài nguyên nếu chưa tồn tại"
          sx={{
            width: 'fit-content',
          }}
        />
      </Stack>
      <Variables
        addOne
        open={variableModal.value}
        onClose={variableModal.onFalse}
        updateVariableAction={(key) => {
          const _clone = cloneDeep(formData?.dataFields?.data);
          const _find = _clone?.findIndex((i) => i.id === itemClicking);
          _clone[_find].value = `$\{${key}}`;

          pushEventChange(_clone);
        }}
      />
    </Stack>
  );
}

UpdateResourceForm.propTypes = {
  formData: PropTypes.object,
  IdNode: PropTypes.string,
};
