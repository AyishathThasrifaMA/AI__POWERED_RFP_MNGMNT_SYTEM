const Vendor = require('../models/vendor');

async function createVendor(req, res) {
  try {
    const vendor = await Vendor.create(req.body);
    res.json(vendor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function listVendors(req, res) {
  try {
    const vendors = await Vendor.findAll();
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteVendor(req, res) {
  try {
    const vendorId = parseInt(req.params.id, 10);
    if (isNaN(vendorId)) {
      return res.status(400).json({ error: 'Invalid vendor ID' });
    }

    const vendor = await Vendor.findByPk(vendorId);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    await vendor.destroy();
    res.json({ message: 'Vendor deleted successfully' });
  } catch (err) {
    console.error('Error deleting vendor:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { createVendor, listVendors, deleteVendor };
