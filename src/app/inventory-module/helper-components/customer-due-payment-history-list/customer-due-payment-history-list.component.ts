import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ResponseMessage} from "../../../core/model/response-message";
import {HttpStatusCode} from "../../../core/constants/HttpStatusCode";
import {Util} from "../../../core/Util";
import {MessageService} from "../../../core/MessageService";
import {Subject, Subscription} from "rxjs/index";
import {CustomObject} from "../../../core/interface/CustomObject";
import {DataTableDirective} from "angular-datatables";
import {CustomerDuePaymentHistoryViewModel} from "../view-model/customer-due-payment-history-view-model";
import {CustomerDuePaymentHistoryService} from "../../service/customer-due-payment-history.service";

@Component({
  selector: 'customer-due-payment-history-list',
  templateUrl: './customer-due-payment-history-list.component.html',
  styleUrls: ['./customer-due-payment-history-list.component.scss']
})
export class CustomerDuePaymentHistoryListComponent implements OnInit, AfterViewInit, OnDestroy {


  public pageTitle:string="Customer Due Payment Details";

  @ViewChild(DataTableDirective)
  public dtElement: DataTableDirective;
  public dtOptions: DataTables.Settings = {};
  public dtTrigger: Subject<any> = new Subject<any>();


  public customerDuePaymentHistoryViewModelList: Array<CustomerDuePaymentHistoryViewModel>;

  invoiceNo:string;

  //message: any;
  subscription: Subscription;

  constructor(private customerDuePaymentHistoryService: CustomerDuePaymentHistoryService,
              private messageService: MessageService) {
    // subscribe to home component messages
    this.subscription = this.messageService.getMessage().subscribe(
      (message:CustomObject) =>
      {
      //this.message = message;
      //Util.logConsole(message.invoiceNo,"Message");
      this.invoiceNo = message.invoiceNo;
      this.getCustomerDuePaymentHistoryByInvoiceNo();
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




  private getCustomerDuePaymentHistoryByInvoiceNo() {
      this.customerDuePaymentHistoryService.getDuePaymentHistoryByInvoiceNo(this.invoiceNo).subscribe(
        (responseMessage: ResponseMessage) =>
        {
          if(responseMessage.httpStatus==HttpStatusCode.FOUND) {
            this.customerDuePaymentHistoryViewModelList = <Array<CustomerDuePaymentHistoryViewModel>>responseMessage.data;
            Util.logConsole(this.customerDuePaymentHistoryViewModelList);
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
