import { useButton } from '@react-aria/button';
import { useRef } from 'react';

export default function AccessibleButton(props) {
  const ref = useRef();
  const { buttonProps } = useButton(props, ref);

  return (
    <button
      {...buttonProps}
      ref={ref}
      className={`primary-button ${props.className || ''}`}
      type={props.type || 'button'}
    >
      {props.children}
    </button>
  );
}
