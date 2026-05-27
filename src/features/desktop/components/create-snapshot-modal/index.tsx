import { Form, Input, message, Modal, Radio } from '@/shared/ui';
import { useEffect, useMemo, useState } from 'react';
import { useMessageFormatter } from '@/utils/message-format';
import Regex from '@/utils/regex';
import { createSnapshot } from '@/services/api/desktop';
import useRequest from '@/hooks/useRequest';
import './index.scss';
import { isEmptyValue } from '@/utils/value';

const useCreateSnap = (props: any) => {
  const { visible = false, setVisible, desktopId, desktopDiskList, refreshList } = props;
  const intl = useMessageFormatter();
  const { formatMessage } = intl;
  const [formIns] = Form.useForm();
  const [_systemDiskId, setSystemDiskId] = useState();

  const { run: createSnapshotRun, loading: createSnapshotLoading } = useRequest(createSnapshot, {
    manual: true,
    onSuccess: (res: any) => {
      formIns.resetFields();
      setVisible(false);
      refreshList();
      if (res.errorCode) {
        message.error(formatMessage({ id: `error_code.${res.errorCode}` }));
      }
    },
  });

  const dataDisks = useMemo(() => {
    const desktopDiskListNum = desktopDiskList.length;
    let esc = desktopDiskList.length - 1;
    const systemDisk: any = [];
    const personalDisk: any = [];
    const otherDisks: any = [];

    desktopDiskList.map((disk: any, _index: any) => {
      if (disk.isSystem) {
        setSystemDiskId(disk.id);
      }
      const delAttribute = disk.isSystem ? 'system' : disk.attribute;
      switch (delAttribute) {
        case 'system':
          systemDisk.push({
            label: `系统盘：${disk?.name}[${disk?.size}G]`,
            value: disk.id,
            hide: false,
            checked: false,
          });
          break;
        case 'personal':
          personalDisk.push({
            label: `个人盘：${disk.name}[${disk?.size}G]`,
            value: disk.id,
            hide: true,
            checked: false,
          });
          break;
        case 'common':
          otherDisks.push({
            label: `普通盘${desktopDiskListNum - esc--}：${disk.name}[${disk?.size}G]`,
            value: disk.id,
            hide: false,
            checked: true,
          });
          break;
      }
    });

    return [...systemDisk, ...personalDisk, ...otherDisks];
  }, [desktopDiskList]);

  const diskOptions = useMemo(() => {
    return [
      {
        label: intl.formatMessage({ id: 'OnlySystemDisk' }),
        value: 'onlySystemDisk',
        disabled: false,
      },
      {
        label: intl.formatMessage({ id: 'AllDisks' }),
        value: 'includDataDisk',
        disabled: isEmptyValue(dataDisks),
      },
    ];
  }, [dataDisks, intl]);

  useEffect(() => {
    if (visible) {
      formIns.setFieldsValue({
        diskType: 'onlySystemDisk',
      });
    }
  }, [formIns, visible]);

  const handleSubmit = () => {
    formIns.validateFields().then((value) => {
      const creatParams: any = {
        name: value.snapName,
        desktopId: desktopId,
        diskIds: [],
      };
      if (value.diskType === 'includDataDisk') {
        creatParams.diskIds = dataDisks
          .filter((disk: any) => disk.checked)
          .map((disk: any) => disk.value);
      }
      createSnapshotRun(creatParams);
    });
  };

  const renderCheckBox = useMemo(() => {
    return (
      <Form.Item
        name="diskType"
        label={intl.formatMessage({ id: 'VmDisk' })}
        rules={[{ required: true }]}
        className="basic-form-item"
      >
        <Radio.Group options={diskOptions} />
      </Form.Item>
    );
  }, [diskOptions, intl]);

  return (
    <Modal
      open={visible}
      keyboard={false}
      className="sendmsg-modal desk-detail-create-snap-modal"
      onCancel={() => {
        formIns.resetFields();
        setVisible(false);
      }}
      // alertSlots={[
      //   {
      //     type: 'warning',
      //     message: intl.formatMessage({ id: 'CreateSnapShotTip' }),
      //   },
      // ]}
      onOk={() => handleSubmit()}
      okButtonProps={{
        loading: createSnapshotLoading,
      }}
      title={intl.formatMessage({ id: 'CREATE_SNAP' })}
      centered={true}
      cancelText={intl.formatMessage({ id: 'Cancel' })}
    >
      <Form layout="vertical" form={formIns}>
        <Form.Item
          name="snapName"
          label={intl.formatMessage({ id: 'NAME' })}
          className="basic-form-item"
          rules={[
            {
              required: true,
              pattern: Regex.isName,
              message: intl.formatMessage({ id: 'SnapNamePlaceHolder' }),
            },
          ]}
        >
          <Input />
        </Form.Item>
        {renderCheckBox}
      </Form>
    </Modal>
  );
};

export default useCreateSnap;
