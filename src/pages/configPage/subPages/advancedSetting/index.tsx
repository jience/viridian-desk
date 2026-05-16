import './index.scss';
import { selectDeveloperMode } from '@/store/feature/config';
import { useAppSelector } from '@/store';
import { LogInfo } from './LogInfo';
import { DeveloperMode } from './DeveloperMode';
import { NetworkInfo } from './NetworkInfo';
import { Diagnosis } from './Diagnosis';
import { useTranslation } from 'react-i18next';
import { useIntl } from 'react-intl';
import { SettingsGroup, SettingsSection } from '../../redesign/components';

type PendingAdvancedSettingKey =
  | 'developer_tools'
  | 'developer_tools_description'
  | 'operations'
  | 'operations_description'
  | 'support_tools'
  | 'support_tools_description';

const advancedSettingKey = <T extends PendingAdvancedSettingKey>(key: T) =>
  `config_page.advanced_setting.${key}` as const;

export default function AdvancedSetting() {
  const { t } = useTranslation();
  const intl = useIntl();
  const tPending = (key: PendingAdvancedSettingKey) => t(advancedSettingKey(key));
  const developerMode = useAppSelector(selectDeveloperMode);

  // 网络信息编辑表单
  // const _NIFormFeatures = useMemo(() => {
  //   return [
  //     {
  //       key: 'dhcpEnabled',
  //       name: 'dhcpEnabled',
  //       label: intl.formatMessage({ id: 'DHCP' }),
  //       canLabelClick: '',
  //       rules: [{ required: true }],
  //       // tooltip: '测试提示info',
  //       comType: 'switch',
  //       valuePropName: 'checked',
  //       resetForm: {
  //         // 是否触发整个表单重置 可选配置，可不写默认就不重置表单
  //         isReset: true, // 是否重置的判断值，true-重置，false-不重置
  //         effectValue: 'true', // 触发重置动作的当前表单项值，布尔值，数值都转换为字符值
  //         // 触发重置动作, 指定需要重置的表单项name
  //         fieldKeys: ['address', 'gatewayIp', 'netmask'],
  //       },
  //       comProps: {
  //         disabled: false,
  //       },
  //     },
  //     {
  //       key: 'address',
  //       name: 'address',
  //       label: `IP${intl.formatMessage({ id: 'ADDRESS' })}`,
  //       canLabelClick: '',
  //       rules: [
  //         {
  //           required: true,
  //           message: intl.formatMessage(
  //             { id: 'FORM_ERROR_MSG' },
  //             { name: `IP${intl.formatMessage({ id: 'ADDRESS' })}` },
  //           ),
  //         },
  //       ],
  //       comType: 'input.ipv4',
  //       comProps: {
  //         prefix: '',
  //         suffix: '',
  //         disabled: networkInfo?.dhcpEnabled,
  //         placeholder: `0-255.0-255.0-255.0-255`,
  //       },
  //       // 控制当前项指定propKey的属性值，受key值表单项的影响变化
  //       impactProps: [
  //         {
  //           keys: ['dhcpEnabled'], // 影响当前prop属性的其他表单项name
  //           propKey: 'disabled', // 当前项受影响的prop属性key
  //           impactAction: (val: any) => {
  //             // val是key表单项的当前值，返回值是propKey的影响值
  //             return val.dhcpEnabled === undefined ? networkInfo?.dhcpEnabled : val.dhcpEnabled;
  //           },
  //         },
  //       ],
  //     },
  //     {
  //       key: 'gatewayIp',
  //       name: 'gatewayIp',
  //       label: intl.formatMessage({ id: 'NETGATEWAY' }),
  //       canLabelClick: '',
  //       rules: [
  //         {
  //           required: true,
  //           message: intl.formatMessage(
  //             { id: 'FORM_ERROR_MSG' },
  //             { name: intl.formatMessage({ id: 'NETGATEWAY' }) },
  //           ),
  //         },
  //         // {
  //         //   pattern: regex.isIpv4Gateway,
  //         //   message: intl.formatMessage(
  //         //     { id: 'FORM_REGEX_ERROR_MSG' },
  //         //     { name: intl.formatMessage({ id: 'NETGATEWAY' }) },
  //         //   ),
  //         // },
  //       ],
  //       comType: 'input.ipv4',
  //       comProps: {
  //         prefix: '',
  //         suffix: '',
  //         disabled: networkInfo?.dhcpEnabled,
  //         placeholder: `0-255.0-255.0-255.1-254`,
  //       },
  //       // 控制当前项指定propKey的属性值，受key值表单项的影响变化
  //       impactProps: [
  //         {
  //           keys: ['dhcpEnabled'], // 影响当前prop属性的其他表单项name
  //           propKey: 'disabled', // 当前项受影响的prop属性key
  //           impactAction: (val: any) => {
  //             // val是key表单项的当前值，返回值是propKey的影响值
  //             return val.dhcpEnabled === undefined ? networkInfo?.dhcpEnabled : val.dhcpEnabled;
  //           },
  //         },
  //       ],
  //     },
  //     {
  //       key: 'netmask',
  //       name: 'netmask',
  //       label: `${intl.formatMessage({ id: 'SUBNETMASK' })}`,
  //       canLabelClick: '',
  //       rules: [
  //         {
  //           required: true,
  //           message: intl.formatMessage(
  //             { id: 'FORM_ERROR_MSG' },
  //             { name: `${intl.formatMessage({ id: 'SUBNETMASK' })}` },
  //           ),
  //         },
  //       ],
  //       comType: 'input.ipv4',
  //       comProps: {
  //         prefix: '',
  //         suffix: '',
  //         disabled: networkInfo?.dhcpEnabled,
  //         placeholder: `0-255.0-255.0-255.0-255`,
  //       },
  //       // 控制当前项指定propKey的属性值，受key值表单项的影响变化
  //       impactProps: [
  //         {
  //           keys: ['dhcpEnabled'], // 影响当前prop属性的其他表单项name
  //           propKey: 'disabled', // 当前项受影响的prop属性key
  //           impactAction: (val: any) => {
  //             // val是key表单项的当前值，返回值是propKey的影响值
  //             return val.dhcpEnabled === undefined ? networkInfo?.dhcpEnabled : val.dhcpEnabled;
  //           },
  //         },
  //       ],
  //     },
  //   ];
  // }, [intl, networkInfo]);

  return (
    <SettingsSection
      eyebrow={tPending('operations')}
      title={intl.formatMessage({ id: 'Senior' })}
      description={tPending('operations_description')}
    >
      <div className="advanced-setting" key="advanced-setting">
        <SettingsGroup
          title={tPending('support_tools')}
          description={tPending('support_tools_description')}
        >
          <Diagnosis />
          <NetworkInfo />
        </SettingsGroup>
        <SettingsGroup
          title={tPending('developer_tools')}
          description={tPending('developer_tools_description')}
        >
          <DeveloperMode />
          {developerMode && <LogInfo />}
        </SettingsGroup>
      </div>
    </SettingsSection>
  );
}
