import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  public alerts = [];

  constructor() {}

  addAlert(alert): void {
    this.alerts.push(alert);
    setTimeout(() => {
      this.closeAlert(alert);
    }, 7000);
  }

  closeAlert(alert): void {
    const index = this.alerts.indexOf(alert);
    if (index !== -1) {
      this.alerts.splice(index, 1);
    }
  }

  showSuccess(successMessage:string){
    const alert = {
      type: 'success',
      dismissible: true,
      message: successMessage,
    };
    this.addAlert(alert);
  }

  showDanger(dangerMessage:string){
    const alert = {
      type: 'danger',
      dismissible: true,
      message: dangerMessage,
    };
    this.addAlert(alert);
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  scrollToBottom(): void {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }
}
