import { Injectable } from '@angular/core';
import {Observable} from "rxjs/index";
import {HttpRequestHelperService} from "../../core/http-request-helper.service";
import {InventoryApiEndPoint} from "../inventory-api-end-point";
import {HttpRequestAsyncHelperService} from "../../core/http-request-async-helper.service";
import {ProductModel} from "../model/product-model";
import {ResponseMessage} from "../../core/model/response-message";

@Injectable({
  providedIn: 'root'
})
export class StoreInProductsService {

  constructor(private httpRequestHelperService: HttpRequestHelperService,
              private httpRequestAsyncHelperService: HttpRequestAsyncHelperService) {
  }

  save(data): Observable<any> {
    return this.httpRequestHelperService.postRequest(InventoryApiEndPoint.storeInProducts, data);
  }

  getList(dataTableParameter?:any): Observable<any> {
    return this.httpRequestHelperService.getRequest(InventoryApiEndPoint.storeInProducts+"/list",dataTableParameter);
  }


  public getStoreInAvailableProductListByIdentificationIds(dataTableParameter:any,storeId?:string,barcode?:string, serialNo?:string) {
    return this.httpRequestHelperService.getRequest(InventoryApiEndPoint.storeInProducts+"/identification-ids/"+storeId+"/"+barcode+"/"+serialNo,dataTableParameter);
  }

  public getProductListByStoreId(storeId:string) {
    return this.httpRequestHelperService.getRequestWithUrl(InventoryApiEndPoint.storeInProducts+"/store-id/"+storeId);
  }

  async getProductListByStoreIdAndCategoryIdAsync(storeId:string, categoryId:string) {
    return await this.httpRequestAsyncHelperService.getRequestWithUrl(InventoryApiEndPoint.storeInProducts+"/store-id/category-id/"+storeId+"/"+categoryId);
  }


  getById(id): Observable<any> {
    return this.httpRequestHelperService.getRequestById(InventoryApiEndPoint.storeInProducts, id);
  }

  update(data) {
    return this.httpRequestHelperService.updateRequest(InventoryApiEndPoint.storeInProducts, data);
  }

  delete(id) {
    return this.httpRequestHelperService.deleteRequest(InventoryApiEndPoint.storeInProducts, id);
  }
}
