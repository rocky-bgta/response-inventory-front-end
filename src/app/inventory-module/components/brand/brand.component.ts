import { Component, OnInit } from '@angular/core';
import {BrandModel} from "../../model/brand-model";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DataTableRequest} from "../../../core/model/data-table-request";
import {BrandService} from "../../service/brand.service";
import {ToastrService} from "ngx-toastr";
import {NgxSmartModalService} from "ngx-smart-modal";
import {RequestMessage} from "../../../core/model/request-message";
import {Util} from "../../../core/Util";
import {ResponseMessage} from "../../../core/model/response-message";
import {HttpErrorResponse} from "@angular/common/http";
import * as HttpStatus from 'http-status-codes'

@Component({
  selector: 'app-brand',
  templateUrl: './brand.component.html',
  styleUrls: ['./brand.component.scss']
})
export class BrandComponent implements OnInit {


  public brandModel: BrandModel = new BrandModel();

  public entryForm: FormGroup;
  public formSubmitted:boolean=false;

  public dataTableOptions: DataTables.Settings = {};
  public brandModelList: Array<BrandModel> = new Array();

  public isPageInUpdateState: boolean;
  public hideInputForm: boolean;
  public disablePageElementOnDetailsView: boolean;

  private dataTablesCallBackParameters: DataTableRequest;
  private dataTableCallbackFunction: any;


  constructor(private brandService: BrandService,
              private formBuilder: FormBuilder,
              private toastr: ToastrService,
              public ngxSmartModalService: NgxSmartModalService) {
    }

  ngOnInit() {
    this.initializeReactiveFormValidation();
    this.initializedPageStateVariable();
    this.populateDataTable();
  }

  public onClickSubmit(){
    this.formSubmitted = true;
    let requestMessage: RequestMessage;

    if(this.isPageInUpdateState && !this.entryForm.invalid){
      // calll update method
      return;
    }

    if(!this.isPageInUpdateState){
      if(this.entryForm.invalid){
        this.toastr.info("Please provide required form data","Category");
        return;
      }
    }

    //======== now we safely save entry form data
    requestMessage = Util.getRequestMessage(this.brandModel);
    this.brandService.save(requestMessage).subscribe
    (
      (responseMessage: ResponseMessage) =>
                {
                  if(responseMessage.httpStatus==HttpStatus.CREATED) {
                    this.toastr.success( responseMessage.message,'Brand');
                    this.brandModel = <BrandModel> responseMessage.data;
                    this.getBrandList(this.dataTablesCallBackParameters, this.dataTableCallbackFunction);
                  }else {
                    this.toastr.error(responseMessage.message,'Brand');
                  }
                },

      (httpErrorResponse: HttpErrorResponse) =>
                {
                  if (httpErrorResponse.error instanceof Error) {
                    this.toastr.error('Please try again','Error')
                     Util.logConsole(null,"Client-side error occurred.");
                  } else {
                    this.toastr.error('Please try again later','Error')
                    Util.logConsole(null,"Client-side error occurred.");
                  }
                }
    );
    return;
  }

  public onClickReset(){

  }

  public onClickCancel(){

  }


  // ========== Data table button event =====================

  private populateDataTable(){

    this.dataTableOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: false,
      searching: false,
      ajax: (dataTablesParameters: DataTableRequest, callback) => {
        this.getBrandList(dataTablesParameters, callback);
      },
      columns: [{data: 'id'}, {data: 'name'}, {data: 'description'}]
    };
  }


  private getBrandList(dataTablesParameters: DataTableRequest, callback: any):Array<BrandModel> {
    this.dataTablesCallBackParameters = dataTablesParameters;
    this.dataTableCallbackFunction = callback;

    this.brandService.getList(dataTablesParameters).subscribe
    (
      (response: ResponseMessage) =>
                {
                  this.brandModelList = <Array<BrandModel>>response.data;
                  callback({
                    recordsTotal: response.dataTableResponse.recordsTotal,
                    recordsFiltered: response.dataTableResponse.recordsTotal,
                    data: []
                  });
                },

      (httpErrorResponse: HttpErrorResponse) =>
                {
                  if (httpErrorResponse.error instanceof Error) {
                    this.toastr.error('Datatable population ','Error')
                    Util.logConsole(httpErrorResponse,"Client-side error occurred.");
                  } else {
                    this.toastr.error('Please try again later','Error')
                    Util.logConsole(httpErrorResponse,"Client-side error occurred.");
                  }
                }
    );

    return this.brandModelList;
  }

  public onClickDetails(){

  }

  public onClickEdit(){

  }

  public onClickDelete(){

  }

  // ========== Data table button event =====================


  private initializedPageStateVariable(){
    this.isPageInUpdateState = false;
    this.hideInputForm = false;
    this.disablePageElementOnDetailsView = false;
    this.dataTablesCallBackParameters = new DataTableRequest();
    this.dataTablesCallBackParameters.start = 0;
    this.dataTablesCallBackParameters.length = 10;
  }

  private initializeReactiveFormValidation(){
    this.entryForm = this.formBuilder.group({
      name: ['',  Validators.compose([Validators.required, Validators.maxLength(20)])],
      description: ['', Validators.maxLength(100)]
    });
  }

}
