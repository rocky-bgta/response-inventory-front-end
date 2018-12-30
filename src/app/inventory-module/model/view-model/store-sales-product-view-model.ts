import {SalesProductViewModel} from "./sales-product-view-model";

export class StoreSalesProductViewModel{
  storeId:string;
  customerId:string;
  storeProductViewModelList: Array<SalesProductViewModel> = new Array<SalesProductViewModel>()
  barcode: string;
  serialNo: string;
  salesMethod: number;
}
