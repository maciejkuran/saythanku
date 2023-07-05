import { useRouter } from 'next/router';
import classes from './PreviewCard.module.scss';
import Card from '../UI/Card';
import Image from 'next/image';
import CloseButton from '../UI/Button/CloseButton';
import PrimaryButton from '../UI/Button/PrimaryButton';
import { CardData } from '@/types/interfaces';

interface Props {
  hideHandler(): void;
  submitted?: boolean;
  card: CardData;
}

const PreviewCard = ({ hideHandler, card, submitted }: Props): JSX.Element => {
  const router = useRouter();
  const { senderName, senderLastName, senderEmail, senderPicture, cardTitle, cardContent, gift } =
    card;

  const replyHandler = () => {
    hideHandler();
    if (router.isReady) router.push(`/account?new-card=true&reply-to=${senderEmail}`);
  };

  const closePreviewHandler = () => {
    hideHandler();
    router.push('/account');
  };

  return (
    <Card className={classes.preview}>
      <div className={classes['card-content']}>
        <div className={classes['card-content__title']}>
          <Image
            className={classes['card-content__sender-img']}
            height={80}
            width={80}
            alt={`${senderName} ${senderLastName}`}
            src={senderPicture}
          />

          <h4>{cardTitle}</h4>
        </div>

        <p>{cardContent}</p>

        <div className={classes['card-content__gift']}>
          <h6>🎁 {`${senderName} ${senderLastName}`} is sending you a gift! </h6>
          <Image
            height={120}
            width={120}
            alt={`A gift from ${senderName} ${senderLastName}`}
            src={gift}
          />
        </div>
      </div>
      <div className={classes['card-content__reply']}>
        {!submitted && <PrimaryButton attributes={{ onClick: replyHandler }}>Reply!</PrimaryButton>}
      </div>
      <CloseButton attributes={{ onClick: closePreviewHandler }} />
      <span>PREVIEW</span>
    </Card>
  );
};

export default PreviewCard;
