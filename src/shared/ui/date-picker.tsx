import { cn } from './lib/cn';
import { Input, type InputProps } from './input';

export const DatePicker = Object.assign((props: InputProps) => <Input type="date" {...props} />, {
  TimePicker: (props: InputProps) => <Input type="time" {...props} />,
  RangePicker: (props: any) => (
    <span className={cn('vdui-range-picker', props.className)}>
      <Input type="datetime-local" />
      <Input type="datetime-local" />
    </span>
  ),
});
