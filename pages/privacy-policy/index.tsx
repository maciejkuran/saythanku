import { ReactNode } from 'react';
import classes from './index.module.scss';
import Card from '@/components/UI/Card';
import Head from 'next/head';

const PrivacyPolicyPage = (): ReactNode => {
  return (
    <>
      <Head>
        <title>Privacy Policy - saythanku</title>
        <meta
          name="description"
          content="The Saythanku app is a project done for portfolio purposes. In addition to educational
        purposes, I wanted to create an app that is friendly to everyone."
        />
      </Head>
      <section className={classes.privacy}>
        <h1>Privacy Policy</h1>
        <p>Hi, I am Maciej Kuran-Janowski 👋.</p>
        <p>I designed and made this application.</p>
        <p>
          The Saythanku app is a project done for portfolio purposes. In addition to educational
          purposes, I wanted to create an app that is friendly to everyone.
        </p>
        <p>
          Saythanku is the application the world needs today. Whether you choose to use it is now
          totally up to you.
        </p>
        <Card className={classes['privacy__user-data']}>
          <p>To build an excellent user experience, the app must collect user data.</p>
          <ul>
            <li>👉 During user account registration.</li>
            <li>
              👉 Cards that you send are saved and collected so that you can access the history of
              your submitted/received cards anytime.
            </li>
            <li>
              👉 Data collection is for the sake of the user experience, and the data is not
              processed in any way, much less shared anywhere.
            </li>
          </ul>
        </Card>
        <p></p>
      </section>
    </>
  );
};

export default PrivacyPolicyPage;
