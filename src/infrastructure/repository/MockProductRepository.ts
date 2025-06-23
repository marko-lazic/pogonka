import { Product } from '../../domain/model/Product';
import { ProductRepository } from '../../domain/repository/ProductRepository';
import { ProductId } from '../../domain/model/ProductId';
import { Money } from '../../domain/model/Money';
import { PidGenerator } from '../util/PidGenerator';

/**
 * MockProductRepository is an in-memory implementation of the ProductRepository interface.
 * It's used for testing and development purposes.
 */
export class MockProductRepository implements ProductRepository {
  private products: Map<string, Product> = new Map();
  private idGenerator = new PidGenerator();

  constructor() {
    // Initialize with one sample product
    this.initializeSampleData();
  }

  async findById(id: ProductId): Promise<Product | null> {
    return this.products.get(id.value) || null;
  }

  async findAll(): Promise<Product[]> {
    return Array.from(this.products.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async findWithPagination(limit: number, offset: number): Promise<{ products: Product[], total: number }> {
    const allProducts = Array.from(this.products.values())
      .sort((a, b) => a.name.localeCompare(b.name));
    const total = allProducts.length;
    const paginatedProducts = allProducts.slice(offset, offset + limit);
    return { products: paginatedProducts, total };
  }

  async searchByNameWithPagination(query: string, limit: number, offset: number): Promise<{ products: Product[], total: number }> {
    if (!query) {
      return this.findWithPagination(limit, offset);
    }

    if (query.trim() === '') {
      return this.findWithPagination(limit, offset);
    }

    const normalizedQuery = query.toLowerCase().trim();
    const allProducts = Array.from(this.products.values());

    const filteredProducts = allProducts.filter(product => {
      // Search by product ID
      if (product.id.value.toLowerCase().includes(normalizedQuery)) {
        return true;
      }

      // Search by product name
      if (product.name.toLowerCase().includes(normalizedQuery)) {
        return true;
      }

      return false;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

    const total = filteredProducts.length;
    const paginatedProducts = filteredProducts.slice(offset, offset + limit);

    return { products: paginatedProducts, total };
  }

  async save(product: Product): Promise<Product> {
    this.products.set(product.id.value, product);
    return product;
  }

  async delete(id: ProductId): Promise<boolean> {
    if (!this.products.has(id.value)) {
      return false;
    }
    this.products.delete(id.value);
    return true;
  }

  private initializeSampleData(): void {
    // Savadeck Products from the catalog
    const savadeck_products = [
      // Hardwood Deking
      { name: 'Savadeck Hardwood Teak', price: 85.50, category: 'Hardwood Deking' },

      // Classic Deking
      { name: 'Classic Deking Patina', price: 36.40, category: 'Classic Deking' },
      { name: 'Classic Deking Teak', price: 36.40, category: 'Classic Deking' },
      { name: 'Classic Deking Chocolate', price: 36.40, category: 'Classic Deking' },

      // Natur Deking
      { name: 'Natur Deking Black', price: 39.60, category: 'Natur Deking' },
      { name: 'Natur Deking Chocolate', price: 39.60, category: 'Natur Deking' },
      { name: 'Natur Deking Cream', price: 39.60, category: 'Natur Deking' },
      { name: 'Natur Deking Patina', price: 39.60, category: 'Natur Deking' },
      { name: 'Natur Deking Teak', price: 39.60, category: 'Natur Deking' },

      // Premium Deking
      { name: 'Premium Deking Coffee', price: 60.00, category: 'Premium Deking' },
      { name: 'Premium Deking Grey', price: 60.00, category: 'Premium Deking' },
      { name: 'Premium Deking Teak', price: 60.00, category: 'Premium Deking' },
      { name: 'Premium Deking White', price: 60.00, category: 'Premium Deking' },
      { name: 'Premium Deking Wood', price: 60.00, category: 'Premium Deking' },

      // Strong Deking
      { name: 'Strong Deking Teak', price: 65.00, category: 'Strong Deking' },
      { name: 'Strong Deking Terracotta', price: 65.00, category: 'Strong Deking' },
      { name: 'Strong Deking Patina', price: 65.00, category: 'Strong Deking' },
      { name: 'Strong Deking Cream', price: 65.00, category: 'Strong Deking' },
      { name: 'Strong Deking Chocolate', price: 65.00, category: 'Strong Deking' },
      { name: 'Strong Deking Black', price: 65.00, category: 'Strong Deking' },

      // Wood
      { name: 'Savadeck Wood', price: 22.50, category: 'Wood' },

      // Štelujuće stope (Adjustable Pedestals)
      { name: 'Štelujuće stope', price: 5.65, category: 'Štelujuće stope' }, // Average price
      { name: 'Korektor nagiba za deking', price: 0.85, category: 'Štelujuće stope' },
      { name: 'Korektor nagiba za pločice', price: 0.75, category: 'Štelujuće stope' },
      { name: 'Korektor nagiba podloge 1%', price: 0.63, category: 'Štelujuće stope' },
      { name: 'Korektor nagiba podloge 2%', price: 0.72, category: 'Štelujuće stope' },
      { name: 'Usadna vinkla', price: 0.27, category: 'Štelujuće stope' },
      { name: 'Usadni krstić za keramiku 3mm i 4mm', price: 0.19, category: 'Štelujuće stope' },
      { name: 'Osigurač (prsten za fiksiranje)', price: 0.50, category: 'Štelujuće stope' },
      { name: 'Guma za keramiku 2mm', price: 0.35, category: 'Štelujuće stope' },
      { name: 'Nastavak', price: 2.00, category: 'Štelujuće stope' },

      // Ograde Natur (Natur Fencing)
      { name: 'Ograda Natur sa aplikacijom Black', price: 106.69, category: 'Ograde Natur' }, // Average price
      { name: 'Ograda Natur sa aplikacijom Cream', price: 106.69, category: 'Ograde Natur' }, // Average price
      { name: 'Ograda Natur sa aplikacijom Patina', price: 106.69, category: 'Ograde Natur' }, // Average price
      { name: 'Ograda Natur sa aplikacijom Chocolate', price: 106.69, category: 'Ograde Natur' }, // Average price
      { name: 'Ograda Natur sa aplikacijom Teak', price: 106.69, category: 'Ograde Natur' }, // Average price
      { name: 'Ograda Natur Teak', price: 85.06, category: 'Ograde Natur' }, // Average price
      { name: 'Ograda Natur Chocolate', price: 85.06, category: 'Ograde Natur' }, // Average price
      { name: 'Ograda Natur Patina', price: 85.06, category: 'Ograde Natur' }, // Average price
      { name: 'Ograda Natur Cream', price: 85.06, category: 'Ograde Natur' }, // Average price
      { name: 'Ograda Natur Black', price: 85.06, category: 'Ograde Natur' }, // Average price

      // Aluminijumske Ograde (Aluminum Fencing)
      { name: 'Transparentna alu ograda S', price: 118.95, category: 'Aluminijumske Ograde' }, // Average price
      { name: 'Transparentna alu ograda M', price: 96.67, category: 'Aluminijumske Ograde' }, // Average price
      { name: 'Transparentna alu ograda L', price: 85.53, category: 'Aluminijumske Ograde' }, // Average price

      // Obloge (Cladding)
      { name: 'Natur ograda Black', price: 39.90, category: 'Obloge' },
      { name: 'Natur ograda Chocolate', price: 39.90, category: 'Obloge' },
      { name: 'Natur ograda Cream', price: 39.90, category: 'Obloge' },
      { name: 'Natur ograda Patina', price: 39.90, category: 'Obloge' },
      { name: 'Natur ograda Teak', price: 39.90, category: 'Obloge' },
      { name: 'Alu letvica 24×18mm', price: 3.00, category: 'Obloge' },
      { name: 'Alu letvica 63×18mm', price: 5.80, category: 'Obloge' },

      // Dekorativne aplikacije (Decorative Applications)
      { name: 'Dekorativna Aplikacija Twilight', price: 104.00, category: 'Dekorativne aplikacije' }, // Average price
      { name: 'Dekorativna Aplikacija Habitat', price: 112.00, category: 'Dekorativne aplikacije' }, // Average price
      { name: 'Dekorativna Aplikacija Pebble', price: 114.00, category: 'Dekorativne aplikacije' }, // Average price
      { name: 'Dekorativna Aplikacija Aspen', price: 94.00, category: 'Dekorativne aplikacije' }, // Average price
      { name: 'Dekorativna Aplikacija Heritage', price: 114.00, category: 'Dekorativne aplikacije' }, // Average price
      { name: 'Dekorativna Aplikacija Hive', price: 112.00, category: 'Dekorativne aplikacije' }, // Average price
      { name: 'Dekorativna Aplikacija Linea', price: 94.00, category: 'Dekorativne aplikacije' }, // Average price
      { name: 'Dekorativna Aplikacija Palm', price: 94.00, category: 'Dekorativne aplikacije' }, // Average price
      { name: 'Dekorativna aplikacija Prism', price: 104.00, category: 'Dekorativne aplikacije' }, // Average price

      // Kapije Pešačka (Pedestrian Gates)
      { name: 'Kapija Natur sa aplikacijom Chocolate', price: 366.75, category: 'Kapije Pešačka' }, // Average price
      { name: 'Kapija Natur sa aplikacijom Patina', price: 366.75, category: 'Kapije Pešačka' }, // Average price
      { name: 'Kapija Natur sa aplikacijom Cream', price: 366.75, category: 'Kapije Pešačka' }, // Average price
      { name: 'Kapija Natur sa aplikacijom Black', price: 366.75, category: 'Kapije Pešačka' }, // Average price
      { name: 'Kapija Natur sa aplikacijom Teak', price: 366.75, category: 'Kapije Pešačka' }, // Average price
      { name: 'Kapija Natur Teak', price: 320.05, category: 'Kapije Pešačka' }, // Average price
      { name: 'Kapija Natur Patina', price: 320.05, category: 'Kapije Pešačka' }, // Average price
      { name: 'Kapija Natur Chocolate', price: 320.05, category: 'Kapije Pešačka' }, // Average price
      { name: 'Kapija Natur Cream', price: 320.05, category: 'Kapije Pešačka' }, // Average price
      { name: 'Kapija Natur Black', price: 320.05, category: 'Kapije Pešačka' }, // Average price
      { name: 'Transparentna alu kapija S', price: 360.95, category: 'Kapije Pešačka' }, // Average price
      { name: 'Transparentna alu kapija M', price: 335.00, category: 'Kapije Pešačka' }, // Average price
      { name: 'Transparentna alu kapija L', price: 322.05, category: 'Kapije Pešačka' }, // Average price

      // Kapije Dvokrilna (Double-wing Gates)
      { name: 'Kapija Natur sa aplikacijom Chocolate', price: 686.55, category: 'Kapije Dvokrilna' }, // Average price
      { name: 'Kapija Natur sa aplikacijom Patina', price: 686.55, category: 'Kapije Dvokrilna' }, // Average price
      { name: 'Kapija Natur sa aplikacijom Cream', price: 686.55, category: 'Kapije Dvokrilna' }, // Average price
      { name: 'Kapija Natur sa aplikacijom Black', price: 686.55, category: 'Kapije Dvokrilna' }, // Average price
      { name: 'Kapija Natur sa aplikacijom Teak', price: 686.55, category: 'Kapije Dvokrilna' }, // Average price
      { name: 'Kapija Natur Teak', price: 606.10, category: 'Kapije Dvokrilna' }, // Average price
      { name: 'Kapija Natur Patina', price: 606.10, category: 'Kapije Dvokrilna' }, // Average price
      { name: 'Kapija Natur Chocolate', price: 606.10, category: 'Kapije Dvokrilna' }, // Average price
      { name: 'Kapija Natur Cream', price: 606.10, category: 'Kapije Dvokrilna' }, // Average price
      { name: 'Kapija Natur Black', price: 606.10, category: 'Kapije Dvokrilna' }, // Average price
      { name: 'Transparentna alu kapija S', price: 718.80, category: 'Kapije Dvokrilna' }, // Average price
      { name: 'Transparentna alu kapija M', price: 656.50, category: 'Kapije Dvokrilna' }, // Average price
      { name: 'Transparentna alu kapija L', price: 625.30, category: 'Kapije Dvokrilna' }, // Average price

      // Kapije Klizna (Sliding Gates)
      { name: 'Kapija Natur sa aplikacijom Chocolate', price: 1163.65, category: 'Kapije Klizna' }, // Average price
      { name: 'Kapija Natur sa aplikacijom Patina', price: 1163.65, category: 'Kapije Klizna' }, // Average price
      { name: 'Kapija Natur sa aplikacijom Cream', price: 1163.65, category: 'Kapije Klizna' }, // Average price
      { name: 'Kapija Natur sa aplikacijom Black', price: 1163.65, category: 'Kapije Klizna' }, // Average price
      { name: 'Kapija Natur sa aplikacijom Teak', price: 1163.65, category: 'Kapije Klizna' }, // Average price
      { name: 'Kapija Natur Teak', price: 934.10, category: 'Kapije Klizna' }, // Average price
      { name: 'Kapija Natur Patina', price: 934.10, category: 'Kapije Klizna' }, // Average price
      { name: 'Kapija Natur Chocolate', price: 934.10, category: 'Kapije Klizna' }, // Average price
      { name: 'Kapija Natur Cream', price: 934.10, category: 'Kapije Klizna' }, // Average price
      { name: 'Kapija Natur Black', price: 934.10, category: 'Kapije Klizna' }, // Average price
      { name: 'Transparentna alu kapija S', price: 1031.95, category: 'Kapije Klizna' }, // Average price
      { name: 'Transparentna alu kapija M', price: 1086.05, category: 'Kapije Klizna' }, // Average price
      { name: 'Transparentna alu kapija L', price: 1083.65, category: 'Kapije Klizna' }, // Average price

      // Fasade (Facades)
      { name: 'Savadeck Mixit', price: 110.00, category: 'Fasade' },
      { name: 'Natur fasada Black', price: 36.00, category: 'Fasade' },
      { name: 'Natur fasada Chocolate', price: 36.00, category: 'Fasade' },
      { name: 'Natur fasada Cream', price: 36.00, category: 'Fasade' },
      { name: 'Natur fasada Teak', price: 36.00, category: 'Fasade' },
      { name: 'Natur fasada Patina', price: 36.00, category: 'Fasade' },
      { name: 'Kit Kat fasada Chocolate', price: 37.80, category: 'Fasade' },
      { name: 'Kit Kat fasada Patina', price: 37.80, category: 'Fasade' },
      { name: 'Kit Kat fasada Teak', price: 37.80, category: 'Fasade' },
      { name: 'Kit Kat fasada Black', price: 37.80, category: 'Fasade' },
      { name: 'Kit Kat fasada Cream', price: 37.80, category: 'Fasade' },

      // Pergole Stubovi (Pergola Posts)
      { name: 'WPC Stub Black', price: 40.00, category: 'Pergole Stubovi' },
      { name: 'WPC Stub Teak', price: 40.00, category: 'Pergole Stubovi' },
      { name: 'WPC Stub Chocolate', price: 40.00, category: 'Pergole Stubovi' },

      // Pergole Grede (Pergola Beams)
      { name: 'WPC Greda Black', price: 14.00, category: 'Pergole Grede' },
      { name: 'WPC Greda Teak', price: 14.00, category: 'Pergole Grede' },
      { name: 'WPC Greda Chocolate', price: 14.00, category: 'Pergole Grede' },

      // Instalacioni materijali (Installation Materials)
      { name: 'Alu stubna', price: 2.50, category: 'Instalacioni materijali' },
      { name: 'Kompo stubna', price: 1.20, category: 'Instalacioni materijali' },
      { name: 'Kompo stub', price: 10.00, category: 'Instalacioni materijali' },
      { name: 'Kompo U profil', price: 4.50, category: 'Instalacioni materijali' },
      { name: 'L Natur', price: 3.50, category: 'Instalacioni materijali' },
      { name: 'Set Natur ograde', price: 20.16, category: 'Instalacioni materijali' },
      { name: 'Set stuba kapije', price: 34.99, category: 'Instalacioni materijali' },
      { name: 'Skrivena Stopa Pergole', price: 25.00, category: 'Instalacioni materijali' },
      { name: 'L Classic', price: 3.50, category: 'Instalacioni materijali' },
      { name: 'Alu stub ograde', price: 27.00, category: 'Instalacioni materijali' },
      { name: 'Set dvokrilne kapije', price: 120.00, category: 'Instalacioni materijali' },
      { name: 'Nosač zasene', price: 5.00, category: 'Instalacioni materijali' },
      { name: 'L Premium', price: 3.50, category: 'Instalacioni materijali' },
      { name: 'Set pešačke kapije', price: 60.00, category: 'Instalacioni materijali' },
      { name: 'Alu L Profil', price: 3.60, category: 'Instalacioni materijali' },
      { name: 'Alu L Spojnica', price: 4.00, category: 'Instalacioni materijali' },
      { name: 'Alu F Profil 3000×40×60mm', price: 7.00, category: 'Instalacioni materijali' },
      { name: 'Alu U Profil 46×40mm', price: 11.00, category: 'Instalacioni materijali' },
      { name: 'Set klizne kapije', price: 105.00, category: 'Instalacioni materijali' },
      { name: 'Alu T Spojnica', price: 5.00, category: 'Instalacioni materijali' },
      { name: 'Alu gredica 40×30', price: 4.50, category: 'Instalacioni materijali' },
      { name: 'Alu stub kapije', price: 45.00, category: 'Instalacioni materijali' },
      { name: 'Alu Kapa Stuba Pergole', price: 8.00, category: 'Instalacioni materijali' },
      { name: 'WPC Gredica 60×40', price: 4.50, category: 'Instalacioni materijali' },
      { name: 'Set stuba ograde', price: 17.76, category: 'Instalacioni materijali' },
      { name: 'Stoper za dvokrilnu set', price: 61.80, category: 'Instalacioni materijali' },
      { name: 'U nosač', price: 3.55, category: 'Instalacioni materijali' }, // Average price
      { name: 'WPC Gredica 50×30', price: 4.00, category: 'Instalacioni materijali' },
      { name: 'Kapa stuba ograde', price: 2.00, category: 'Instalacioni materijali' },
      { name: 'Stoper', price: 40.00, category: 'Instalacioni materijali' },
      { name: 'L nosač', price: 3.10, category: 'Instalacioni materijali' }, // Average price
      { name: 'Drvena štafna', price: 3.00, category: 'Instalacioni materijali' },
      { name: 'Kapa U profila', price: 1.50, category: 'Instalacioni materijali' },
      { name: 'Podploča za stoper', price: 16.00, category: 'Instalacioni materijali' },
      { name: 'Alu kotva', price: 2.90, category: 'Instalacioni materijali' }, // Average price
      { name: 'Deking klipsa', price: 0.25, category: 'Instalacioni materijali' },
      { name: 'Vinkla U Profila', price: 1.00, category: 'Instalacioni materijali' },
      { name: 'Stopa stuba kapije', price: 18.00, category: 'Instalacioni materijali' },
      { name: 'SavaDeck klipsa za deking', price: 0.25, category: 'Instalacioni materijali' },
      { name: 'Alu nosač', price: 3.00, category: 'Instalacioni materijali' },
      { name: 'Kapa stuba kapije', price: 3.00, category: 'Instalacioni materijali' },
      { name: 'Inox klipsa', price: 0.40, category: 'Instalacioni materijali' },
      { name: 'Klipsa i šraf za Hardwood set', price: 0.40, category: 'Instalacioni materijali' },
      { name: 'Brava za kliznu kapiju', price: 35.00, category: 'Instalacioni materijali' },
      { name: 'Skrivena klipsa i šraf za Hardwood set', price: 0.40, category: 'Instalacioni materijali' },
      { name: 'Alu početna', price: 5.00, category: 'Instalacioni materijali' },
      { name: 'Brava za pešačku i dvokrilnu kapiju', price: 35.00, category: 'Instalacioni materijali' },
      { name: 'Šraf za klipsu', price: 0.12, category: 'Instalacioni materijali' }, // Average price
      { name: 'Alu završna', price: 5.00, category: 'Instalacioni materijali' },
      { name: 'Šraf sa obojenom glavom 3×30', price: 0.10, category: 'Instalacioni materijali' },
      { name: 'Stubna vinkla', price: 1.00, category: 'Instalacioni materijali' },
      { name: 'Šraf sa obojenom glavom 4.5×50', price: 0.13, category: 'Instalacioni materijali' },
      { name: 'Maska stope', price: 3.00, category: 'Instalacioni materijali' },
      { name: 'Šraf za Wood deking 5×50 Inox', price: 0.13, category: 'Instalacioni materijali' },
      { name: 'Stopa stuba ograde', price: 6.00, category: 'Instalacioni materijali' },
      { name: 'Šraf 4×30mm TX15', price: 0.12, category: 'Instalacioni materijali' }, // Average price
      { name: 'Vijak M8', price: 0.48, category: 'Instalacioni materijali' }, // Average price
      { name: 'SPAX šrafovi', price: 0.17, category: 'Instalacioni materijali' }, // Average price
      { name: 'Anker friulsider', price: 3.80, category: 'Instalacioni materijali' }, // Average price
      { name: 'Spax bit TX produženi 6.4×50mm', price: 3.50, category: 'Instalacioni materijali' },
      { name: 'Friulsider samorezac', price: 0.09, category: 'Instalacioni materijali' }, // Average price
      { name: 'Fischer DuoPower tiplovi', price: 0.21, category: 'Instalacioni materijali' }, // Average price
      { name: 'Samorezac 3.9×16mm', price: 0.07, category: 'Instalacioni materijali' }, // Average price
      { name: 'Načukavajući tiplovi Koelner', price: 0.20, category: 'Instalacioni materijali' }, // Average price
      { name: 'Hybrifix lepak', price: 10.00, category: 'Instalacioni materijali' },
      { name: 'Turbo vijak 6×60', price: 0.10, category: 'Instalacioni materijali' },
      { name: 'Nivelator', price: 0.24, category: 'Instalacioni materijali' }, // Average price
      { name: 'Plastična kapa', price: 0.30, category: 'Instalacioni materijali' }, // Average price
      { name: 'Čivija fi5', price: 0.15, category: 'Instalacioni materijali' },
      { name: 'Sika Grout 212', price: 20.00, category: 'Instalacioni materijali' },
      { name: 'Kajla za nivelaciju', price: 0.04, category: 'Instalacioni materijali' }
    ];

    // Create and add all products to the repository
    for (const productData of savadeck_products) {
      const productId = new ProductId(this.idGenerator.productId());
      const productPrice = new Money(productData.price, 'EUR');
      const product = new Product(productId, productData.name, productPrice);

      // Add product to the map
      this.products.set(product.id.value, product);
    }
  }
}
