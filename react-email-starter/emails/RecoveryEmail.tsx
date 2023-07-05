import * as React from 'react';
import { Button } from '@react-email/button';
import { Html } from '@react-email/html';
import Font from '../components/Font';
import { Head } from '@react-email/head';
import { Text } from '@react-email/text';
import { Heading } from '@react-email/heading';
import { Container } from '@react-email/container';
import { Section } from '@react-email/section';
import { Img } from '@react-email/img';
import { Hr } from '@react-email/hr';
import EmailBodyHack from '../components/EmailBodyHack';
import appImages from '../../public/appImagesRemoteUrls';

interface Props {
  url: string;
}

export default function RecoveryEmail({ url }: Props) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Poppins"
          fallbackFontFamily="Arial"
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <EmailBodyHack style={{ background: '#f7f7f7' }}>
        <Container
          style={{
            marginTop: '100px',
            marginBottom: '100px',
            background: '#ffffff',
            padding: '30px',
            maxWidth: '600px',
            width: '100%',
            borderRadius: '10px',
          }}
        >
          <Img src={appImages.logo} alt="thankuapp" width="160" style={{ margin: 'auto' }} />
          <Section>
            <Heading style={{ textAlign: 'center', marginTop: '50px' }}>Account Recovery</Heading>
            <Hr />
            <Text style={{ fontWeight: '600', fontSize: '22px' }}>
              Did You Request a Password Change?
            </Text>
            <Text style={{ fontSize: '16px' }}>
              If you did not request a password change, please ignore this email! To proceed the
              password change, please click on the button below.
            </Text>
            <Text style={{ fontWeight: '600', fontSize: '16px' }}>
              ⚠ Please note, that the link below will expire in 1 hour.
            </Text>
          </Section>
          <Section style={{ textAlign: 'center' }}>
            <Button
              target="_blank"
              pX={20}
              pY={12}
              href={url}
              style={{
                background: '#000',
                color: '#fff',
                textAlign: 'center',
                borderRadius: '10px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Change Password
            </Button>
          </Section>
        </Container>
      </EmailBodyHack>
    </Html>
  );
}
