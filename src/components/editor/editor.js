import PropTypes from 'prop-types';
import 'src/utils/highlight';
import ReactQuill from 'react-quill';
// @mui
import { alpha } from '@mui/material/styles';
//
import { useCallback, useRef } from 'react';
import { getURLImage } from 'src/api/common.api';
import { StyledEditor } from './styles';
import Toolbar, { formats } from './toolbar';

// ----------------------------------------------------------------------

export default function Editor({
  id = 'minimal-quill',
  error,
  simple = false,
  helperText,
  sx,
  readOnly = false,
  formatType,
  ...other
}) {
  const reactQuillRef = useRef(null);

  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();
    input.onchange = async () => {
      if (input !== null && input.files !== null) {
        const file = input.files[0];
        const imageURL = await getURLImage(file);
        const quill = reactQuillRef.current;
        if (quill) {
          const range = quill.getEditorSelection();
          // eslint-disable-next-line no-unused-expressions
          range && quill.getEditor().insertEmbed(range.index, 'image', imageURL);
        }
      }
    };
  }, []);

  const modules = {
    toolbar: readOnly
      ? false
      : {
          container: `#${id}`,
          handlers: {
            ...(!formatType === 'base64' && {
              image: imageHandler,
            }),
          },
        },
    history: {
      delay: 500,
      maxStack: 100,
      userOnly: true,
    },
    syntax: true,
    clipboard: {
      matchVisual: false,
    },
  };

  return (
    <>
      <StyledEditor
        sx={{
          ...(error && {
            border: (theme) => `solid 1px ${theme.palette.error.main}`,
            '& .ql-editor': {
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
            },
          }),
          ...sx,
        }}
      >
        {!readOnly && <Toolbar id={id} isSimple={simple} />}

        <ReactQuill
          ref={reactQuillRef}
          modules={modules}
          formats={formats}
          placeholder="Write something awesome..."
          readOnly={readOnly}
          {...other}
        />
      </StyledEditor>

      {helperText && helperText}
    </>
  );
}

Editor.propTypes = {
  error: PropTypes.bool,
  helperText: PropTypes.object,
  id: PropTypes.string,
  formatType: PropTypes.string,
  simple: PropTypes.bool,
  sx: PropTypes.object,
  readOnly: PropTypes.bool,
};
