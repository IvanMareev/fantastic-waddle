import { useButton } from '@react-aria/button';
import { useRef } from 'react';

export default function AccessibleButton({ variant = 'primary', className = '', size, ...props }) {
  const ref = useRef();
  const { buttonProps } = useButton(props, ref);

  const classes = [
    'btn',
    `btn--${variant}`,
    size ? `btn--${size}` : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      {...buttonProps}
      ref={ref}
      className={classes}
      type={props.type || 'button'}
    >
      {props.children}
    </button>
  );
}