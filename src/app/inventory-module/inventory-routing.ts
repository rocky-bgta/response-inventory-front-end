import {Routes} from '@angular/router';
import {InventoryComponent} from './inventory.component';
import {CategoryComponent} from "./category/category.component";


export const inventoryRoutes: Routes = [
  {
    path: '',
    component: InventoryComponent,
    children: [
      {path: 'category', component: CategoryComponent}
    ]
  },
];
