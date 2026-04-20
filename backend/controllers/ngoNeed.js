const NGONeed = require('../models/NGONeed');
const User = require('../models/User');

// POST /api/ngo-needs
exports.createNeed = async (req, res) => {
  try {
    const { category, description, urgencyFlag } = req.body;
    
    const need = await NGONeed.create({
      ngoId: req.user.id,
      category,
      description,
      urgencyFlag
    });

    res.status(201).json({ success: true, data: need });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// GET /api/ngo-needs
exports.getAllNeeds = async (req, res) => {
  try {
    const needs = await NGONeed.find({ status: 'Open' })
      .populate('ngoId', 'name city')
      .sort({ urgencyFlag: -1, createdAt: -1 });

    res.json({ success: true, data: needs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// PATCH /api/ngo-needs/:id/fulfill
exports.fulfillNeed = async (req, res) => {
  try {
    const need = await NGONeed.findById(req.params.id);

    if (!need || need.ngoId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    need.status = 'Fulfilled';
    await need.save();

    res.json({ success: true, message: "Need marked as fulfilled" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
