import { Request, Response } from 'express';
import { ProductService } from '../../application/service/ProductService';
import { ProductMapper } from '../mappers/ProductMapper';
import { NotificationService } from '../../application/service/NotificationService';
import { SessionService } from '../../application/service/SessionService';

/**
 * ProductController handles HTTP requests related to products.
 */
export class ProductController {
  private notificationService: NotificationService;
  private sessionService: SessionService;

  constructor(private readonly productService: ProductService) {
    this.notificationService = NotificationService.getInstance();
    this.sessionService = SessionService.getInstance();
  }

  /**
   * Create a new product
   * @param req The HTTP request
   * @param res The HTTP response
   */
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const { name, price, currency } = req.body;

      if (!name || !price) {
        res.status(400).render('error', {
          title: `${res.__('common.error')} - ${res.__('app.name')}`,
          message: res.__('products.missing_required_fields')
        });
        return;
      }

      const product = await this.productService.createProduct(name, parseFloat(price), currency);

      // Get the user ID from the session
      const userId = this.sessionService.getUserId(req);

      // Send notification to other users
      this.notificationService.notifyProductChange(userId);

      // Redirect to the products page
      return this.renderProductsPage(req, res);
    } catch (error) {
      res.status(500).render('error', {
        title: `${res.__('common.error')} - ${res.__('app.name')}`,
        message: error instanceof Error ? error.message : res.__('products.failed_to_create_product')
      });
    }
  }

  /**
   * Update a product
   * @param req The HTTP request
   * @param res The HTTP response
   */
  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, price, currency } = req.body;

      if (!name || !price) {
        res.status(400).render('error', {
          title: `${res.__('common.error')} - ${res.__('app.name')}`,
          message: res.__('products.missing_required_fields')
        });
        return;
      }

      const product = await this.productService.updateProduct(id, name, parseFloat(price), currency);

      if (!product) {
        res.status(404).render('error', {
          title: `${res.__('common.error')} - ${res.__('app.name')}`,
          message: res.__('products.product_not_found')
        });
        return;
      }

      // Get the user ID from the session
      const userId = this.sessionService.getUserId(req);

      // Send notification to other users
      this.notificationService.notifyProductChange(userId);

      // Redirect to the products page
      return this.renderProductsPage(req, res);
    } catch (error) {
      res.status(500).render('error', {
        title: `${res.__('common.error')} - ${res.__('app.name')}`,
        message: error instanceof Error ? error.message : res.__('products.failed_to_update_product')
      });
    }
  }

  /**
   * Delete a product
   * @param req The HTTP request
   * @param res The HTTP response
   */
  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.productService.deleteProduct(id);

      if (!deleted) {
        res.status(404).render('error', {
          title: `${res.__('common.error')} - ${res.__('app.name')}`,
          message: res.__('products.product_not_found')
        });
        return;
      }

      // Get the user ID from the session
      const userId = this.sessionService.getUserId(req);

      // Send notification to other users
      this.notificationService.notifyProductChange(userId);

      // Redirect to the products page
      return this.renderProductsPage(req, res);
    } catch (error) {
      res.status(500).render('error', {
        title: `${res.__('common.error')} - ${res.__('app.name')}`,
        message: error instanceof Error ? error.message : res.__('products.failed_to_delete_product')
      });
    }
  }

  /**
   * Render the products page
   * @param req The HTTP request
   * @param res The HTTP response
   */
  async renderProductsPage(req: Request, res: Response): Promise<void> {
    try {
      // Get pagination parameters from query
      const size = parseInt(req.query.size as string) || 10; // Default page size is 10
      const page = parseInt(req.query.page as string) || 1; // Default page is 1
      const offset = (page - 1) * size;
      const query = req.query.q as string || ''; // Get search query from request

      // Get paginated products (with or without search)
      let productsResult;
      if (query) {
        productsResult = await this.productService.searchProductsByNameWithPagination(query, size, offset);
      } else {
        productsResult = await this.productService.getProductsWithPagination(size, offset);
      }

      const { products, total } = productsResult;
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const productDtos = ProductMapper.toDtoList(products, baseUrl);

      // Calculate pagination info
      const totalPages = Math.ceil(total / size);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;
      const nextPage = page + 1;
      const prevPage = page - 1;
      const start = total > 0 ? offset + 1 : 0;
      const end = Math.min(offset + size, total);

      // Check if this is an HTMX request for the table container
      const isHtmxRequest = req.headers['hx-request'] === 'true';
      const targetId = req.headers['hx-target'] as string;

      if (isHtmxRequest && (targetId === 'product-table-container' || targetId === '#product-table-container' || targetId === '.card-body')) {
        // If it's an HTMX request for the table container, render only that part
        return res.render('partials/product-table-container', {
          layout: false, // Don't use the layout for the partial
          products: productDtos,
          searchQuery: query,
          pagination: {
            currentPage: page,
            totalPages,
            hasNextPage,
            hasPrevPage,
            nextPage,
            prevPage,
            size,
            total,
            start,
            end
          }
        });
      }

      // Otherwise render the full page
      res.render('products', {
        title: `${res.__('products.title')} - ${res.__('app.name')}`,
        products: productDtos,
        searchQuery: query, // Pass the search query to the view
        pagination: {
          currentPage: page,
          totalPages,
          hasNextPage,
          hasPrevPage,
          nextPage,
          prevPage,
          size,
          total,
          start,
          end
        },
        breadcrumbs: [
          { label: res.__('common.home'), url: '/' },
          { label: res.__('products.title'), url: '/products' }
        ]
      });
    } catch (error) {
      res.status(500).render('error', {
        title: `${res.__('common.error')} - ${res.__('app.name')}`,
        message: res.__('products.failed_to_retrieve_products')
      });
    }
  }

  /**
   * Render the product details page
   * @param req The HTTP request
   * @param res The HTTP response
   */
  async renderProductDetailsPage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await this.productService.getProductById(id);

      if (!product) {
        res.status(404).render('error', {
          title: `${res.__('common.error')} - ${res.__('app.name')}`,
          message: res.__('products.product_not_found')
        });
        return;
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const productDto = ProductMapper.toDto(product, baseUrl);

      res.render('product-details', {
        title: `${res.__('products.product_details')} ${id} - ${res.__('app.name')}`,
        product: productDto,
        breadcrumbs: [
          { label: res.__('common.home'), url: '/' },
          { label: res.__('products.title'), url: '/products' },
          { label: `${id}`, url: `/products/${id}` }
        ]
      });
    } catch (error) {
      res.status(500).render('error', {
        title: `${res.__('common.error')} - ${res.__('app.name')}`,
        message: res.__('products.failed_to_retrieve_products')
      });
    }
  }

  /**
   * Render the create product page
   * @param req The HTTP request
   * @param res The HTTP response
   */
  async renderCreateProductPage(req: Request, res: Response): Promise<void> {
    try {
      res.render('create-product', {
        title: `${res.__('products.create_new_product')} - ${res.__('app.name')}`,
        breadcrumbs: [
          { label: res.__('common.home'), url: '/' },
          { label: res.__('products.title'), url: '/products' },
          { label: res.__('products.create_new_product'), url: '/products/create' }
        ]
      });
    } catch (error) {
      res.status(500).render('error', {
        title: `${res.__('common.error')} - ${res.__('app.name')}`,
        message: res.__('products.failed_to_retrieve_products')
      });
    }
  }

  /**
   * Search products by name (for AJAX requests)
   * @param req The HTTP request
   * @param res The HTTP response
   */
  async searchProducts(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.q as string || '';
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = 0; // Always start from the first page for search results

      const { products, total } = await this.productService.searchProductsByNameWithPagination(query, limit, offset);
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const productDtos = ProductMapper.toDtoList(products, baseUrl);

      res.json(productDtos);
    } catch (error) {
      res.status(500).json({
        error: res.__('products.failed_to_search_products')
      });
    }
  }
}