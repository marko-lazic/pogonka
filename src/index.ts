import express, { Request, Response } from 'express';
import { engine } from 'express-handlebars';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

// Configure handlebars
app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'layout',
  layoutsDir: path.join(__dirname, '../views/layouts')
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../views'));

app.get('/', (req: Request, res: Response) => {
  res.render('index', { 
    message: 'Hello World!',
    title: 'HWpogonka'
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port} ✨`);
});
