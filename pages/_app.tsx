import { useRouter } from 'next/router';
import '@/styles/globals.scss';
import type { AppProps } from 'next/app';
import LayoutWrapper from '@/components/Layout/LayoutWrapper';
import Head from 'next/head';
import { SessionProvider } from 'next-auth/react';

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const router = useRouter();

  const defaultHead = (
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      <link rel="icon" href="/icons/love.png" />
      <title>saythanku</title>
      <meta
        name="description"
        content="With the saythanku app, you will send a wonderful customized thank you card for free!"
      />
    </Head>
  );

  if (router.asPath.includes('/auth') || router.asPath.includes('/account-data-change')) {
    return (
      <SessionProvider session={session}>
        {defaultHead}
        <Component {...pageProps} />
      </SessionProvider>
    );
  }

  return (
    <SessionProvider session={session}>
      <LayoutWrapper>
        {defaultHead}
        <Component {...pageProps} />
      </LayoutWrapper>
    </SessionProvider>
  );
}
