import { Container } from '@mui/material';
import { useParams } from 'react-router';
import { useGetProfileById } from 'src/api/profile.api';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import { useAuthContext } from 'src/auth/hooks';
import SingleCreateUpdateProfile from './single-create-update-profile';

const ProfileUpdateView = () => {
  const { workspace_id } = useAuthContext();
  const settings = useSettingsContext();
  const { profileId } = useParams();
  const { profile } = useGetProfileById(workspace_id, profileId);

  return (
    <Container
      maxWidth={settings.themeStretch ? false : 'lg'}
      sx={{
        height: 1,
        pb: 1,
        px: '0px!important',
      }}
    >
      <Scrollbar
        sxRoot={{
          overflow: 'unset',
        }}
        sx={{
          height: 'calc(100% - 60px)',
          mt: 1,
          '& .simplebar-track.simplebar-vertical': {
            position: 'absolute',
            right: '-12px',
            pointerEvents: 'auto',
            width: 12,
          },
        }}
      >
        <SingleCreateUpdateProfile currentProfile={profile} isUpdateMode />
      </Scrollbar>
    </Container>
  );
};

export default ProfileUpdateView;
