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
import appImages from '@/public/appImagesRemoteUrls';

interface Props {
  senderName: string;
  senderLastName: string;
  senderPicture: string;
  cardTitle: string;
  cardContent: string;
  gift: string;
}

export default function CardEmail({
  senderName,
  senderLastName,
  senderPicture,
  cardTitle,
  cardContent,
  gift,
}: Props) {
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
          <Img src={appImages.logo} width="160" style={{ margin: 'auto' }} />
          <Section style={{ marginTop: '50px' }}>
            <Img
              src={senderPicture}
              alt={`${senderName} ${senderLastName}`}
              width="100"
              style={{ margin: 'auto', borderRadius: '50%' }}
            />
            <Heading style={{ textAlign: 'center' }}>{cardTitle}</Heading>
            <Hr />
            <Text style={{ fontSize: '16px' }}>{cardContent}</Text>
          </Section>
          <Section>
            <Hr />
            <Heading style={{ textAlign: 'center', fontSize: '20px', fontWeight: '600' }}>
              🎁 {`${senderName} ${senderLastName}`} is sending you a gift!
            </Heading>
            <Img src={gift} alt="thankuapp" width="120" style={{ margin: 'auto' }} />
          </Section>
          <Section style={{ textAlign: 'center', marginTop: '20px' }}>
            <Hr />
            <Heading style={{ textAlign: 'center', fontSize: '20px', fontWeight: '600' }}>
              Wanna reply?
            </Heading>
            <Text>
              ⚠ If you don&lsquo;t have an account yet, please sign up first. You will get access to
              all your received cards once you sign in to your account.
            </Text>
            <Text style={{ fontWeight: '600' }}>
              ⚠ Please make sure you sign up with the same email address!
            </Text>
            <Button
              target="_blank"
              pX={20}
              pY={12}
              href={`${process.env.NEXT_PUBLIC_VERCEL_URL}/auth`}
              style={{
                background: '#000',
                color: '#fff',
                textAlign: 'center',
                borderRadius: '10px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Reply
            </Button>
          </Section>
        </Container>
      </EmailBodyHack>
    </Html>
  );
}
