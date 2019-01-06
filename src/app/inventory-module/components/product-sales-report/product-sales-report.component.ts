import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ProductSalesReportViewModel} from "../../model/view-model/product-sales-report-view-model";
import {Subject} from "rxjs/index";
import {DataTableDirective} from "angular-datatables";
import {DataTableRequest} from "../../../core/model/data-table-request";
import {Util} from "../../../core/Util";
import {HttpStatusCode} from "../../../core/constants/HttpStatusCode";
import {ResponseMessage} from "../../../core/model/response-message";
import {HttpErrorResponse} from "@angular/common/http";
import {ToastrService} from "ngx-toastr";
import {ProductSalesReportService} from "../../service/product-sales-report.service";
import {ProductSalesReportModel} from "../../model/product-sales-report-model";
import {RequestMessage} from "../../../core/model/request-message";

@Component({
  selector: 'app-product-sales-report',
  templateUrl: './product-sales-report.component.html',
  styleUrls: ['./product-sales-report.component.scss']
})
export class ProductSalesReportComponent implements OnInit, AfterViewInit, OnDestroy {


  public pageTitle:string="Product Sales Report";


  //======== Variables related to data-table =======================
  @ViewChild(DataTableDirective)
  public dtElement: DataTableDirective;
  public dtTrigger: Subject<any> = new Subject<any>();
  public dataTableOptions: DataTables.Settings = {};

  //private searchParameter:CustomObject = {};

  public productSalesReportViewModel:ProductSalesReportViewModel;

  public productSalesReportModelList: Array<ProductSalesReportModel> = new Array<ProductSalesReportModel>();

  public totalSalesPrice:number;
  public totalBuyPrice:number;
  public totalProfit:number;

  constructor(private toaster: ToastrService,
              private productSalesReportService:ProductSalesReportService) { }

  ngOnInit() {

    this.populateDataTable();

    this.productSalesReportViewModel= new ProductSalesReportViewModel();
    this.productSalesReportViewModel.fromDate = new Date();
    this.productSalesReportViewModel.toDate = new Date();
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

  public onClickSearch(){
    this.rerender();
    //this.calculateTotal();

  }

  private getProductSalesReportByDate(dataTablesParameters: DataTableRequest, callback: any){
    let requestMessage: RequestMessage;
    requestMessage = Util.getRequestMessage(this.productSalesReportViewModel, dataTablesParameters);
    this.productSalesReportService.getListByRequestMessage(requestMessage).subscribe
    (
      (responseMessage: ResponseMessage) => {
        if (responseMessage.httpStatus == HttpStatusCode.FOUND) {
          this.productSalesReportModelList = <Array<ProductSalesReportModel>>responseMessage.data;
          this.calculateTotal();
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


  private calculateTotal(){
    let totalBuyPrice:number=0;
    let totalSalesPrice:number=0;
    let totalProfit:number=0;
    for(let item of this.productSalesReportModelList){
      totalBuyPrice+= item.buyPrice;
      totalSalesPrice+= item.salesPrice;
      totalProfit+= item.profit;
    }

    this.totalBuyPrice = totalBuyPrice;
    this.totalSalesPrice = totalSalesPrice;
    this.totalProfit = totalProfit;

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
          this.getProductSalesReportByDate(dataTablesParameters, callback);
        },
        columns: [
          {title:'Invoice No',  data: 'invoiceNo'},
          {title:'Product Name',data: 'productName'},
          {title:'Customer',    data: 'customerName'},
          {title:'Buy Price',   data: 'buyPrice'},
          {title:'Sales Price', data: 'salesPrice'},
          {title:'Profit',      data: 'profit'},
          {title:'Date',        data: 'date'},
        ]
      };
  }

}
