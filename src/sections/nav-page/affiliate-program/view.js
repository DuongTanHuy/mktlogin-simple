import React, { useState } from 'react';
import {
  Button,
  Card,
  Container,
  Grid,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import Iconify from 'src/components/iconify';
import Label from 'src/components/label';
import { bgGradient } from 'src/theme/css';
import { BookingIllustration } from 'src/assets/illustrations';
import SeoIllustration from 'src/assets/illustrations/seo-illustration';
import { useGetAnalyticsSummary } from 'src/api/affiliate.api';
import { fCurrencyVND } from 'src/utils/format-number';
import { useAuthContext } from 'src/auth/hooks';
import { useLocales } from 'src/locales';
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';
import RewardTable from './reward-table';
import { isElectron } from '../../../utils/commom';

export default function AffiliateProgramView() {
  const theme = useTheme();
  const settings = useSettingsContext();
  const { analyticData } = useGetAnalyticsSummary();
  const { user } = useAuthContext();
  const { t } = useLocales();
  const { copy } = useCopyToClipboard();
  const [displayUsernameTooltip, setDisplayUsernameTooltip] = useState(false);
  const [displayLinkTooltip, setDisplayLinkTooltip] = useState(false);

  return (
    <Container
      maxWidth={settings.themeStretch ? 'xl' : 'lg'}
      sx={{
        height: 1,
        pt: 3,
        pb: 1,
        px: '0px!important',
      }}
    >
      <Grid container spacing={3} height={1}>
        <Grid item xs={12} md={8} height={1} order={{ xs: 2, md: 1 }}>
          <Stack spacing={2} height={1}>
            <Stack direction="row" spacing={2}>
              <Stack
                sx={{
                  width: 1,
                  padding: 2,
                  paddingBottom: 5,
                  borderRadius: 1,
                  boxShadow: theme.customShadows.z8,
                  position: 'relative',
                }}
              >
                <Typography color="text.secondary">{t('affiliateProgram.userInvited')}</Typography>
                <Typography variant="h5">{analyticData?.user_invited || 0}</Typography>
                <BookingIllustration
                  sx={{ width: 100, position: 'absolute', right: 10, bottom: 0 }}
                />
              </Stack>

              <Stack
                sx={{
                  width: 1,
                  padding: 2,
                  paddingBottom: 5,
                  borderRadius: 1,
                  boxShadow: theme.customShadows.z8,
                  position: 'relative',
                }}
              >
                <Typography color="text.secondary">{t('affiliateProgram.totalEarned')}</Typography>
                <Typography variant="h5">
                  {fCurrencyVND(analyticData?.total_earned) || '0 VND'}
                </Typography>
                <SeoIllustration sx={{ width: 100, position: 'absolute', right: 10, bottom: 0 }} />
              </Stack>
            </Stack>
            <Stack spacing={1} height={1}>
              <Typography
                variant="h4"
                sx={{
                  marginBottom: 1,
                }}
              >
                {t('affiliateProgram.affiliateLevel')}
              </Typography>
              <RewardTable affiliateLevel={analyticData?.affiliate_level_id} />
            </Stack>
          </Stack>
        </Grid>
        <Grid item xs={12} md={4} order={{ xs: 1, md: 2 }}>
          <Card>
            <Stack p={2} spacing={2}>
              <Stack direction="row" spacing={1}>
                <Label
                  startIcon={<Iconify icon="material-symbols:rewarded-ads" />}
                  color="primary"
                  sx={{
                    width: 'fit-content',
                  }}
                >
                  {`${t('affiliateProgram.level')} : ${
                    user?.affiliate_level ? user?.affiliate_level?.level : 'Novice'
                  }`}
                </Label>
                <Label
                  startIcon={<Iconify icon="hugeicons:affiliate" />}
                  color="primary"
                  sx={{
                    width: 'fit-content',
                  }}
                >
                  {`${t('affiliateProgram.commissionRate')} : ${
                    user?.affiliate_level ? user?.affiliate_level?.commission : '10%'
                  }`}
                </Label>
              </Stack>
              <Stack
                p={2}
                spacing={1}
                sx={{
                  ...bgGradient({
                    direction: 'to bottom',
                    startColor: alpha(theme.palette.primary.light, 0.6),
                    endColor: alpha(theme.palette.primary.main, 0.6),
                  }),
                  borderRadius: 1,
                  boxShadow: theme.customShadows.z8,
                }}
              >
                <Typography color="white" fontWeight={500}>
                  {t('affiliateProgram.yourBalance')}
                </Typography>
                <Typography color="white" variant="h5">
                  {fCurrencyVND(analyticData?.commission_balance) || '0 VND'}
                </Typography>
                <Button
                  onClick={() => {
                    // open link new tab
                    if (isElectron()) {
                      window.ipcRenderer.send('open-external', 'https://affiliate.mktlogin.com');
                    } else {
                      window.open('https://affiliate.mktlogin.com');
                    }
                  }}
                  variant="contained"
                  sx={{
                    width: 'fit-content',
                  }}
                >
                  {t('affiliateProgram.withdrawFunds')}
                </Button>
              </Stack>
              <TextField
                label={t('affiliateProgram.yourReferralCode')}
                variant="filled"
                value={user?.username}
                inputProps={{
                  readOnly: true,
                }}
                InputProps={{
                  endAdornment: (
                    <Tooltip
                      onClose={() => setDisplayUsernameTooltip(false)}
                      open={displayUsernameTooltip}
                      title={t('workflow.script.dialog.share.copy')}
                      placement="top"
                    >
                      <IconButton
                        onClick={() => {
                          copy(user?.username);
                          setDisplayUsernameTooltip(true);
                        }}
                      >
                        <Iconify icon="solar:copy-bold-duotone" />
                      </IconButton>
                    </Tooltip>
                  ),
                }}
              />
              <TextField
                label={t('affiliateProgram.yourReferralLink')}
                value={`https://app.mktlogin.com/register?referer=${user?.username}`}
                variant="filled"
                inputProps={{
                  readOnly: true,
                }}
                InputProps={{
                  endAdornment: (
                    <Tooltip
                      onClose={() => setDisplayLinkTooltip(false)}
                      open={displayLinkTooltip}
                      title={t('workflow.script.dialog.share.copy')}
                      placement="top"
                    >
                      <IconButton
                        onClick={() => {
                          copy(`https://app.mktlogin.com/register?referer=${user?.username}`);
                          setDisplayLinkTooltip(true);
                        }}
                      >
                        <Iconify icon="solar:copy-bold-duotone" />
                      </IconButton>
                    </Tooltip>
                  ),
                }}
              />
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

AffiliateProgramView.propTypes = {};
