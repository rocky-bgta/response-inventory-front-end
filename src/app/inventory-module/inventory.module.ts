import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from "@angular/router";
import {inventoryRoutes} from "./inventory-routing";
import {InventoryComponent} from "./inventory.component";
import {CategoryComponent} from "./category/category.component";

@NgModule({
  declarations: [InventoryComponent,CategoryComponent],
  imports: [
    [RouterModule.forChild(inventoryRoutes)],
    CommonModule,
  ],
  bootstrap: [
    InventoryComponent
  ]
})
export class InventoryModule { }
