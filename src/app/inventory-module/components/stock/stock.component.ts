import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import {StoreService} from "../../service/store.service";
import {StockViewModel} from "../../model/view-model/stock-view-model";
import {ResponseMessage} from "../../../core/model/response-message";
import {HttpErrorResponse} from "@angular/common/http";
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
import {CategoryService} from "../../service/category.service";
import {CategoryModel} from "../../model/category-model";
import * as _ from 'lodash';
import {SalesProductViewModel} from "../../model/view-model/sales-product-view-model";
import {ProductSalesService} from "../../service/product-sales.service";
import {NgxSmartModalService} from "ngx-smart-modal";
import {RequestMessage} from "../../../core/model/request-message";
declare var jQuery: any;
@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class StockComponent implements OnInit, AfterViewInit, OnDestroy {


  public pageTitle: string = "Stock";


  //public entryForm: FormGroup;

  //======= save modal text ======================================
  public modalHeader: string = this.pageTitle;
  public modalBodyText: string = "You are about to Update Stock";
  //======= save modal text ======================================

  //======== page state variables star ===========
  public isPageInUpdateState: boolean;
  //public hideInputForm: boolean;
  //public disablePageElementOnDetailsView: boolean;


  //======== Variables for this page business ====================
  public stockViewModel: StockViewModel = new StockViewModel();
  public storeModelList: Array<StoreModel> = new Array<StoreModel>();
  public productModelList: Array<ProductModel> = new Array<ProductModel>();
  public availableStockModelList: Array<AvailableStockModel> = new Array<AvailableStockModel>();
  public categoryModelList: Array<CategoryModel> = new Array<CategoryModel>();

  public currentStockProductList: Array<SalesProductViewModel> = new Array<SalesProductViewModel>();
  public updatedStockProductList: Array<SalesProductViewModel> = new Array<SalesProductViewModel>();

  private _storeId:string;
  private _productId:string;
  private _categoryId:string;

  private searchRequestParameter: CustomObject = {};

  //======== Variables related to data-table =======================
  @ViewChild(DataTableDirective)
  public dtElement: DataTableDirective;
  public dtTrigger: Subject<any> = new Subject<any>();
  public dataTableOptions: DataTables.Settings = {};

  private searchParameter: CustomObject = {};


  constructor(//private formBuilder: FormBuilder,
              private productSalesService: ProductSalesService,
              //private storeInProductService: StoreInProductsService,
              private ngxSmartModalService: NgxSmartModalService,
              private categoryService: CategoryService,
              private stockService: StockService,
              private storeService: StoreService,
              private toaster: ToastrService) {
  }

  ngOnInit() {
    this.getStoreList();
    this.initializedPageStateVariable();
    //this.getCategoryList();
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


  public onChangeStore(storeId: string) {
    if (storeId != null) {
      //this.getProductListByStoreId(storeId);
      this.getCategoryListByStoreId(storeId);
      this.searchParameter.storeId = storeId;
      this.stockViewModel.totalStockProductPrice = null;
      this.rerender();

    }
  }

  public onClearStore() {
    this.stockViewModel.productId = null;
    this.stockViewModel.categoryId = null;
    this.productModelList = null;
    this.categoryModelList = null;
    this.searchParameter = {};
    //this.clearCategoryAndProductList();
    this.rerender();
  }

  public onChangeCategory(categoryId: string) {
    if (categoryId != null) {
      this.searchParameter.categoryId = categoryId;
      this.rerender();
    }
  }

  public onClearCategory() {
    this.searchParameter.categoryId = "";
    this.rerender();
  }

  public onClickSearch(){
    this.rerender();
  }

  public onClickUpdateStock(dynamicForm){
    if (!dynamicForm.invalid) {
      this.ngxSmartModalService.getModal('saveConfirmationModal').open();
    }else {
      this.toaster.info("Please Stock Update Information");
    }
  }

  public onClickSaveConfirmationOfModal(isConfirm: boolean){
    if (isConfirm) {
      this.updateStock();
    }
  }

  private updateStock(){
    let requestMessage: RequestMessage;
    let stockViewModel: StockViewModel = new StockViewModel();
    stockViewModel.storeId = this._storeId;
    stockViewModel.categoryId = this._categoryId;
    stockViewModel.productId = this._productId;
    stockViewModel.stockProductListForUpdate = this.currentStockProductList;
    requestMessage = Util.getRequestMessage(stockViewModel);
    this.stockService.update(requestMessage).subscribe
    (
      (responseMessage: ResponseMessage) => {
        if (responseMessage.httpStatus == HttpStatusCode.CONFLICT) {
          this.toaster.info(responseMessage.message, this.pageTitle);
        }else if (responseMessage.httpStatus == HttpStatusCode.OK) {
          this.toaster.success(responseMessage.message, this.pageTitle);
          this.resetPage();
          return;
        } else {
          this.toaster.error(responseMessage.message, this.pageTitle);
          return;
        }
      },

      (httpErrorResponse: HttpErrorResponse) => {
        this.toaster.error('Failed to Update Stock', this.pageTitle);
        if (httpErrorResponse.error instanceof ErrorEvent) {
          Util.logConsole("Client Side error occurred: " + httpErrorResponse.error.message);
        } else {
          this.toaster.error('There is a problem with the service. We are notified and working on it', this.pageTitle);
          Util.logConsole(httpErrorResponse, "Server Side error occurred");
        }
        return;
      }
    );
  }

 /* public onChangeProduct(productId: string) {
    if (productId != null) {
      this.searchParameter.productId = productId;
      this.rerender();
    }
  }

  public onClearProduct() {
    this.searchParameter.productId = "";
    this.rerender();
  }*/

  private getCategoryListByStoreId(storeId: string) {
    this.categoryService.getCategoryListByStoreId(storeId).subscribe
    (
      (response: ResponseMessage) => {
        if (response.httpStatus == HttpStatusCode.FOUND) {
          this.categoryModelList = <Array<CategoryModel>>response.data;
          return;
        } else if (response.httpStatus == HttpStatusCode.NOT_FOUND) {
          this.categoryModelList.splice(0, this.categoryModelList.length);
          this.toaster.error(response.message, this.pageTitle);
          return;
        } else {
          Util.logConsole(response);
          return;
        }
      },

      (httpErrorResponse: HttpErrorResponse) => {
        if (httpErrorResponse.error instanceof Error) {
          Util.logConsole(httpErrorResponse, "Client Side error occurred.");
        } else {
          Util.logConsole(httpErrorResponse, "Server-side error occurred.");
        }
        return;
      }
    )
  }

  private getStoreList() {
    this.storeService.getList().subscribe
    (
      (response: ResponseMessage) => {
        if (response.httpStatus == HttpStatusCode.FOUND) {
          this.storeModelList = <Array<StoreModel>>response.data;
          return;
        } else if (response.httpStatus == HttpStatusCode.NOT_FOUND) {
          this.toaster.error(response.message, this.pageTitle);
          return;
        } else {
          Util.logConsole(response);
          return;
        }
      },

      (httpErrorResponse: HttpErrorResponse) => {
        if (httpErrorResponse.error instanceof Error) {
          Util.logConsole(httpErrorResponse, "Client Side error occurred.");
        } else {
          Util.logConsole(httpErrorResponse, "Server-side error occurred.");
        }
        return;
      }
    )
  }

/*

  private getProductListByStoreId(storeId: string) {
    this.storeInProductService.getProductListByStoreId(storeId).subscribe
    (
      (response: ResponseMessage) => {
        if (response.httpStatus == HttpStatusCode.FOUND) {
          this.productModelList = <Array<ProductModel>>response.data;
          return;
        } else if (response.httpStatus == HttpStatusCode.NOT_FOUND) {
          this.toaster.error(response.message, this.pageTitle);
          return;
        } else {
          Util.logConsole(response);
          return;
        }
      },

      (httpErrorResponse: HttpErrorResponse) => {
        if (httpErrorResponse.error instanceof Error) {
          Util.logConsole(httpErrorResponse, "Client Side error occurred.");
        } else {
          Util.logConsole(httpErrorResponse, "Server-side error occurred.");
        }
        return;
      }
    )
  }

 */


  private async getAvailableStockProducts(dataTablesParameters: DataTableRequest, callback: any, searchParameter: any):Promise<StockViewModel> {
    let stockViewModel: StockViewModel=null;
    await this.stockService.getListWithRequestModelAsync(this.stockViewModel,dataTablesParameters, searchParameter).then
    (
      async (responseMessage: ResponseMessage) => {
        if (responseMessage.httpStatus == HttpStatusCode.FOUND) {
          stockViewModel = <StockViewModel>responseMessage.data;
          this.stockViewModel.totalStockProductPrice = stockViewModel.totalStockProductPrice;
          this.availableStockModelList = stockViewModel.availableStockViewList;
          //await this.setStoreNameForStockList();
          //this.availableStockModelList = <Array<AvailableStockModel>>responseMessage.data;
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
    return stockViewModel;
  }

 /* private async setStoreNameForStockList() {
    let storeModel: StoreModel;
    for (let index in this.availableStockModelList) {
      let id = this.availableStockModelList[index].storeId;
      storeModel = _.find(this.storeModelList, {id});
      this.availableStockModelList[index].storeName = storeModel.name;
    }
  }*/

  public onClickEditStock(selectedItem:AvailableStockModel){

    this._storeId = selectedItem.store_id;
    this._categoryId = selectedItem.category_id;
    this._productId =  selectedItem.product_id;

    this.searchRequestParameter.storeId = selectedItem.store_id;
    this.searchRequestParameter.categoryId = selectedItem.category_id;
    this.searchRequestParameter.productId = selectedItem.product_id;

    this.getCurrentStockProductList(this.searchRequestParameter);
    this.showEntryForm();
    this.isPageInUpdateState=true;

  }

  public onClickCancel(){
    this.isPageInUpdateState=false;
  }

 private getCurrentStockProductList(searchRequestParameter:CustomObject){
   let currentStockProductList: Array<SalesProductViewModel> = new Array<SalesProductViewModel>();
   this.productSalesService.getAllAvailableProduct(searchRequestParameter).subscribe
   (
     (responseMessage: ResponseMessage) => {
       if (responseMessage.httpStatus == HttpStatusCode.FOUND) {
         currentStockProductList = <Array<SalesProductViewModel>>responseMessage.data;
         this.currentStockProductList = currentStockProductList;
         this.setTotalPrice();
         Util.logConsole(currentStockProductList);
       } else if (responseMessage.httpStatus == HttpStatusCode.NOT_FOUND) {
         this.toaster.error(responseMessage.message, this.pageTitle);
         return;
       } else {
         Util.logConsole(responseMessage);
         return;
       }
     }
     ,
     (httpErrorResponse: HttpErrorResponse) => {
       if (httpErrorResponse.error instanceof ErrorEvent) {
         Util.logConsole(httpErrorResponse, "Client-side error occurred.");
       } else {
         this.toaster.error('There is a problem with the service. We are notified and working on it');
         Util.logConsole(httpErrorResponse, "Server Side error occurred");
       }
       return;
     });
 }

  private populateDataTable(): void {
    // Util.logConsole("Populate table");

    this.dataTableOptions =
      {
        pagingType: 'full_numbers',
        pageLength: 10,
        serverSide: true,
        ordering:true,
        processing: false,
        searching: true,
        ajax: async(dataTablesParameters: DataTableRequest, callback) => {
          await this.getAvailableStockProducts(dataTablesParameters, callback, this.searchParameter);
        },
        columns: [
          /* {title:'Category',      data: 'categoryName'},*/
          {data: 'store_name'},
          {data: 'category_name'},
          {data: 'product_name'},
          {data: 'model_no'},
          {data: 'available_qty'},
          {data: 'total_price'},
          {data: ''},
        ]
      };
  }

  private initializedPageStateVariable():void{
    this.isPageInUpdateState = false;
    //this.hideInputForm = false;
    //this.disablePageElementOnDetailsView = false;
  }

  private showEntryForm():void{
    jQuery('html, body').animate({scrollTop: $("#collapseInputForm").height()-150}, 500);
    jQuery('#collapseInputForm').collapse('show');

  }

  public onClickCancelUpdate(){
   this.isPageInUpdateState=false;
   this.hideEntryForm();
   this.currentStockProductList = null;
  }

  private hideEntryForm():void{
    jQuery('#collapseInputForm').collapse('hide');
    setTimeout
    (
      () =>
      {
        //this.disablePageElementOnDetailsView = false;
      }, 500
    );
    return;
  }

  public onFocusOutStockQty(stockQty){
    if(stockQty>0)
      this.setTotalPrice();
  }

  public onFocusOutBuyPrice(buyPrice){
    if(buyPrice>0)
      this.setTotalPrice();
  }

  private setTotalPrice() {
    let grandTotal: number;
    let stockQty:number;
    let unitPrice:number;
    for (let index in this.currentStockProductList) {
      stockQty = this.currentStockProductList[index].available;
      unitPrice = this.currentStockProductList[index].buyPrice;
      grandTotal = stockQty*unitPrice;
      grandTotal = Util.roundNumberToTwoDecimalPlace(grandTotal);
      this.currentStockProductList[index].totalPrice = grandTotal;

    }
  }

  private resetPage(){
    this.isPageInUpdateState=false;
    this.hideEntryForm();
    this.currentStockProductList=null;
  }

  /*private clearCategoryAndProductList() {
    this.categoryModelList = this.categoryModelList.splice(0, this.categoryModelList.length);
    this.productModelList = this.productModelList.splice(0, this.productModelList.length);
  }*/

  /* private initializeReactiveFormValidation(index?:number){
     this.entryForm=this.formBuilder.group({
       dynamicSerialNo:  new FormControl(''),
       dynamicPrice:     new FormControl('',[Validators.required]),
       dynamicQuantity:  new FormControl('',[Validators.required]),
       dynamicMfDate:    new FormControl(''),
       dynamicExpDate:   new FormControl(''),
       dynamicEntryDate: new FormControl('',[Validators.required])
     });
   }*/

}
