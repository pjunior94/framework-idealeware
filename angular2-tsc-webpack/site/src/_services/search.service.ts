import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {HttpClient} from '../httpclient'
import {AppSettings} from '../app.settings';
import {ProductPicture} from '../_models/product/product-picture';
import {Search} from '../_models/search/search';
import { NgProgressService } from "ngx-progressbar";
import { Product } from "../_models/product/product";

@Injectable()
export class SearchService{

    constructor(
        private client: HttpClient,
        private loaderService: NgProgressService
    ){ }

    searchFor(search: Search, pageNumber: number = null, pageSize: number = null): Promise<Product[]>{
        return new Promise((resolve, reject) => {
            // let url = `${AppSettings.API_SEARCH}/search?Page=${pageNumber}&PageSize=${pageSize}`;
            let url = `${AppSettings.API_SEARCH}/search`;
            
            this.client.post(url, search)
            .map(res => {
                let pagination = res.headers.get('x-pagination');
                return res.json();
            })
            .subscribe(response => {
                let products = response.map(p => p = new Product(p));
                resolve(products);
            }, error => reject(error));
        });
    }
}