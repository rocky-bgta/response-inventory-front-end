import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from "@angular/router";
import {inventoryRoutes} from "./inventory-routing";
import {CategoryComponent} from "./category/category.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {TranslateModule} from "@ngx-translate/core";
import {DataTablesModule} from "angular-datatables";
import {NgSelectModule} from "@ng-select/ng-select";

@NgModule({
  declarations: [CategoryComponent],
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
