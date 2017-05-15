import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { PaymentPagseguroComponent } from './payment-pagseguro.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CurrencyFormatModule } from "../_pipes/currency-format.module";
import { CreditCartdMaskModule } from "../_directives/creditCart-mask/creditCard-mask.module";
import { OfflinePaymentPanelModule } from "../checkout-payment-offline/payment-offline-panel.module";
import { OfflinePaymentModule } from "../checkout-payment-offline/payment-offline.module";

@NgModule({
    declarations: [ PaymentPagseguroComponent ],
    imports: [ 
        BrowserModule, 
        FormsModule, 
        ReactiveFormsModule, 
        CurrencyFormatModule, 
        CreditCartdMaskModule,
        OfflinePaymentModule,
        OfflinePaymentPanelModule,
    ],
    providers: [],
    exports: [ PaymentPagseguroComponent ]
})
export class PaymentPagseguroModule {}