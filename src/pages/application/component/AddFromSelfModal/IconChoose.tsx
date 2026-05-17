import { useState, useEffect } from 'react';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import { listVappIcon } from '@/services/api/vapp';
import { open } from '@tauri-apps/plugin-dialog';
import { readLocalFile } from '@/utils/base64';
import './IconChoose.scss';

interface IconChooseProps {
  value?: string;
  onChange?: (value: string) => void;
}

const IconChoose: React.FC<IconChooseProps> = ({ value, onChange }) => {
  const [iconList, setIconList] = useState<string[]>([]);
  const { t } = useTranslation();

  const handleIconSelect = (iconUrl: string) => {
    onChange?.(iconUrl);
  };

  const handleAddBySelf = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: 'Image',
            extensions: ['png'],
          },
        ],
      });
      if (selected) {
        const dataUrl = await readLocalFile(selected);
        // 检查是否已存在
        if (iconList.indexOf(dataUrl) === -1) {
          const newIconList = [...iconList, dataUrl];
          setIconList(newIconList);
          handleIconSelect(dataUrl);
        } else {
          message.warning(t('application_page.select_upload_image_exists'));
        }
      }
    } catch (error) {
      console.error('Error opening file dialog:', error);
      message.error(t('application_page.select_upload_image_error'));
    }
  };

  const vappIconList = async () => {
    try {
      const res = await listVappIcon({ isTerminal: true });
      const icons = res.data.map((val) => val.iconUrl);
      setIconList(icons);

      // 如果没有选中的值且有默认图标，设置默认值
      if (!value && icons.length > 0) {
        const defaultIcon =
          res.data.find((val) => val.name === 'common')?.iconUrl || res.data[0].iconUrl;
        handleIconSelect(defaultIcon);
      }
    } catch (error) {
      console.error('Error fetching icon list:', error);
    }
  };

  useEffect(() => {
    vappIconList();
  }, []);

  return (
    <div className="icon-choose">
      {iconList.map((iconUrl: string, index: number) => {
        return (
          <div
            key={index}
            className={`img-container ${iconUrl === value ? 'active' : ''}`}
            onClick={() => handleIconSelect(iconUrl)}
          >
            <img src={iconUrl} alt={`icon-${index}`} />
          </div>
        );
      })}
      <div className="upload-trigger" onClick={handleAddBySelf}>
        <div className="iconModel-modal">
          <i className="iconfont icon-add iconModel-modal-icon" />
        </div>
      </div>
    </div>
  );
};

export default IconChoose;
