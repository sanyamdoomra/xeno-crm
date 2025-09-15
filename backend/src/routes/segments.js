const express = require('express');
const router = express.Router();
const { validateSegment } = require('../validators');
const { createSegment } = require('../services/segments');

router.post('/', async (req, res) => {
  const { error } = validateSegment(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  const segment = await createSegment(req.body);
  res.json(segment);
});

module.exports = router;
