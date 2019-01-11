import {SalesProductViewModel} from "./sales-product-view-model";

export class ProductSalesViewModel{
  storeId:string;
  customerId:string;
  salesProductViewModelList: Array<SalesProductViewModel> = new Array<SalesProductViewModel>()
  barcode: string;

  salesMethod: number;
  paidAmount:number;
  dueAmount:number;
  grandTotal:number;
  invoiceNo:string;
  //================
  productId:string;
  serialNo: string;
}
