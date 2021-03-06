import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CartService } from '../services/cart.service';
import { CartItem } from '../models/cart/cart-item';
import { Cart } from '../models/cart/cart';
import { Product } from '../models/product/product';
import { Sku } from '../models/product/sku';
import { Shipping } from "../models/shipping/shipping";
import { Service } from "../models/product-service/product-service";
import { isPlatformBrowser } from '@angular/common';
import { AppCore } from '../app.core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AppConfig } from '../app.config';
import { AbandonedCart } from '../models/cart/abandoned-cart';
import { CookieService } from 'ngx-cookie-service';
import { GoogleTagsService } from '../services/google-tags.service';

declare var dataLayer: any;
declare var toastr: any;

@Injectable({
    providedIn: 'root'
})
export class CartManager {

    private cart: Cart;
    private cartSubject = new BehaviorSubject<Cart>(new Cart());

    constructor(
        private service: CartService,
        private cookie: CookieService,
        private googleTagsService: GoogleTagsService,
        @Inject(PLATFORM_ID) private platformId: Object) {
    }

    /**
     * Retorna o carrinho pela API
     * 
     * @param {string} cartId ID do carrinho
     * @returns {Observable<Cart>} 
     * @memberof CartManager
     */
    getCart(): Observable<Cart> {
        if (isPlatformBrowser(this.platformId)) {
            return this.cartSubject.asObservable();
        }
    }

    /**
     * Pré carga do cart para que todos lugares que utilizam o cart comece a escutar o cart carregado.
     */
    loadCart(): Observable<Cart> {
        if (isPlatformBrowser(this.platformId)) {
            const cartId = this.getCartId();
            if (cartId)
                return this.service.getCart(cartId)
                    .pipe(tap(cart => {
                        this.nextSubject(cart);
                        this.cart = cart;
                    }, error => { throw new Error(`${error.error} Status: ${error.status}`) }));
            else {
                return this.service.getCart(AppCore.createGuid())
                    .pipe(tap(cart => {
                        this.nextSubject(cart);
                        this.cart = cart;
                    }, error => { throw new Error(`${error.error} Status: ${error.status}`) }));
            }
        }
    }

    /**
     * Retorna o CEP armazenado no localStorage
     * @private
     * @returns {number} 
     * @memberof CartManager
     */
    private getZipcode(): number {
        if (isPlatformBrowser(this.platformId)) {
            if (localStorage.getItem('customer_zipcode'))
                return Number(localStorage.getItem('customer_zipcode').replace('-', ''));
            return 0;
        }
        return 0;
    }

    /**
     * Retorna o ID da Session armazenado no localStorage
     * @private
     * @returns {string} 
     * @memberof CartManager
     */
    private getSessionId(): string {
        if (isPlatformBrowser(this.platformId)) {
            return localStorage.getItem('session_id');
        }
        return null;
    }

    /**
     * Salva o ID do carrinho na localStorage
     * @param {string} id 
     * @memberof CartManager
     */
    setCartId(id: string) {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('cart_id', id);
        }
    }

    /**
     * Retorna o ID do carrinho armazenado no localStorage
     * @returns {string} 
     * @memberof CartManager
     */
    getCartId(): string {
        if (isPlatformBrowser(this.platformId)) {
            const id = localStorage.getItem('cart_id');
            return id && id != 'undefined' ? id : null;
        }
        return null;
    }

    /**
     * Atualiza todos os lugares que utilizam o cart
     * @param cart 
     */
    nextSubject(cart: Cart) {
        if (isPlatformBrowser(this.platformId)) {
            this.cartSubject.next(cart);
            this.setCartId(cart.id);
        }
    }

    /**
     * Atualiza o cart de acordo com a emissão de outros componentes
     * @param {Cart} cart Novo cart
     */
    updateCartFromEmitter(cart: Cart) {
        if (isPlatformBrowser(this.platformId)) {
            this.nextSubject(cart);
        }
    }

    /**
     * Adiciona um produto ao carrinho
     * Se não houver um carrinho existente, um novo será criado
     * 
     * @param {string} cartId ID do carrinho
     * @param {Product} product Produto à ser a adicionado ao carrinho
     * @param {Sku} sku SKU selecionado
     * @param {number} quantity Quantidade de produtos
     * @param {string} feature Detalhes adicionais (opcional)
     * @returns {Observable<Cart>} Carrinho com produto
     * @memberof CartManager
     */
    purchase(product: Product, sku: Sku, quantity: number, feature: string): Observable<Cart> {
        if (isPlatformBrowser(this.platformId)) {
            this.googleTagsService.addToCart(product, sku);
            if (this.cart) {
                this.cart.origin = this.getOrigin();
                return this.addItem(this.cart.id, sku.id, quantity, feature)
                    .pipe(tap(cart => this.nextSubject(cart)))
            }
            else {
                this.cart = new Cart();
                this.cart.origin = this.getOrigin();
                let cartItem = new CartItem().createFromProduct(product, sku, feature, quantity);
                this.cart.products.push(cartItem);
                return this.createCart(this.cart).pipe(tap(cart => {
                    this.cart = cart;
                    this.nextSubject(cart);
                }));
            }
        }
    }

    /**
     * Adiciona um produto à um carrinho já existente
     * 
     * @param {string} cartId 
     * @param {string} skuId 
     * @param {number} quantity 
     * @param {string} feature 
     * @returns {Observable<Cart>} 
     * @memberof CartManager
     */
    addItem(cartId: string, skuId: string, quantity: number, feature: string): Observable<Cart> {
        if (isPlatformBrowser(this.platformId)) {
            let item = {
                "skuId": skuId,
                "quantity": quantity,
                "feature": feature,
                "origin": this.getOrigin()
            };
            return this.service.sendToCart(item, cartId)
                .pipe(tap(cart => this.nextSubject(cart)));
        }
    }

    /**
     * Adiciona um serviço à um carrino já existente
     * 
     * @param {string} serviceId 
     * @param {number} quantity 
     * @param {string} cartId 
     * @returns {Observable<Cart>} 
     * @memberof CartManager
     */
    addService(serviceId: string, quantity: number, cartId: string): Observable<Cart> {
        if (isPlatformBrowser(this.platformId)) {
            let item = {
                "serviceId": serviceId,
                "quantity": quantity
            };
            return this.service.sendServiceToCart(item, cartId)
                .pipe(tap(cart => this.nextSubject(cart)));
        }
    }

    /**
     * Cria um carrinho na API
     * 
     * @param {Cart} cart 
     * @returns {Observable<Cart>} 
     * @memberof CartManager
     */
    private createCart(cart: Cart): Observable<Cart> {
        if (isPlatformBrowser(this.platformId)) {
            let session_id: string = this.getSessionId();
            let zipCode: number = this.getZipcode();
            let origin = this.getOrigin();
            return this.service.createCart(cart, session_id, zipCode, origin)
                .pipe(tap(cart => {
                    this.cart = cart;
                    this.nextSubject(cart);
                }));
        }
    }

    /**
     * Atualiza um produto já adicionado ao carrinho
     * 
     * @param {CartItem} item 
     * @param {string} cartId 
     * @returns {Observable<Cart>} 
     * @memberof CartManager
     */
    updateItem(item: CartItem, cartId: string): Observable<Cart> {
        if (isPlatformBrowser(this.platformId)) {
            return this.service.updateItem(item, cartId)
                .pipe(tap(cart => this.nextSubject(cart)));
        }
    }

    /**
     * Atualiza um produto já adicionado ao carrinho
     * 
     * @param {CartItem} item 
     * @param {string} cartId 
     * @returns {Observable<Cart>} 
     * @memberof CartManager
     */
    updateIsPackageItem(item: CartItem, cartId: string): Observable<Cart> {
        if (isPlatformBrowser(this.platformId)) {
            return this.service.updateIsPackageItem(item, cartId)
                .pipe(tap(cart => this.nextSubject(cart)));
        }
    }

    /**
     * Atualiza um serviço já adicionado ao carrinho
     * 
     * @param {Service} item 
     * @param {string} cartId 
     * @returns {Observable<Cart>} 
     * @memberof CartManager
     */
    updateItemService(item: Service, cartId: string): Observable<Cart> {
        if (isPlatformBrowser(this.platformId)) {
            return this.service.updateItemService(item, cartId)
                .pipe(tap(cart => this.nextSubject(cart)));
        }
    }

    /**
     * Remove um produto do carrinho
     * 
     * @param {CartItem} item 
     * @param {string} cartId 
     * @returns {Observable<Cart>} 
     * @memberof CartManager
     */
    deleteItem(item: CartItem, cartId: string): Observable<Cart> {
        if (isPlatformBrowser(this.platformId)) {
            this.googleTagsService.removeFromCart(item);
            return this.service.deleteItem(item, cartId)
                .pipe(tap(cart => this.nextSubject(cart)))
        }
    }

    /**
     * Remove um serviço do carrinho
     * 
     * @param {string} serviceId 
     * @param {string} cartId 
     * @returns {Observable<Cart>} 
     * @memberof CartManager
     */
    deleteService(serviceId: string, cartId: string): Observable<Cart> {
        if (isPlatformBrowser(this.platformId)) {
            return this.service.deleteService(serviceId, cartId)
                .pipe(tap(cart => this.nextSubject(cart)))
        }

    }

    /**
     * Remove o carrinho
     */
    removeCart() {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('cart_id');
            this.nextSubject(new Cart());
        }
    }

    /**
     * Adiciona frete calculado ao carrinho
     * 
     * @param {Shipping} shipping 
     * @param {string} cartId 
     * @returns {Observable<Cart>} 
     * @memberof CartManager
     */
    setShipping(shipping: Shipping, cartId: string): Observable<Cart> {
        if (isPlatformBrowser(this.platformId)) {
            return this.service.setShipping(shipping, cartId)
                .pipe(tap(cart => this.nextSubject(cart)))
        }
    }

    /**
     * Associa um cliente à um carrinho
     * 
     * @param {string} cartId 
     * @returns {Observable<Cart>} 
     * @memberof CartManager
     */
    setCustomerToCart(): Observable<Cart> {
        if (isPlatformBrowser(this.platformId)) {
            return this.service.setCustomerToCart(this.getCartId())
                .pipe(tap(cart => this.setCartId(cart.id)));
        }
    }


    /**
     * Adiciona endereço de entrega ao carrinho
     * 
     * @param {string} cartId 
     * @param {string} addressId 
     * @returns {Observable<Cart>} 
     * @memberof CartManager
     */
    addDeliveryAddress(cartId: string, addressId: string): Observable<Cart> {
        if (isPlatformBrowser(this.platformId)) {
            return this.service.addDeliveryAddress(cartId, addressId)
                .pipe(tap(cart => this.nextSubject(cart)));
        }
    }

    /**
     * Adiciona endereço de cobrança ao carrinho
     * 
     * @param {string} cartId 
     * @param {string} addressId 
     * @returns {Observable<Cart>} 
     * @memberof CartManager
     */
    addBillingAddress(cartId: string, addressId: string): Observable<Cart> {
        if (isPlatformBrowser(this.platformId)) {
            return this.service.addBillingAddress(cartId, addressId)
                .pipe(tap(cart => this.nextSubject(cart)));
        }
    }

    isMobile(): boolean {
        if (isPlatformBrowser(this.platformId)) {
            return AppCore.isMobile(window);
        }
        else return false;
    }

    getOrigin(): string {
        if (isPlatformBrowser(this.platformId)) {
            if (this.isMobile())
                return "mobile";
            return "desktop";
        }
    }

    haveCart() {
        if (isPlatformBrowser(this.platformId)) {
            return this.cart ? true : false;
        }
    }

    /**
     * criar carrinho abandonado
     */
    createAbandonedCart(isAbandonedCart: boolean): Observable<AbandonedCart> {
        return this.service.createAbandonedCart(this.getCartId(),
            AppConfig.DOMAIN,
            this.cookie.get("customer_email"), isAbandonedCart);
    }

    /**
     * Remove o carrinho abandonado
     */
    removeAbandonedCart() {
        if (isPlatformBrowser(this.platformId)) {
            return this.service.deleteAbandonedCart(this.getCartId(), AppConfig.DOMAIN);
        }
    }
}