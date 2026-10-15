import { Component, signal } from '@angular/core';
import { NgForm } from '@angular/forms';

export interface ContactModel {
  name: string;
  email: string;
  phone: string;
  message: string;
}

@Component({
  selector: 'app-contact-form',
  standalone: false,
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.css',
})
export class ContactForm {
  readonly model: ContactModel = { name: '', email: '', phone: '', message: '' };
  readonly submitted = signal(false);
  readonly sentMessage = signal<ContactModel | null>(null);

  onSubmit(form: NgForm): void {
    this.submitted.set(true);
    this.sentMessage.set(null);

    if (form.invalid) {
      return;
    }

    this.sentMessage.set({ ...this.model });
    form.resetForm();
    this.submitted.set(false);
  }
}
