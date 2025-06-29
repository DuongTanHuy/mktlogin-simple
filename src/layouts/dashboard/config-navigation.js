import { useMemo } from 'react';
// routes
import { paths } from 'src/routes/paths';
// components
import SvgColor from 'src/components/svg-color';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const ICONS = {
  profile: icon('ic_profile'),
  automation: icon('ic_automation'),
  script: icon('ic_script'),
  synchronizer: icon('ic_synchronize'),
  extension: icon('ic_extension'),
  member: icon('ic_group'),
  api_doc: icon('ic_apidocs'),
  trash: icon('ic_trash'),
  general_log: icon('ic_general_log'),
  workspace_setting: icon('ic_setting'),
};

// ----------------------------------------------------------------------

export function useNavData() {
  const { t } = useLocales();

  const data = useMemo(
    () => [
      // ----------------------------------------------------------------------
      {
        // subheader: `${t('nav.overview')} v1.0.0`,
        items: [
          { title: t('nav.profile'), path: paths.dashboard.profile, icon: ICONS.profile },
          {
            title: t('nav.automation'),
            path: paths.dashboard.automation,
            icon: ICONS.automation,
            children: [
              { title: t('nav.automation_sub.workflow'), path: paths.dashboard.automation },
              { title: t('nav.automation_sub.task'), path: paths.dashboard.task },
              { title: t('nav.automation_sub.schedule'), path: paths.dashboard.schedule },
              { title: t('nav.automation_sub.marketplace'), path: paths.dashboard.marketplace },
            ],
          },
          {
            title: t('nav.synchronizer'),
            path: paths.dashboard.synchronizer,
            icon: ICONS.synchronizer,
          },
          { title: t('nav.extension'), path: paths.dashboard.extension, icon: ICONS.extension },
          { title: t('nav.member'), path: paths.dashboard.member, icon: ICONS.member },
          { title: t('nav.trash'), path: paths.dashboard.trash, icon: ICONS.trash },
          {
            title: t('nav.general-log'),
            path: paths.dashboard.general_log,
            icon: ICONS.general_log,
          },
          {
            title: t('nav.setting'),
            path: paths.dashboard.setting,
            icon: ICONS.workspace_setting,
          },
        ],
      },
    ],
    [t]
  );

  return data;
}
