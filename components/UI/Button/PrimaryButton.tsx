import classes from './PrimaryButton.module.scss';

interface Props {
  attributes?: {};
  className?: string;
  children: JSX.Element | JSX.Element[] | string;
}

const PrimaryButton = (props: Props): JSX.Element => {
  return (
    <button {...props.attributes} className={`${classes.button} ${props.className}`}>
      {props.children}
    </button>
  );
};

export default PrimaryButton;
