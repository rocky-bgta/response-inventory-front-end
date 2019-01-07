import {Injectable} from '@angular/core';
import {HttpRequestHelperService} from "../../core/http-request-helper.service";
import {Observable} from "rxjs/index";
import {InventoryApiEndPoint} from "../inventory-api-end-point";
import {HttpRequestAsyncHelperService} from "../../core/http-request-async-helper.service";
import {ResponseMessage} from "../../core/model/response-message";


@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private httpRequestHelperService: HttpRequestHelperService,
              private httpRequestAsyncHelperService: HttpRequestAsyncHelperService) {
  }

  save(data): Observable<any> {
    return this.httpRequestHelperService.postRequest(InventoryApiEndPoint.product, data);
  }

 /* getList(): Observable<any> {
    return this.httpRequestHelperService.getRequest(InventoryApiEndPoint.product+"getAll");
  }
*/
  getList(dataTableParameter:any): Observable<any> {
    return this.httpRequestHelperService.getRequest(InventoryApiEndPoint.product+"/list",dataTableParameter);
  }

  getProductViewList(dataTableParameter:any): Observable<any> {
    return this.httpRequestHelperService.getRequest(InventoryApiEndPoint.product+"/list-view",dataTableParameter);
  }


  getById(id): Observable<any> {
    return this.httpRequestHelperService.getRequestById(InventoryApiEndPoint.product, id);
  }

  getByBarcode(barcode:string): Observable<any> {
    return this.httpRequestHelperService.getRequestById(InventoryApiEndPoint.product +'/barcode', barcode);
  }

  async getByBarcodeAsync(barcode:string): Promise<ResponseMessage> {
    return await this.httpRequestAsyncHelperService.getRequestById(InventoryApiEndPoint.product +'/barcode', barcode);
  }

  update(data) {
    return this.httpRequestHelperService.updateRequest(InventoryApiEndPoint.product, data);
  }

  delete(id) {
    return this.httpRequestHelperService.deleteRequest(InventoryApiEndPoint.product, id);
  }


  saveImage(data): Observable<any> {
    return this.httpRequestHelperService.postRequest(InventoryApiEndPoint.product+"/image", data);
  }

  getImage(): Observable<any> {
    return this.httpRequestHelperService.getRequest(InventoryApiEndPoint.product+"/imageGet");
  }

}
