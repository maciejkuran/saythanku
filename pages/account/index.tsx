import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import useHttp from '@/hooks/useHttp';
import classes from './index.module.scss';
import Head from 'next/head';
import Card from '@/components/UI/Card';
import InfoBox from '@/components/Account/InfoBox';
import NewCard from '@/components/Account/NewCard';
import AccountSettings from '@/components/Account/AccountSettings';
import Overlay from '@/components/UI/Overlay';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { GetServerSidePropsContext } from 'next';
import Portal from '@/components/Portal';
import { getToken } from 'next-auth/jwt';
import Link from 'next/link';
import { CardData } from '@/types/interfaces';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import Notification from '@/components/UI/Notification';
import InfoBoxPlaceholder from '@/components/Account/InfoBoxPlaceholder';
import Image from 'next/image';
import reqConfig from '@/utils/reqConfig';

interface Props {
  newCardQueryIsTrue: boolean;
  settingsQueryIsTrue: boolean;
}

const AccountPage = ({ newCardQueryIsTrue, settingsQueryIsTrue }: Props): JSX.Element => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const router = useRouter();
  const { data: session } = useSession();
  console.log(session);

  const { sendFetchReq, isLoading: fetchReqIsLoading, data, error: fetchError } = useHttp();
  const { sendFetchReq: sendPatchReq } = useHttp();

  //Send fetch req. if path === '/account'
  useEffect(() => {
    if (router.isReady) {
      if (router.asPath === '/account') {
        const timer = setTimeout(() => {
          sendFetchReq('/api/cards');
          setIsRefreshing(false);
        }, 300);

        return () => clearTimeout(timer);
      }
    }
  }, [router.isReady, router.asPath, sendFetchReq, isRefreshing]);

  //Redirect to /account if user enters page with /account?preview=true
  useEffect(() => {
    if (router.isReady && router.asPath === '/account?preview=true' && !data) {
      router.push('/account');
    }
  }, [router, router.isReady, router.asPath, data]);

  const markCardAsReadHandler = (cardId: string): void => {
    sendPatchReq('/api/cards', reqConfig('PATCH', { cardId }));
  };

  return (
    <>
      <Head>
        <title>Account - saythanku</title>
        {/* Don't index this page! */}
        <meta name="robots" content="noindex"></meta>
      </Head>

      <div className={classes.acc}>
        <Card className={`${classes['acc__card']} ${classes['acc__card--1']}`}>
          <section>
            {session && <h5>👋 Hello {session?.user?.name}</h5>}
            <p>We are happy to see you!</p>
            <ul>
              <li>📤 Total cards sent: {data ? data.totalSubmittedCards : '⏳'}</li>
              <li>📥 Total cards received: {data ? data.totalReceivedCards : '⏳'}</li>
            </ul>
            {fetchError && <Notification type="error" message={fetchError} />}
          </section>
        </Card>

        <Card className={`${classes['acc__card']} ${classes['acc__card--2']}`}>
          <section>
            <h5>✨ New Thank You Card</h5>
            <Link href="/account?new-card=true">
              <button>➕</button>
            </Link>
          </section>
        </Card>

        <Card className={`${classes['acc__card']} ${classes['acc__card--3']}`}>
          <section>
            <h5>📤 Submitted Cards</h5>
            {fetchReqIsLoading && <InfoBoxPlaceholder />}
            {data && data.totalSubmittedCards === 0 && (
              <div className={classes['acc__card__empty']}>
                <p>
                  👉 This is the place where all your submitted cards are displayed. You can preview
                  any card that has been sent. Sounds cool?
                </p>
                <Image src="/images/info.svg" height={100} width={100} alt="info" />
              </div>
            )}
            <ul>
              {data &&
                data.submittedCards.map((card: CardData) => (
                  <li key={card._id}>
                    <InfoBox card={card} submitted={true} />
                  </li>
                ))}
            </ul>
          </section>
        </Card>

        <Card className={`${classes['acc__card']} ${classes['acc__card--4']}`}>
          <section>
            <h5>📥 Received Cards</h5>
            {fetchReqIsLoading && <InfoBoxPlaceholder />}
            {data && data.totalReceivedCards === 0 && (
              <div className={classes['acc__card__empty']}>
                <p>
                  👉 In this section, we collect for you all the cards received. You can view your
                  cards at any time.
                </p>
                <Image src="/images/info.svg" height={100} width={100} alt="info" />
              </div>
            )}
            <ul>
              {data &&
                data.receivedCards.map((card: CardData) => (
                  <li key={card._id}>
                    <InfoBox markCardAsReadHandler={markCardAsReadHandler} card={card} />
                  </li>
                ))}
            </ul>
            <button
              onClick={() => setIsRefreshing(true)}
              title="Refresh"
              className={classes['acc__card__refresh-btn']}
            >
              <FontAwesomeIcon icon={faArrowsRotate} />
            </button>
          </section>
        </Card>

        <Card className={`${classes['acc__card']} ${classes['acc__card--5']}`}>
          <section>
            <h5>Account Settings</h5>
            <Link href="/account?settings=true">
              <button>⚙️</button>
            </Link>
          </section>
        </Card>

        <Card className={`${classes['acc__card']} ${classes['acc__card--6']}`}>
          <section>
            <h5>Need Help? Contact Support.</h5>
            <Link target="_blank" href="mailto:saythankuapp@gmail.com?subject=Problem with ...">
              <button>📧</button>
            </Link>
          </section>
        </Card>
      </div>

      {newCardQueryIsTrue && (
        <Portal>
          <NewCard />
        </Portal>
      )}
      {settingsQueryIsTrue && (
        <Portal>
          <AccountSettings />
        </Portal>
      )}
      {(newCardQueryIsTrue || settingsQueryIsTrue) && (
        <Portal>
          <Overlay />
        </Portal>
      )}
      {fetchReqIsLoading && (
        <Portal>
          <LoadingSpinner />
        </Portal>
      )}
    </>
  );
};

export default AccountPage;

//Managing urls
export const getServerSideProps = async ({
  query,
  req,
  resolvedUrl,
}: GetServerSidePropsContext) => {
  const newCardQuery = query['new-card'];
  const settingsQuery = query.settings;
  const previewQuery = query.preview;
  const token = await getToken({ req });

  if (!token) {
    return {
      redirect: {
        destination: '/auth',
        permanent: true,
      },
    };
  }

  if (newCardQuery && newCardQuery === 'true') {
    return {
      props: {
        newCardQueryIsTrue: true,
      },
    };
  }

  if (settingsQuery && settingsQuery === 'true') {
    return {
      props: {
        settingsQueryIsTrue: true,
      },
    };
  }

  if (previewQuery && previewQuery === 'true') {
    return {
      props: {},
    };
  }

  if (resolvedUrl !== '/account') {
    return {
      redirect: {
        permanent: true,
        destination: '/account',
      },
    };
  }

  return {
    props: {},
  };
};
