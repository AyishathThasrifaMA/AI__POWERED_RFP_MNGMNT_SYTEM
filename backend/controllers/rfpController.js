const RFP = require('../models/rfp');
const { parseRFP, evaluateProposals } = require('../services/aiService');
const Proposal = require('../models/proposal');

async function createRFP(req, res) {
  try {
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }
    const structuredData = await parseRFP(description);
    const rfp = await RFP.create({ title: structuredData.title, description, structuredData });
    res.json({
      id: rfp.id,
      title: rfp.title,
      description: rfp.description,
      category: rfp.structuredData?.category || rfp.structuredData?.title || 'General',
      budget: rfp.structuredData?.budget || 'Not specified',
      status: rfp.status,
      structuredData: rfp.structuredData
    });
  } catch (err) {
    console.error('Error creating RFP:', err);
    res.status(500).json({ error: err.message });
  }
}

async function getRFP(req, res) {
  try {
    const rfp = await RFP.findByPk(req.params.id, { include: Proposal });
    res.json(rfp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function evaluateRFP(req, res) {
  try {
    const rfpId = parseInt(req.params.id, 10);
    if (isNaN(rfpId)) {
      return res.status(400).json({ error: 'Invalid RFP ID' });
    }

    const rfp = await RFP.findByPk(rfpId);
    if (!rfp) {
      return res.status(404).json({ error: 'RFP not found' });
    }

    const Vendor = require('../models/vendor');
    const proposals = await Proposal.findAll({ 
      where: { rfpId: rfpId },
      include: [{ model: Vendor, attributes: ['id', 'name', 'email'] }]
    });

    if (proposals.length === 0) {
      return res.json({ 
        evaluation: {
          bestProposal: null,
          summary: "No proposals to evaluate",
          scores: []
        }
      });
    }
    const proposalData = proposals.map(p => ({
      vendorName: p.Vendor?.name || 'Unknown Vendor',
      content: p.content || {},
      id: p.id
    }));
    const result = await evaluateProposals(proposalData, rfp.structuredData);

    if (result.scores && Array.isArray(result.scores)) {
      for (const scoreData of result.scores) {
        const proposal = proposals.find(p => 
          (p.Vendor?.name === scoreData.vendorName) || 
          (p.content?.vendorName === scoreData.vendorName)
        );
        if (proposal) {
          const updatedContent = {
            ...proposal.content,
            score: scoreData.score,
            strengths: scoreData.strengths || [],
            weaknesses: scoreData.weaknesses || []
          };
          await proposal.update({ content: updatedContent });
        }
      }
    }

    res.json({ evaluation: result });
  } catch (err) {
    console.error('Error evaluating RFP:', err);
    res.status(500).json({ error: err.message });
  }
}
async function listRFPs(req, res) {
  try {
    const rfps = await RFP.findAll();
    const formattedRFPs = rfps.map(rfp => ({
      id: rfp.id,
      title: rfp.title,
      description: rfp.description,
      category: rfp.structuredData?.category || rfp.structuredData?.title || 'General',
      budget: rfp.structuredData?.budget || 'Not specified',
      status: rfp.status,
      structuredData: rfp.structuredData
    }));
    res.json(formattedRFPs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteRFP(req, res) {
  try {
    console.log('DELETE RFP called with ID:', req.params.id);
    const rfpId = parseInt(req.params.id, 10);
    if (isNaN(rfpId)) {
      console.log('Invalid RFP ID:', req.params.id);
      return res.status(400).json({ error: 'Invalid RFP ID' });
    }

    const rfp = await RFP.findByPk(rfpId);
    if (!rfp) {
      console.log('RFP not found with ID:', rfpId);
      return res.status(404).json({ error: 'RFP not found' });
    }

    console.log('Deleting RFP:', rfpId);
    await Proposal.destroy({ where: { rfpId: rfpId } });
    await rfp.destroy();
    console.log('RFP deleted successfully:', rfpId);
    res.json({ message: 'RFP and associated proposals deleted successfully' });
  } catch (err) {
    console.error('Error deleting RFP:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { createRFP, getRFP, evaluateRFP, listRFPs, deleteRFP };
