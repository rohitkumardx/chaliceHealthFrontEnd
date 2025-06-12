import { Component ,Input} from '@angular/core';

@Component({
  selector: 'app-message-pop-up',
  templateUrl: './message-pop-up.component.html',
  styleUrls: ['./message-pop-up.component.css']
})
export class MessagePopUpComponent {
  @Input() message = '';
  @Input() show = false;

  closePopup() {
    this.show = false;
  }
}
