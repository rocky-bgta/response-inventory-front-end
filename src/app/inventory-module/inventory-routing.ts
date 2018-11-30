import {Routes} from '@angular/router';
import {CategoryComponent} from "./category/category.component";


export const inventoryRoutes: Routes = [
  {
    path: '',
    children: [
      {path: 'category', component: CategoryComponent}
    ]
  },
];
