import express from 'express';
import Store from '../models/Store';

const router = express.Router();

// GET all stores
router.get('/', async (req, res) => {
  try {
    const stores = await Store.find();
    res.json(stores);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
});

// GET single store by id
router.get('/:id', async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ error: 'Store not found' });
    res.json(store);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch store' });
  }
});

// CREATE a new store
router.post('/', async (req, res) => {
  try {
    const store = new Store(req.body);
    await store.save();
    res.status(201).json(store);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create store' });
  }
});

// UPDATE a store
router.put('/:id', async (req, res) => {
  try {
    const store = await Store.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!store) return res.status(404).json({ error: 'Store not found' });
    res.json(store);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update store' });
  }
});

// DELETE a store
router.delete('/:id', async (req, res) => {
  try {
    const store = await Store.findByIdAndDelete(req.params.id);
    if (!store) return res.status(404).json({ error: 'Store not found' });
    res.json({ message: 'Store deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete store' });
  }
});

export default router;
