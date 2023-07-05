import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import useHttp from '@/hooks/useHttp';
import Head from 'next/head';
import classes from './index.module.scss';
import Logo from '@/components/UI/Logo';
import reqConfig from '@/utils/reqConfig';
import Notification from '@/components/UI/Notification';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import Portal from '@/components/Portal';
import { GetServerSidePropsContext } from 'next';

const AccountDataChangePage = (): JSX.Element => {
  const router = useRouter();
  const { data: session } = useSession();
  const { sendFetchReq: sendPatchReq, isLoading, data, error, success } = useHttp();

  //If session, sign out user
  useEffect(() => {
    if (session) signOut();
  }, [session]);

  useEffect(() => {
    if (router.isReady && !session) {
      const { id: userId, key } = router.query;

      const timer = setTimeout(() => {
        console.log('sending request...');
        sendPatchReq('/api/users', reqConfig('PATCH', { userId, key }));
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [router, router.isReady, sendPatchReq, session]);

  //Redirect if success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push('/auth');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [router, success]);

  return (
    <>
      <Head>
        <title>Account Data Change - saythanku</title>
        {/* Don't index this page! */}
        <meta name="robots" content="noindex"></meta>
      </Head>
      <section className={classes.activation}>
        <div className={classes['activation__wrapper']}>
          <Logo />
          <h1>Account Data Change</h1>

          {isLoading && <p className={classes['activation__progress']}>In progress ...</p>}
          {(error || success) && (
            <Notification
              type={error ? 'error' : 'success'}
              message={error ? error : data.message}
            />
          )}
        </div>
      </section>

      {isLoading && (
        <Portal>
          <LoadingSpinner />
        </Portal>
      )}
    </>
  );
};

export default AccountDataChangePage;

export const getServerSideProps = (context: GetServerSidePropsContext) => {
  const { id, key } = context.query;

  if (!id || !key) {
    return {
      redirect: {
        destination: '/auth',
        permanent: true,
      },
    };
  }

  return {
    props: {},
  };
};
