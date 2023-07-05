import classes from './index.module.scss';
import Head from 'next/head';
import Logo from '@/components/UI/Logo';
import ResetPasswordForm from '@/components/Form/ResetPasswordForm';
import { GetServerSidePropsContext } from 'next';
import { getToken } from 'next-auth/jwt';

const ResetPasswordPage = (): JSX.Element => {
  return (
    <>
      <Head>
        <title>Account Activation - saythanku</title>
        {/* Don't index this page! */}
        <meta name="robots" content="noindex"></meta>
      </Head>
      <section className={classes.recovery}>
        <div className={classes['recovery__wrapper']}>
          <Logo />
          <h1>Reset Password</h1>
          <ResetPasswordForm />
        </div>
      </section>
    </>
  );
};

export default ResetPasswordPage;

//Basic checking & possible server redirections
export const getServerSideProps = async ({ req, params }: GetServerSidePropsContext) => {
  const token = await getToken({ req });
  const query = params?.id_key as string[];

  if (token) {
    return {
      redirect: {
        destination: '/account',
        permanent: true,
      },
    };
  }

  if (query.length !== 2) {
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
