import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PedidoService } from '../pedido.service';

@Component({
  selector: 'app-form-venta',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form-venta.component.html',
  styles: ``,
})
export class FormVentaComponent implements OnInit {
  form: FormGroup;

  constructor(private fb: FormBuilder, private pedidoService: PedidoService) {
    this.form = this.fb.group({
      name: [''],
      direccion: [''],
      telefono: [''],
      pizzaSize: [''],
      ingredientes: this.fb.group({
        jamon: [false],
        pina: [false],
        champinones: [false],
      }),
      cantidad: [''],
      fecha: [''],
    });
  }

  ngOnInit(): void {}

  agregarPizza(): void {
    const nuevoPedido = {
      name: this.form.get('name')?.value,
      direccion: this.form.get('direccion')?.value,
      telefono: this.form.get('telefono')?.value,
      pizzaSize: this.form.get('pizzaSize')?.value,
      cantidad: parseInt(this.form.get('cantidad')?.value, 10),
      ingredientes: this.obtenerIngredientesSeleccionados(),
      fecha: this.form.get('fecha')?.value,
    };
    this.pedidoService.agregarPedido(nuevoPedido);
    /* this.form.reset(); */
  }

  obtenerIngredientesSeleccionados(): string[] {
    const ingredientesGroup = this.form.get('ingredientes') as FormGroup;
    return Object.keys(ingredientesGroup.controls).filter(
      (key) => ingredientesGroup.get(key)?.value
    );
  }
}
