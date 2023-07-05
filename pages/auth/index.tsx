import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import classes from './index.module.scss';
import Logo from '@/components/UI/Logo';
import SignInForm from '@/components/Form/SignInForm';
import SignUpForm from '@/components/Form/SignUpForm';
import RecoveryForm from '@/components/Form/RecoveryForm';
import renderAuthHeading from '@/utils/authPage/renderAuthHeading';
import renderAuthPageMeta from '@/utils/authPage/renderAuthPageMeta';
import { getToken } from 'next-auth/jwt';

interface Props {
  isLogging?: boolean;
  isRegistering?: boolean;
  isRecovering?: boolean;
}

const AuthPage = ({ isLogging, isRegistering, isRecovering }: Props): JSX.Element => {
  const router = useRouter();
  const { data: session, status } = useSession();

  //Redirect to /account page if user is authenticated
  useEffect(() => {
    if (status === 'authenticated') router.push('/account');
  }, [router, status]);

  useEffect(() => {
    if (!router || !router.isReady) return;

    const curPath = router.asPath;
    const query = router.query;

    if (
      curPath !== '/auth' &&
      query.recovery !== 'true' &&
      (!query.signup || query.signup !== 'true')
    ) {
      router.push('/auth');
    }
  }, [router, router.isReady]);

  return (
    <>
      <Head>
        <title>{`${renderAuthHeading(isLogging, isRegistering, isRecovering)} - saythanku`}</title>
        <meta
          name="description"
          content={renderAuthPageMeta(isLogging, isRegistering, isRecovering)}
        />
      </Head>
      <section className={classes.auth}>
        <Logo />
        <h1>{renderAuthHeading(isLogging, isRegistering, isRecovering)}</h1>
        {isLogging && <SignInForm />}
        {isRegistering && <SignUpForm signUp={true} />}
        {isRecovering && <RecoveryForm />}
      </section>
    </>
  );
};

export default AuthPage;

//Server checks the url and returns props with state. Based on the props boolean value, the page pre-renders initially a specific form component (great for SEO). Possible re-directions are handled on the client side.
export const getServerSideProps = async ({ resolvedUrl, req }: GetServerSidePropsContext) => {
  const curPath = resolvedUrl;
  const token = await getToken({ req });

  if (token) {
    return {
      redirect: {
        permanent: true,
        destination: '/account',
      },
    };
  }

  if (curPath === '/auth') {
    return {
      props: {
        isLogging: true,
      },
    };
  }

  if (curPath === '/auth?signup=true') {
    return {
      props: {
        isRegistering: true,
      },
    };
  }

  if (curPath === '/auth?recovery=true') {
    return {
      props: {
        isRecovering: true,
      },
    };
  }

  return {
    props: {},
  };
};
