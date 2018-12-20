import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {StoreInProductsModel} from "../../model/store-in-products-model";
import {DataTableRequest} from "../../../core/model/data-table-request";
import {ToastrService} from "ngx-toastr";
import {VendorService} from "../../service/vendor.service";
import {NgxSmartModalService} from "ngx-smart-modal";
import {ResponseMessage} from "../../../core/model/response-message";
import {Util} from "../../../core/Util";
import {RequestMessage} from "../../../core/model/request-message";
import {HttpErrorResponse} from "@angular/common/http";
import {VendorModel} from "../../model/vendor-model";

@Component({
  selector: 'app-store-in-products',
  templateUrl: './store-in-products.component.html',
  styleUrls: ['./store-in-products.component.scss']
})
export class StoreInProductsComponent implements OnInit {

  public pageTitle:string="Vendor";

  public storeInProductsModel: StoreInProductsModel = new StoreInProductsModel();

  public entryForm: FormGroup;
  public formSubmitted:boolean=false;

  public dataTableOptions: DataTables.Settings = {};
  public vendorModelList: Array<VendorModel> = new Array<VendorModel>();

  public storeInProductsModelList: Array<StoreInProductsModel> = new Array<StoreInProductsModel>();


  public isPageInUpdateState: boolean;
  public hideInputForm: boolean;
  public disablePageElementOnDetailsView: boolean;

  private dataTablesCallBackParameters: DataTableRequest;
  private dataTableCallbackFunction: any;


  constructor(private vendorService: VendorService,
              private formBuilder: FormBuilder,
              private toastr: ToastrService,
              public  ngxSmartModalService: NgxSmartModalService) { }

  ngOnInit() {
  }

  onChangeVendor($event){

  }

  private getVendorList(){
    let requestMessage: RequestMessage;
    requestMessage = Util.getRequestMessage();
    this.vendorService.getList().subscribe
    (
      (response:ResponseMessage)=>
      {

      },
    (error: HttpErrorResponse)=>
    {

    }

    )
  }


  private initializeReactiveFormValidation():void{
    //let notAllowedCharacter = "^[A-Za-z0-9_.]+$";
    //let notAllowedCharacter = "^[A-Za-z0-9-_. \\\\ \\/ - \\n]+$";
    this.entryForm = this.formBuilder.group({
      //name:     ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
      //phoneNo:  ['', Validators.compose([Validators.required, Validators.maxLength(20)])],
      //email:    ['', Validators.compose([Validators.email, Validators.maxLength(50)])],
      //address: ['', Validators.compose([Validators.maxLength(200)])],
      vendor: ['', Validators.compose([Validators.required])]

      //address: ['', Validators.compose([Validators.maxLength(200), Validators.pattern(notAllowedCharacter)])],
      //description: ['', Validators.compose([Validators.maxLength(200), Validators.pattern(notAllowedCharacter)])]

    });
  }

}
