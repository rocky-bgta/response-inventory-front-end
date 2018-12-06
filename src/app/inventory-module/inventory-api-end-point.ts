export class InventoryApiEndPoint{
  public static readonly rootUrl:string = "http://localhost:3000/";

  public static readonly apiPrefix:string="api/";

  public static readonly category:string = InventoryApiEndPoint.rootUrl+InventoryApiEndPoint.apiPrefix+"category";

  public static readonly product:string = InventoryApiEndPoint.rootUrl+InventoryApiEndPoint.apiPrefix+"product";


}
