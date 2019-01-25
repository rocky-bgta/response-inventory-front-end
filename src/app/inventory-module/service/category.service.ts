import {Injectable} from '@angular/core';
import {HttpRequestHelperService} from "../../core/http-request-helper.service";
import {Observable} from "rxjs/index";
import {InventoryApiEndPoint} from "../inventory-api-end-point";
import {RequestMessage} from "../../core/model/request-message";


@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private httpRequestHelperService: HttpRequestHelperService) {
  }

  save(data): Observable<any> {
    return this.httpRequestHelperService.postRequest(InventoryApiEndPoint.category, data);
  }

 /* getList(): Observable<any> {
    return this.httpRequestHelperService.getRequest(InventoryApiEndPoint.category+"getAll");
  }
*/
  getList(dataTableParameter?:any): Observable<any> {
    return this.httpRequestHelperService.getRequest(InventoryApiEndPoint.category+"/list",dataTableParameter);
  }

  getCategoryListByStoreId(storeId:string): Observable<any> {
    return this.httpRequestHelperService.getRequestById(InventoryApiEndPoint.category+"/store-id",storeId);
  }


  getById(id): Observable<any> {
    return this.httpRequestHelperService.getRequestById(InventoryApiEndPoint.category, id);
  }

  update(data) {
    return this.httpRequestHelperService.updateRequest(InventoryApiEndPoint.category, data);
  }

  delete(id) {
    return this.httpRequestHelperService.deleteRequest(InventoryApiEndPoint.category, id);
  }


}
