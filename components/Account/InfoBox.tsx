import { useRouter } from 'next/router';
import useModal from '@/hooks/useModal';
import classes from './InfoBox.module.scss';
import Card from '../UI/Card';
import PreviewCard from './PreviewCard';
import Portal from '../Portal';
import Overlay from '../UI/Overlay';
import { CardData } from '@/types/interfaces';
import formatDateShort from '@/utils/formatDateShort';

interface Props {
  submitted?: boolean;
  card: CardData;
  markCardAsReadHandler?(cardId: string): void;
}

const InfoBox = ({ submitted, card, markCardAsReadHandler }: Props): JSX.Element => {
  const router = useRouter();
  const { showModal, showHandler, hideHandler } = useModal();
  const { senderName, senderLastName, recipientEmail, createdAt, _id, read } = card;

  const previewHandler = () => {
    showHandler();
    router.push('/account?preview=true');
    if (markCardAsReadHandler && !submitted) {
      markCardAsReadHandler(_id);
    }
  };

  return (
    <>
      <Card
        className={`${classes.infobox} ${!read && !submitted ? classes['infobox--unread'] : ''}`}
      >
        <p>
          {submitted ? 'Recipient' : 'Sender'}:{' '}
          {submitted ? recipientEmail : `${senderName} ${senderLastName}`}
        </p>
        <div>
          <p className={classes['infobox__date']}>{formatDateShort(createdAt)}</p>
          <button onClick={previewHandler}>VIEW</button>
        </div>
        {!read && !submitted && <span className={classes['infobox__new']}>NEW</span>}
      </Card>
      {showModal && (
        <Portal>
          <Overlay />
          <PreviewCard submitted={submitted} card={card} hideHandler={hideHandler} />
        </Portal>
      )}
    </>
  );
};

export default InfoBox;
