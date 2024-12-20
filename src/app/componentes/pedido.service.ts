import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PedidoService {
  private pedidosSubject = new BehaviorSubject<any[]>([]);
  pedidos$ = this.pedidosSubject.asObservable();

  private apiUrl = 'http://localhost:5000/terminar-pedido';
  private ventasApiUrl = 'http://localhost:5000/ventas-por-dia'; // Nueva URL para ventas

  private preciosPizza: { [key: string]: number } = {
    Chica: 40,
    Mediana: 80,
    Grande: 120,
  };

  private preciosIngredientes: { [key: string]: number } = {
    jamon: 10,
    pina: 10,
    champinones: 10,
  };

  constructor(private http: HttpClient) {}

  private obtenerPedidos(): any[] {
    return JSON.parse(localStorage.getItem('pedidos') || '[]');
  }

  /* FormPedidos */
  agregarPedido(nuevoPedido: any): void {
    const pedidos = this.pedidosSubject.value;
    const pedidoExistente = pedidos.find(
      (pedido) =>
        pedido.name === nuevoPedido.name &&
        pedido.direccion === nuevoPedido.direccion &&
        pedido.pizzaSize === nuevoPedido.pizzaSize &&
        JSON.stringify(pedido.ingredientes.sort()) ===
          JSON.stringify(nuevoPedido.ingredientes.sort())
    );

    const precioPizza = this.preciosPizza[nuevoPedido.pizzaSize];
    const precioIngredientes = nuevoPedido.ingredientes.reduce(
      (total: number, ingrediente: string) =>
        total + this.preciosIngredientes[ingrediente],
      0
    );

    const precioIndividualPizza = precioPizza + precioIngredientes;
    const pedidoConPrecio = {
      ...nuevoPedido,
      precio: precioIndividualPizza * nuevoPedido.cantidad,
      cantidad: nuevoPedido.cantidad,
    };

    if (pedidoExistente) {
      pedidoExistente.cantidad += nuevoPedido.cantidad;
      pedidoExistente.precio += precioIndividualPizza * nuevoPedido.cantidad;
    } else {
      pedidos.push(pedidoConPrecio);
    }

    this.pedidosSubject.next(pedidos);
  }

  /* TablaPedidos */
  terminarPedido(): void {
    const pedidos = this.pedidosSubject.value;
    const total = pedidos.reduce((sum, pedido) => sum + pedido.precio, 0);

    if (
      confirm(`El costo total es: $${total}. ¿Está de acuerdo con el pedido?`)
    ) {
      const fecha = new Date(pedidos[0].fecha);
      const fechaUTC = new Date(
        fecha.getTime() + fecha.getTimezoneOffset() * 60000
      );
      const diasSemana = [
        'domingo',
        'lunes',
        'martes',
        'miércoles',
        'jueves',
        'viernes',
        'sábado',
      ];
      const diaSemana = diasSemana[fechaUTC.getDay()];

      const detallesPedido = pedidos.map((pedido) => ({
        pizza: pedido.pizzaSize,
        ingredientes: pedido.ingredientes,
        cantidad: pedido.cantidad,
        subtotal: pedido.precio,
      }));

      const pedidoCompleto = {
        cliente: {
          nombre: pedidos[0].name,
          direccion: pedidos[0].direccion,
          telefono: pedidos[0].telefono,
        },
        total: total,
        fecha: pedidos[0].fecha,
        dia_semana: diaSemana,
        detalles: detallesPedido,
      };

      this.http.post(this.apiUrl, pedidoCompleto).subscribe(
        (response) => {
          console.log('Pedido guardado en la base de datos:', response);
          this.pedidosSubject.next([]);
        },
        (error) => {
          console.error('Error al guardar el pedido:', error);
        }
      );
    }
  }

  eliminarPedido(pedido: any): void {
    const pedidos = this.pedidosSubject.value.filter((p) => p !== pedido);
    this.pedidosSubject.next(pedidos);
  }

  /* ResumenVentas */
  obtenerVentasPorDia(dia: string, callback: (ventas: any[]) => void): void {
    const url = `${this.ventasApiUrl}?dia=${dia}`;

    this.http.get<any[]>(url).subscribe(
      (response) => {
        const ventasPorDia = response
          .filter((pedido) => pedido.nombreCliente && pedido.total)
          .map((pedido, index) => ({
            ticketId: `Ticket ${index + 1}`,
            nombreCliente: pedido.nombreCliente,
            total: parseFloat(pedido.total),
          }));

        callback(ventasPorDia); // Llama al callback con las ventas.
      },
      (error) => {
        console.error('Error al obtener ventas por día:', error);
        callback([]); // Llama al callback con un arreglo vacío en caso de error.
      }
    );
  }
}
