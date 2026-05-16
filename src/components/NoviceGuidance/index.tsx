import './index.scss';

import { useState } from 'react';
import img1 from '@/assets/images/boot_page/1.png';
import img2 from '@/assets/images/boot_page/2.png';
import img3 from '@/assets/images/boot_page/3.png';
import img4 from '@/assets/images/boot_page/4.png';
import img5 from '@/assets/images/boot_page/5.png';
import img6 from '@/assets/images/boot_page/6.png';

import { Button, Space } from 'antd';
import { selectIsThin } from '@/store/feature/terminal/terminalSlice';
import { useAppSelector } from '@/store';
import { useIntl } from 'react-intl';

interface NoviceGuidanceProps {
  setIsNoviceGuidance: (value: string) => void;
}

interface StepConfig {
  id: number;
  image: string;
  showSkip?: boolean;
  showLastStep?: boolean;
  showNextStep?: boolean;
  nextStepText?: string;
  nextStepAction?: () => void;
  useSpaceCompact?: boolean;
}

const NoviceGuidance = ({ setIsNoviceGuidance }: NoviceGuidanceProps) => {
  const { formatMessage } = useIntl();
  const [step, setStep] = useState(1);
  const isThin = useAppSelector(selectIsThin);

  const handleSkip = () => {
    setIsNoviceGuidance('true');
    localStorage.setItem('noviceGuidance', 'true');
  };

  const stepConfigs: StepConfig[] = [
    {
      id: 1,
      image: img1,
      showSkip: true,
      showNextStep: true,
      nextStepText: formatMessage({ id: 'NextStep' }),
    },
    {
      id: 2,
      image: img2,
      showLastStep: true,
      showNextStep: true,
      useSpaceCompact: true,
      nextStepText: formatMessage({ id: 'NextStep' }),
    },
    {
      id: 3,
      image: img3,
      showLastStep: true,
      showNextStep: true,
      useSpaceCompact: true,
      nextStepText: formatMessage({ id: 'NextStep' }),
    },
    {
      id: 4,
      image: img4,
      showLastStep: true,
      showNextStep: true,
      useSpaceCompact: true,
      nextStepText: formatMessage({ id: 'NextStep' }),
    },
    {
      id: 5,
      image: img5,
      showLastStep: true,
      showNextStep: true,
      useSpaceCompact: true,
      nextStepText: formatMessage({ id: 'NextStep' }),
    },
    {
      id: 6,
      image: img6,
      showLastStep: true,
      showNextStep: true,
      nextStepText: formatMessage({ id: 'StartExperience' }),
      nextStepAction: handleSkip,
      useSpaceCompact: true,
    },
  ];

  const currentStepConfig = stepConfigs.find((config) => config.id === step);

  if (!currentStepConfig) return null;

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleNextStep = () => {
    if (currentStepConfig.nextStepAction) {
      currentStepConfig.nextStepAction();
    } else if (step < stepConfigs.length) {
      setStep(step + 1);
    }
  };

  const renderButtons = () => {
    const buttons = [];

    if (currentStepConfig.showSkip) {
      buttons.push(
        <Button key="skip" className="novice-guidance__button" type="default" onClick={handleSkip}>
          {formatMessage({ id: 'SkipGuide' })}
        </Button>,
      );
    }

    if (currentStepConfig.showLastStep) {
      buttons.push(
        <Button
          key="prev"
          className="novice-guidance__button"
          type="default"
          onClick={handlePrevStep}
        >
          {formatMessage({ id: 'Previous' })}
        </Button>,
      );
    }

    if (currentStepConfig.showNextStep) {
      buttons.push(
        <Button
          key="next"
          className="novice-guidance__button novice-guidance__button--primary"
          type="primary"
          onClick={handleNextStep}
        >
          {currentStepConfig.nextStepText || formatMessage({ id: 'NextStep' })}
        </Button>,
      );
    }

    if (currentStepConfig.useSpaceCompact && buttons.length > 1) {
      return (
        <>
          <div></div>
          <Space.Compact>{buttons}</Space.Compact>
        </>
      );
    }

    return buttons;
  };

  return (
    <main className={`novice-guidance ${!isThin ? 'layout-drag' : ''}`}>
      <img
        className="novice-guidance__image"
        src={currentStepConfig.image}
        alt={formatMessage({ id: 'NoviceGuide' })}
        draggable={false}
      />
      <div className="novice-guidance__progress" aria-label={formatMessage({ id: 'NoviceGuide' })}>
        {stepConfigs.map((config) => (
          <span
            className={
              config.id === step ? 'novice-guidance__dot is-active' : 'novice-guidance__dot'
            }
            key={config.id}
          />
        ))}
      </div>
      <div className="novice-guidance__options">{renderButtons()}</div>
    </main>
  );
};

export default NoviceGuidance;
