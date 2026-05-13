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
      nextStepText: '下一步',
    },
    {
      id: 2,
      image: img2,
      showLastStep: true,
      showNextStep: true,
      useSpaceCompact: true,
      nextStepText: '下一步',
    },
    {
      id: 3,
      image: img3,
      showLastStep: true,
      showNextStep: true,
      useSpaceCompact: true,
      nextStepText: '下一步',
    },
    {
      id: 4,
      image: img4,
      showLastStep: true,
      showNextStep: true,
      useSpaceCompact: true,
      nextStepText: '下一步',
    },
    {
      id: 5,
      image: img5,
      showLastStep: true,
      showNextStep: true,
      useSpaceCompact: true,
      nextStepText: '下一步',
    },
    {
      id: 6,
      image: img6,
      showLastStep: true,
      showNextStep: true,
      nextStepText: '开始体验',
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

    // 跳过按钮
    if (currentStepConfig.showSkip) {
      buttons.push(
        <Button key="skip" className="step-btn" type="default" shape="round" onClick={handleSkip}>
          跳过
        </Button>,
      );
    }

    // 上一步按钮
    if (currentStepConfig.showLastStep) {
      buttons.push(
        <Button
          key="prev"
          className="step-btn"
          type="default"
          shape="round"
          onClick={handlePrevStep}
        >
          上一步
        </Button>,
      );
    }

    // 下一步/开始体验按钮
    if (currentStepConfig.showNextStep) {
      buttons.push(
        <Button
          key="next"
          className="step-btn"
          type="primary"
          shape="round"
          onClick={handleNextStep}
        >
          {currentStepConfig.nextStepText || '下一步'}
        </Button>,
      );
    }

    // 如果需要紧凑布局，使用 Space.Compact
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
    <div
      className={`novice-guidance ${!isThin && 'layout-drag'}`}
      style={{ backgroundImage: `url(${currentStepConfig.image})` }}
    >
      <div className="options-wrapper">{renderButtons()}</div>
    </div>
  );
};

export default NoviceGuidance;
