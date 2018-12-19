import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from "@angular/router";
import {inventoryRoutes} from "./inventory-routing";
import {CategoryComponent} from "./components/category/category.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {DataTablesModule} from "angular-datatables";
import {NgSelectModule} from "@ng-select/ng-select";
import {ProductComponent} from './components/product/product.component';
import {NgxSmartModalModule} from "ngx-smart-modal";
import {ConfirmationModalComponent} from "../core/components/confirmation-modal/confirmation-modal.component";
import { BrandComponent } from './components/brand/brand.component';
import { VendorComponent } from './components/vendor/vendor.component';
import { StoreComponent } from './components/store/store.component';
import { StoreInProductsComponent } from './components/store-in-products/store-in-products.component';
import { StoreSalesProductsComponent } from './components/store-sales-products/store-sales-products.component';

@NgModule({
  declarations: [
    CategoryComponent,
    ProductComponent,
    ConfirmationModalComponent,
    BrandComponent,
    VendorComponent,
    StoreComponent,
    StoreInProductsComponent,
    StoreSalesProductsComponent
  ],
  imports: [
    [
      RouterModule.forChild(inventoryRoutes)],
      CommonModule,
      ReactiveFormsModule,
      FormsModule,
      HttpClientModule,
      DataTablesModule,
      NgSelectModule,
      NgxSmartModalModule.forRoot()
  ],
  bootstrap: [
  ]
})
export class InventoryModule { }
