//prettier-ignore
import {useState, useRef, useEffect, ChangeEvent, MouseEvent,KeyboardEvent, FormEvent,} from 'react';
import useHttp from '@/hooks/useHttp';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import useModal from '@/hooks/useModal';
import classes from './NewCard.module.scss';
import Card from '../UI/Card';
import Input from '../UI/Input/Input';
import TextArea from '../UI/Input/TextArea';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFaceSmile } from '@fortawesome/free-regular-svg-icons';
import Gifts from './Gifts';
import PrimaryButton from '../UI/Button/PrimaryButton';
import CloseButton from '../UI/Button/CloseButton';
import EmojiPicker from 'emoji-picker-react';
import Notification from '../UI/Notification';
import { UserSession, CardData } from '../../types/interfaces/index';
import LoadingSpinner from '../UI/LoadingSpinner';
import Portal from '../Portal';
import Link from 'next/link';
import reqConfig from '@/utils/reqConfig';

const NewCard = (): JSX.Element => {
  const [replyQuery, setReplyQuery] = useState<boolean | string>(false);
  const router = useRouter();
  const { showModal: emojiBox, showHandler: showEmojiBox, hideHandler: hideEmojiBox } = useModal();
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const [emailInput, setEmailInput] = useState<string>('');
  const [cardContent, setCardContent] = useState<string>('');
  const [gift, setGift] = useState<string>('');
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [wordsCount, setWordsCount] = useState<number>(0);
  const { data: session } = useSession();
  const {
    name: senderName,
    lastName: senderLastName,
    email: senderEmail,
    _id: senderId,
    profileImage: senderPicture,
  } = (session?.user as UserSession) || {};
  const {
    sendFetchReq: sendCard,
    isLoading: sendCardIsLoading,
    data: sendCardData,
    error: sendCardError,
    success: sendCardSuccess,
  } = useHttp();
  const {
    sendFetchReq: getRecipientData,
    isLoading: recipientDataIsLoading,
    data: recipientData,
    error: recipientDataError,
    success: recipientDataSuccess,
  } = useHttp();

  //Get recipient data
  useEffect(() => {
    if (emailInput.includes('@') && emailInput.includes('.')) {
      const timer = setTimeout(() => {
        getRecipientData(`/api/users?email=${emailInput}`);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [getRecipientData, emailInput]);

  //redirect to /account when new card was successfully submitted
  useEffect(() => {
    if (sendCardSuccess) {
      const timer = setTimeout(() => {
        router.push('/account');
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [router, sendCardSuccess]);

  useEffect(() => {
    if (router.isReady) {
      const replyQuery = router.query['reply-to'] as string;

      if (replyQuery) setReplyQuery(replyQuery);
    }
  }, [router.isReady, router.query]);

  //Counting wordsCount in 'card content'
  useEffect(() => {
    //Stay update after 500ms
    const timer = setTimeout(() => {
      const words = cardContent.split(' ').length as number;
      setWordsCount(words);
    }, 300);

    //Cleanup function to prevent state update on every keystroke
    return () => clearTimeout(timer);
  }, [cardContent]);

  const submitNewCardHandler = (e: FormEvent) => {
    e.preventDefault();

    const data: CardData = {
      recipientEmail: emailInput.trim().toLowerCase() as string,
      senderName,
      senderLastName,
      senderEmail,
      senderPicture,
      senderId,
      cardTitle: titleRef?.current?.value.trim() as string,
      cardContent,
      wordsCount,
      gift,
      read: false,
    };

    const url = '/api/cards';
    sendCard(url, reqConfig('POST', data));
  };

  const getCursorPositionHandler = (e: MouseEvent | KeyboardEvent<HTMLTextAreaElement>) => {
    hideEmojiBox();

    if (e.target instanceof HTMLTextAreaElement) {
      setCursorPosition(e.target.selectionStart);
    }
  };

  const cardContentHandler = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setCardContent(e.target.value);
  };

  const emojiPickerHandler = (emojiObj: { emoji: string }) => {
    const clickedEmoji = emojiObj.emoji;
    //Setting new state for the card content
    setCardContent((cardContent: string) => {
      return (
        cardContent?.slice(0, cursorPosition) + clickedEmoji + cardContent?.slice(cursorPosition)
      );
    });
  };

  const giftHandler = (giftImgUrl: string) => {
    setGift(giftImgUrl);
  };

  return (
    <Card className={classes.new}>
      <h4>{replyQuery ? '✨ You reply to the card' : '✨ New Card'}</h4>
      <form onSubmit={submitNewCardHandler}>
        <div className={classes['input-wrap']}>
          <label htmlFor="recipient">Recipient Email Address</label>
          <Input
            attributes={{
              onChange: (e: ChangeEvent<HTMLInputElement>) => setEmailInput(e.target.value),
              defaultValue: replyQuery ? replyQuery : undefined,
              id: 'recipient',
              placeholder: 'Recipient email address',
            }}
          />
          {recipientDataIsLoading && (
            <LoadingSpinner
              styles={{ height: '45', width: '45', radius: '9', color: '#989898' }}
              className={classes.spinner}
            />
          )}
        </div>
        {(recipientDataSuccess || recipientDataError) && (
          <Card className={classes['found-user-list']}>
            <ul>
              <li>
                {recipientDataSuccess && (
                  <Image
                    height={35}
                    width={35}
                    src={recipientData.user.profileImage}
                    alt="saythanku user"
                  />
                )}
                {recipientDataSuccess && (
                  <p>
                    Found {recipientData.user.name} {recipientData.user.lastName}
                  </p>
                )}
                {recipientDataError && (
                  <p>
                    {recipientDataError} Don&lsquo;t worry! We will deliver your card and the
                    recipient will have the opportunity to sign up and respond! 👍
                  </p>
                )}
              </li>
            </ul>
          </Card>
        )}
        <div className={classes['input-wrap']}>
          <label htmlFor="title">Card Title</label>
          <TextArea
            ref={titleRef}
            attributes={{
              spellCheck: 'false',
              id: 'title',
              placeholder: 'It will build the first impression.',
              rows: '1',
            }}
          />
        </div>
        <div className={`${classes['input-wrap']} ${classes['input-wrap__content']}`}>
          <label htmlFor="content">Card Content (max. 100 words)</label>
          <div className={classes['input-wrap__textarea']}>
            <TextArea
              attributes={{
                value: cardContent,
                onChange: cardContentHandler,
                onClick: getCursorPositionHandler,
                onKeyUp: getCursorPositionHandler,
                spellCheck: 'false',
                id: 'content',
                placeholder: 'What would you like to thank for?',
                rows: '4',
              }}
            />
            <button type="button" onClick={showEmojiBox} title="Emoji picker">
              <FontAwesomeIcon icon={faFaceSmile} />
            </button>
          </div>
          {emojiBox && (
            <div className={classes['input-wrap__emoji']}>
              <EmojiPicker onEmojiClick={emojiPickerHandler} height={400} width={280} />
              <CloseButton
                attributes={{ title: 'Close', onClick: hideEmojiBox }}
                className={classes['input-wrap__emoji__close']}
              />
            </div>
          )}
        </div>
        {wordsCount > 100 && (
          <Notification type="error" message={`Words count: ${wordsCount}/100`} />
        )}

        <div className={classes['new__gift']}>
          <label>Choose a Digital Gift</label>
          <Gifts gift={gift} giftHandler={giftHandler} />
        </div>

        {(sendCardError || sendCardSuccess) && (
          <Notification
            type={sendCardError ? 'error' : 'success'}
            message={sendCardError ? sendCardError : sendCardData.message}
          />
        )}

        <div className={classes['new__submit-btn']}>
          <PrimaryButton
            attributes={{
              type: 'submit',
              disabled: sendCardIsLoading || sendCardSuccess ? true : false,
            }}
          >
            Send!
          </PrimaryButton>
        </div>
        <Link href="/account">
          <CloseButton />
        </Link>
      </form>
      {sendCardIsLoading && (
        <Portal>
          <LoadingSpinner />
        </Portal>
      )}
    </Card>
  );
};

export default NewCard;
