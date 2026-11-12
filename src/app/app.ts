import { Component } from '@angular/core';
import { ProductList } from './products/product-list';

@Component({
  selector: 'app-root',
  imports: [ProductList],
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
