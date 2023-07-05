import Navbar from './Navbar';
import classes from './LayoutWrapper.module.scss';
import Footer from './Footer';

interface Props {
  children: JSX.Element[] | JSX.Element;
}

const LayoutWrapper = (props: Props) => {
  return (
    <>
      <Navbar />
      <main className={classes.main}>{props.children}</main>
      <Footer />
    </>
  );
};

export default LayoutWrapper;
