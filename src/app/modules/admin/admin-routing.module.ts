import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AuthGuard } from 'src/app/Core/Auth/auth.guard';




const routes: Routes = [{
  path: '', component: AdminComponent,
  children: [
    // { path: 'addEditProperty', component:AddEditPropertyComponent}
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {
}
