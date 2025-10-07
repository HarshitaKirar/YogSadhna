// Admin authentication middleware
function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.isAdmin) {
    return next();
  }
  res.status(403).json({ error: 'Admin access required' });
}

// Check if user is logged in and is admin
function requireAdmin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  if (!req.session.user.isAdmin) {
    return res.status(403).send('Admin access required');
  }
  next();
}

module.exports = { isAdmin, requireAdmin };