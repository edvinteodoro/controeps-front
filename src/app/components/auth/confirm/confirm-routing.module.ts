import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ConfirmComponent } from './confirm.component';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: ConfirmComponent }
    ])],
    exports: [RouterModule]
})
export class ConfirmRoutingModule { }
