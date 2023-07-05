import classes from './Logo.module.scss';
import Image from 'next/image';
import Link from 'next/link';

const Logo = (): JSX.Element => {
  return (
    <Link href="/">
      <div className={classes.logo}>
        <Image src="/icons/love.png" height={27} width={27} alt="saythanku logo" />
        <h5>saythanku</h5>
      </div>
    </Link>
  );
};

export default Logo;
