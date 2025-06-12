// shared.module.ts
import { NgModule } from '@angular/core';
import { NumbersOnlyDirective } from './directives/numbers-only/numbers-only.directive';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ConditionalValidationDirective } from './directives/conditional-validation/conditional-validation.directive';
import { LoaderComponent } from './components/loader/loader.component';
import { SingleSelectDropDownComponent } from './components/single-select-drop-down/single-select-drop-down.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PhoneFormatPipe } from './pipes/phone-format/phone-format.pipe';
import { TreeviewComponent } from './components/treeview/treeview.component';
import { TruncatePipe } from './pipes/truncate-pipe/truncate.pipe';
import { TableFilterComponent } from './components/table-filter/table-filter.component';
import { PaginationComponent } from "./components/pagination/pagination.component";
import { AutoCapitalizeDirective } from './directives/auto-capitalize/auto-capitalize.directive';
import { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';
import { LettersOnlyDirective } from './directives/letters-only/letters-only.directive';
import { SsnFormatDirective } from './directives/ssn-format/ssn-format.directive';
import { MaskPipe } from "./pipes/mask/mask-pipe";
import { ShortNamePipe } from './pipes/short-name/short-name.pipe';
import { NoConsecutiveSpacesDirective} from './directives/no-trailing-spaces/no-consecutive-spaces.directive';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FooterComponent } from './components/footer/footer.component';
import { CapitalizeFirstLetterPipe } from './pipes/capitalize-first-letter.pipe';
import { DeletePopupComponent } from './components/delete-popup/delete-popup.component';
import { AudioRecordingComponent } from './components/audio-recording/audio-recording.component';
import { MinAgeValidatorDirective } from './directives/validators/min-age.directive';
import { HeaderComponent } from './components/header/header.component';
import { MainFooterComponent } from './components/main-footer/main-footer.component';



@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    NgbModule
  ],
  declarations: [
    NotFoundComponent,
    NumbersOnlyDirective,
    ConditionalValidationDirective,
    LoaderComponent,
    SingleSelectDropDownComponent,
    TreeviewComponent,
    PhoneFormatPipe,
    TruncatePipe,
    MaskPipe,
    TableFilterComponent,
    PaginationComponent,
    AutoCapitalizeDirective,
    ConfirmationModalComponent,
    LettersOnlyDirective,
    SsnFormatDirective,
    NoConsecutiveSpacesDirective,
    ShortNamePipe,
    SidebarComponent,
    FooterComponent,
    CapitalizeFirstLetterPipe,
    DeletePopupComponent,
    AudioRecordingComponent,
    MinAgeValidatorDirective,
    HeaderComponent,
    MainFooterComponent 

  
  ],
  exports: [
    NotFoundComponent,
    NumbersOnlyDirective,
    NgbModule,
    ConditionalValidationDirective,
    LoaderComponent,
    SingleSelectDropDownComponent,
    PhoneFormatPipe,
    MaskPipe,
    ShortNamePipe,
    TableFilterComponent,
    TreeviewComponent,
    PhoneFormatPipe,
    PaginationComponent,
    AutoCapitalizeDirective,
    LettersOnlyDirective,
    SsnFormatDirective,
    NoConsecutiveSpacesDirective,
    SidebarComponent,
    FooterComponent,
    AudioRecordingComponent,
    CapitalizeFirstLetterPipe,
    MinAgeValidatorDirective,
    HeaderComponent,
    CommonModule,
    MainFooterComponent
  ]
})
export class SharedModule {
}
