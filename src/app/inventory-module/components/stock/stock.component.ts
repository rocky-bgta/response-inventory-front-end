import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
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


  //======== Variables related to data-table =======================
  @ViewChild(DataTableDirective)
  public dtElement: DataTableDirective;
  public dtTrigger: Subject<any> = new Subject<any>();


  constructor(private formBuilder: FormBuilder,
              private storeInProductService: StoreInProductsService,
              private storeService: StoreService,
              private toastr: ToastrService,) { }

  ngOnInit() {
    this.getStoreList();
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
    if(storeId!=null)
      this.getProductListByStoreId(storeId);
  }

  public onClearStore(){
      this.stockViewModel.productId=null;
      this.productModelList=null;
  }

  public onChangeProduct(productId:string){

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
          this.toastr.error(response.message,this.pageTitle);
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
          this.toastr.error(response.message,this.pageTitle);
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
