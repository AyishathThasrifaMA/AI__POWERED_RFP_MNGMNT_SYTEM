const express = require('express');
const router = express.Router();
const { createVendor, listVendors, deleteVendor } = require('../controllers/vendorController');

router.post('/', createVendor);
router.get('/', listVendors);
router.delete('/:id', deleteVendor);

module.exports = router;
