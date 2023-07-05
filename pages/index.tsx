import classes from './index.module.scss';
import PrimaryButton from '@/components/UI/Button/PrimaryButton';
import Image from 'next/image';
import Card from '@/components/UI/Card';
import iconsRemoteUrls from '../public/giftIconsRemoteUrls';
import { ourMissionIcons } from '../public/icons/icons';
import Link from 'next/link';

const HomePage = (): JSX.Element => {
  return (
    <>
      <header className={classes.header}>
        <div>
          <h6>Don&apos;t wait any longer.</h6>
          <h1>
            Say Thank You<span>!</span>
          </h1>
          <p>
            Expressing gratitude and appreciation to other people is incredibly important. With the
            saythanku app, you may send a <span>breathtaking customized thank you card</span> for
            free! Sign up and use our tool right now!
          </p>
          <Link href="/auth">
            <PrimaryButton>Get Started</PrimaryButton>
          </Link>
        </div>

        <Image height={276} width={173} alt="saythanku app" src="/images/home.png" />
      </header>

      <section id={'how-it-works'} className={classes['how-it-works']}>
        <h2>It&apos;s as Easy as Pie 🍰</h2>
        <p>We made it easy for you. The rest depends on you!</p>
        <ul>
          <li>
            <Card className={classes['how-it-works__card']}>
              <h6>🚀 Sign Up for an Account.</h6>
            </Card>
          </li>
          <li>
            <Card className={classes['how-it-works__card']}>
              <h6>✍️ Write Honestly What You Want to Thank For.</h6>
            </Card>
          </li>
          <li>
            <Card className={classes['how-it-works__card']}>
              <h6>🎁 Choose a Digital Gift.</h6>
              <div className={classes['how-it-works__icons']}>
                {iconsRemoteUrls.map(icon => (
                  <Image src={icon.url} key={icon.url} alt={icon.alt} width={50} height={50} />
                ))}
              </div>
            </Card>
          </li>
          <li>
            <Card className={classes['how-it-works__card']}>
              <h6>📧 Ready? We Will Send it to the Recipient For You.</h6>
            </Card>
          </li>
        </ul>
      </section>

      <section id={'our-mission'} className={classes['our-mission']}>
        <h3>Our Mission 💡</h3>
        <div className={classes['our-mission__description']}>
          <p>
            We emphasize the value of the word <span>thank you! </span>
            We live in a highly competitive world, people set high standards and strive for
            perfection. This leads to a constant focus on improvement and criticism. We lack the
            ability to appreciate and be thankful.
          </p>
        </div>
        <ul>
          {ourMissionIcons.map(icon => {
            return (
              <li key={icon.src}>
                <Card className={classes['our-mission__card']}>
                  <Image height={68} width={68} src={icon} alt={icon.alt} />
                  <h5>{icon.title}</h5>
                  <p>{icon.description}</p>
                </Card>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={classes['get-started']}>
        <Card className={classes['get-started__card']}>
          <h3>Don&apos;t Wait Any Longer!</h3>
          <div>
            <Link href="/auth">
              <PrimaryButton>Get Started</PrimaryButton>
            </Link>
          </div>
        </Card>
      </section>
    </>
  );
};

export default HomePage;
