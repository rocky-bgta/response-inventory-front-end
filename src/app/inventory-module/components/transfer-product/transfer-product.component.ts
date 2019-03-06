import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ToastrService} from "ngx-toastr";
import {StoreService} from "../../service/store.service";
import {StockService} from "../../service/stock.service";
import {CategoryService} from "../../service/category.service";
import {NgxSmartModalService} from "ngx-smart-modal";
import {Util} from "../../../core/Util";
import {HttpErrorResponse} from "@angular/common/http";
import {HttpStatusCode} from "../../../core/constants/HttpStatusCode";
import {StoreModel} from "../../model/store-model";
import {ResponseMessage} from "../../../core/model/response-message";
import {TransferProductModel} from "../../model/transfer-product-model";
import {CategoryModel} from "../../model/category-model";
import {Subject} from "rxjs/index";
import {DataTableDirective} from "angular-datatables";
import {DataTableRequest} from "../../../core/model/data-table-request";
import {CustomObject} from "../../../core/interface/CustomObject";
import {StockViewModel} from "../../model/view-model/stock-view-model";
import {AvailableStockModel} from "../../model/available-stock-model";

@Component({
  selector: 'app-transfer-product',
  templateUrl: './transfer-product.component.html',
  styleUrls: ['./transfer-product.component.scss']
})
export class TransferProductComponent implements OnInit, AfterViewInit, OnDestroy {

  public pageTitle: string = "Transfer Product";

  //======= save modal text ======================================
  public modalHeader: string = this.pageTitle;
  public modalBodyText: string = "You are about to Transfer Product";
  //======= save modal text ======================================

  //======== Variables for this page business ====================
  public stockViewModel: StockViewModel = new StockViewModel();
  public storeModelList: Array<StoreModel> = new Array<StoreModel>();
  public transferProductModel: TransferProductModel = new TransferProductModel();
  public categoryModelList: Array<CategoryModel> = new Array<CategoryModel>();
  //public selectedStoreStockProductList: Array<StockProductDetailsViewModel> = new Array<StockProductDetailsViewModel>();
  public availableStockModelList: Array<AvailableStockModel> = new Array<AvailableStockModel>();

  private selectedProductForTransfer: Array<AvailableStockModel> = new Array<AvailableStockModel>();

  //======== page state variables star ===========
  public isPageInUpdateState: boolean;

  //======== Variables related to data-table =======================
  @ViewChild(DataTableDirective)
  public dtElement: DataTableDirective;
  public dtTrigger: Subject<any> = new Subject<any>();
  public dataTableOptions: DataTables.Settings = {};

  private searchParameter: CustomObject = {};


  constructor(private ngxSmartModalService: NgxSmartModalService,
              private categoryService: CategoryService,
              private stockService: StockService,
              private storeService: StoreService,
              private toaster: ToastrService) {
  }

  ngOnInit() {
    this.getStoreList();
    this.initializedPageStateVariable();
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
      this.rerender();
    }
  }

  public onClearStore() {
     this.transferProductModel.categoryId = null;
     this.categoryModelList = null;
     this.searchParameter = {};
     this.rerender();
  }

  public onChangeCategory(categoryId: string) {
    if (categoryId != null) {
      this.searchParameter.categoryId = categoryId;
      this.rerender();
    }
  }

  public onClickSelect(index:number, isSelected:boolean){
    //this
    console.log("index: "+index+ "Selected working: "+isSelected);
  }

  public onClearCategory() {
    this.searchParameter.categoryId = "";
    this.rerender();
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

  private async getAvailableStockProducts(dataTablesParameters: DataTableRequest, callback: any, searchParameter: any): Promise<StockViewModel> {
    let stockViewModel: StockViewModel = null;
    await this.stockService.getListWithRequestModelAsync(this.stockViewModel, dataTablesParameters, searchParameter).then
    (
      async (responseMessage: ResponseMessage) => {
        if (responseMessage.httpStatus == HttpStatusCode.FOUND) {
          stockViewModel = <StockViewModel>responseMessage.data;
          //this.stockViewModel.totalStockProductPrice = stockViewModel.totalStockProductPrice;
          this.availableStockModelList = stockViewModel.availableStockViewList;
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
          Util.logConsole(httpErrorResponse, "Server Side error occurred");
        }
        return;
      });
    return stockViewModel;
  }

  private populateDataTable(): void {
    // Util.logConsole("Populate table");

    this.dataTableOptions =
      {
        pagingType: 'full_numbers',
        pageLength: 10,
        serverSide: true,
        ordering: true,
        processing: false,
        searching: true,
        ajax: async (dataTablesParameters: DataTableRequest, callback) => {
          await this.getAvailableStockProducts(dataTablesParameters, callback, this.searchParameter);
        },
        columns: [
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

  private initializedPageStateVariable(): void {
    this.isPageInUpdateState = false;
  }

}
