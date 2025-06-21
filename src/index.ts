import express, { Request, Response } from 'express';
import path from 'path';
import { create } from 'express-handlebars';
import { OrderController } from './interfaces/controllers/OrderController';
import { OrderService } from './application/service/OrderService';
import { MockOrderRepository } from './infrastructure/repository/MockOrderRepository';
import {PidGenerator} from "./infrastructure/util/PidGenerator";

const app = express();
const port = process.env.PORT || 9876;

// Set up Handlebars

const handlebars = create({
  extname: '.hbs',
  defaultLayout: 'layout',
  layoutsDir: path.join(__dirname, '../views/layouts'),
  helpers: {
    formatDate: function(dateString: string) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleString();
    },
    eq: function(a: any, b: any) {
      return a === b;
    },
    ne: function(a: any, b: any) {
      return a !== b;
    },
    capitalize: function(str: string) {
      if (!str) return '';
      return str.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
  }
});

app.engine('hbs', handlebars.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../views'));

// Middleware
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize repositories, services, and controllers
const orderRepository = new MockOrderRepository();
const pidGenerateId = new PidGenerator();
const orderService = new OrderService(orderRepository, pidGenerateId);
const orderController = new OrderController(orderService);

// Routes
app.get('/', (req: Request, res: Response) => {
  res.render('index', { 
    message: 'Welcome to Pogonka',
    title: 'Pogonka - Order Management'
  });
});

// View routes
app.get('/orders', orderController.renderOrdersPage.bind(orderController));
app.get('/orders/create', orderController.renderCreateOrderPage.bind(orderController));
app.get('/orders/:id', orderController.renderOrderDetailsPage.bind(orderController));

// Order action routes
app.post('/orders', orderController.createOrder.bind(orderController));
app.delete('/orders/:id', orderController.deleteOrder.bind(orderController));

// Order status transition routes
app.post('/orders/:id/confirm', orderController.confirmOrder.bind(orderController));
app.post('/orders/:id/cancel', orderController.cancelOrder.bind(orderController));
app.post('/orders/:id/pay', orderController.markOrderAsPaid.bind(orderController));
app.post('/orders/:id/start-production', orderController.startOrderProduction.bind(orderController));
app.post('/orders/:id/start-delivery', orderController.startOrderDelivery.bind(orderController));
app.post('/orders/:id/complete-billing', orderController.completeOrderBilling.bind(orderController));

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port} ✨`);
  console.log(`View orders at http://localhost:${port}/orders`);
});
