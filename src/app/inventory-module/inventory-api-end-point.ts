export class InventoryApiEndPoint{



  public static readonly rootUrl:string = "http://localhost:3000/";

  public static readonly apiPrefix:string="api/";

  public static readonly enum:string = InventoryApiEndPoint.rootUrl+InventoryApiEndPoint.apiPrefix+"enum";

  public static readonly category:string = InventoryApiEndPoint.rootUrl+InventoryApiEndPoint.apiPrefix+"category";

  public static readonly product:string = InventoryApiEndPoint.rootUrl+InventoryApiEndPoint.apiPrefix+"product";

  public static readonly brand:string = InventoryApiEndPoint.rootUrl+InventoryApiEndPoint.apiPrefix+"brand";

  public static readonly vendor:string = InventoryApiEndPoint.rootUrl+InventoryApiEndPoint.apiPrefix+"vendor";

  public static readonly stock:string = InventoryApiEndPoint.rootUrl+InventoryApiEndPoint.apiPrefix+"stock";

  public static readonly store:string = InventoryApiEndPoint.rootUrl+InventoryApiEndPoint.apiPrefix+"store";

  public static readonly storeInProducts:string = InventoryApiEndPoint.rootUrl+InventoryApiEndPoint.apiPrefix+"store-in-products";

  public static readonly storeSalesProducts:string = InventoryApiEndPoint.rootUrl+InventoryApiEndPoint.apiPrefix+"store-sales-products";

  public static readonly customer:string = InventoryApiEndPoint.rootUrl+InventoryApiEndPoint.apiPrefix+"customer";




}
