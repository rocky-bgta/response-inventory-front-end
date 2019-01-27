import {SalesProductViewModel} from "./sales-product-view-model";
import {CustomerModel} from "../customer-model";

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
  customerModel:CustomerModel;
  discountAmount:number;
  //================
  previousDue:number;
  productId:string;
  serialNo: string;
}
