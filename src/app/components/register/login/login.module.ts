import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { LoginComponent } from "./login.component";
import { NotAuthGuard } from "../../../guards/not-auth.guard";

@NgModule({
    declarations: [
        LoginComponent,
    ],
    imports: [
        RouterModule.forChild([
            { path: '', component: LoginComponent, canActivate: [NotAuthGuard] },
        ]),
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
    ]
})
export class LoginModule { }