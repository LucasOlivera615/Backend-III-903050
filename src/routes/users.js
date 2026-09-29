import { Router } from 'express';
import User from '../models/user.model.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).send('Error del servidor');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send('Usuario no encontrado');
    res.json(user);
  } catch (error) {
    res.status(500).send('Error del servidor');
  }
});

router.post('/', async (req, res) => {
  try {
    if (!req.body.firstName || !req.body.lastName || !req.body.email || !req.body.password) {
      return res.status(400).send('Faltan campos obligatorios');
    }

    const existing = await User.findOne({ email: req.body.email });
    if (existing) return res.status(400).json({ status: 'error', data: null });

    if (req.body.role === 'admin') {
      return res.status(403).send('No se puede crear un admin desde este endpoint');
    }

    const newUser = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role || 'user'
    });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).send('Error del servidor');
  }
});

router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).send('Usuario no encontrado');
    res.json(user);
  } catch (error) {
    res.status(500).send('Error del servidor');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).send('Usuario no encontrado');
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).send('Error del servidor');
  }
});

export default router;
