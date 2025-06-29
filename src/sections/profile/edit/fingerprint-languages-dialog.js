import PropTypes from 'prop-types';
// mui
import { Button, Checkbox, FormControlLabel, Stack } from '@mui/material';
// components
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useFormContext } from 'react-hook-form';
// apis

const FingerprintLanguagesDialog = ({ open, onClose, languages }) => {
  const { getValues, setValue } = useFormContext();
  const selected_languages = [];

  const onChange = (event, language) => {
    if (event.target.checked) {
      selected_languages.push(language);
    } else {
      selected_languages.splice(selected_languages.indexOf(language), 1);
    }
  };

  const handleAddLanguage = () => {
    let languageCurrent = getValues('languages').split(',');
    languageCurrent = languageCurrent.concat(selected_languages);
    const languageFiltered = Array.from(new Set(languageCurrent)).filter(item => item !== "");
    setValue('languages', languageFiltered.join(','));
    onClose();
  }

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title="Thêm ngôn ngữ"
      content={
        <Stack>
          {languages?.map((language) => (
            <FormControlLabel
              key={language.value}
              control={<Checkbox onChange={(event) => onChange(event, language.value)} />}
              label={language.label}
            />
          ))}
        </Stack>
      }
      action={
        <Button variant="contained" color="primary" onClick={handleAddLanguage}>
          Thêm
        </Button>
      }
    />
  );
};

export default FingerprintLanguagesDialog;

FingerprintLanguagesDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  languages: PropTypes.array,
};
