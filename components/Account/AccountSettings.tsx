import classes from './AccountSettings.module.scss';
import Card from '../UI/Card';
import CloseButton from '../UI/Button/CloseButton';
import SignUpForm from '../Form/SignUpForm';
import Link from 'next/link';

const AccountSettings = (): JSX.Element => {
  return (
    <Card className={classes.settings}>
      <h4>Account Settings</h4>
      <SignUpForm />
      <Link href="/account">
        <CloseButton />
      </Link>
    </Card>
  );
};

export default AccountSettings;
