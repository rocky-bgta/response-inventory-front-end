export class SalesProductViewModel {
  productId: string;
  storeId: string;
  available: number;
  productName: string;
  categoryName: string;
  brandName: string;
  modelNo: string;
  buyPrice: number;
  salePrice:number;
  description: string;
  barcode: string;
  image: string;
  discount:number;
  vendorId:string;
  vendorName:string;


  //=========================
  required: boolean;


  salesQty: number;
  serialNo: number;
  supportPeriodInMonth: number;
  totalPrice: number;
  stockId: string;
  stockInProductId: string;

  constructor(){
    this.discount=0;
    this.salePrice=0;
    this.salesQty=1;
  }

}
