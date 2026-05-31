import { useTextField } from '@react-aria/textfield';
import { useRef } from 'react';

export default function AccessibleTextField({ label, errorMessage, ...props }) {
  const ref = useRef();
  const { labelProps, inputProps } = useTextField({ label, ...props }, ref);

  return (
    <div className="field-group">
      <label {...labelProps} className="block text-sm font-medium text-slate-800">
        {label}
      </label>
      <input
        {...inputProps}
        ref={ref}
        className="input-field"
        aria-invalid={errorMessage ? 'true' : 'false'}
      />
      {errorMessage ? <div className="error">{errorMessage}</div> : null}
    </div>
  );
}
