import { useTheme } from '@emotion/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ReactSortable } from 'react-sortablejs';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  alpha,
  Stack,
  Typography,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import PropTypes from 'prop-types';

const OptionFields = ({ options }) => {
  const theme = useTheme();

  return (
    <Stack sx={{ height: '100%' }}>
      <Accordion
        sx={{
          paddingX: '10px',
          marginBottom: '5px',
          '&.Mui-expanded': {
            marginBottom: '2.5px',
          },
        }}
        defaultExpanded
      >
        <AccordionSummary
          expandIcon={<Iconify icon="icon-park-outline:down" width={20} />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="body2">Layouts</Typography>
        </AccordionSummary>

        <ReactSortable
          list={options.filter((i) => i.typeGroup === 'layout' && i.display)}
          setList={(data) => {}}
          animation={150}
          group={{
            name: 'shared-group',
            pull: 'clone', // Cho phép clone item từ danh sách này
            put: false, // Không cho phép thả vào danh sách này
          }}
        >
          {options
            .filter((i) => i.typeGroup === 'layout' && i.display)
            .map((item) => (
              <AccordionDetails
                key={item.id}
                sx={{
                  display: 'flex',
                  padding: '10px',
                  flexWrap: 'wrap',
                  border: '1px solid',
                  borderRadius: 1,
                  borderColor: alpha(theme.palette.grey[500], 0.32),
                  bgcolor: alpha(theme.palette.grey[600]),
                  marginBottom: '10px',
                  alignItems: 'center',
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="flex-start"
                  draggable
                  alignItems="center"
                  gap={1}
                >
                  <Iconify icon={item.icon} width={18} />
                  <Typography variant="body2">{item.name}</Typography>
                </Stack>
              </AccordionDetails>
            ))}
        </ReactSortable>
      </Accordion>
      <Accordion
        sx={{
          paddingX: '10px',
          marginBottom: '5px',
          '&.Mui-expanded': {
            marginBottom: '2.5px',
          },
        }}
        defaultExpanded
      >
        <AccordionSummary
          expandIcon={<Iconify icon="icon-park-outline:down" width={20} />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="body2">Basic Fields</Typography>
        </AccordionSummary>

        <ReactSortable
          list={options.filter((i) => i.typeGroup === 'basicField' && i.display)}
          setList={(data) => {}}
          animation={150}
          group={{
            name: 'shared-group',
            pull: 'clone', // Cho phép clone item từ danh sách này
            put: false, // Không cho phép thả vào danh sách này
          }}
        >
          {options
            .filter((i) => i.typeGroup === 'basicField' && i.display)
            .map((item) => (
              <AccordionDetails
                key={item.id}
                sx={{
                  display: 'flex',
                  padding: '10px',
                  flexWrap: 'wrap',
                  border: '1px solid',
                  borderRadius: 1,
                  borderColor: alpha(theme.palette.grey[500], 0.32),
                  bgcolor: alpha(theme.palette.grey[600]),
                  marginBottom: '10px',
                  alignItems: 'center',
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="flex-start"
                  draggable
                  alignItems="center"
                  gap={1}
                >
                  <Iconify icon={item.icon} width={18} />
                  <Typography variant="body2">{item.name}</Typography>
                </Stack>
              </AccordionDetails>
            ))}
        </ReactSortable>
      </Accordion>
      <Accordion
        sx={{
          paddingX: '10px',
          marginBottom: '5px',
          '&.Mui-expanded': {
            marginBottom: '2.5px',
          },
        }}
        defaultExpanded
      >
        <AccordionSummary
          expandIcon={<Iconify icon="icon-park-outline:down" width={20} />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="body2">Advance Field</Typography>
        </AccordionSummary>

        <ReactSortable
          list={options.filter((i) => i.typeGroup === 'advanceField' && i.display)}
          setList={(data) => {}}
          animation={150}
          group={{
            name: 'shared-group',
            pull: 'clone', // Cho phép clone item từ danh sách này
            put: false, // Không cho phép thả vào danh sách này
          }}
        >
          {options
            .filter((i) => i.typeGroup === 'advanceField' && i.display)
            .map((item) => (
              <AccordionDetails
                key={item.id}
                sx={{
                  display: 'flex',
                  padding: '10px',
                  flexWrap: 'wrap',
                  border: '1px solid',
                  borderRadius: 1,
                  borderColor: alpha(theme.palette.grey[500], 0.32),
                  bgcolor: alpha(theme.palette.grey[600]),
                  marginBottom: '10px',
                  alignItems: 'center',
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="flex-start"
                  draggable
                  alignItems="center"
                  gap={1}
                >
                  <Iconify icon={item.icon} width={18} />
                  <Typography variant="body2">{item.name}</Typography>
                </Stack>
              </AccordionDetails>
            ))}
        </ReactSortable>
      </Accordion>
    </Stack>
  );
};

OptionFields.propTypes = {
  options: PropTypes.array,
};

export default OptionFields;
