// i18n
import 'src/locales/i18n';
// scrollbar
import 'simplebar-react/dist/simplebar.min.css';
// carousel
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
// image
import 'react-lazy-load-image-component/src/effects/blur.css';
// editor
import 'react-quill/dist/quill.snow.css';
import 'split-pane-react/esm/themes/default.css';

// import 'reactflow/dist/style.css';
import '@xyflow/react/dist/style.css';
import './assets/global/style.css';

// ----------------------------------------------------------------------

// routes
import Router from 'src/routes/sections';
// theme
import ThemeProvider from 'src/theme';
// hooks
import { useScrollToTop } from 'src/hooks/use-scroll-to-top';
// components
import ProgressBar from 'src/components/progress-bar';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import { SettingsProvider, SettingsDrawer } from 'src/components/settings';
// auth
import { AuthProvider, AuthConsumer } from 'src/auth/context/jwt';
import { SnackbarProvider } from './components/snackbar';
import { LocalizationProvider } from './locales';
import { InitialSettingProvider } from './initial-setting/context/initial-setting-provider';
import { BalanceProvider } from './account-balance/context/balance-provider';

// ----------------------------------------------------------------------

export default function App() {
  const charAt = `

  ░░░    ░░░
  ▒▒▒▒  ▒▒▒▒
  ▒▒ ▒▒▒▒ ▒▒
  ▓▓  ▓▓  ▓▓
  ██      ██

  `;

  console.info(`%c${charAt}`, 'color: #5BE49B');

  useScrollToTop();

  return (
    <AuthProvider>
      <LocalizationProvider>
        <BalanceProvider>
          <SettingsProvider
            defaultSettings={{
              themeMode: 'dark', // 'light' | 'dark'
              themeDirection: 'ltr', //  'rtl' | 'ltr'
              themeContrast: 'default', // 'default' | 'bold'
              themeLayout: 'vertical', // 'vertical' | 'horizontal' | 'mini'
              themeColorPresets: 'default', // 'default' | 'cyan' | 'purple' | 'blue' | 'orange' | 'red'
              themeStretch: true,
              isFullScreen: false,
              local_rpa_method: 'flowchart', // 'script' | 'flowchart'
            }}
          >
            <ThemeProvider>
              <MotionLazy>
                <SnackbarProvider>
                  <SettingsDrawer />
                  <ProgressBar />
                  <AuthConsumer>
                    <InitialSettingProvider>
                      <Router />
                    </InitialSettingProvider>
                  </AuthConsumer>
                </SnackbarProvider>
              </MotionLazy>
            </ThemeProvider>
          </SettingsProvider>
        </BalanceProvider>
      </LocalizationProvider>
    </AuthProvider>
  );
}
