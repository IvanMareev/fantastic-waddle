import { useTextField } from '@react-aria/textfield';
import { useRef } from 'react';

export default function AccessibleTextField({ label, errorMessage, onChange, ...props }) {
  const ref = useRef();
  const { labelProps, inputProps } = useTextField({ label, ...props }, ref);
  const { onChange: ariaOnChange, ...restInputProps } = inputProps;

  const handleChange = (event) => {
    if (typeof ariaOnChange === 'function') {
      ariaOnChange(event);
    }

    if (typeof onChange === 'function') {
      if (event && typeof event === 'object' && 'target' in event) {
        onChange(event.target.value);
      } else {
        onChange(event);
      }
    }
  };

  return (
    <div className="field-group">
      <label {...labelProps} className="block text-sm font-medium text-slate-800">
        {label}
      </label>
      <input
        {...restInputProps}
        onChange={handleChange}
        ref={ref}
        className="input-field"
        aria-invalid={errorMessage ? 'true' : 'false'}
      />
      {errorMessage ? <div className="error">{errorMessage}</div> : null}
    </div>
  );
}
