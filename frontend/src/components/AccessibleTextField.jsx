import { useTextField } from '@react-aria/textfield';
import { useRef } from 'react';

export default function AccessibleTextField({ label, errorMessage, hint, onChange, ...props }) {
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
    <div className="field">
      <label {...labelProps} className="field__label">
        {label}
      </label>
      <input
        {...restInputProps}
        onChange={handleChange}
        ref={ref}
        className={`field__input ${errorMessage ? 'field__input--invalid' : ''}`}
        aria-invalid={errorMessage ? 'true' : 'false'}
      />
      {errorMessage ? <div className="field__error">{errorMessage}</div> : hint ? <div className="field__hint">{hint}</div> : null}
    </div>
  );
}