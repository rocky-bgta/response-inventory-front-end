import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from "@angular/router";
import {inventoryRoutes} from "./inventory-routing";
import {CategoryComponent} from "./category/category.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {TranslateModule} from "@ngx-translate/core";
import {DataTablesModule} from "angular-datatables";
import {NgSelectModule} from "@ng-select/ng-select";
import {ProductComponent} from './product/product.component';

@NgModule({
  declarations: [CategoryComponent, ProductComponent],
  imports: [
    [
      RouterModule.forChild(inventoryRoutes)],
      CommonModule,
      ReactiveFormsModule,
      FormsModule,
      HttpClientModule,
      TranslateModule,
      DataTablesModule,
      NgSelectModule
  ],
  bootstrap: [
  ]
})
export class InventoryModule { }
