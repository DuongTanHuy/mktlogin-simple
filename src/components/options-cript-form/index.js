import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import HttpRequestOption from './actions-form/http-request';
import WaitOption from './actions-form/wait';
import ClickMouse from './actions-form/click-mouse';
import OpenLink from './actions-form/open-link';
import OpenTab from './actions-form/open-tab';
import GetText from './actions-form/get-text';
import SpeadSheet from './actions-form/spread-sheet';
import SwitchTab from './actions-form/switch-tabs';
import GetURL from './actions-form/get-url';
import CloseTab from './actions-form/close-tab';
import ScrollMouse from './actions-form/scroll-mouse';
import PressKeyBoard from './actions-form/press-keyboard';
import TypingText from './actions-form/typing-text';

// ----------------------------------------------------------------------

export default function OptionsScriptForm({ onClose, submitOptionFormData, initData, ...other }) {
  const handleSubmit = (data) => {
    try {
      submitOptionFormData(`${data}`);
    } catch (error) {
      console.log('error', error);
    }
  };

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      onClose={() => onClose()}
      {...other}
      sx={{
        '& .MuiDialog-container': {
          '& .MuiPaper-root': {
            width: '500px',
            maxWidth: '100%', // Set your width here
          },
        },
      }}
    >
      {initData?.alias === 'http_request' && initData?.parameters && (
        <HttpRequestOption formData={initData} onClose={onClose} applyForm={handleSubmit} />
      )}
      {initData?.alias === 'doi' && initData?.parameters && (
        <WaitOption formData={initData} onClose={onClose} applyForm={handleSubmit} />
      )}
      {initData?.alias === 'nhan_chuot' && initData?.parameters && (
        <ClickMouse formData={initData} onClose={onClose} applyForm={handleSubmit} />
      )}
      {initData?.alias === 'mo_url' && initData?.parameters && (
        <OpenLink formData={initData} onClose={onClose} applyForm={handleSubmit} />
      )}
      {initData?.alias === 'mo_tab_moi' && initData?.parameters && (
        <OpenTab formData={initData} onClose={onClose} applyForm={handleSubmit} />
      )}
      {initData?.alias === 'lay_van_ban' && initData?.parameters && (
        <GetText formData={initData} onClose={onClose} applyForm={handleSubmit} />
      )}
      {initData?.alias === 'lay_url' && initData?.parameters && (
        <GetURL formData={initData} onClose={onClose} applyForm={handleSubmit} />
      )}
      {initData?.alias === 'bang_tinh' && initData?.parameters && (
        <SpeadSheet formData={initData} onClose={onClose} applyForm={handleSubmit} />
      )}
      {initData?.alias === 'chuyen_tab' && initData?.parameters && (
        <SwitchTab formData={initData} onClose={onClose} applyForm={handleSubmit} />
      )}
      {initData?.alias === 'dong_tab' && initData?.parameters && (
        <CloseTab formData={initData} onClose={onClose} applyForm={handleSubmit} />
      )}
      {initData?.alias === 'cuon_chuot' && initData?.parameters && (
        <ScrollMouse formData={initData} onClose={onClose} applyForm={handleSubmit} />
      )}
      {initData?.alias === 'nhan_phim' && initData?.parameters && (
        <PressKeyBoard formData={initData} onClose={onClose} applyForm={handleSubmit} />
      )}
      {initData?.alias === 'go_van_ban' && initData?.parameters && (
        <TypingText formData={initData} onClose={onClose} applyForm={handleSubmit} />
      )}
    </Dialog>
  );
}

OptionsScriptForm.propTypes = {
  onClose: PropTypes.func,
  initData: PropTypes.object,
  submitOptionFormData: PropTypes.func,
};
