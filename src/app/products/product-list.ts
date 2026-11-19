import { Component, computed, signal } from '@angular/core';

export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  price: number;
  weight: number;
  stock: number;
  active: boolean;
}

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.html',
})
export class ProductList {
  nextId = 7;

  sku = signal<string>('');
  name = signal<string>('');
  category = signal<string>('');
  price = signal<number>(0);
  weight = signal<number>(0);
  stock = signal<number>(0);
  editedId = signal<number | null>(null);

  products = signal<Product[]>([
    {
      id: 1,
      sku: 'LAP-001',
      name: 'Laptop Nova 15',
      category: 'Calculatoare',
      price: 3200,
      weight: 1800,
      stock: 4,
      active: true,
    },
    {
      id: 2,
      sku: 'MOU-002',
      name: 'Mouse Wireless',
      category: 'Accesorii',
      price: 90,
      weight: 95,
      stock: 25,
      active: true,
    },
    {
      id: 3,
      sku: 'MON-003',
      name: 'Monitor 27 inch',
      category: 'Calculatoare',
      price: 1100,
      weight: 4200,
      stock: 0,
      active: true,
    },
    {
      id: 4,
      sku: 'CAS-004',
      name: 'Casti Studio',
      category: 'Accesorii',
      price: 250,
      weight: 280,
      stock: 12,
      active: true,
    },
    {
      id: 5,
      sku: 'CAF-005',
      name: 'Cafea boabe 1kg',
      category: 'Bucatarie',
      price: 60,
      weight: 1000,
      stock: 40,
      active: true,
    },
    {
      id: 6,
      sku: 'CEA-006',
      name: 'Ceainic electric',
      category: 'Bucatarie',
      price: 300,
      weight: 900,
      stock: 3,
      active: false,
    },
  ]);

  skuError = computed<string>(() => {
    const val = this.sku().trim();
    if (!val) return 'SKU-ul e obligatoriu';
    const currentId = this.editedId();
    if (this.products().some((p) => p.sku === val && p.id !== currentId)) {
      return 'SKU-ul exista deja';
    }
    return '';
  });

  nameError = computed<string>(() => (this.name().trim() ? '' : 'Numele e obligatoriu'));

  categoryError = computed<string>(() => (this.category().trim() ? '' : 'Categoria e obligatorie'));

  priceError = computed<string>(() => {
    const val = this.price();
    if (Number.isNaN(val) || val < 1 || val > 50000) {
      return 'Pretul trebuie sa fie intre 1 si 50000';
    }
    return '';
  });

  weightError = computed<string>(() => {
    const val = this.weight();
    if (Number.isNaN(val) || val < 0) {
      return 'Greutatea trebuie sa fie mai mare ca 0';
    }
    return '';
  });

  stockError = computed<string>(() => {
    const val = this.stock();
    if (Number.isNaN(val) || !Number.isInteger(val) || val < 0) {
      return 'Stocul trebuie sa fie un numar intreg, minim 0';
    }
    return '';
  });

  hasErrors = computed<boolean>(
    () =>
      Boolean(this.skuError()) ||
      Boolean(this.nameError()) ||
      Boolean(this.categoryError()) ||
      Boolean(this.priceError()) ||
      Boolean(this.weightError()) ||
      Boolean(this.stockError()),
  );

  canSave = computed<boolean>(() => !this.hasErrors());

  resetForm(): void {
    this.sku.set('');
    this.name.set('');
    this.category.set('');
    this.price.set(0);
    this.weight.set(0);
    this.stock.set(0);
    this.editedId.set(null);
  }

  startEdit(p: Product): void {
    this.editedId.set(p.id);
    this.sku.set(p.sku);
    this.name.set(p.name);
    this.category.set(p.category);
    this.price.set(p.price);
    this.weight.set(p.weight);
    this.stock.set(p.stock);
  }

  cancelEdit(): void {
    this.resetForm();
  }

  save(): void {
    if (!this.canSave()) return;

    const currentId = this.editedId();
    if (currentId !== null) {
      this.products.update((list) =>
        list.map((p) =>
          p.id === currentId
            ? {
                ...p,
                sku: this.sku().trim(),
                name: this.name().trim(),
                category: this.category().trim(),
                price: this.price(),
                weight: this.weight(),
                stock: this.stock(),
              }
            : p,
        ),
      );
      this.resetForm();
      return;
    }

    const newProduct: Product = {
      id: this.nextId++,
      sku: this.sku().trim(),
      name: this.name().trim(),
      category: this.category().trim(),
      price: this.price(),
      weight: this.weight(),
      stock: this.stock(),
      active: true,
    };

    this.products.update((list) => [...list, newProduct]);
    this.resetForm();
  }

  remove(id: number): void {
    this.products.update((list) => list.filter((p) => p.id !== id));
    if (this.editedId() === id) {
      this.resetForm();
    }
  }
  totalPrice = computed<number>(() => this.products().reduce((sum, p) => sum + p.price, 0));

  averagePrice = computed<number>(() => {
    const list = this.products();
    if (list.length === 0) return 0;
    return Math.round((this.totalPrice() / list.length) * 10) / 10;
  });

  mostExpensive = computed<Product | null>(() => {
    const list = this.products();
    if (list.length === 0) return null;
    return list.reduce((best, p) => (p.price > best.price ? p : best), list[0]);
  });

  categoryCounts = computed<{ category: string; count: number }[]>(() => {
    const list = this.products();
    const categories = list
      .map((p) => p.category)
      .filter((cat, index, arr) => arr.indexOf(cat) === index);

    return categories.map((cat) => ({
      category: cat,
      count: list.filter((p) => p.category === cat).length,
    }));
  });
  onlyActive = signal<boolean>(false);

  visible = computed<Product[]>(() => {
    if (this.onlyActive()) {
      return this.products().filter((p) => p.active === true);
    } else {
      return this.products();
    }
  });

  changeStock(id: number, delta: number): void {
    this.products.update((list) =>
      list.map((p) => {
        if (p.id === id && p.stock + delta >= 0) {
          return { ...p, stock: p.stock + delta };
        }
        return p;
      }),
    );
  }

  toggleActive(id: number): void {
    this.products.update((list) =>
      list.map((p) => {
        if (p.id === id) {
          return { ...p, active: !p.active };
        }
        return p;
      }),
    );
  }

  outOfStockCount = computed<number>(() => {
    return this.products().filter((p) => p.stock === 0).length;
  });
  stockValue = computed<number>(() => {
    return this.products().reduce((total, p) => total + p.price * p.stock, 0);
  });

  mostStock = computed<Product | null>(() => {
    const list = this.products();
    if (list.length === 0) {
      return null;
    }
    return list.reduce((best, p) => {
      if (p.stock > best.stock) {
        return p;
      }
      return best;
    });
  });
  cart = signal<{ id: number; name: string; price: number; qty: number }[]>([]);
  addToCart(p: Product): void {
    if (p.stock === 0 || !p.active) {
      return;
    }

    const found = this.cart().find((x) => x.id === p.id);
    if (found) {
      if (found.qty < p.stock) {
        const updatedCart = this.cart().map((x) => {
          if (x.id === p.id) {
            return { id: x.id, name: x.name, price: x.price, qty: x.qty + 1 };
          }
          return x;
        });
        this.cart.set(updatedCart);
      }
      return;
    }

    const newCart = this.cart().concat([{ id: p.id, name: p.name, price: p.price, qty: 1 }]);
    this.cart.set(newCart);
  }
  removeFromCart(id: number): void {
    const remaining: { id: number; name: string; price: number; qty: number }[] = [];
    for (const x of this.cart()) {
      if (x.id !== id) {
        remaining.push(x);
      }
    }
    this.cart.set(remaining);
  }

  changeCartQty(id: number, delta: number): void {
    const prod = this.products().find((p) => p.id === id);
    const maxStock = prod ? prod.stock : 0;

    const updatedCart: { id: number; name: string; price: number; qty: number }[] = [];
    for (const x of this.cart()) {
      if (x.id === id) {
        const nextQty = x.qty + delta;
        if (nextQty > 0 && nextQty <= maxStock) {
          updatedCart.push({ id: x.id, name: x.name, price: x.price, qty: nextQty });
        } else if (nextQty > maxStock) {
          updatedCart.push(x);
        }
      } else {
        updatedCart.push(x);
      }
    }
    this.cart.set(updatedCart);
  }

  cartCount = computed<number>(() => {
    return this.cart().reduce((sum, x) => sum + x.qty, 0);
  });
  subtotal = computed<number>(() => {
    return this.cart().reduce((sum, x) => sum + x.price * x.qty, 0);
  });
  discount = computed<number>(() => {
    if (this.subtotal() > 1000) {
      return Math.round(this.subtotal() * 0.1);
    }
    return 0;
  });
  totalToPay = computed<number>(() => {
    return this.subtotal() - this.discount();
  });
  checkout(): void {
    const itemsInCart = this.cart();

    const updatedProducts = this.products().map((p) => {
      const found = itemsInCart.find((x) => x.id === p.id);
      if (found) {
        const left = p.stock - found.qty;
        return {
          id: p.id,
          sku: p.sku,
          name: p.name,
          category: p.category,
          price: p.price,
          weight: p.weight,
          stock: left >= 0 ? left : 0,
          active: p.active,
        };
      }
      return p;
    });
    this.products.set(updatedProducts);
    this.cart.set([]);
  }
}

