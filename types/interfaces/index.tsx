export interface CardData {
  recipientEmail: string;
  senderName: string;
  senderLastName: string;
  senderEmail: string;
  senderPicture: string;
  senderId: string;
  cardTitle: string;
  cardContent: string;
  wordsCount: number;
  gift: string;
  read: boolean;
  [props: string]: any;
}

export interface UserSession {
  name: string;
  lastName: string;
  email: string;
  _id: string;
  profileImage: string;
}
