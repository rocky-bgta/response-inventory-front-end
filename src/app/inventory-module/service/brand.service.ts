import {Injectable} from '@angular/core';
import {HttpRequestHelperService} from "../../core/http-request-helper.service";
import {Observable} from "rxjs/index";
import {InventoryApiEndPoint} from "../inventory-api-end-point";


@Injectable({
  providedIn: 'root'
})
export class BrandService {

  constructor(private httpRequestHelperService: HttpRequestHelperService) {
  }

  save(data): Observable<any> {
    return this.httpRequestHelperService.postRequest(InventoryApiEndPoint.brand, data);
  }

  getList(dataTableParameter?:any): Observable<any> {
    return this.httpRequestHelperService.getRequest(InventoryApiEndPoint.brand+"/list",dataTableParameter);
  }


  getById(id): Observable<any> {
    return this.httpRequestHelperService.getRequestById(InventoryApiEndPoint.brand, id);
  }

  update(data) {
    return this.httpRequestHelperService.updateRequest(InventoryApiEndPoint.brand, data);
  }

  delete(id) {
    return this.httpRequestHelperService.deleteRequest(InventoryApiEndPoint.brand, id);
  }


}
