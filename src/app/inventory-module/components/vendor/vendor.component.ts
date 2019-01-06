import {Component, OnInit} from '@angular/core';
import {NgxSmartModalService} from "ngx-smart-modal";
import {ToastrService} from "ngx-toastr";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {VendorModel} from "../../model/vendor-model";
import {DataTableRequest} from "../../../core/model/data-table-request";
import {VendorService} from "../../service/vendor.service";
import {ResponseMessage} from "../../../core/model/response-message";
import {HttpErrorResponse} from "@angular/common/http";
import {Util} from "../../../core/Util";
import {RequestMessage} from "../../../core/model/request-message";

import * as Models from '../../model';

import * as _ from 'lodash';
import * as HttpStatus from 'http-status-codes'
import {HttpStatusCode} from "../../../core/constants/HttpStatusCode";
declare var jQuery: any;

@Component({
  selector: 'app-vendor',
  templateUrl: './vendor.component.html',
  styleUrls: ['./vendor.component.scss']
})
export class VendorComponent implements OnInit {


  public pageTitle:string="Vendor";

  public vendorModel: VendorModel = new VendorModel();

  public entryForm: FormGroup;
  public formSubmitted:boolean=false;

  public dataTableOptions: DataTables.Settings = {};
  public vendorModelList: Array<VendorModel> = new Array<VendorModel>();

  public isPageInUpdateState: boolean;
  public hideInputForm: boolean;
  public disablePageElementOnDetailsView: boolean;

  private dataTablesCallBackParameters: DataTableRequest;
  private dataTableCallbackFunction: any;


  constructor(private vendorService: VendorService,
              private formBuilder: FormBuilder,
              private toaster: ToastrService,
              public  ngxSmartModalService: NgxSmartModalService) {
  }


  ngOnInit() {
    this.initializeReactiveFormValidation();
    this.initializedPageStateVariable();
    this.populateDataTable();
    //Models.BrandModel
  }



  public onClickSubmit(){
    this.formSubmitted = true;

    if(this.isPageInUpdateState && !this.entryForm.invalid){
      this.updateVendor();
      return;
    }

    if(!this.isPageInUpdateState){
      if(this.entryForm.invalid){
        this.toaster.info("Please provide required form data",this.pageTitle);
        return;
      }
    }
    //======== now we safely save entry form data
    this.saveVendor();
    return;
  }

  public onClickReset(){
    let editItemId:string;
    if(!this.isPageInUpdateState){
      this.vendorModel = new VendorModel();
    }else {
      editItemId = this.vendorModel.id;
      this.vendorModel = new VendorModel();
      this.vendorModel.id=editItemId;
    }
  }

  public onClickCancel(){
    this.vendorModel = new VendorModel();
    this.isPageInUpdateState=false;
    this.disablePageElementOnDetailsView=false;
    this.hideEntryForm();
  }

  // ========== Data table button event =====================

  private populateDataTable():void{

    this.dataTableOptions =
      {
        pagingType: 'full_numbers',
        pageLength: 10,
        serverSide: true,
        processing: false,
        searching: true,
        ajax: (dataTablesParameters: DataTableRequest, callback) => {
          this.getVendorList(dataTablesParameters, callback);
        },
        columns: [{data: 'name'},{data:'phoneNo'},{data:'email'},{data:'address'}, {data: 'description'}]
      };
  }

  private getVendorList(dataTablesParameters: DataTableRequest, callback: any):Array<VendorModel> {
    this.dataTablesCallBackParameters = dataTablesParameters;
    this.dataTableCallbackFunction = callback;

    this.vendorService.getList(dataTablesParameters).subscribe
    (
      (response: ResponseMessage) =>
      {
        if(response.httpStatus==HttpStatusCode.FOUND) {
          this.vendorModelList = <Array<VendorModel>>response.data;
          callback({
            recordsTotal: response.dataTableResponse.recordsTotal,
            recordsFiltered: response.dataTableResponse.recordsTotal,
            data: []
          });
          return;
        }else if(response.httpStatus == HttpStatusCode.NOT_FOUND){
          this.toaster.error(response.message,this.pageTitle);
          return;
        }else {
          return;
        }
      },

      (httpErrorResponse: HttpErrorResponse) =>
      {
        if (httpErrorResponse.error instanceof Error) {
          this.toaster.error('Datatable population ',this.pageTitle);
          Util.logConsole(httpErrorResponse,"Client-side error occurred.");
        } else {
          this.toaster.error('Please try again later',this.pageTitle);
          Util.logConsole(httpErrorResponse,"Client-side error occurred.");
        }
        return;
      }
    );
    return this.vendorModelList;
  }

  public onClickDetails(id){
    this.vendorModel = _.find(this.vendorModelList,{id});
    this.disablePageElementOnDetailsView=true;
    this.isPageInUpdateState=false;
    this.showEntryForm();
  }

  public onClickEdit(id){

    this.vendorService.getById(id).subscribe
    (
      (responseMessage: ResponseMessage) =>
      {
        if(responseMessage.httpStatus==HttpStatus.OK) {
          this.vendorModel = <VendorModel> responseMessage.data;
          return;
        }else {
          this.toaster.error('Failed to get requested '+ this.pageTitle, this.pageTitle);
          return;
        }
      },
      (httpErrorResponse: HttpErrorResponse) =>
      {
        this.toaster.error('Failed to get requested brand','Brand')
        if (httpErrorResponse.error instanceof Error) {
          console.log("Client-side error occurred.");
        } else {
          console.log("Server-side error occurred.");
        }
        return;
      }
    );

    this.disablePageElementOnDetailsView=false;
    this.isPageInUpdateState=true;
    this.showEntryForm();
  }

  public onClickDelete(id){
    let selectedDeleteModel: VendorModel;
    selectedDeleteModel = _.find(this.vendorModelList, {id});
    this.vendorModel = selectedDeleteModel;
    this.ngxSmartModalService.getModal('deleteConfirmationModal').open();
  }

  public onDeleteConfirm(id: string) {
    this.vendorService.delete(id).subscribe
    (
      (responseMessage: ResponseMessage) =>
      {
        if(responseMessage.httpStatus==HttpStatus.OK) {
          this.toaster.success(responseMessage.message, this.pageTitle);
          this.resetPage();
          this.hideEntryForm();
          return;
        }else {
          this.toaster.error(responseMessage.message, this.pageTitle);
          return
        }
      },
      (httpErrorResponse: HttpErrorResponse) =>
      {
        this.toaster.error('Failed to delete '+this.pageTitle, this.pageTitle);
        if (httpErrorResponse.error instanceof Error) {
          console.log("Client-side error occurred.");
        } else {
          console.log("Server-side error occurred.");
        }
        return;
      }
    );
    return;
  }

  // ========== Data table button event =====================

  private saveVendor():void{
    let requestMessage: RequestMessage;
    //this.replaceCharacterFromModelField();
    requestMessage = Util.getRequestMessage(this.vendorModel);
    this.vendorService.save(requestMessage).subscribe
    (
      (responseMessage: ResponseMessage) =>
      {
        if(responseMessage.httpStatus== HttpStatus.CONFLICT) {
          this.toaster.info(responseMessage.message, this.pageTitle);
        }else if(responseMessage.httpStatus==HttpStatus.FAILED_DEPENDENCY) {
          this.toaster.error(responseMessage.message,this.pageTitle);
        }else if(responseMessage.httpStatus==HttpStatus.CREATED){
          this.toaster.success( responseMessage.message,this.pageTitle);
          this.vendorModel = <VendorModel> responseMessage.data;
          this.getVendorList(this.dataTablesCallBackParameters, this.dataTableCallbackFunction);
          return;
        }else {
          this.toaster.error(responseMessage.message,this.pageTitle);
          return;
        }
      },

      (httpErrorResponse: HttpErrorResponse) =>
      {
        this.toaster.error('Failed to save vendor',this.pageTitle);
        if (httpErrorResponse.error instanceof Error) {
          Util.logConsole(null,"Client-side error occurred.");
        } else {
          Util.logConsole(null,"Client-side error occurred.");
        }
        return;
      }
    );
    return;
  }

  private updateVendor():void{
    let requestMessage: RequestMessage;
    //this.replaceCharacterFromModelField();
    requestMessage = Util.getRequestMessage(this.vendorModel);
    //requestMessage = Util.getRequestMessage(this.vendorModel);

    this.vendorService.update(requestMessage).subscribe
    (
      (responseMessage: ResponseMessage) =>
      {
        if(responseMessage.httpStatus==HttpStatus.CONFLICT) {
          this.toaster.info(responseMessage.message,this.pageTitle);
          return;
        }else if(responseMessage.httpStatus==HttpStatus.OK){
          this.toaster.success(responseMessage.message, this.pageTitle);
          this.resetPage();
          return;
        }else {
          this.toaster.error(responseMessage.message,this.pageTitle);
          return;
        }
      },

      (httpErrorResponse: HttpErrorResponse) =>
      {
        this.toaster.error('Failed to update brand',this.pageTitle);
        if (httpErrorResponse.error instanceof Error) {
          Util.logConsole(null,"Client-side error occurred.");
        } else {
          Util.logConsole(null,"Client-side error occurred.");
        }
      }
    );
  }

  private resetPage():void {
    this.vendorModel = new VendorModel();
    this.isPageInUpdateState = false;
    this.formSubmitted=false;
    this.getVendorList(this.dataTablesCallBackParameters, this.dataTableCallbackFunction);
    return;
  }

  private initializedPageStateVariable():void{
    this.isPageInUpdateState = false;
    this.hideInputForm = false;
    this.disablePageElementOnDetailsView = false;
    this.dataTablesCallBackParameters = new DataTableRequest();
    this.dataTablesCallBackParameters.start = 0;
    this.dataTablesCallBackParameters.length = 10;
  }

  private initializeReactiveFormValidation():void{
    //let notAllowedCharacter = "^[A-Za-z0-9_.]+$";
    //let notAllowedCharacter = "^[A-Za-z0-9-_. \\\\ \\/ - \\n]+$";
    this.entryForm = this.formBuilder.group({
      name:     ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
      phoneNo1:  ['', Validators.compose([Validators.required, Validators.maxLength(20)])],
      phoneNo2:  ['', Validators.compose([Validators.maxLength(20)])],
      email:    ['', Validators.compose([Validators.email, Validators.maxLength(50)])],
      address: ['', Validators.compose([Validators.maxLength(200)])],
      description: ['', Validators.compose([Validators.maxLength(200)])]

      //address: ['', Validators.compose([Validators.maxLength(200), Validators.pattern(notAllowedCharacter)])],
      //description: ['', Validators.compose([Validators.maxLength(200), Validators.pattern(notAllowedCharacter)])]

    });
  }

  private showEntryForm():void{
    jQuery('#collapseInputForm').collapse('show');
    jQuery('html, body').animate({scrollTop: '0px'}, 500);
    jQuery("#collapseInputForm").scrollTop();
  }

  private hideEntryForm():void{
    jQuery('#collapseInputForm').collapse('hide');
    setTimeout
    (
      () =>
      {
        this.disablePageElementOnDetailsView = false;
      }, 500
    );
    return;
  }
}
