import { useRef } from 'react';
import { useCheckbox } from '@react-aria/checkbox';
import { useToggleState } from '@react-stately/toggle';

export default function AccessibleCheckbox({
                                               label,
                                               isSelected,
                                               onChange
                                           }) {
    const inputRef = useRef();

    const state = useToggleState({
        isSelected,
        onChange
    });

    const { inputProps } = useCheckbox(
        {},
        state,
        inputRef
    );

    return (
        <label>
            <input
                {...inputProps}
                ref={inputRef}
            />
            {label}
        </label>
    );
}
