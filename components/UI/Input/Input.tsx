import { forwardRef } from 'react';
import classes from './Input.module.scss';

interface Props {
  attributes?: {};
  className?: string;
}

const Input = forwardRef<HTMLInputElement, Props>((props, ref) => {
  return (
    <input ref={ref} {...props.attributes} className={`${classes.input} ${props.className}`} />
  );
});

Input.displayName = 'Input';

export default Input;
