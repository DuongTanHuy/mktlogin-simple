// @mui

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
// icons
import Iconify from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';

// router
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

// components
import { useSettingsContext } from 'src/components/settings';
import { format } from 'date-fns';
import { useBoolean } from 'src/hooks/use-boolean';
import cloneDeep from 'lodash/cloneDeep';
import { deleteWorkflow } from 'src/api/workflow.api';
import { enqueueSnackbar } from 'notistack';
import { getStorage } from 'src/hooks/use-local-storage';
import { WORKSPACE_ID } from 'src/utils/constance';
import ImportWorkflowDialog from 'src/components/custom-dialog/import-workflow-dialog';
import ShareWorkflowDialog from 'src/components/custom-dialog/share-workflow-dialog';
import { useLocales } from 'src/locales';
import { TablePaginationCustom } from 'src/components/table';
import Scrollbar from 'src/components/scrollbar';
import { LoadingButton } from '@mui/lab';
import EditFormWorkFlow from './edittingForm';

// ----------------------------------------------------------------------

const AutomationView = React.memo(
  ({
    groupSelected,
    listWorkFlow,
    groups,
    getListAfterImport,
    setListWorkFlow,
    handleFilterChange,
    totalRecord,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
  }) => {
    const { t } = useLocales();
    const settings = useSettingsContext();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const workspaceId = getStorage(WORKSPACE_ID);
    const [items, setItems] = useState([]);

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const importForm = useBoolean();

    const editForm = useBoolean();
    const deleteForm = useBoolean();
    const [deleteItem, setDeleteItem] = useState(null);
    const [formEdit, setFormEdit] = useState(null);

    const shareForm = useBoolean();
    const [shareItem, setShareItem] = useState(null);

    const goToCreateOrEdit = (id) => {
      if (!id) {
        return router.push(paths.dashboard.automation_createOrEdit());
      }
      return router.push(paths.dashboard.automation_createOrEdit(id));
    };

    useEffect(() => {
      if (!groupSelected) {
        setItems(listWorkFlow.map((i) => ({ ...i, display: true })));
      }

      if (groupSelected) {
        setItems(
          listWorkFlow.map((i) => ({ ...i, display: String(i.workflow_group) === groupSelected }))
        );
      }
    }, [groupSelected, listWorkFlow]);

    const showCategory = (id) => {
      const fil = groups.filter((i) => String(i.id) === String(id));
      if (!fil) return '';
      return fil[0]?.name;
    };

    const handleClick = (event) => {
      event.stopPropagation();
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };

    const openEditForm = () => {
      const findItem = items.filter(
        (i) => String(i.id) === String(anchorEl.getAttribute('value-index'))
      );
      editForm.onTrue();
      setFormEdit(findItem[0]);
    };

    const updateWorkflowList = (item) => {
      const findIndex = listWorkFlow.findIndex((i) => i.id === item.id);
      const cloneWF = cloneDeep(listWorkFlow);
      cloneWF[findIndex] = item;
      setListWorkFlow(cloneWF);
    };

    const openShareWF = () => {
      const findItem = items.filter(
        (i) => String(i.id) === String(anchorEl.getAttribute('value-index'))
      );
      setShareItem(findItem[0]);
      shareForm.onTrue();
      handleClose();
    };

    const openConfirmDeleteWF = () => {
      const findItem = items.filter(
        (i) => String(i.id) === String(anchorEl.getAttribute('value-index'))
      );
      setDeleteItem(findItem[0]);
      deleteForm.onTrue();
      handleClose();
    };

    const handleDelete = async () => {
      if (deleteItem) {
        try {
          setLoading(true);
          await deleteWorkflow(workspaceId, deleteItem.id);
          deleteForm.onFalse();
          const findIndex = listWorkFlow.findIndex((i) => i.id === deleteItem.id);
          const cloneWF = cloneDeep(listWorkFlow);
          cloneWF.splice(findIndex, 1);
          setListWorkFlow(cloneWF);

          enqueueSnackbar(t('systemNotify.success.delete'), { variant: 'success' });
        } catch (error) {
          enqueueSnackbar(t('systemNotify.error.delete'), { variant: 'error' });
        } finally {
          setLoading(false);
        }
      }
    };

    return (
      <Container
        maxWidth={settings.themeStretch ? false : 'xl'}
        style={{ height: '100%', pr: '0px!important' }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <TextField
            placeholder={`${t('workflow.script.actions.search')}...`}
            size="small"
            width={300}
            onChange={handleFilterChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
          <Stack direction="row" spacing={2}>
            <Button
              size="small"
              variant="contained"
              startIcon={<Iconify icon="bx:import" width={20} />}
              onClick={importForm.onTrue}
            >
              {t('workflow.script.actions.import')}
            </Button>
            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="solar:add-circle-linear" width={20} />}
              onClick={() => goToCreateOrEdit()}
            >
              {t('workflow.script.actions.addWorkflow')}
            </Button>
          </Stack>
        </Stack>

        <Box
          sx={{
            mt: 2,
            width: 1,
            borderRadius: 2,
            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
            border: (theme) => `dashed 1px ${theme.palette.divider}`,
            height: 'calc(100% - 118px)',
          }}
        >
          <Scrollbar
            sx={{
              p: 2,
            }}
          >
            <Grid container spacing={2}>
              {items.map(
                (item) =>
                  item.display && (
                    <Grid key={item.id} item xs={6} sm={6} md={4} lg={4} xl={3}>
                      <Card
                        variant="outlined"
                        onClick={() => goToCreateOrEdit(item.id)}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            transform: 'scale(1.03)',
                          },
                          transition: (theme) =>
                            theme.transitions.create(['all'], {
                              duration: theme.transitions.duration.shortest,
                            }),
                        }}
                      >
                        <CardHeader
                          action={
                            <IconButton
                              aria-label="settings"
                              id={`basic-button-${item.id}`}
                              aria-controls={open ? `basic-menu-${item.id}` : undefined}
                              aria-haspopup="true"
                              aria-expanded={open ? 'true' : undefined}
                              value-index={item.id}
                              onClick={handleClick}
                            >
                              <Iconify icon="mingcute:more-2-line" width={20} />
                            </IconButton>
                          }
                          title={
                            <Typography
                              onClick={() => goToCreateOrEdit(item.id)}
                              sx={{
                                cursor: 'pointer',
                                display: '-webkit-box',
                                WebkitLineClamp: '1',
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                minHeight: '22px',
                                ':hover': {
                                  textDecoration: 'underline',
                                },
                              }}
                              title={item.name}
                            >
                              {item.name}
                            </Typography>
                          }
                          sx={{
                            '& span': {
                              whiteSpace: 'nowrap',
                            },
                          }}
                          subheader={format(new Date(item.created_at), 'dd/MM/yyyy hh:ss')}
                        />
                        <CardContent>
                          <Typography
                            sx={{
                              fontSize: 14,
                              fontStyle: 'italic',
                              display: '-webkit-box',
                              WebkitLineClamp: '1',
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              minHeight: '22px',
                            }}
                            color="text.secondary"
                            gutterBottom
                          >
                            {showCategory(item.workflow_group)}
                          </Typography>
                          <Typography
                            variant="body2"
                            component="div"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: '1',
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              minHeight: '22px',
                            }}
                          >
                            {item.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  )
              )}
            </Grid>
          </Scrollbar>
        </Box>

        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
            // onMouseLeave: handleClose,
          }}
        >
          <MenuItem
            onClick={() => {
              openEditForm();
              handleClose();
            }}
          >
            <Iconify icon="ic:twotone-edit" width={16} mr={1} />
            {t('workflow.script.actions.editInfo')}
          </MenuItem>
          <MenuItem
            onClick={() => {
              openShareWF();
              handleClose();
            }}
          >
            <Iconify icon="material-symbols:share" width={16} mr={1} />
            {t('workflow.flow.actions.shareWorkflow')}
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => openConfirmDeleteWF()}
            sx={{
              color: 'error.main',
            }}
          >
            <Iconify icon="material-symbols:delete-outline" width={16} mr={1} />
            {t('workflow.script.actions.delete')}
          </MenuItem>
        </Menu>

        <TablePaginationCustom
          count={totalRecord}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setPage(0);
            setRowsPerPage(event.target.value);
          }}
        />

        {editForm.value && (
          <EditFormWorkFlow
            open={editForm.value}
            onClose={editForm.onFalse}
            formEdit={formEdit}
            groups={groups}
            updateWorkflowList={updateWorkflowList}
            mode="flowchart"
          />
        )}

        <ImportWorkflowDialog
          open={importForm.value}
          onClose={importForm.onFalse}
          items={items}
          getListAfterImport={getListAfterImport}
        />

        <ShareWorkflowDialog
          open={shareForm.value}
          onClose={shareForm.onFalse}
          shareItem={shareItem}
        />

        <Dialog onClose={() => deleteForm.onFalse()} open={deleteForm.value}>
          <DialogTitle>{t('workflow.script.dialog.delete.title')}</DialogTitle>
          <DialogActions
            sx={{
              pt: 0,
            }}
          >
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" onClick={() => deleteForm.onFalse()}>
                {t('workflow.script.actions.cancel')}
              </Button>
              <LoadingButton
                loading={loading}
                variant="contained"
                onClick={() => handleDelete()}
                color="error"
              >
                {t('workflow.script.actions.delete')}
              </LoadingButton>
            </Stack>
          </DialogActions>
        </Dialog>
      </Container>
    );
  },
  (prevProps, nextProps) =>
    prevProps.listWorkFlow === nextProps.listWorkFlow &&
    prevProps.groupSelected === nextProps.groupSelected &&
    prevProps.groups === nextProps.groups
);

export default AutomationView;

AutomationView.propTypes = {
  groupSelected: PropTypes.string,
  listWorkFlow: PropTypes.array,
  groups: PropTypes.array,
  setListWorkFlow: PropTypes.func,
  getListAfterImport: PropTypes.func,
  handleFilterChange: PropTypes.func,
  totalRecord: PropTypes.number,
  page: PropTypes.number,
  setPage: PropTypes.func,
  rowsPerPage: PropTypes.number,
  setRowsPerPage: PropTypes.func,
};
