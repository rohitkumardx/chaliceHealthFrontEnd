import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent {
  @Input() loadingText = '';
  @Input() spinnerWidth = '1.42rem';
  @Input() spinnerHeight = '1.42rem';
  @Input() spinnerColor = '#fff';
  @Input() additionalClasses: string;
}
