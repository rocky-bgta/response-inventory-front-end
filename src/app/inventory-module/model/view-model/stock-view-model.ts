import {AvailableStockModel} from "../available-stock-model";

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
}
