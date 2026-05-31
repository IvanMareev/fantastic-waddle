import { useCheckbox } from '@react-aria/checkbox';
import { useRef } from 'react';

export default function AccessibleCheckbox({ label, isSelected, onChange, value, name }) {
  const ref = useRef();
  const { inputProps } = useCheckbox({ isSelected, onChange, value, name }, ref);

  return (
    <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 cursor-pointer hover:border-indigo-300">
      <input {...inputProps} ref={ref} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
      <span>{label}</span>
    </label>
  );
}
