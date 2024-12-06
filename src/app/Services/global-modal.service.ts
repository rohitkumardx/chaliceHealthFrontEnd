import { Injectable } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Injectable({
  providedIn: 'root'
})
export class GlobalModalService {
  private activeModals: NgbActiveModal[] = [];
  constructor(private modalService: NgbModal) { }
  addActiveModal(activeModal: NgbActiveModal) {
    this.activeModals.push(activeModal);
  }
  closeAllModals() {
    for (const activeModal of this.activeModals) {
      activeModal.close();
    }
    this.activeModals = [];
  }
  formatPhoneNumberForDisplay(value: string): string {
    const cleanedValue = value.replace(/\D/g, ''); // Remove non-numeric characters
    const matches = cleanedValue.match(/^(\d{3})(\d{3})(\d{4})$/);

    if (matches) {
      return `(${matches[1]})-${matches[2]}-${matches[3]}`;
    } else {
      return value; // Return the original value if it doesn't match the expected format
    }
  }
}
