const Proposal = require('../models/proposal');
const Vendor = require('../models/vendor');
const { parseProposal } = require('../services/aiService');
const { extractTextFromEmail } = require('../utils/parseEmail');

async function receiveProposal(req, res) {
  try {
    const { rfpId, vendorId, rawEmail } = req.body;
    if (!rfpId || !vendorId || !rawEmail) {
      return res.status(400).json({ error: 'rfpId, vendorId, and rawEmail are required' });
    }
    
    const rfpIdInt = parseInt(rfpId, 10);
    const vendorIdInt = parseInt(vendorId, 10);
    
    if (isNaN(rfpIdInt) || isNaN(vendorIdInt)) {
      return res.status(400).json({ error: 'Invalid rfpId or vendorId' });
    }
    
    const RFP = require('../models/rfp');
    const rfp = await RFP.findByPk(rfpIdInt);
    if (!rfp) {
      return res.status(404).json({ error: 'RFP not found' });
    }
    
    const vendor = await Vendor.findByPk(vendorIdInt);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    const emailText = extractTextFromEmail(rawEmail);
    const parsedContent = await parseProposal(emailText); 
    
    const proposal = await Proposal.create({ 
      rfpId: rfpIdInt, 
      vendorId: vendorIdInt, 
      rawEmail, 
      content: parsedContent 
    });
    
    const createdProposal = await Proposal.findByPk(proposal.id, {
      include: [{ model: Vendor, attributes: ['id', 'name', 'email'] }]
    });
    
    res.json({
      id: createdProposal.id,
      rfpId: createdProposal.rfpId,
      vendorId: createdProposal.vendorId,
      vendorName: vendor.name,
      content: createdProposal.content,
      message: 'Proposal created successfully'
    });
  } catch (err) {
    console.error('Error receiving proposal:', err);
    res.status(500).json({ error: err.message });
  }
}

async function listProposalsByRFP(req, res) {
  try {
    const { rfpId } = req.params;
    if (!rfpId) {
      return res.status(400).json({ error: 'rfpId is required' });
    }

    const rfpIdInt = parseInt(rfpId, 10);
    if (isNaN(rfpIdInt)) {
      return res.status(400).json({ error: 'Invalid rfpId' });
    }

    const proposals = await Proposal.findAll({
      where: { rfpId: rfpIdInt },
      include: [{ 
        model: Vendor, 
        attributes: ['id', 'name', 'email'],
        required: false 
      }],
      order: [['id', 'DESC']] 
    });

    const seenVendorIds = new Set();
    const seenProposalIds = new Set();
    const uniqueProposals = proposals.filter(proposal => {
      if (seenProposalIds.has(proposal.id)) {
        return false;
      }
      seenProposalIds.add(proposal.id);
      if (proposal.vendorId && seenVendorIds.has(proposal.vendorId)) {
        return false; 
      }
      if (proposal.vendorId) {
        seenVendorIds.add(proposal.vendorId);
      }
      
      return true;
    });

    const formattedProposals = uniqueProposals.map(proposal => {
      const content = proposal.content || {};
      const vendor = proposal.Vendor || {};
      
      
      let warranty = content.warranty;
      if (!warranty || warranty === 'Not specified' || warranty === '') {
        
        const summary = content.solutionSummary || content.summary || '';
        if (summary) {
          const warrantyMatch = summary.match(/(\d+[-\s]?(year|month|yr|mo)[\s-]?warranty|warranty[\s:]+(\d+[-\s]?(year|month|yr|mo)))/i);
          if (warrantyMatch) {
            warranty = warrantyMatch[0];
          }
        }
      }
      if (!warranty || warranty === '') {
        warranty = 'Not specified';
      }
      
      return {
        id: proposal.id,
        vendorId: proposal.vendorId,
        vendorName: content.vendorName || vendor.name || 'Unknown Vendor',
        price: content.cost || content.price || 'Not specified',
        deliveryDays: content.timeline || content.deliveryDays || null,
        warranty: warranty,
        aiSummary: content.solutionSummary || content.summary || null,
        aiScore: content.score || null,
        strengths: content.strengths || [],
        weaknesses: content.weaknesses || [],
        rawEmail: proposal.rawEmail,
        content: proposal.content
      };
    });

    res.json(formattedProposals);
  } catch (err) {
    console.error('Error listing proposals:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ error: err.message || 'Failed to list proposals' });
  }
}

async function listProposalsByVendor(req, res) {
  try {
    const { vendorId } = req.params;
    if (!vendorId) {
      return res.status(400).json({ error: 'vendorId is required' });
    }

    const vendorIdInt = parseInt(vendorId, 10);
    if (isNaN(vendorIdInt)) {
      return res.status(400).json({ error: 'Invalid vendorId' });
    }

    const RFP = require('../models/rfp');
    const proposals = await Proposal.findAll({
      where: { vendorId: vendorIdInt },
      include: [
        { model: Vendor, attributes: ['id', 'name', 'email'] },
        { model: RFP, attributes: ['id', 'title', 'description'] }
      ],
      order: [['id', 'DESC']]
    });

    const formattedProposals = proposals.map(proposal => {
      const content = proposal.content || {};
      const vendor = proposal.Vendor || {};
      const rfp = proposal.RFP || {};
      
      return {
        id: proposal.id,
        rfpId: proposal.rfpId,
        rfpTitle: rfp.title || `RFP #${proposal.rfpId}`,
        vendorId: proposal.vendorId,
        vendorName: content.vendorName || vendor.name || 'Unknown Vendor',
        price: content.cost || content.price || 'Not specified',
        deliveryDays: content.timeline || content.deliveryDays || null,
        warranty: content.warranty || 'Not specified',
        aiSummary: content.solutionSummary || content.summary || null,
        aiScore: content.score || null,
        strengths: content.strengths || [],
        weaknesses: content.weaknesses || [],
        createdAt: proposal.createdAt
      };
    });

    res.json(formattedProposals);
  } catch (err) {
    console.error('Error listing proposals by vendor:', err);
    res.status(500).json({ error: err.message });
  }
}

async function deleteProposal(req, res) {
  try {
    const proposalId = parseInt(req.params.id, 10);
    if (isNaN(proposalId)) {
      return res.status(400).json({ error: 'Invalid proposal ID' });
    }

    const proposal = await Proposal.findByPk(proposalId);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    await proposal.destroy();
    res.json({ message: 'Proposal deleted successfully' });
  } catch (err) {
    console.error('Error deleting proposal:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { receiveProposal, listProposalsByRFP, listProposalsByVendor, deleteProposal };
