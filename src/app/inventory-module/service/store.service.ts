import {Injectable} from '@angular/core';
import {HttpRequestHelperService} from "../../core/http-request-helper.service";
import {Observable} from "rxjs/index";
import {InventoryApiEndPoint} from "../inventory-api-end-point";


@Injectable({
  providedIn: 'root'
})
export class StoreService {

  constructor(private httpRequestHelperService: HttpRequestHelperService) {
  }

  save(data): Observable<any> {
    return this.httpRequestHelperService.postRequest(InventoryApiEndPoint.store, data);
  }

  getList(dataTableParameter?:any): Observable<any> {
    return this.httpRequestHelperService.getRequest(InventoryApiEndPoint.store+"/list",dataTableParameter);
  }


  getById(id): Observable<any> {
    return this.httpRequestHelperService.getRequestById(InventoryApiEndPoint.store, id);
  }

  update(data) {
    return this.httpRequestHelperService.updateRequest(InventoryApiEndPoint.store, data);
  }

  delete(id) {
    return this.httpRequestHelperService.deleteRequest(InventoryApiEndPoint.store, id);
  }


}
