import { Body } from '@react-email/body';

export type EmailBodyHackProps = {
  children?: React.ReactNode;
  style?: React.CSSProperties;
};

const EmailBodyHack = ({ children, style }: EmailBodyHackProps) => {
  return (
    <Body>
      <table width="100%" style={style}>
        <tbody>
          <tr style={{ width: '100%' }}>
            <td>{children}</td>
          </tr>
        </tbody>
      </table>
    </Body>
  );
};

export default EmailBodyHack;
