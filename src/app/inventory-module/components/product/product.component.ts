import {Component, OnInit} from '@angular/core';
import {ProductModel} from "../../model/product-model";
import {Util} from "../../../core/Util";
import {ProductService} from "../../service/product.service";
import {ResponseMessage} from "../../../core/model/response-message";
import {FormGroup} from "@angular/forms";
import {CategoryModel} from "../../model/category-model";

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

  public files: any[];
  base64textString = [];

  public imageBack:any[];

  constructor(private productService: ProductService ) {
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
  }

  public onClickSave(){
    this.productService.saveImage(this.base64textString).subscribe(
      response=>{
        Util.logConsole(response)
      },
      error=>{
        Util.logConsole(error)
      }
    )
  }

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

  onUploadChange(evt: any) {
    console.log(evt);
    const file = evt.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = this.handleReaderLoaded.bind(this);
      reader.readAsBinaryString(file);
    }
  }

  handleReaderLoaded(e) {
    Util.logConsole(btoa(e.target.result),"Image");

    this.base64textString.push('data:image/png;base64,' + btoa(e.target.result));
  }

}
