import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {HttpClient} from '../httpclient';
import {AppSettings} from '../app.settings';
import {NgProgressService} from 'ngx-progressbar';
import {Token} from '../_models/customer/token';
import { Order } from '../_models/order/order';
import { Cart } from "../_models/cart/cart";

@Injectable()
export class OrderService{
    
    private token: Token;
    
    constructor(
        private client: HttpClient,
        private loader: NgProgressService
    ){

    }

    private getToken(){
        this.token = new Token();
        this.token.accessToken = localStorage.getItem('auth');
        this.token.createdDate = new Date(localStorage.getItem('auth_create'));
        this.token.expiresIn = Number(localStorage.getItem('auth_expires'));
        this.token.tokenType = 'Bearer';
    }

    public hasToken(): boolean{
        if(localStorage.getItem('auth')) return true;
        else return false;
    }

    public getOrder(id: string): Promise<Order>{
        return new Promise((resolve, reject) => {
            let url = `${AppSettings.API_ORDER}/order/${id}`;
            this.getToken();
            this.client.get(url, this.token)
            .map(res => res.json())
            .subscribe(response => {
                let order = new Order(response);
                resolve(order);
            }, error => reject(error));
        });
    }

    public getOrders(): Promise<Order[]>{
        return new Promise((resolve, reject) => {
            let url = `${AppSettings.API_ORDER}/order/customer`
            this.getToken();
            this.client.get(url, this.token)
                .map(res => res.json())
                .subscribe(response => {
                    let orders = response.map(order => order = new Order(order));
                    resolve(orders);
                }, error => reject(error));
        });
    }

    public placeOrder(cartId: string): Promise<Order>{
        return new Promise((resolve, reject) => {
            let url = `${AppSettings.API_ORDER}/Order/${cartId}`;
            this.getToken();
            this.client.post(url, null, this.token)
            .map(res => res.json())
            .subscribe(response => {
                let order = new Order(response);
                resolve(order);
            }, error => reject(error));
        });
    }

    public validateOrder(cartId: string): Promise<Cart>{
        return new Promise((resolve, reject) => {
            // let url = `${AppSettings.API_ORDERVALIDATION}/OrderValidation/${cartId}`;
            // this.client.post(url, null)
            // .map(res => res.json())
            // .subscribe(response => {
            //     let cart = new Cart(response);
            //     resolve(cart);
            // }, error => reject(error));

            resolve(new Cart());
        });
    }
}