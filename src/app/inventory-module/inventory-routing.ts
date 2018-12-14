import {Routes} from '@angular/router';
import {CategoryComponent} from "./components/category/category.component";
import {ProductComponent} from "./components/product/product.component";
import {BrandComponent} from "./components/brand/brand.component";


export const inventoryRoutes: Routes = [
  {
    path: '',
    children: [
      {path: 'category', component: CategoryComponent, pathMatch: 'full'},
      {path: 'product', component: ProductComponent, pathMatch: 'full'},
      {path: 'brand', component: BrandComponent, pathMatch: 'full'}
    ]
  },
];
