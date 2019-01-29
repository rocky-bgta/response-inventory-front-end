import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {Subject} from "rxjs/index";
import {DataTableDirective} from "angular-datatables";
import {StoreModel} from "../../model/store-model";
import {CustomerModel} from "../../model/customer-model";
import {InvoiceHistoryModel} from "../../model/invoice-history-model";
import {StoreService} from "../../service/store.service";
import {CustomerService} from "../../service/customer.service";
import {DataTableRequest} from "../../../core/model/data-table-request";
import {CustomObject} from "../../../core/interface/CustomObject";
import {InvoiceHistoryService} from "../../service/invoice-history.service";
import {ResponseMessage} from "../../../core/model/response-message";
import {HttpStatusCode} from "../../../core/constants/HttpStatusCode";
import {ToastrService} from "ngx-toastr";
import {Util} from "../../../core/Util";
import {HttpErrorResponse} from "@angular/common/http";
import {MessageService} from "../../../core/MessageService";
import {DropDownSelectModel} from "../../../core/model/DropDownSelectModel";


declare var $: any;

@Component({
  selector: 'app-invoice-history',
  templateUrl: './invoice-history.component.html',
  styleUrls: ['./invoice-history.component.scss']
})
export class InvoiceHistoryComponent implements OnInit, AfterViewInit, OnDestroy {

  public pageTitle: string = "Invoice History";
  public entryForm: FormGroup;

  //======== page state variables star ===========
  public formSubmitted: boolean;
  //======== page state variables end  ===========

  //======= data table variable ========================
  public dataTableOptions: DataTables.Settings = {};

  @ViewChild(DataTableDirective)
  public dtElement: DataTableDirective;
  public dtTrigger: Subject<any> = new Subject<any>();

  private storeId: string;
  private customerId: string;
  //private serialNo:string;
  private searchRequestParameter: CustomObject = {};
  //====================================================


  //========== Variables for this page business =====================================================
  public storeModelList: Array<StoreModel> = new Array<StoreModel>();
  public customerModelList: Array<DropDownSelectModel> = new Array<DropDownSelectModel>();
  public invoiceHistoryList: Array<InvoiceHistoryModel> = new Array<InvoiceHistoryModel>();

  public storeSelected: boolean = false;
  public customerSelected: boolean = false;

  public invoiceNo: string;

  //========== Variables for this page business =====================================================


  constructor(private storeService: StoreService,
              private customerService: CustomerService,
              private invoiceHistoryService: InvoiceHistoryService,
              private toaster: ToastrService,
              private messageService: MessageService) {
  }

  ngOnInit() {
    this.getInvoiceCustomerList();
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

  public onChangeCustomer(event){
    if(event!=null){
      this.searchRequestParameter.customerId = event.id;
      this.rerender();
    }
    //Util.logConsole(event.id);
  }

  public onClearCustomer(){
    this.searchRequestParameter.customerId="";
    this.rerender();
  }

  public onClickSalesDetails(invoiceNo: string) {
    this.invoiceNo = invoiceNo;
    let customObject: CustomObject = {};
    customObject.invoiceNo = this.invoiceNo;

    this.sendMessage(customObject);

    setTimeout(function () {
      $(".nsm-content").draggable();
      Util.logConsole("Function executed");
    }, 500);


  }

  public onClickPaymentHistory(invoiceNo: string) {
    this.invoiceNo = invoiceNo;
    let customObject: CustomObject = {};
    customObject.invoiceNo = this.invoiceNo;

    this.sendMessage(customObject);

    setTimeout(function () {
      $(".nsm-content").draggable();
      Util.logConsole("Function executed");
    }, 500);


  }

  sendMessage(message: CustomObject): void {
    // send message to subscribers via observable subject
    this.messageService.sendMessage(message);
  }

  clearMessage(): void {
    // clear message
    this.messageService.clearMessage();
  }

  private getInvoiceCustomerList() {
    this.customerService.getInvoiceCustomerList().subscribe
    (
      (response: ResponseMessage) => {
        if (response.httpStatus == HttpStatusCode.FOUND) {
          this.customerModelList = <Array<DropDownSelectModel>>response.data;
          return;
        } else {
          Util.logConsole(response);
          return;
        }
      },

      (httpErrorResponse: HttpErrorResponse) => {
        if (httpErrorResponse.error instanceof Error) {
          Util.logConsole(httpErrorResponse, "Client-side error occurred.");
        } else {
          Util.logConsole(httpErrorResponse, "Client-side error occurred.");
        }
        return;
      }
    )
  }

  private getInvoiceHistoryByQueryParameters(dataTablesParameters: DataTableRequest, callback: any, searchParameter: CustomObject) {
    this.invoiceHistoryService.getListByQueryParameter(dataTablesParameters, searchParameter).subscribe
    (
      (responseMessage: ResponseMessage) => {
        if (responseMessage.httpStatus == HttpStatusCode.FOUND) {
          this.invoiceHistoryList = <Array<InvoiceHistoryModel>>responseMessage.data;
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
        processing: false,
        searching: true,
        ajax: (dataTablesParameters: DataTableRequest, callback) => {
          this.getInvoiceHistoryByQueryParameters(dataTablesParameters, callback, this.searchRequestParameter);
        },
        columns: [
          {data: 'customerName'},
          {data: 'invoiceNo'},
          {data: 'invoiceAmount'},
          {data: 'discountAmount'},
          {data: 'invoiceStatus'},
          {data: 'date'},
          {data: ''}
        ]
      };
  }

}
