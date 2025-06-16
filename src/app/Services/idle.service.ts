import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, fromEvent, merge, timer, Subscription } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
@Injectable({ providedIn: 'root' })
export class IdleService implements OnDestroy {
 private idleTimeout = 60 * 1000; // 1 Minute
private warningTime = 30 * 1000; // 30 Seconds
private maxIdleDuration = 60 * 1000; // 1 Minute
private resetIdle$ = new Subject<void>();
private activitySubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private modalService: NgbModal
  ) {
    this.checkPreviousSession();
    this.startWatching();
    window.addEventListener('beforeunload', this.onBeforeUnload.bind(this));
  }
 
  private checkPreviousSession() {
    const lastActive = localStorage.getItem('lastActiveAt');
    if (lastActive) {
      const lastTime = parseInt(lastActive, 10);
      const now = Date.now();
      if (now - lastTime > this.maxIdleDuration) {
        this.logoutUser(true); // Silent logout
      }
    }
  }
 
  private startWatching() {
    const activityEvents = merge(
      fromEvent(document, 'mousemove'),
      fromEvent(document, 'keydown'),
      fromEvent(document, 'click')
    );
    const userInfo=this.authService.getUserInfo();
 if(userInfo!=null){
 this.activitySubscription = activityEvents.pipe(
      tap(() => {
        this.resetIdle$.next();
        localStorage.setItem('lastActiveAt', Date.now().toString());
      }),
      switchMap(() =>
        timer(this.idleTimeout - this.warningTime).pipe(
          tap(() =>
            this.notificationService.showDanger('You will be logged out soon due to inactivity.')
          ),
          switchMap(() => timer(this.warningTime)),
          tap(() => this.handleLogout())
        )
      )
    ).subscribe();
 }
  }
 
  private handleLogout() {
    if (this.modalService.hasOpenModals()) {
      this.modalService.dismissAll();
    }
    this.logoutUser();
  }
 
private logoutUser(silent: boolean = false) {
  // Store the current page first
  localStorage.setItem('returnUrl', this.router.url);
  
  // Also store the role of the currently authenticated user
  const userInfo = this.authService.getUserInfo();
  if (userInfo && userInfo.accountType) {
    localStorage.setItem('returnRole', userInfo.accountType);
  }
  
  localStorage.removeItem('lastActiveAt');
  if (!silent) {
    this.notificationService.showDanger('You have been logged out due to inactivity.')
  }
  this.authService.logOut();
  this.router.navigate(['/login']); 
}

  private onBeforeUnload(event: BeforeUnloadEvent) {
    localStorage.setItem('lastActiveAt', Date.now().toString());
  }
 
  ngOnDestroy() {
    this.activitySubscription?.unsubscribe();
    window.removeEventListener('beforeunload', this.onBeforeUnload.bind(this));
  }
}
 
 

