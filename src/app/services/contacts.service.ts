import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Contact, ContactFormValue } from '../models/contact.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ContactsService {
  private readonly http = inject(HttpClient);  ;
  private readonly baseUrl = `${environment.apiBaseUrl}/contacts`;

  getContacts() {
    return this.http.get<Contact[]>(this.baseUrl);
  }

  getContact(id: number) {
    return this.http.get<Contact>(`${this.baseUrl}/${id}`);
  }

  createContact(contact: ContactFormValue) {
    return this.http.post<Contact>(this.baseUrl, contact);
  }

  updateContact(contact: Contact) {
    return this.http.put<void>(`${this.baseUrl}/${contact.id}`, contact);
  }

  deleteContact(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}