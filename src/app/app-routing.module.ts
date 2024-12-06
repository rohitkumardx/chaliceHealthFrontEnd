import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { AuthGuard } from './Core/Auth/auth.guard';


const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'page-not-found', component: NotFoundComponent
  },

  {
    path: 'admin',
    loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'provider',
    loadChildren: () => import('./modules/provider/provider.module').then(m => m.ProviderModule),
    // canActivate: [AuthGuard],
    // data: { role: 'IndependentProvider' }

  },

  {
    path: 'patient',
    loadChildren: () => import('./modules/patient/patient.module').then(m => m.PatientModule),
    // canActivate: [AuthGuard],
    // data: { role: 'Patient' }
  },

  
  {
    path: 'call',
    loadChildren: () => import('./modules/video-call-process/video-call-process.module').then(m => m.VideoCallProcessModule),
    // canActivate: [AuthGuard],
    // data: { role: 'Patient' }
  },
 
 
  {
    path: '**',
    redirectTo: '/page-not-found'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
