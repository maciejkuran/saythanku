import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import classes from './Navbar.module.scss';
import Image from 'next/image';
import Link from 'next/link';
import Logo from '../UI/Logo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket, faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { UserSession } from '@/types/interfaces';

const Navbar = (): JSX.Element => {
  const [mobileNav, setMobileNav] = useState<boolean>(false);
  const { data: session } = useSession();
  const { profileImage } = (session?.user as UserSession) || {};

  const toggleNavOnMobile = () => {
    setMobileNav(state => !state);
  };

  return (
    <header className={classes.header}>
      <nav className={classes.nav}>
        <div className={classes['nav__left']}>
          <Logo />
          <ul className={!mobileNav ? classes.hide : ''}>
            <Link href="/#how-it-works">
              <li>How it Works</li>
            </Link>
            <Link href="/#our-mission">
              <li>Our Mission</li>
            </Link>
          </ul>
        </div>
        <div className={classes['nav__right']}>
          <ul>
            <li onClick={toggleNavOnMobile} className={classes['nav__right__mobile-menu']}>
              <FontAwesomeIcon icon={faEllipsis} className={mobileNav ? classes.active : ''} />
            </li>
            <li title="User Account">
              <Link href="/auth">
                <Image
                  src={!session ? '/images/blank-user-pic.png' : profileImage}
                  height={43}
                  width={43}
                  alt="saythanku user profile image"
                />
              </Link>
            </li>
            {session && (
              <li onClick={() => signOut()} title="Sign Out">
                <FontAwesomeIcon icon={faArrowRightFromBracket} />
              </li>
            )}
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
