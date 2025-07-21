import merge from 'lodash/merge';
// pages
import translationProfile from './profile.json';
import translationLogin from './login.json';
import translationRegister from './register.json';
import translationsForgotPassword from './forgot-password.json';
import translationNewPassword from './new-password.json';
import translationOtpVerify from './otp-verify.json';
import translationInviteMember from './invite-member.json';
import translationAccSetting from './acc-setting.json';
import translationPricing from './pricing.json';
import translationExtension from './extension.json';
import translationWorkspaceSetting from './workspace-setting.json';
import translationMember from './member.json';
import translationWorkflow from './workflow.json';
import translationTask from './task.json';
import translationSchedule from './schedule.json';
import translationMarketplace from './marketplace.json';
import translationSynchronizer from './synchronizer.json';
import translationGlobalSetting from './global-setting.json';
import translationaffiliate from './affiliate-program.json';
// components
import translationLayout from './layout.json';
import translationDialog from './dialog.json';
import translationPopup from './popup.json';
import translationThemeSetting from './theme-setting.json';
import translationSystemNotification from './system-notification.json';
import translationFormError from './form-error.json';
import translationValidateMessage from './validate-message.json';
import translationTrash from './trash.json';
import translationGeneralLog from './general-log.json';

const translationVi = merge(
  // pages
  translationProfile,
  translationLogin,
  translationRegister,
  translationsForgotPassword,
  translationNewPassword,
  translationOtpVerify,
  translationInviteMember,
  translationAccSetting,
  translationPricing,
  translationExtension,
  translationWorkspaceSetting,
  translationThemeSetting,
  translationMember,
  translationWorkflow,
  translationTask,
  translationSchedule,
  translationMarketplace,
  translationSynchronizer,
  translationGlobalSetting,
  translationaffiliate,
  translationTrash,
  translationGeneralLog,
  // components
  translationLayout,
  translationDialog,
  translationPopup,
  translationSystemNotification,
  translationFormError,
  translationValidateMessage
);

export default translationVi;
