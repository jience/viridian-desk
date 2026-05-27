import { forwardRef, memo, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/shared/ui/lib/cn';

type LeanInputProps = InputHTMLAttributes<HTMLInputElement>;
type LeanTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const LeanInput = memo(
  forwardRef<HTMLInputElement, LeanInputProps>(function LeanInput(
    {
      className,
      value,
      defaultValue,
      spellCheck: _spellCheck,
      autoCorrect: _autoCorrect,
      autoCapitalize: _autoCapitalize,
      ...props
    },
    ref,
  ) {
    const nativeValueProps =
      value !== undefined ? { value } : defaultValue !== undefined ? { defaultValue } : {};

    return (
      <input
        ref={ref}
        className={cn('vdui-lean-input', className)}
        data-lean-input
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="none"
        {...nativeValueProps}
        {...props}
      />
    );
  }),
);
LeanInput.displayName = 'LeanInput';

export const LeanTextarea = memo(
  forwardRef<HTMLTextAreaElement, LeanTextareaProps>(function LeanTextarea(
    {
      className,
      value,
      defaultValue,
      spellCheck: _spellCheck,
      autoCorrect: _autoCorrect,
      autoCapitalize: _autoCapitalize,
      ...props
    },
    ref,
  ) {
    const nativeValueProps =
      value !== undefined ? { value } : defaultValue !== undefined ? { defaultValue } : {};

    return (
      <textarea
        ref={ref}
        className={cn('vdui-lean-input', className)}
        data-lean-input
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="none"
        {...nativeValueProps}
        {...props}
      />
    );
  }),
);
LeanTextarea.displayName = 'LeanTextarea';
