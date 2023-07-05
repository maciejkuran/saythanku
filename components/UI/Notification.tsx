import classes from './Notification.module.scss';

interface Props {
  message: string | null | false;
  type: 'error' | 'success';
}

const Notification = ({ message, type }: Props): JSX.Element => {
  return (
    <p className={`${classes.notification} ${type === 'error' ? classes.error : classes.success}`}>
      <span>{type === 'error' ? '⚠' : '👉'}</span> {message}
    </p>
  );
};

export default Notification;
