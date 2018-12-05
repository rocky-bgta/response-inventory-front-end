import {Component, OnInit} from '@angular/core';
import {ProductModel} from "../../model/product-model";
import {Util} from "../../../core/Util";

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {

  public productModel:ProductModel;

  public files: any[];
  base64textString = [];

  constructor() {
  }

  ngOnInit() {
   this.productModel = new ProductModel();
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
    this.base64textString.push('data:image/png;base64,' + btoa(e.target.result));
  }

}
