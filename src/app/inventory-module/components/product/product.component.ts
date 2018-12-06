import {Component, OnInit} from '@angular/core';
import {ProductModel} from "../../model/product-model";
import {Util} from "../../../core/Util";
import {ProductService} from "../../service/product.service";
import {ResponseMessage} from "../../../core/model/response-message";

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {

  public productModel:ProductModel;

  public files: any[];
  base64textString = [];

  public imageBack:any[];

  constructor(private productService: ProductService ) {
  }

  ngOnInit() {
   this.productModel = new ProductModel();
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
    const file = evt.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = this.handleReaderLoaded.bind(this);
      reader.readAsBinaryString(file);
    }
  }

  handleReaderLoaded(e) {
    Util.logConsole(btoa(e.target.result),"Image");

    this.base64textString.push(btoa(e.target.result));
  }

}
