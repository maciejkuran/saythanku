import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useHttp from '@/hooks/useHttp';
import Head from 'next/head';
import classes from './activation.module.scss';
import Logo from '@/components/UI/Logo';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import reqConfig from '@/utils/reqConfig';
import Notification from '@/components/UI/Notification';
import { GetServerSidePropsContext } from 'next';
import { getToken } from 'next-auth/jwt';

type Query = [string, string];

const ActivationPage = (): JSX.Element => {
  const { sendFetchReq: sendPostReq, isLoading, data, error, success } = useHttp();
  const router = useRouter();

  //Send POST req
  useEffect(() => {
    if (router && router.isReady) {
      const query = router.query.email_key;

      const [email, uniqueKey] = query as Query;

      if (!query || query?.length !== 2) {
        router.push('/auth');
      }

      const timer = setTimeout(() => {
        const data = { email, uniqueKey };
        sendPostReq('/api/users', reqConfig('POST', data));
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [router, router.isReady, sendPostReq]);

  //Redirect to Sign In Page if signed up successfully
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push('/auth');
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [router, success]);

  return (
    <>
      <Head>
        <title>Account Activation - saythanku</title>
        {/* Don't index this page! */}
        <meta name="robots" content="noindex"></meta>
      </Head>
      <section className={classes.activation}>
        <div className={classes['activation__wrapper']}>
          <Logo />
          <h1>Account Activation</h1>
          {isLoading && (
            <p className={classes['activation__progress']}>Activation in progress ...</p>
          )}
          {isLoading && <LoadingSpinner />}
          {(error || success) && (
            <Notification
              type={error ? 'error' : 'success'}
              message={error ? error : data.message}
            />
          )}
        </div>
      </section>
    </>
  );
};

export default ActivationPage;

export const getServerSideProps = async ({ req }: GetServerSidePropsContext) => {
  const token = await getToken({ req });

  if (token) {
    return {
      redirect: {
        destination: '/account',
        permanent: true,
      },
    };
  }

  return {
    props: {},
  };
};
