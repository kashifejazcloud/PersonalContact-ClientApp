import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Contact, ContactFormValue } from '../../models/contact.model';
import { ContactsService } from '../../services/contacts.service';

@Component({
  selector: 'app-contacts-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contacts-page.html',
  styleUrl: './contacts-page.scss',
})
export class ContactsPageComponent implements OnInit {
  private readonly contactsService = inject(ContactsService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly contacts = signal<Contact[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly editingContactId = signal<number | null>(null);

  protected readonly contactForm = this.formBuilder.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    phoneNumber: ['', [Validators.required, Validators.maxLength(20)]],
    address: ['', [Validators.maxLength(250)]],
  });

  ngOnInit(): void {
    this.loadContacts();
  }

  protected loadContacts(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.contactsService.getContacts().subscribe({
      next: (contacts) => {
        this.contacts.set(contacts);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load contacts.');
        this.isLoading.set(false);
      },
    });
  }

  protected saveContact(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    const formValue: ContactFormValue = this.contactForm.getRawValue();
    const editingId = this.editingContactId();

    if (editingId === null) {
      this.contactsService.createContact(formValue).subscribe({
        next: () => {
          this.resetForm();
          this.loadContacts();
          this.isSaving.set(false);
        },
        error: () => {
          this.errorMessage.set('Unable to create contact.');
          this.isSaving.set(false);
        },
      });

      return;
    }

    const updatedContact: Contact = {
      id: editingId,
      ...formValue,
    };

    this.contactsService.updateContact(updatedContact).subscribe({
      next: () => {
        this.resetForm();
        this.loadContacts();
        this.isSaving.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to update contact.');
        this.isSaving.set(false);
      },
    });
  }

  protected editContact(contact: Contact): void {
    this.editingContactId.set(contact.id);
    this.contactForm.patchValue({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phoneNumber: contact.phoneNumber,
      address: contact.address ?? '',
    });
  }

  protected deleteContact(contact: Contact): void {
    const confirmed = window.confirm(
      `Delete contact "${contact.firstName} ${contact.lastName}"?`
    );

    if (!confirmed) {
      return;
    }

    this.errorMessage.set('');

    this.contactsService.deleteContact(contact.id).subscribe({
      next: () => {
        if (this.editingContactId() === contact.id) {
          this.resetForm();
        }

        this.loadContacts();
      },
      error: () => {
        this.errorMessage.set('Unable to delete contact.');
      },
    });
  }

  protected cancelEdit(): void {
    this.resetForm();
  }

  protected isFieldInvalid(fieldName: keyof ContactFormValue): boolean {
    const field = this.contactForm.controls[fieldName];
    return field.invalid && (field.touched || field.dirty);
  }

  private resetForm(): void {
    this.editingContactId.set(null);
    this.contactForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      address: '',
    });
  }
}