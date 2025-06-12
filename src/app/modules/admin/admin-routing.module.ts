import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AuthGuard } from 'src/app/Core/Auth/auth.guard';
import { ProviderslistComponent } from './providerslist/providerslist.component';
import { FacilityListComponent } from './facility-list/facility-list.component';
import { TransactionHistoryComponent } from './transaction-history/transaction-history.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { PatientListComponent } from './patient-list/patient-list.component';
import { AnnouncementComponent } from './announcement/announcement.component';
import { ServiceComponent } from './service/service.component';
import { SettingsComponent } from './settings/settings.component';
import { RoleManagementComponent } from './role-management/role-management.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { UserListComponent } from './user-list/user-list.component';
import { MessageComponent } from './message/message.component';
import { DocumentsComponent } from './documents/documents.component';
import { RefundListComponent } from './refund-list/refund-list.component';
import { AcceptRejectRefundComponent } from './accept-reject-refund/accept-reject-refund.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ComplaintListComponent } from './complaint-list/complaint-list.component';
import { ReportedMessagesListComponent } from './reported-messages-list/reported-messages-list.component';
import { LoginLogsComponent } from './login-logs/login-logs.component';
import { AddBlogComponent } from './add-blog/add-blog.component';
import { ClinicProvidersListComponent } from './clinic-providers-list/clinic-providers-list.component';
import { ConditionsSymptomsComponent } from './conditions-symptoms/conditions-symptoms.component';






const routes: Routes = [{
  path: '', component: AdminComponent,
  children: [
    { path: 'providers-list', component: ProviderslistComponent, canActivate: [AuthGuard], data: { role: 'Admin' } },
    { path: 'facility-list', component: FacilityListComponent, canActivate: [AuthGuard], data: { role: 'Admin' } },
    { path: 'transaction-history', component: TransactionHistoryComponent, canActivate: [AuthGuard], data: { role: 'Admin' } },
    { path: 'dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard], data: { role: 'Admin' } },
    { path: 'patient-list', component: PatientListComponent, canActivate: [AuthGuard], data: { role: 'Admin' } },
    { path: 'announcement', component: AnnouncementComponent, canActivate: [AuthGuard], data: { role: 'Admin' } },
    { path: 'service', component: ServiceComponent, canActivate: [AuthGuard], data: { role: 'Admin' } },
    { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard], data: { role: 'Admin' } },
    { path: 'role', component: RoleManagementComponent, canActivate: [AuthGuard], data: { role: 'Admin' } },
    { path: 'addUser', component: UserManagementComponent, canActivate: [AuthGuard], data: { role: 'Admin' } },
    { path: 'userList', component: UserListComponent, canActivate: [AuthGuard], data: { role: 'Admin' } },
    { path: 'messages', component: MessageComponent },
    { path: 'documents', component: DocumentsComponent },
    { path: 'refundList', component: RefundListComponent, canActivate: [AuthGuard], data: { role: 'Admin' } },
    { path: 'refund', component: AcceptRejectRefundComponent,canActivate: [AuthGuard], data: { role: 'Admin' }  },
    { path: 'notifications', component: NotificationsComponent,canActivate: [AuthGuard], data: { role: 'Admin' }  },
    { path: 'complaintList', component: ComplaintListComponent,canActivate: [AuthGuard], data: { role: 'Admin' }  },
    
    { path: 'reported-messages', component: ReportedMessagesListComponent,canActivate: [AuthGuard], data: { role: 'Admin' }  },
    { path: 'login-logs', component: LoginLogsComponent,canActivate: [AuthGuard], data: { role: 'Admin' }  },
    { path: 'add-blog', component: AddBlogComponent,canActivate: [AuthGuard], data: { role: 'Admin' }  },
    { path: 'clinic-provider', component: ClinicProvidersListComponent,canActivate: [AuthGuard], data: { role: 'Admin' }  },
    { path: 'condition-symptoms', component: ConditionsSymptomsComponent,canActivate: [AuthGuard], data: { role: 'Admin' }  }






  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {
}
