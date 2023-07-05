import { forwardRef } from 'react';
import classes from './TextArea.module.scss';

interface Props {
  attributes?: {};
  className?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, Props>((props, ref): JSX.Element => {
  return (
    <textarea
      ref={ref}
      className={`${classes.textarea} ${props.className}`}
      {...props.attributes}
    />
  );
});

TextArea.displayName = 'TextArea';

export default TextArea;
