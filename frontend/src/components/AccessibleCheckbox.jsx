import { useRef } from 'react';
import { useCheckbox } from '@react-aria/checkbox';
import { useToggleState } from '@react-stately/toggle';

export default function AccessibleCheckbox({ label, isSelected, onChange }) {
  const inputRef = useRef();

  const state = useToggleState({
    isSelected,
    onChange,
  });

  const { inputProps } = useCheckbox({}, state, inputRef);

  return (
    <label className={`checkbox ${isSelected ? 'checkbox--active' : ''}`}>
      <input {...inputProps} ref={inputRef} className="checkbox__input" />
      <span className="checkbox__box" aria-hidden />
      <span className="checkbox__label">{label}</span>
    </label>
  );
}