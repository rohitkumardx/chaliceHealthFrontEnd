import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class PopUpService {

  constructor() { }
   private popupSubject = new Subject<string>();
  popup$ = this.popupSubject.asObservable();

  showPopup(message: string) {
    this.popupSubject.next(message);
  }
}
