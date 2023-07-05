import classes from './Footer.module.scss';
import Logo from '../UI/Logo';
import Link from 'next/link';

const Footer = (): JSX.Element => {
  return (
    <footer className={classes.footer}>
      <div>
        <Logo />
        <p>Copyright©</p>
        <p>Designed & developed by Maciej Kuran-Janowski.</p>
        <Link href="/privacy-policy">Privacy Policy</Link>
      </div>
    </footer>
  );
};

export default Footer;
