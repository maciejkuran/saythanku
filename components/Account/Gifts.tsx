import { MouseEvent } from 'react';
import classes from './Gifts.module.scss';
import iconsRemoteUrls from '../../public/giftIconsRemoteUrls';
import Image from 'next/image';

interface Props {
  className?: string;
  giftHandler(giftImgUrl: string): void;
  gift: string;
}

const Gifts = (props: Props): JSX.Element => {
  const selectGiftHandler = (e: MouseEvent<HTMLElement>) => {
    const giftImgUrl = e.currentTarget.dataset.gift as string;
    props.giftHandler(giftImgUrl);
  };

  return (
    <ul className={`${classes.gifts} ${props.className}`}>
      {iconsRemoteUrls.map(icon => (
        <li onClick={selectGiftHandler} data-gift={icon.url} key={icon.url}>
          <Image
            className={icon.url === props.gift ? classes.active : classes.inactive}
            title={icon.name}
            data-gift={icon.url}
            src={icon.url}
            alt={icon.alt}
            height={40}
            width={40}
          />
        </li>
      ))}
    </ul>
  );
};

export default Gifts;
