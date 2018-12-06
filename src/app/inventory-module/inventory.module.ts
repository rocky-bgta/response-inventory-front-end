import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from "@angular/router";
import {inventoryRoutes} from "./inventory-routing";
import {CategoryComponent} from "./components/category/category.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {TranslateModule} from "@ngx-translate/core";
import {DataTablesModule} from "angular-datatables";
import {NgSelectModule} from "@ng-select/ng-select";
import {ProductComponent} from './components/product/product.component';
import {NgxSmartModalModule} from "ngx-smart-modal";

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
      NgSelectModule,
      NgxSmartModalModule.forRoot()
  ],
  bootstrap: [
  ]
})
export class InventoryModule { }
