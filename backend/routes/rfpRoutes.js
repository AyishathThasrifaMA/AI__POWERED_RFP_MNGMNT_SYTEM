const express = require('express');
const router = express.Router();
const { createRFP, getRFP, evaluateRFP, listRFPs, deleteRFP } = require('../controllers/rfpController');

router.post('/', createRFP);
router.get('/', listRFPs);  
router.get('/:id/evaluate', evaluateRFP);
router.delete('/:id', deleteRFP);
router.get('/:id', getRFP);

module.exports = router;
