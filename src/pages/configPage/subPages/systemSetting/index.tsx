import React, { useMemo } from 'react';
import './index.scss';

// components
import IntegratedCard from '@/components/IntegratedCard';

// UI
import { Button } from 'antd';
import { useIntl } from 'react-intl';

// other

interface tagObject {
  color: string;
  textColor: string;
  optIcon?: React.ReactNode;
  name: string;
}

interface cardConfig {
  cardType: string; // normal | overSize
  titleConfig: {
    key: string;
    mainTitle: string | React.ReactNode;
    mainTitle_tags?: Array<tagObject>;
    subTitle?: Array<tagObject>;
    middleSlot?: string | React.ReactNode;
    rightSlot?: string | React.ReactNode;
  };
  content?: any;
  show: boolean;
  clickAction?: boolean;
}

const SystemSetting = (_props: any) => {
  const intl = useIntl();

  /**
   * @author QL
   * @date 2022-11-03 09:32:01
   * @version V..
   * @description useEffect & useMemo & other
   */
  // useEffect(() => {

  //     return () => {
  //         window.ipcRenderer.removeAllListeners(`${}.cb`)
  //     }
  // }, [])

  const cards = useMemo<Array<cardConfig>>(() => {
    return [
      {
        cardType: 'normal',
        titleConfig: {
          key: 'SystemVoice',
          mainTitle: intl.formatMessage({ id: 'SystemVoice' }),
          mainTitle_tags: [],
          subTitle: [],
          middleSlot: '',
          rightSlot: (
            <Button
              type="default"
              name={intl.formatMessage({ id: 'SETUP' })}
              className="special"
              onClick={() => systemAction('voice')}
            />
          ),
        },
        show: true,
      },
      {
        cardType: 'normal',
        titleConfig: {
          key: 'SystemView',
          mainTitle: intl.formatMessage({ id: 'SystemView' }),
          mainTitle_tags: [],
          subTitle: [],
          middleSlot: '',
          rightSlot: (
            <Button
              type="default"
              name={intl.formatMessage({ id: 'SETUP' })}
              className="special"
              onClick={() => systemAction('view')}
            />
          ),
        },
        show: true,
      },
      {
        cardType: 'normal',
        titleConfig: {
          key: 'SystemVote',
          mainTitle: intl.formatMessage({ id: 'SystemVote' }),
          mainTitle_tags: [],
          subTitle: [],
          middleSlot: '',
          rightSlot: (
            <Button
              type="default"
              name={intl.formatMessage({ id: 'SETUP' })}
              className="special"
              onClick={() => systemAction('vote')}
            />
          ),
        },
        show: true,
      },
    ].filter((card: cardConfig) => card.show);
  }, []); // mouseSlefSet

  /**
   * @author QL
   * @date 2022-11-03 09:33:20
   * @version V..
   * @description other methods
   */

  const systemAction = (_type: any) => {
    // const typeMap: any = {
    //   voice: 'sound',
    //   view: 'display',
    //   vote: 'projection.screen',
    // };
    // window.ipcRenderer.send(setupAjax.RunSystemSetting, {
    //     type: typeMap[type]
    // })
  };

  // const cardHandleClick = () => {};

  /**
   * @author QL
   * @date 2022-11-03 09:31:34
   * @version V..
   * @description VDOM
   */
  return (
    <div className="commonSetting" key="commonSetting">
      {cards?.map((card: cardConfig) => (
        <IntegratedCard
          key={card.titleConfig.key}
          type={card.cardType}
          titleConfig={card.titleConfig}
          content={card.content}
        />
      ))}
    </div>
  );
};

export default SystemSetting;
