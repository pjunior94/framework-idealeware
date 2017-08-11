import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { PaymentMercadoPagoComponent } from './payment-mercadopago.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CurrencyFormatModule } from "app/pipes/currency-format/currency-format.module";
import { CreditCartdMaskModule } from "app/directives/creditcart-mask/creditcard-mask.module";
import { OfflinePaymentPanelModule } from "../checkout-payment-offline/payment-offline-panel.module";
import { OfflinePaymentModule } from "../checkout-payment-offline/payment-offline.module";
import { CpfMaskModule } from "app/directives/cpf-mask/cpf-mask.module";


@NgModule({
    declarations: [ PaymentMercadoPagoComponent ],
    imports: [ 
        BrowserModule, 
        FormsModule, 
        ReactiveFormsModule, 
        CurrencyFormatModule, 
        CreditCartdMaskModule,
        CpfMaskModule,
        OfflinePaymentModule,
        OfflinePaymentPanelModule,
    ],
    providers: [],
    exports: [ PaymentMercadoPagoComponent ]
})
export class PaymentMercadoPagoModule {}