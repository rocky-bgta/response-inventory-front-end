import {Routes} from '@angular/router';
import {CategoryComponent} from "./components/category/category.component";
import {ProductComponent} from "./components/product/product.component";
import {BrandComponent} from "./components/brand/brand.component";
import {VendorComponent} from "./components/vendor/vendor.component";


export const inventoryRoutes: Routes = [
  {
    path: '',
    children: [
      {path: 'category', component: CategoryComponent, pathMatch: 'full'},
      {path: 'product', component: ProductComponent, pathMatch: 'full'},
      {path: 'brand', component: BrandComponent, pathMatch: 'full'},
      {path: 'vendor', component: VendorComponent, pathMatch: 'full'}
    ]
  },
];
