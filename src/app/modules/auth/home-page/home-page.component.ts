import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit , AfterViewInit {

  @ViewChild('sliderWrapper') sliderWrapper!: ElementRef<HTMLDivElement>;
  @ViewChild('sliderWrapper2') sliderWrapper2!: ElementRef<HTMLDivElement>;
  currentIndex = 0;
  slideWidth: number = 0;
  totalSlides: number = 0;
  slideWidth2: number = 0;
  totalSlides2: number = 0;
  constructor(private router: Router) { }
  ngOnInit() {

  }



  ngAfterViewInit() {
    // Set the initial width of the slides after the view is initialized
    this.slideWidth = this.sliderWrapper.nativeElement.clientWidth / 4; // Divide by 4 for 4 visible slides
    this.totalSlides = this.sliderWrapper.nativeElement.children.length;
    this.slideWidth2 = this.sliderWrapper2.nativeElement.clientWidth / 4; // Divide by 4 for 4 visible slides
    this.totalSlides2 = this.sliderWrapper2.nativeElement.children.length;
    this.updateSlider();
  }

  nextSlide() {
    if (this.currentIndex < this.totalSlides - 4) {
      this.currentIndex += 1; // Move by one group of 4 slides
    } else {
      this.currentIndex = 0; // Loop back to the first group of slides
    }
    this.updateSlider();
  }

  prevSlide() {
    if (this.currentIndex > 0) {
      this.currentIndex -= 1; // Move by one group of 4 slides
    } else {
      this.currentIndex = this.totalSlides - 4; // Loop back to the last group of slides
    }
    this.updateSlider();
  }

  prevSlide2() {
    if (this.currentIndex < this.totalSlides - 4) {
      this.currentIndex += 1; // Move by one group of 4 slides
    } else {
      this.currentIndex = 0; // Loop back to the first group of slides
    }
    this.updateSlider2();
  }
  
  nextSlide2(){ if (this.currentIndex < this.totalSlides - 4) {
    this.currentIndex += 1; // Move by one group of 4 slides
  } else {
    this.currentIndex = 0; // Loop back to the first group of slides
  }
  this.updateSlider2();
}

  updateSlider() {
    const wrapper = this.sliderWrapper.nativeElement;
    const slideItems = wrapper.children as HTMLCollectionOf<HTMLElement>;  
    if (slideItems.length > 0) {
      const slideWidth = slideItems[0].offsetWidth;
      wrapper.style.transform = `translateX(-${this.currentIndex * slideWidth}px)`;
    }
  }
  updateSlider2() {
    const wrapper = this.sliderWrapper2.nativeElement;
    const slideItems = wrapper.children as HTMLCollectionOf<HTMLElement>;  
    if (slideItems.length > 0) {
      const slideWidth = slideItems[0].offsetWidth;
      wrapper.style.transform = `translateX(-${this.currentIndex * slideWidth}px)`;
    }
  }

  redirectToDoctorSearch(){
  
    this.router.navigate(['/patient/doctor-search'], { queryParams: { request: 'withoutLogin' } });
  }
  navigateToPatientSignup() {
    this.router.navigate(['/signup'], { queryParams: { request: 'PatientPortal' } });
  }
  navigateToPatientLogin() {
    this.router.navigate(['/login'], { queryParams: { request: 'PatientPortal' } });
  }
  navigateToDoctorSignup() {
    this.router.navigate(['/signup'], { queryParams: { request: 'ProviderPortal' } });
  }
  navigateToDoctorLogin() {
    this.router.navigate(['/login'], { queryParams: { request: 'ProviderPortal' } });
  }
}
