import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-thank-you',
  templateUrl: './thank-you.component.html',
  styleUrls: ['./thank-you.component.css']
})
export class ThankYouComponent {
  message: any;
  showMessage: boolean;
  constructor(private router: Router,
    private route: ActivatedRoute) { }
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.message = params['request'];


    });
    this.getMessage();
  }
  routerNevigate() {
    this.router.navigate(['/login'])
  }
  getMessage() {
    if (this.message == 'forgot-password') {
      this.showMessage = true;
    }
  }
  redirectToDoctorSearch(){
    this.router.navigate(['/patient/appointment-list'])
  }
}
