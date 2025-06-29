import { Card, CardContent, Stack, Typography } from '@mui/material';
import { Upload } from 'src/components/upload';
import WithSectionAction from '../components/WithSelectionAction';

const PropTypes = require('prop-types');

const FileContent = ({ data, selectingItem, onDuplicate, onDelete, updateItemByField }) => {
  const handleRemoveFile = (inputFile) => {
    const filesFiltered = data?.config?.files.filter((fileFiltered) => fileFiltered !== inputFile);
    updateItemByField(data, 'files', filesFiltered);
  };

  return (
    <WithSectionAction
      data={data}
      isActive={data.id === selectingItem?.id}
      onDuplicate={onDuplicate}
      onDelete={onDelete}
    >
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          ...data?.styleDefault,
          width: '100%',
          overflow: 'hidden',
          height: `${data?.config?.height}px`,
          transition: 'all 0.3s',
          justifyContent: 'flex-start!important',
        }}
      >
        {!data?.config?.hideLabel && (
          <Typography
            sx={{
              minWidth: '100px',
              width: `${data?.config?.labelWidth}px`,
              transition: 'all 0.3s',
              flexShrink: 0,
            }}
          >
            {data?.config?.name}
          </Typography>
        )}

        <Card
          sx={{
            bgcolor: 'transparent',
            boxShadow: 'none',
            p: 0,
            borderRadius: 1,
            overflow: 'visible',
            transition: 'all 0.3s',
            ...(updateItemByField && {
              '&.MuiPaper-root': {
                width: '100%',
              },
              '& [role="presentation"]': {
                maxWidth: 'fit-content',
              },
            }),
            ...(data?.config?.width
              ? {
                  width: `${data?.config?.width}px`,
                }
              : {
                  width: 'fit-content',
                }),
          }}
        >
          <CardContent
            sx={{
              p: '0px!important',
              pt: 1,
            }}
          >
            <Upload
              multiple
              disabled={{}}
              files={data?.config?.files}
              onRemove={handleRemoveFile}
              stylePreview={{
                ...(!updateItemByField && {
                  display: 'none',
                }),
              }}
              placeholder={
                <Typography
                  variant="h6"
                  sx={{
                    p: 1,
                  }}
                >
                  Drop or Select file
                </Typography>
              }
            />
          </CardContent>
        </Card>
      </Stack>
    </WithSectionAction>
  );
};

FileContent.propTypes = {
  data: PropTypes.object,
  selectingItem: PropTypes.object,
  onDuplicate: PropTypes.func,
  onDelete: PropTypes.func,
  updateItemByField: PropTypes.func,
};

export default FileContent;
