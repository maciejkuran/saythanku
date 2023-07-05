import classes from './CloseButton.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-regular-svg-icons';

interface Props {
  className?: string;
  attributes?: {};
}

const CloseButton = ({ className, attributes }: Props): JSX.Element => {
  return (
    <button type="button" title="Close">
      <FontAwesomeIcon
        {...attributes}
        className={`${classes.close} ${className}`}
        icon={faCircleXmark}
      />
    </button>
  );
};

export default CloseButton;
