import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {DataTableRequest} from "../../../core/model/data-table-request";
import {ProductService} from "../../service/product.service";
import {ProductViewModel} from "../view-model/product-view-model";
import {ResponseMessage} from "../../../core/model/response-message";
import {HttpStatusCode} from "../../../core/constants/HttpStatusCode";
import {ToastrService} from "ngx-toastr";
import * as _ from 'lodash';
import {Util} from "../../../core/Util";
import {SalesHistoryService} from "../../service/sales-history.service";
import {SalesHistoryViewModel} from "../view-model/sales-history-view-model";
import {MessageService} from "../../../core/MessageService";
import {Subject, Subscription} from "rxjs/index";
import {CustomObject} from "../../../core/interface/CustomObject";
import {DataTableDirective} from "angular-datatables";

@Component({
  selector: 'sales-history-list',
  templateUrl: './sales-history-list.component.html',
  styleUrls: ['./sales-history-list.component.scss']
})
export class SalesHistoryListComponent implements OnInit, AfterViewInit, OnDestroy {


  public pageTitle:string="Sales Details";

  @ViewChild(DataTableDirective)
  public dtElement: DataTableDirective;
  public dtOptions: DataTables.Settings = {};
  public dtTrigger: Subject<any> = new Subject<any>();


  public salesHistoryViewModelList: Array<SalesHistoryViewModel>;

  invoiceNo:string;

  //message: any;
  subscription: Subscription;

  constructor(private salesHistoryService: SalesHistoryService,
              private messageService: MessageService) {
    // subscribe to home component messages
    this.subscription = this.messageService.getMessage().subscribe(
      (message:CustomObject) =>
      {
      //this.message = message;
      //Util.logConsole(message.invoiceNo,"Message");
      this.invoiceNo = message.invoiceNo;
      this.getSalesHistoryByInvoiceNo();
      this.rerender();

      //this.invoiceNo = this

    });
  }

  ngOnInit() {
    this.populateDataTable();
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }


  ngOnDestroy(): void {
    // unsubscribe to ensure no memory leaks
    this.subscription.unsubscribe();
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

/*
  public onClickSubmit(){
   /!* this.selectedProductList.emit(this._selectedProductList);
    for(let product of this._selectedProductList){
      product.selectedProduct=false;
    }
    this._selectedProductList= new Array<ProductViewModel>();*!/

  }*/




  private getSalesHistoryByInvoiceNo() {
      this.salesHistoryService.getSalesHistoryByInvoiceNo(this.invoiceNo).subscribe(
        (responseMessage: ResponseMessage) =>
        {
          if(responseMessage.httpStatus==HttpStatusCode.FOUND) {
            this.salesHistoryViewModelList = <Array<SalesHistoryViewModel>>responseMessage.data;
            Util.logConsole(this.salesHistoryViewModelList);
            //this.dtTrigger.next();
          }else if(responseMessage.httpStatus==HttpStatusCode.NOT_FOUND){
            //this.toaster.info(responseMessage.message,this.pageTitle);
          }
         /* callback({
            recordsTotal: responseMessage.dataTableResponse.recordsTotal,
            recordsFiltered: responseMessage.dataTableResponse.recordsFiltered,
            data: []
          });*/

        });

    }



  private populateDataTable() {
    this.dtOptions = {
      pagingType: 'numbers',
      lengthChange:false,
      //bInfo:false,
      ordering:false,
      info:false,
      //pageLength: 25,
      //serverSide: false,
      //processing: false,
      searching: false,
     // ajax: (dataTablesParameters: DataTableRequest, callback) => {
     //   this.getSalesHistoryByInvoiceNo(dataTablesParameters, callback);
      //}
      /*columns: [
        {data: 'invoiceNo'},
        {data: 'storeName'},
        {data: 'customerName'},
        {data: 'productName'},
        {data: 'salesPrice'}
      ]*/
    };
  }
}
