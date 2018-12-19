import { Injectable } from '@angular/core';
import {Observable} from "rxjs/index";
import {HttpRequestHelperService} from "../../core/http-request-helper.service";
import {InventoryApiEndPoint} from "../inventory-api-end-point";

@Injectable({
  providedIn: 'root'
})
export class StoreInProductsService {

  constructor(private httpRequestHelperService: HttpRequestHelperService) {
  }

  save(data): Observable<any> {
    return this.httpRequestHelperService.postRequest(InventoryApiEndPoint.storeInProducts, data);
  }

  getList(dataTableParameter?:any): Observable<any> {
    return this.httpRequestHelperService.getRequest(InventoryApiEndPoint.storeInProducts+"/list",dataTableParameter);
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
