import { Order } from 'src/app/shared/models/Order';
import { Component } from '@angular/core';
import { OrderService } from 'src/app/services/order.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent {
  orders:Order[] = []
  constructor(private orderService:OrderService,private router:Router){
    orderService.getOrders().subscribe(orders => {
      this.orders = orders;
    })

  }
  goToTrackOrder(orderid:any){
    this.router.navigateByUrl(`/track/${orderid}`);
  }
  ngOnInit(): void {

  }

}
