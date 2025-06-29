import PropTypes from 'prop-types';
import { useCallback, useRef } from 'react';
import ReactQuill from 'react-quill';

import 'react-quill/dist/quill.snow.css';
import { getURLImage } from 'src/api/common.api';
import { StyledEditor } from '../editor/styles';

export default function EditorV2({ setDescritionContent, descriptionContent, sx }) {
  const reactQuillRef = useRef(null);

  const onChange = (content) => {
    setDescritionContent(content);
  };

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

  return (
    <StyledEditor
      sx={{
        ...sx,
      }}
    >
      <ReactQuill
        ref={reactQuillRef}
        theme="snow"
        placeholder="Start writing..."
        modules={{
          toolbar: {
            container: [
              [{ header: '1' }, { header: '2' }, { font: [] }],
              [{ size: [] }],
              ['bold', 'italic', 'underline', 'strike', 'blockquote'],
              [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
              ['link', 'image', 'video'],
              ['code-block'],
              ['clean'],
            ],
            handlers: {
              image: imageHandler,
            },
          },
          clipboard: {
            matchVisual: false,
          },
        }}
        formats={[
          'header',
          'font',
          'size',
          'bold',
          'italic',
          'underline',
          'strike',
          'blockquote',
          'list',
          'bullet',
          'indent',
          'link',
          'image',
          'video',
          'code-block',
        ]}
        value={descriptionContent}
        onChange={onChange}
      />
    </StyledEditor>
  );
}

EditorV2.propTypes = {
  setDescritionContent: PropTypes.func,
  sx: PropTypes.object,
  descriptionContent: PropTypes.string,
};
