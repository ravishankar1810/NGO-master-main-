const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User is not authenticated' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `User role '${req.user.role}' is not authorized to access this resource` 
      });
    }
    
    // For NGOs, some routes also require them to be verified
    if (req.user.role === 'ngo' && !req.user.isVerified) {
      // Allow them pass through role check, but individual controllers may block if needed,
      // or we can strictly enforce it here.
    }

    next();
  };
};

module.exports = { checkRole };
