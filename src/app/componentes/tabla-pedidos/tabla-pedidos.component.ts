import { Component, OnInit } from '@angular/core';
import { PedidoService } from '../pedido.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabla-pedidos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabla-pedidos.component.html',
  styles: ``,
})
export class TablaPedidosComponent implements OnInit {
  pedidos: any[] = [];

  constructor(private pedidoService: PedidoService) {}

  ngOnInit(): void {
    this.pedidoService.pedidos$.subscribe((pedidos) => {
      this.pedidos = pedidos.filter(
        (pedido) => pedido && Object.keys(pedido).length > 0
      );
    });
  }

  eliminarPedido(pedido: any): void {
    this.pedidoService.eliminarPedido(pedido);
  }

  terminarPedido(): void {
    this.pedidoService.terminarPedido();
  }
  calcularTotal(): number {
    return this.pedidos.reduce((total, pedido) => total + pedido.precio, 0);
  }
}
