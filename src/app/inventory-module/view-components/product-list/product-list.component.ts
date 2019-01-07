import {Component, OnInit} from '@angular/core';
import {DataTableRequest} from "../../../core/model/data-table-request";
import {ProductService} from "../../service/product.service";
import {ProductViewModel} from "../view-model/product-view-model";
import {ResponseMessage} from "../../../core/model/response-message";
import {HttpStatusCode} from "../../../core/constants/HttpStatusCode";
import {ToastrService} from "ngx-toastr";
import {Util} from "../../../core/Util";

@Component({
  selector: 'product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {

  public pageTitle:string="Product List";

  public dtOptions: DataTables.Settings = {};

  public productViewModelList: Array<ProductViewModel>;

  constructor(private productService: ProductService,
              private toaster: ToastrService,) { }

  ngOnInit() {
    this.populateDataTable();
  }

  public onClickSelect(productId){
    Util.logConsole(productId);
  }


  private getProductList(dataTablesParameters: DataTableRequest, callback: any) {
    this.productService.getProductViewList(dataTablesParameters).subscribe(
      (responseMessage: ResponseMessage) =>
      {
        if(responseMessage.httpStatus==HttpStatusCode.FOUND) {
          this.productViewModelList = <Array<ProductViewModel>>responseMessage.data;
        }else if(responseMessage.httpStatus==HttpStatusCode.NOT_FOUND){
          this.toaster.info(responseMessage.message,this.pageTitle);
        }
        callback({
          recordsTotal: responseMessage.dataTableResponse.recordsTotal,
          recordsFiltered: responseMessage.dataTableResponse.recordsFiltered,
          data: []
        });

      });

  }

  private populateDataTable() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: false,
      searching: true,
      ajax: (dataTablesParameters: DataTableRequest, callback) => {
        this.getProductList(dataTablesParameters, callback);
      },
      columns: [
        {data: 'name'},
        {data: 'category'},
        {data: 'brand'},
        {data: 'modelNo'},
        {data: 'price'},
        {data: 'image'}
      ]
    };
  }
}
