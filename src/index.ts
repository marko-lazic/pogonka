import express, { Request, Response } from 'express';
import path from 'path';
import { create } from 'express-handlebars';
import cookieParser from 'cookie-parser';
import { OrderController } from './interfaces/controllers/OrderController';
import { OrderService } from './application/service/OrderService';
import { MockOrderRepository } from './infrastructure/repository/MockOrderRepository';
import { PidGenerator } from "./infrastructure/util/PidGenerator";
import i18n, { DEFAULT_LOCALE, AVAILABLE_LOCALES, LOCALE_FORMATS, LocaleType } from './config/i18n';

const app = express();
const port = process.env.PORT || 9876;

// Set up Handlebars

const handlebars = create({
  extname: '.hbs',
  defaultLayout: 'layout',
  layoutsDir: path.join(__dirname, '../views/layouts'),
  helpers: {
    __: function(key: string, options: any) {
      // If options contains a hash, pass it as the replacement values
      const replacements = options.hash || {};

      // Try to get the i18n function from the Handlebars context
      const i18nFunc = options.data && options.data.root && options.data.root.__ ? 
        options.data.root.__ : i18n.__;

      // Get the locale from the Handlebars context if available
      if (options.data && options.data.root && options.data.root.currentLocale) {
        const locale = options.data.root.currentLocale as LocaleType;
        return i18nFunc.call({locale}, key, replacements);
      }

      return i18nFunc(key, replacements);
    },
    __n: function(key: string, count: number, options: any) {
      // If options contains a hash, pass it as the replacement values
      const replacements = options.hash || {};

      // Try to get the i18n function from the Handlebars context
      const i18nFunc = options.data && options.data.root && options.data.root.__n ? 
        options.data.root.__n : i18n.__n;

      // Get the locale from the Handlebars context if available
      if (options.data && options.data.root && options.data.root.currentLocale) {
        const locale = options.data.root.currentLocale as LocaleType;
        return i18nFunc.call({locale}, key, count, replacements);
      }

      return i18nFunc(key, count, replacements);
    },
    formatDate: function(dateString: string, options: any) {
      if (!dateString) return '';
      const date = new Date(dateString);
      // Get the current locale from the handlebars context
      const locale = (options.data.root.currentLocale || DEFAULT_LOCALE) as LocaleType;
      // Use the locale format mapping to get the correct format string
      const formatLocale = LOCALE_FORMATS[locale] || LOCALE_FORMATS[DEFAULT_LOCALE];
      return date.toLocaleString(formatLocale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
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
    },
    // Helper to translate status values
    translateStatus: function(status: string, options: any) {
      if (!status) return '';

      // Try to get the i18n function from the Handlebars context
      const i18nFunc = options.data && options.data.root && options.data.root.__ ? 
        options.data.root.__ : i18n.__;

      // Convert status to a key for translation
      const statusKey = status.toLowerCase().replace(/ /g, '_');

      // Get the locale from the Handlebars context if available
      if (options.data && options.data.root && options.data.root.currentLocale) {
        const locale = options.data.root.currentLocale as LocaleType;
        return i18nFunc.call({locale}, `status.${statusKey}`);
      }

      return i18nFunc(`status.${statusKey}`);
    },
    // Helper to concatenate strings
    concat: function(...args: any[]) {
      // Remove the last argument (Handlebars options)
      args.pop();
      return args.join('');
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
app.use(cookieParser());

// Custom middleware to set language from header or cookie before i18n initialization
app.use((req, res, next) => {
  // Check for language in X-Language header (set by our JavaScript)
  const headerLang = req.get('X-Language');
  if (headerLang && AVAILABLE_LOCALES.includes(headerLang as LocaleType)) {
    // Set the language in the cookie that i18n will use
    res.cookie('lang', headerLang, { maxAge: 900000, httpOnly: true });
    req.cookies = req.cookies || {};
    req.cookies.lang = headerLang;
  } else if (!req.cookies || !req.cookies.lang) {
    // If no language is specified, set the default locale
    res.cookie('lang', DEFAULT_LOCALE, { maxAge: 900000, httpOnly: true });
    req.cookies = req.cookies || {};
    req.cookies.lang = DEFAULT_LOCALE;
  }
  next();
});

// Initialize i18n middleware
app.use(i18n.init);

// Middleware to make i18n available to all templates
app.use((req, res, next) => {
  // Make i18n functions available to templates
  res.locals.__ = req.__ || i18n.__;
  res.locals.__n = req.__n || i18n.__n;

  // Set HTML lang attribute based on current locale
  res.locals.currentLocale = i18n.getLocale(req);

  next();
});

// Initialize repositories, services, and controllers
const orderRepository = new MockOrderRepository();
const pidGenerateId = new PidGenerator();
const orderService = new OrderService(orderRepository, pidGenerateId);
const orderController = new OrderController(orderService);

// Routes
app.get('/', (req: Request, res: Response) => {
  res.render('index', { 
    message: res.__('common.welcome'),
    title: res.__('app.title')
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
