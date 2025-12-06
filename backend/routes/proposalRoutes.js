const express = require('express');
const router = express.Router();
const { receiveProposal, listProposalsByRFP, listProposalsByVendor, deleteProposal } = require('../controllers/proposalController');

router.post('/', receiveProposal);
router.get('/rfp/:rfpId', listProposalsByRFP);
router.get('/vendor/:vendorId', listProposalsByVendor);
router.delete('/:id', deleteProposal);

module.exports = router;
