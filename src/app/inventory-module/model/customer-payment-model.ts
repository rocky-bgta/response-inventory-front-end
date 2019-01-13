export class CustomerPaymentModel{
   id:string;
   customerId:string;
   invoiceNo:string;
   paidAmount:number;
   dueAmount:number;
   grandTotal:number;
   paidStatus:number;
   invoiceDate:Date;
   paymentDate:Date;

  //========================
   customerName:string;

   currentPayment:number;
}
