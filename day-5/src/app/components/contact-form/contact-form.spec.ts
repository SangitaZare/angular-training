import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { ContactForm } from './contact-form';

describe('ContactForm', () => {
  let component: ContactForm;
  let fixture: ComponentFixture<ContactForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [ContactForm],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not accept submission when required fields are empty', () => {
    const form = fixture.debugElement.query(By.css('form'));
    form.triggerEventHandler('ngSubmit', null);

    expect(component.submitted()).toBe(true);
    expect(component.sentMessage()).toBeNull();
  });

  it('should submit and reset once all fields are valid', async () => {
    component.model.name = 'Sangita';
    component.model.email = 'sangita@example.com';
    component.model.message = 'Hello, this is a test message.';
    fixture.detectChanges();
    await fixture.whenStable();

    const form = fixture.debugElement.query(By.css('form'));
    form.triggerEventHandler('ngSubmit', null);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.sentMessage()).toEqual(
      expect.objectContaining({ name: 'Sangita', email: 'sangita@example.com' }),
    );
    expect(component.model.name).toBeNull();
  });
});
