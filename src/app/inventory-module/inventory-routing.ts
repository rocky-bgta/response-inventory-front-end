import {Routes} from '@angular/router';
import {CategoryComponent} from "./components/category/category.component";
import {ProductComponent} from "./components/product/product.component";
import {BrandComponent} from "./components/brand/brand.component";
import {VendorComponent} from "./components/vendor/vendor.component";
import {StoreComponent} from "./components/store/store.component";
import {StoreInProductsComponent} from "./components/store-in-products/store-in-products.component";
import {StoreSalesProductsComponent} from "./components/store-sales-products/store-sales-products.component";
import {CustomerComponent} from "./components/customer/customer.component";
import {StockComponent} from "./components/stock/stock.component";
import {ProductSalesReportComponent} from "./components/product-sales-report/product-sales-report.component";
import {ProductSalesComponent} from "./components/product-sales/product-sales.component";
import {CustomerPaymentComponent} from "./components/customer-payment/customer-payment.component";
import {InvoiceHistoryComponent} from "./components/invoice-history/invoice-history.component";


export const inventoryRoutes: Routes = [
  {
    path: '',
    children: [
      {path: 'stock', component: StockComponent, pathMatch: 'full'},
      {path: 'category', component: CategoryComponent, pathMatch: 'full'},
      {path: 'product', component: ProductComponent, pathMatch: 'full'},
      {path: 'brand', component: BrandComponent, pathMatch: 'full'},
      {path: 'vendor', component: VendorComponent, pathMatch: 'full'},
      {path: 'customer', component: CustomerComponent, pathMatch: 'full'},
      {path: 'store', component: StoreComponent, pathMatch: 'full'},
      {path: 'store-in-products', component: StoreInProductsComponent, pathMatch: 'full'},
      //{path: 'store-sales-products', component: StoreSalesProductsComponent, pathMatch: 'full'},
      {path: 'product-sales-report', component: ProductSalesReportComponent, pathMatch: 'full'},
      {path: 'product-sales', component: ProductSalesComponent, pathMatch: 'full'},
      {path: 'customer-payment', component: CustomerPaymentComponent, pathMatch: 'full'},
      {path: 'invoice-history', component: InvoiceHistoryComponent, pathMatch: 'full'},

    ]
  },
];
