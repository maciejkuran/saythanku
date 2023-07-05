import { ChangeEvent } from 'react';
import classes from './FileInput.module.scss';
import Image from 'next/image';

interface Props {
  onChange(e: ChangeEvent): void;
  imgUrl: string | null;
  profileImage?: string;
}

const FileInput = ({ onChange, imgUrl, profileImage }: Props): JSX.Element => {
  return (
    <>
      <label>⚠ Profile image will later be sent within your card.</label>
      <div className={classes.file}>
        {profileImage && !imgUrl && (
          <Image
            className={`${classes['file__img']} ${classes['file__img--existing']}`}
            src={profileImage}
            height={60}
            width={60}
            alt="image upload"
          />
        )}
        <label className={classes['file__label']} htmlFor="file">
          ➕ Image
        </label>
        <input
          onChange={onChange}
          accept="image/png, image/jpeg"
          className={classes['file__input']}
          id="file"
          type="file"
        />

        {imgUrl && (
          <Image
            className={classes['file__img']}
            src={imgUrl}
            height={40}
            width={40}
            alt="image upload"
          />
        )}
      </div>
    </>
  );
};

export default FileInput;
