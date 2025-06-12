import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/Services/auth.service';

@Component({
  selector: 'app-thank-you',
  templateUrl: './thank-you.component.html',
  styleUrls: ['./thank-you.component.css']
})
export class ThankYouComponent {
  userInfo: any;
  message: any;
  showMessage: boolean;
  constructor(private router: Router,
    private route: ActivatedRoute,
  private authService: AuthService) { }
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.message = params['request'];


    });
    this.getMessage();
    this.userInfo = this.authService.getUserInfo();
    console.log("local storage from thankyou:", this.userInfo);
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
