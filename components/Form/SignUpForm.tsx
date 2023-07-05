import { useRef, FormEvent, ChangeEvent } from 'react';
import { useSession } from 'next-auth/react';
import useHttp from '@/hooks/useHttp';
import useImageUpload from '@/hooks/useImageUpload';
import classes from './SignUpForm.module.scss';
import Input from '../UI/Input/Input';
import FileInput from '../UI/Input/FileInput';
import PrimaryButton from '../UI/Button/PrimaryButton';
import Link from 'next/link';
import Notification from '../UI/Notification';
import profilePicture from '../../config/profilePicture';
import reqConfig from '@/utils/reqConfig';
import LoadingSpinner from '../UI/LoadingSpinner';
import Portal from '../Portal';
import appImages from '@/public/appImagesRemoteUrls';
import { UserSession } from '@/types/interfaces';

interface Props {
  signUp?: boolean;
}

const SignUpForm = (props: Props): JSX.Element => {
  const nameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const { getImageFile, imgUrl, imgUploadError } = useImageUpload(profilePicture);
  //prettier-ignore
  const { sendFetchReq: sendSignUpReq, isLoading: signUpReqIsLoading, data: signUpReqData, error: signUpReqError, success: signUpReqSuccess } = useHttp();
  const { data: session } = useSession();
  const { name, lastName, email, _id, profileImage } = (session?.user as UserSession) || {};

  const submitProfileImage = () => {
    if (props.signUp) {
      if (imgUrl) return imgUrl;
      if (!imgUrl) return appImages.blankUserPicture;
    }

    if (!props.signUp) {
      if (imgUrl) return imgUrl;
      if (!imgUrl) return profileImage;
    }
  };

  const submitFormHandler = (e: FormEvent) => {
    e.preventDefault();
    const formData = {
      name: nameRef.current?.value.trim(),
      lastName: lastNameRef.current?.value.trim(),
      email: emailRef.current?.value.trim().toLowerCase(),
      password: passwordRef.current?.value.trim(),
      confirmPassword: confirmPasswordRef.current?.value.trim(),
      profileImage: submitProfileImage(),
      ...(!props.signUp && { userId: _id }),
    };

    if (props.signUp) {
      const apiUrl = '/api/users/sign-up-request';
      sendSignUpReq(apiUrl, reqConfig('POST', formData));
    }

    if (!props.signUp) {
      const apiUrl = '/api/users/credentials-change-request';
      sendSignUpReq(apiUrl, reqConfig('POST', formData));
    }
  };

  const getFileHandler = (e: ChangeEvent<HTMLInputElement>) => {
    getImageFile(e);
  };

  return (
    <form onSubmit={submitFormHandler} className={classes.form}>
      <div className={classes['form__inputs']}>
        <div>
          <label htmlFor="name">Name</label>
          <Input
            ref={nameRef}
            attributes={{
              id: 'name',
              type: 'text',
              placeholder: 'Name',
              defaultValue: !props.signUp && session ? name : undefined,
            }}
          />
        </div>
        <div>
          <label htmlFor="lastName">Last Name</label>
          <Input
            ref={lastNameRef}
            attributes={{
              id: 'lastName',
              type: 'text',
              placeholder: 'Last Name',
              defaultValue: !props.signUp && session ? lastName : undefined,
            }}
          />
        </div>
      </div>
      <div>
        <div>
          <label htmlFor="email">Email Address</label>
          <Input
            ref={emailRef}
            attributes={{
              id: 'email',
              type: 'text',
              placeholder: 'Email',
              defaultValue: !props.signUp && session ? email : undefined,
            }}
          />
        </div>
      </div>
      <div>
        <div>
          <label htmlFor="password">Password</label>
          <Input
            ref={passwordRef}
            attributes={{ id: 'password', type: 'password', placeholder: 'Password' }}
          />
        </div>
      </div>
      <div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <Input
            ref={confirmPasswordRef}
            attributes={{
              id: 'confirmPassword',
              type: 'password',
              placeholder: 'Confirm password',
            }}
          />
        </div>
      </div>
      <FileInput profileImage={profileImage} imgUrl={imgUrl} onChange={getFileHandler} />

      {/* Handling Errors */}
      {(imgUploadError || signUpReqError) && (
        <Notification type="error" message={imgUploadError ? imgUploadError : signUpReqError} />
      )}

      {/* Handling Success on Sign Up */}
      {signUpReqData && <Notification type="success" message={signUpReqData.message} />}

      <div className={classes['form__submit']}>
        <PrimaryButton
          attributes={{ disabled: signUpReqIsLoading || signUpReqSuccess ? true : false }}
        >
          {props.signUp ? 'Sign Up' : 'Submit'}
        </PrimaryButton>
      </div>
      {props.signUp && (
        <div className={classes['form__actions']}>
          <ul>
            <li>
              <Link href="/auth">👉 Already have an account?</Link>{' '}
            </li>
          </ul>
        </div>
      )}
      {signUpReqIsLoading && (
        <Portal>
          <LoadingSpinner />
        </Portal>
      )}
    </form>
  );
};

export default SignUpForm;
