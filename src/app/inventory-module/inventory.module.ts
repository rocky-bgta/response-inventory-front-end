import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from "@angular/router";
import {inventoryRoutes} from "./inventory-routing";
import {CategoryComponent} from "./category/category.component";

@NgModule({
  declarations: [CategoryComponent],
  imports: [
    [RouterModule.forChild(inventoryRoutes)],
    CommonModule,
  ],
  bootstrap: [
  ]
})
export class InventoryModule { }
