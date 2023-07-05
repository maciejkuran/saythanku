import { useRef, FormEvent } from 'react';
import useHttp from '@/hooks/useHttp';
import classes from './RecoveryForm.module.scss';
import Input from '../UI/Input/Input';
import PrimaryButton from '../UI/Button/PrimaryButton';
import Link from 'next/link';
import reqConfig from '@/utils/reqConfig';
import Notification from '../UI/Notification';
import LoadingSpinner from '../UI/LoadingSpinner';
import Portal from '../Portal';

const RecoveryForm = (): JSX.Element => {
  const emailRef = useRef<HTMLInputElement>(null);
  const { sendFetchReq: sendPostReq, isLoading, data, error, success } = useHttp();

  const recoverAccountHandler = (e: FormEvent) => {
    e.preventDefault();
    const email = emailRef?.current?.value.trim().toLowerCase();
    const url = '/api/users/reset-password';
    sendPostReq(url, reqConfig('POST', { email }));
  };

  return (
    <form onSubmit={recoverAccountHandler} className={classes.recovery}>
      <div>
        <label htmlFor="email">Email Address</label>
        <Input
          ref={emailRef}
          attributes={{ id: 'email', placeholder: 'Email address', type: 'email' }}
        />
      </div>
      <div className={classes['recovery__submit']}>
        <PrimaryButton
          attributes={{ type: 'submit', disabled: isLoading || success ? true : false }}
        >
          Submit
        </PrimaryButton>
      </div>
      {(error || success) && (
        <Notification type={error ? 'error' : 'success'} message={error ? error : data.message} />
      )}
      <ul>
        <li>
          <Link href="/auth?signup=true">👉 Sign up if you don&apos;t have account.</Link>
        </li>
      </ul>
      {isLoading && (
        <Portal>
          <LoadingSpinner />
        </Portal>
      )}
    </form>
  );
};

export default RecoveryForm;
