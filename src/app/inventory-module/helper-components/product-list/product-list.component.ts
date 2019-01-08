import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {DataTableRequest} from "../../../core/model/data-table-request";
import {ProductService} from "../../service/product.service";
import {ProductViewModel} from "../view-model/product-view-model";
import {ResponseMessage} from "../../../core/model/response-message";
import {HttpStatusCode} from "../../../core/constants/HttpStatusCode";
import {ToastrService} from "ngx-toastr";
import * as _ from 'lodash';
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

  private selectedProductList: Array<ProductViewModel>;

  @Output() isConfirm = new EventEmitter<ProductViewModel>();

  constructor(private productService: ProductService,
              private toaster: ToastrService,) { }

  ngOnInit() {
    this.selectedProductList = new Array<ProductViewModel>();
    this.populateDataTable();
  }

  public onClickSelect(index:number,value){
    let id:string;
    let selectedProduct: ProductViewModel;
    //let productRemoved:boolean;
    selectedProduct = this.productViewModelList[index];
    id=selectedProduct.id;
    if(value){
      this.productViewModelList[index].selectedProduct=true;
      this.selectedProductList.push(selectedProduct);
    }else {
      //remove product
        this.selectedProductList =_.filter(this.selectedProductList, (currentObject) => {
          return currentObject.id !== id;
        });
      Util.logConsole(this.selectedProductList,"After remove Product");
    }
  }


  private getProductList(dataTablesParameters: DataTableRequest, callback: any) {
    this.productService.getProductViewList(dataTablesParameters).subscribe(
      (responseMessage: ResponseMessage) =>
      {
        if(responseMessage.httpStatus==HttpStatusCode.FOUND) {
          this.productViewModelList = <Array<ProductViewModel>>responseMessage.data;
          this.checkIsProductAlreadySelected();
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

  private checkIsProductAlreadySelected(){
    Util.logConsole(this.selectedProductList,"Selected Product");
    let selectedProduct:ProductViewModel;
    for(let index:number in this.productViewModelList){
      let id = this.productViewModelList[index].id;
      selectedProduct = _.find(this.selectedProductList,{id});
        if (selectedProduct != null && !_.isEmpty(selectedProduct))
          this.productViewModelList[index].selectedProduct = true;
    }
    return;
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

function remove(array, element) {
  return array.filter((el) => el !== element);
}
