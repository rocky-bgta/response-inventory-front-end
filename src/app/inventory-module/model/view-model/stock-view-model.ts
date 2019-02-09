import {AvailableStockModel} from "../available-stock-model";
import {SalesProductViewModel} from "./sales-product-view-model";

export class StockViewModel{
  storeId:string;
  categoryId:string;
  productId:string;
  availableQty:string;
  updateQty:string;
  unitPrice:string;

  totalPrice:string;
  fromDate:Date;
  toDate:Date;
  availableStockViewList: Array<AvailableStockModel>;
  totalStockProductPrice:number;
  stockProductListForUpdate: Array<SalesProductViewModel>
}
