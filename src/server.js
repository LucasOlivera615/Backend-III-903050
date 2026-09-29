import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import usersRouter from './routes/users.js';
import productsRouter from './routes/products.js';

const app = express();

const PORT = 8080;
const MONGODB_URI = 'mongodb://localhost:27017/shipnow';
const JWT_SECRET = 'mi_clave_secreta';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), secret: JWT_SECRET });
});

app.use((req, res) => {
  res.status(404).send('Ruta no encontrada');
});

mongoose.connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log('Servidor corriendo en puerto ' + PORT);
    });
  })
  .catch((error) => {
    console.log('Error de conexión', error);
  });
