import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import {StoreService} from "../../service/store.service";
import {StockViewModel} from "../../model/view-model/stock-view-model";
import {ResponseMessage} from "../../../core/model/response-message";
import {HttpErrorResponse, HttpParams} from "@angular/common/http";
import {HttpStatusCode} from "../../../core/constants/HttpStatusCode";
import {StoreModel} from "../../model/store-model";
import {ProductModel} from "../../model/product-model";
import {Util} from "../../../core/Util";
import {Subject} from "rxjs/index";
import {DataTableDirective} from "angular-datatables";
import {StoreInProductsService} from "../../service/store-in-products.service";
import {AvailableStockModel} from "../../model/available-stock-model";
import {StockService} from "../../service/stock.service";
import {DataTableRequest} from "../../../core/model/data-table-request";
import {CustomObject} from "../../../core/interface/CustomObject";

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class StockComponent implements OnInit, AfterViewInit, OnDestroy {


  public pageTitle:string="Stock";


  public entryForm: FormGroup;

  //======== page state variables star ===========
  public formSubmitted:boolean;
  public productAdded:boolean;
  public isPageInUpdateState: boolean;


  //======== Variables for this page business ====================
  public stockViewModel :StockViewModel = new StockViewModel();
  public storeModelList: Array<StoreModel> = new Array<StoreModel>();
  public productModelList: Array<ProductModel> = new Array<ProductModel>();
  public availableStockModelList:Array<AvailableStockModel> = new Array<AvailableStockModel>();


  //======== Variables related to data-table =======================
  @ViewChild(DataTableDirective)
  public dtElement: DataTableDirective;
  public dtTrigger: Subject<any> = new Subject<any>();
  public dataTableOptions: DataTables.Settings = {};

  private searchParameter:CustomObject = {};


  constructor(private formBuilder: FormBuilder,
              private storeInProductService: StoreInProductsService,
              private stockService: StockService,
              private storeService: StoreService,
              private toaster: ToastrService) { }

  ngOnInit() {
    this.getStoreList();
    this.populateDataTable();
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
    });
  }


  public onChangeStore(storeId:string){
    if(storeId!=null) {
      this.getProductListByStoreId(storeId);
      this.searchParameter.storeId = storeId;
      this.rerender();
    }
  }

  public onClearStore(){
    this.stockViewModel.productId=null;
    this.productModelList=null;
    this.searchParameter={};
    this.rerender();
  }

  public onChangeProduct(productId:string){
    this.searchParameter.productId=productId;
    this.rerender();
  }

  public onClearProduct(){

  }


  private getStoreList(){
    this.storeService.getList().subscribe
    (
      (response:ResponseMessage)=>
      {
        if(response.httpStatus==HttpStatusCode.FOUND){
          this.storeModelList = <Array<StoreModel>>response.data;
          return;
        }else if(response.httpStatus==HttpStatusCode.NOT_FOUND) {
          this.toaster.error(response.message,this.pageTitle);
          return;
        }else {
          Util.logConsole(response);
          return;
        }
      },

      (httpErrorResponse: HttpErrorResponse) =>
      {
        if (httpErrorResponse.error instanceof Error) {
          Util.logConsole(httpErrorResponse,"Client Side error occurred.");
        } else {
          Util.logConsole(httpErrorResponse,"Server-side error occurred.");
        }
        return;
      }

    )
  }

  private getProductListByStoreId(storeId:string){
    this.storeInProductService.getProductListByStoreId(storeId).subscribe
    (
      (response:ResponseMessage)=>
      {
        if(response.httpStatus==HttpStatusCode.FOUND){
          this.productModelList = <Array<ProductModel>>response.data;
          return;
        }else if(response.httpStatus==HttpStatusCode.NOT_FOUND) {
          this.toaster.error(response.message,this.pageTitle);
          return;
        }else {
          Util.logConsole(response);
          return;
        }
      },

      (httpErrorResponse: HttpErrorResponse) =>
      {
        if (httpErrorResponse.error instanceof Error) {
          Util.logConsole(httpErrorResponse,"Client Side error occurred.");
        } else {
          Util.logConsole(httpErrorResponse,"Server-side error occurred.");
        }
        return;
      }

    )
  }


  private getAvailableStockProducts(dataTablesParameters: DataTableRequest, callback: any, searchParameter:any){

      this.stockService.getList(dataTablesParameters,searchParameter).subscribe
      (
        (responseMessage: ResponseMessage) => {
          if (responseMessage.httpStatus == HttpStatusCode.FOUND) {
            this.availableStockModelList = <Array<AvailableStockModel>>responseMessage.data;
            //Util.logConsole(this.availableProductViewModelList);
            //return productViewModelList;
          } else if (responseMessage.httpStatus == HttpStatusCode.NOT_FOUND) {
            this.toaster.error(responseMessage.message, this.pageTitle);
            return;
          } else {
            Util.logConsole(responseMessage);
            return;
          }

          callback({
            recordsTotal: responseMessage.dataTableResponse.recordsTotal,
            recordsFiltered: responseMessage.dataTableResponse.recordsFiltered,
            data: []
          });
        }
        ,
        (httpErrorResponse: HttpErrorResponse) => {
          if (httpErrorResponse.error instanceof ErrorEvent) {
            Util.logConsole(httpErrorResponse, "Client-side error occurred.");
          } else {
            this.toaster.error('There is a problem with the service. We are notified and working on it');
            //this.toastr.info("Please reload this page");
            Util.logConsole(httpErrorResponse, "Server Side error occurred");
          }
          return;
        });
  }

  private populateDataTable():void{
    // Util.logConsole("Populate table");

    this.dataTableOptions =
      {
        pagingType: 'full_numbers',
        pageLength: 10,
        serverSide: true,
        processing: false,
        searching: false,
        ajax: (dataTablesParameters: DataTableRequest, callback) => {
          this.getAvailableStockProducts(dataTablesParameters, callback,this.searchParameter);
        },
        columns: [
          {title:'Product Name',  data: 'productName'},
          {title:'Store Name',    data: 'storeName'},
          {title:'Available Qty', data: 'availableQty'},
          {title:'Total Price',   data: 'totalPrice'},
          {title:'Action',        data: ''},
        ]
      };
  }

  private initializeReactiveFormValidation(index?:number){
    this.entryForm=this.formBuilder.group({
      dynamicSerialNo:  new FormControl(''),
      dynamicPrice:     new FormControl('',[Validators.required]),
      dynamicQuantity:  new FormControl('',[Validators.required]),
      dynamicMfDate:    new FormControl(''),
      dynamicExpDate:   new FormControl(''),
      dynamicEntryDate: new FormControl('',[Validators.required])
    });
  }

}
