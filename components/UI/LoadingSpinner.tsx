import { ThreeDots } from 'react-loader-spinner';
import classes from './LoadingSpinner.module.scss';

interface Props {
  className?: string;
  styles?: { height: string; width: string; radius: string; color: string };
}

const defaultStyles = {
  height: '80',
  width: '80',
  radius: '9',
  color: '#989898',
};

const LoadingSpinner = ({ className, styles }: Props) => {
  const applyStyles = styles ? styles : defaultStyles;

  return (
    <ThreeDots
      {...applyStyles}
      ariaLabel="three-dots-loading"
      wrapperStyle={{}}
      wrapperClass={className ? className : classes.spinner}
      visible={true}
    />
  );
};

export default LoadingSpinner;
