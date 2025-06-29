import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Tabs,
  Tab,
  Box,
  Typography,
  Stack,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Menu,
  MenuItem,
  Button,
  alpha,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import Scrollbar from '../../../components/scrollbar';
import { getLogColor, getLogStatus } from '../../../utils/rpa';

const styleTab = {
  minWidth: 'auto',
  fontSize: '12px',
  fontWeight: 'inherit',
  textTransform: 'none',
  margin: '0',
  borderRadius: '0',
  borderLeft: '1px solid transparent',
  borderRight: '1px solid transparent',
  borderBottom: '1px solid transparent',
  marginRight: '15px',
};

function TabsScriptRunning({
  handleCloseOutput,
  handleFillScreen,
  sizes,
  outputLogs,
  setOutputLogs,
  table,
}) {
  const scrollRef = useRef(null);
  const [value, setValue] = useState(0);

  const [anchorExport, setAnchorExport] = useState(null);
  const openExport = Boolean(anchorExport);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (scrollRef.current) {
      const { scrollHeight, clientHeight } = scrollRef.current;
      const maxScrollTop = scrollHeight - clientHeight;
      scrollRef.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  }, [outputLogs, table]);

  const clearTerminalLog = () => {
    setOutputLogs([]);
  };

  return (
    <>
      <Tabs
        value={value}
        onChange={handleChange}
        textColor="primary"
        indicatorColor="primary"
        sx={[
          {
            borderTop: '1px solid',
            borderColor: (theme) => alpha(theme.palette.grey[500], 0.32),
            height: '25px',
            minHeight: '40px',
            paddingLeft: '15px',
            '.MuiTabs-scrollButtons': {
              display: 'none',
            },
          },
        ]}
      >
        <Tab label="LOGS" style={styleTab} />
        <Tab label="VARIABLES" style={styleTab} />
        <Tab label="TABLE" style={styleTab} />
      </Tabs>
      <Box
        sx={{
          position: 'absolute',
          top: '0',
          right: '0',
        }}
      >
        <Stack direction="row" justifyContent="flex-start" alignItems="center">
          <IconButton
            style={{ borderRadius: 0 }}
            onClick={() => handleFillScreen(sizes[0] !== 0 ? 'full' : 'less')}
          >
            <Iconify width={17} icon={sizes[0] === 0 ? 'formkit:down' : 'formkit:up'} />
          </IconButton>
          <IconButton style={{ borderRadius: 0 }} onClick={handleCloseOutput}>
            <Iconify width={17} icon="iconamoon:close-fill" />
          </IconButton>
          {value === 0 && (
            <Button
              size="small"
              variant="outlined"
              sx={{
                width: '70px',
                position: 'absolute',
                top: '50px',
                right: '10px',
                zIndex: '999',
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: '#838383', '&:hover': { color: '#eee' } }}
                onClick={clearTerminalLog}
              >
                Clear
              </Typography>
            </Button>
          )}
        </Stack>
      </Box>
      <Scrollbar ref={scrollRef}>
        <Box px={2} py={1}>
          {value === 0 && (
            <Stack
              sx={{
                fontSize: '12px',
                fontWeight: '200',
                overflowY: 'auto',
                paddingRight: '60px',
              }}
            >
              {outputLogs.map((item, index) => (
                <Box key={index}>
                  <Typography
                    key={index}
                    variant="body2"
                    sx={{
                      color: getLogColor(item.type),
                      display: 'inline-block',
                      fontSize: '0.875rem',
                    }}
                  >
                    {getLogStatus(item.type)}
                  </Typography>
                  &nbsp; - &nbsp;{`${item.message}`}
                </Box>
              ))}
            </Stack>
          )}
          {value === 1 && (
            <Stack>
              <Typography style={{ fontSize: '12px', fontWeight: 'inherit' }}>Variables</Typography>
            </Stack>
          )}
          {value === 2 && (
            <Stack>
              <Stack direction="row" justifyContent="flex-end">
                <Button
                  aria-label="more"
                  id="long-button"
                  aria-controls={openExport ? 'long-menu' : undefined}
                  aria-expanded={openExport ? 'true' : undefined}
                  aria-haspopup="true"
                  onClick={(event) => setAnchorExport(event.currentTarget)}
                  variant="contained"
                  endIcon={<Iconify icon="ep:caret-bottom" />}
                >
                  Export
                </Button>
                <Menu
                  id="long-menu"
                  MenuListProps={{
                    'aria-labelledby': 'long-button',
                  }}
                  anchorEl={anchorExport}
                  open={openExport}
                  onClose={() => setAnchorExport(null)}
                  sx={{ width: '300px' }}
                >
                  <MenuItem
                    sx={{
                      padding: '10px 30px',
                    }}
                  >
                    <Stack direction="row" spacing={1}>
                      CSV
                    </Stack>
                  </MenuItem>
                  <MenuItem
                    sx={{
                      padding: '10px 30px',
                    }}
                  >
                    <Stack direction="row" spacing={1}>
                      JSON
                    </Stack>
                  </MenuItem>
                </Menu>
              </Stack>
              <TableContainer
                component={Paper}
                sx={{
                  marginTop: '10px',
                }}
              >
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      {table.map((item, index) => (
                        <TableCell key={item.id} align="center">
                          {item.name}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell align="center">A</TableCell>
                        <TableCell align="center">b</TableCell>
                      </TableRow> */}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          )}
        </Box>
      </Scrollbar>
    </>
  );
}

export default TabsScriptRunning;

TabsScriptRunning.propTypes = {
  handleCloseOutput: PropTypes.func,
  handleFillScreen: PropTypes.func,
  sizes: PropTypes.array,
  outputLogs: PropTypes.array,
  table: PropTypes.array,
  setOutputLogs: PropTypes.func,
};
