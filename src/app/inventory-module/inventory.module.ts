import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule} from "@angular/router";
import {inventoryRoutes} from "./inventory-routing";
import {InventoryComponent} from "./inventory.component";

@NgModule({
  declarations: [],
  imports: [
    [RouterModule.forRoot(inventoryRoutes)],
    CommonModule
  ],
  bootstrap: [
    InventoryComponent
  ]
})
export class InventoryModule { }
