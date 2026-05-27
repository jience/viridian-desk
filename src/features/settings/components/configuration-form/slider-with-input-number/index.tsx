import React, { useState } from 'react';
import { Col, InputNumber, Row, Slider } from '@/shared/ui';
import './index.scss';

export const IntegerStep: React.FC = (props: any) => {
  const [inputValue, setInputValue] = useState(1);

  const onChange = (newValue: number) => {
    setInputValue(newValue);
  };

  return (
    <div className="form-item-width">
      <Row gutter={24}>
        <Col span={18}>
          <Slider
            min={1}
            max={20}
            onChange={onChange}
            value={typeof inputValue === 'number' ? inputValue : 0}
            {...props}
          />
        </Col>
        <Col span={6}>
          <InputNumber
            className="form-item-number"
            min={1}
            max={20}
            value={inputValue}
            onChange={onChange}
            {...props}
          />
        </Col>
      </Row>
    </div>
  );
};

export const DecimalStep: React.FC = (props: any) => {
  const [inputValue, setInputValue] = useState(0);

  const onChange = (value: number) => {
    if (isNaN(value)) {
      return;
    }
    setInputValue(value);
  };

  return (
    <div className="form-item-width">
      <Row gutter={24}>
        <Col span={18}>
          <Slider
            min={0}
            max={1}
            onChange={onChange}
            value={typeof inputValue === 'number' ? inputValue : 0}
            step={0.01}
            {...props}
          />
        </Col>
        <Col span={6}>
          <InputNumber
            className="form-item-number"
            min={0}
            max={1}
            step={0.01}
            value={inputValue}
            onChange={onChange}
            {...props}
          />
        </Col>
      </Row>
    </div>
  );
};
