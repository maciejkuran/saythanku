import { useRef, useState, FormEvent } from 'react';
import classes from './SignInForm.module.scss';
import Input from '../UI/Input/Input';
import PrimaryButton from '../UI/Button/PrimaryButton';
import Link from 'next/link';
import Notification from '@/components/UI/Notification';
import LoadingSpinner from '../UI/LoadingSpinner';
import Portal from '../Portal';
import { signIn } from 'next-auth/react';

const SignInForm = (): JSX.Element => {
  const [signInErrorMessage, setSignInErrorMessage] = useState<string | null>(null);
  const [signInLoading, setSignInLoading] = useState<boolean>(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const submitFormHandler = async (e: FormEvent) => {
    e.preventDefault();
    const credentials = {
      email: emailRef.current?.value.trim().toLowerCase(),
      password: passwordRef.current?.value.trim(),
    };

    setSignInLoading(true);
    const logging = await signIn('credentials', { ...credentials, redirect: false });
    if (logging?.error) setSignInErrorMessage(logging.error);
    if (!logging?.error) setSignInErrorMessage(null);
    setSignInLoading(false);
  };

  return (
    <form onSubmit={submitFormHandler} className={classes.signin}>
      <div className={classes['signin__input']}>
        <label htmlFor="email">Email address</label>
        <Input
          ref={emailRef}
          className={classes['signin__input__el']}
          attributes={{ id: 'email', placeholder: 'Email Address', type: 'email' }}
        />
      </div>

      <div className={classes['signin__input']}>
        <label htmlFor="password">Password</label>
        <Input
          ref={passwordRef}
          className={classes['signin__input__el']}
          attributes={{ id: 'password', placeholder: 'Password', type: 'password' }}
        />
      </div>
      <div className={classes['signin__submit']}>
        <PrimaryButton attributes={{ type: 'submit', disabled: signInLoading ? true : false }}>
          Sign In
        </PrimaryButton>
      </div>

      {signInErrorMessage && <Notification type="error" message={signInErrorMessage} />}

      <div className={classes['signin__actions']}>
        <ul>
          <li>
            <Link href="/auth?signup=true">➕ Sign up if you don&apos;t have account.</Link>
          </li>
          <li>
            <Link className={classes['signin__actions__forgotpw']} href="/auth?recovery=true">
              ⚠ Forgot password?
            </Link>{' '}
          </li>
        </ul>
      </div>
      {signInLoading && (
        <Portal>
          <LoadingSpinner />
        </Portal>
      )}
    </form>
  );
};

export default SignInForm;
