import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { yupResolver } from '@hookform/resolvers/yup';

// mui
import {
  Avatar,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Grow,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';

// component
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { LoadingButton } from '@mui/lab';
import { useEffect, useState } from 'react';
import { useLocales } from 'src/locales';

const NewCategoryFormDialog = ({ open, onClose }) => {
  const { t } = useLocales();
  const [anchorEl, setAnchorEl] = useState(null);
  const openOption = Boolean(anchorEl);
  const [width, setWidth] = useState(320);
  const CategorySchema = Yup.object().shape({
    name: Yup.string().required(),
    remark: Yup.string(),
  });

  const defaultValues = {
    name: '',
    remark: '',
  };

  const methods = useForm({
    resolver: yupResolver(CategorySchema),
    defaultValues,
  });

  const { handleSubmit } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      console.log(data);
    } catch (error) {
      /* empty */
    }
  });

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (anchorEl) {
      setWidth(anchorEl.offsetWidth - 8);
    }
  }, [anchorEl]);
  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiPaper-root.MuiPaper-elevation': {
          boxShadow: (theme) => theme.customShadows.z4,
        },
      }}
    >
      <DialogTitle sx={{ pb: 5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4">{t('dialog.extension.category.newCategory')}</Typography>
          <IconButton onClick={onClose}>
            <Iconify icon="ic:round-close" />
          </IconButton>
        </Stack>
        <Divider
          sx={{
            mt: 1,
          }}
        />
      </DialogTitle>
      <DialogContent sx={{ typography: 'body2' }}>
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Stack spacing={3}>
            <CategoryTab title={t('dialog.extension.category.header.name')}>
              <RHFTextField
                size="small"
                name="name"
                placeholder={t('dialog.extension.category.addCategory.placeholder.name')}
              />
            </CategoryTab>
            <CategoryTab title={t('dialog.extension.category.header.remark')}>
              <RHFTextField
                multiline
                rows={3}
                name="remark"
                placeholder={t('dialog.extension.category.addCategory.placeholder.note')}
              />
            </CategoryTab>
            <CategoryTab title={t('dialog.extension.category.header.extension')}>
              <ListItemText
                primary={
                  <Button
                    fullWidth
                    ref={anchorEl}
                    size="large"
                    variant="outlined"
                    color="primary"
                    onClick={handleClick}
                  >
                    <Iconify
                      width={24}
                      color="primary"
                      icon="gala:add"
                      sx={{
                        marginRight: 1,
                      }}
                    />
                    Select extension
                  </Button>
                }
                secondary={t('dialog.extension.category.addCategory.placeholder.extension')}
                primaryTypographyProps={{ typography: 'body2' }}
                secondaryTypographyProps={{
                  component: 'span',
                  color: 'text.disabled',
                  ml: 1,
                }}
              />
            </CategoryTab>
            <Menu
              id="category-menu"
              MenuListProps={{
                'aria-labelledby': 'fade-button',
              }}
              anchorEl={anchorEl}
              open={openOption}
              onClose={handleClose}
              TransitionComponent={Grow}
            >
              <Stack
                sx={{
                  width,
                }}
              >
                {[1].map((item, index) => (
                  <MenuItem
                    key={index}
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                    onClick={() => {
                      handleClose();
                    }}
                  >
                    <Stack spacing={1} direction="row" alignItems="center">
                      <Avatar
                        variant="rounded"
                        src="https://images.unsplash.com/photo-1702065555316-08fa5cacdd0e?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                      />
                      <Typography>Google Extensions</Typography>
                    </Stack>
                    <Iconify icon="solar:check-circle-linear" color="primary.main" width={16} />
                  </MenuItem>
                ))}
              </Stack>
            </Menu>
            <Stack direction="row" spacing={2} ml="auto" mb={3}>
              <Button variant="contained" color="inherit" onClick={onClose}>
                {t('dialog.extension.actions.cancel')}
              </Button>

              <LoadingButton color="primary" variant="contained">
                {t('dialog.extension.actions.ok')}
              </LoadingButton>
            </Stack>
          </Stack>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default NewCategoryFormDialog;

NewCategoryFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

//----------------------------------------------------------------

function CategoryTab({ title, children }) {
  return (
    <Grid container spacing={3}>
      <Grid
        item
        xs={2}
        textAlign="right"
        style={{
          paddingTop: '30px',
        }}
      >
        {title}
      </Grid>
      <Grid item xs={10}>
        {children}
      </Grid>
    </Grid>
  );
}

CategoryTab.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
};
