import {Routes} from '@angular/router';
import {CategoryComponent} from "./category/category.component";
import {ProductComponent} from "./product/product.component";


export const inventoryRoutes: Routes = [
  {
    path: '',
    children: [
      {path: 'category', component: CategoryComponent, pathMatch: 'full'},
      {path: 'product', component: ProductComponent, pathMatch: 'full'}
    ]
  },
];
