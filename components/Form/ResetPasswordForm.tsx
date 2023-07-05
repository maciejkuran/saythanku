import { useEffect, useRef, FormEvent } from 'react';
import { useRouter } from 'next/router';
import useHttp from '@/hooks/useHttp';
import classes from './ResetPasswordForm.module.scss';
import Input from '../UI/Input/Input';
import PrimaryButton from '../UI/Button/PrimaryButton';
import reqConfig from '@/utils/reqConfig';
import Notification from '../UI/Notification';
import LoadingSpinner from '../UI/LoadingSpinner';
import Portal from '../Portal';

type ArrayQuery = [string, string];

const ResetPasswordForm = () => {
  const { sendFetchReq: sendPostReq, isLoading, data, error, success } = useHttp();
  const router = useRouter();
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  //Redirect to /auth if reset password procedure is completed successfully
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push('/auth');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [success, router]);

  const resetPasswordHandler = (e: FormEvent) => {
    e.preventDefault();
    if (router.isReady) {
      const [userId, uniqueKey] = (router.query.id_key as ArrayQuery) || [];
      const inputData = {
        password: passwordRef.current?.value.trim(),
        confirmPassword: confirmPasswordRef.current?.value.trim(),
      };
      const url = '/api/users/reset-password';
      sendPostReq(url, reqConfig('PATCH', { userId, uniqueKey, ...inputData }));
    }
  };

  return (
    <form onSubmit={resetPasswordHandler} className={classes.reset}>
      <div className={classes['reset__input-wrapper']}>
        <label htmlFor="password">New Password</label>
        <Input
          ref={passwordRef}
          attributes={{ type: 'password', placeholder: 'New password', id: 'password' }}
        />
      </div>
      <div className={classes['reset__input-wrapper']}>
        <label htmlFor="confirm-password">Confirm New Password</label>
        <Input
          ref={confirmPasswordRef}
          attributes={{ type: 'password', placeholder: 'Confirm password', id: 'confirm-password' }}
        />
      </div>
      <div className={classes['reset__submit-btn']}>
        <PrimaryButton>Submit</PrimaryButton>
      </div>
      {(error || success) && (
        <Notification type={error ? 'error' : 'success'} message={error ? error : data.message} />
      )}
      {isLoading && (
        <Portal>
          <LoadingSpinner />
        </Portal>
      )}
    </form>
  );
};

export default ResetPasswordForm;
