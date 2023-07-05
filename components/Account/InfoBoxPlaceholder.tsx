import classes from './InfoBoxPlaceholder.module.scss';
import Card from '../UI/Card';

const InfoBoxPlaceholder = () => {
  return (
    <ul className={classes.placeholder}>
      <li>
        <div className={classes['placeholder__left']}>
          <div></div>
        </div>
        <div className={classes['placeholder__right']}>
          <div className={classes['placeholder__right__date']}></div>
          <div></div>
        </div>
      </li>
      <li>
        <div className={classes['placeholder__left']}>
          <div></div>
        </div>
        <div className={classes['placeholder__right']}>
          <div className={classes['placeholder__right__date']}></div>
          <div></div>
        </div>
      </li>
    </ul>
  );
};

export default InfoBoxPlaceholder;
