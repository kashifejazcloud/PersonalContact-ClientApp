export interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string | null;
}

export type ContactFormValue = Omit<Contact, 'id'>;