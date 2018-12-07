import {Component, OnInit} from '@angular/core';
import {ProductModel} from "../../model/product-model";
import {Util} from "../../../core/Util";
import {ProductService} from "../../service/product.service";
import {ResponseMessage} from "../../../core/model/response-message";
import {FormGroup} from "@angular/forms";
import {CategoryModel} from "../../model/category-model";
import {CategoryService} from "../../service/category.service";
import {RequestMessage} from "../../../core/model/request-message";
import {HttpErrorResponse} from "@angular/common/http";
//var base64Img = require('base64-img');
//var image2base64:any;

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {

  public categoryModelList:Array<CategoryModel>;
  public productModel:ProductModel;
  public productForm: FormGroup;



  public isPageUpdateState: boolean;
  public hideCategoryInputForm: boolean;
  public disableElementOnDetailsView: boolean;

  private base64imageString:string;
  base64textString = [];

  public imageBack:any[];

  constructor(private productService: ProductService,
              private categoryService:CategoryService) {
    //super();
  }

  get f() {
    return this.productForm.controls;
  }

  ngOnInit() {
    this.productModel = new ProductModel();
    this.categoryModelList = new Array<CategoryModel>();
    this.isPageUpdateState=false;
    this.hideCategoryInputForm=false;
    this.disableElementOnDetailsView=false;

    this.getCategoryList();
  }

  public onClickSave(){
    let requestMessage:RequestMessage;
    this.productModel.base64ImageString = this.base64imageString;
    requestMessage = Util.getRequestMessage(this.productModel);

    //Util.logConsole(requestMessage);



    this.productService.save(requestMessage).subscribe(
      (responseMessage: ResponseMessage) => {
        Util.toasterService.success('Product', responseMessage.message);
        this.productModel = <ProductModel> responseMessage.data;
        this.setImage(this.productModel.base64ImageString);
        //this.getCategoryList(this.dataTablesCallBackParameters, this.dataTableCallbackFunction);
      },
      (httpErrorResponse: HttpErrorResponse) => {
        Util.errorHandler(httpErrorResponse);
      }
    );



    /*
    this.productService.saveImage(this.base64textString).subscribe(
      response=>{
        Util.logConsole(response)
      },
      error=>{
        Util.logConsole(error)
      }
    );
    */

  }

  private getCategoryList(){
    this.categoryService.getList().subscribe(
      (response:ResponseMessage)=>{
        this.categoryModelList = <Array<CategoryModel>>response.data;
      },(httpErrorResponse: HttpErrorResponse)=>{
          Util.errorHandler(httpErrorResponse);
      }
    )
  }


  /*

  public getImage(){
    this.productService.getImage().subscribe(
      (response:ResponseMessage)=>{
        this.productModel = <ProductModel> response.data;
        //this.base64textString.push(this.productModel.image);
        //this.imageBack=btoa(new Uint8Array(this.productModel.image).reduce((data, byte) => data + String.fromCharCode(byte), ''));


        Util.logConsole(this.productModel.image);
        //this.base64textString = this.imageBack
      },error=>{

      }
    )
  }
  */



  public onUploadChange(event: any) {
    let file = event.target.files[0];
    if (file) {
      let reader = new FileReader();
      reader.onload = this.handleReaderLoaded.bind(this);
      reader.readAsBinaryString(file);
    }
  }

  private handleReaderLoaded(e) {
    this.base64imageString=(btoa(e.target.result));
    this.base64textString.push('data:image/png;base64,' + this.base64imageString);
  }

  private setImage(image:string){
    this.base64textString.push('data:image/png;base64,' + image);
  }

}
