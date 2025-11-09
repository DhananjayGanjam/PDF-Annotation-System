const ROLES = {
    A1: { role: 'admin', permissions: ['upload', 'view', 'annotate', 'edit_all', 'delete_all'] },
    D1: { role: 'default', permissions: ['view', 'annotate', 'edit_own', 'delete_own'] },
    D2: { role: 'default', permissions: ['view', 'annotate', 'edit_own', 'delete_own'] },
    R1: { role: 'readonly', permissions: ['view'] }
  };
  
  //Code To Check Permission For Every Action
  const checkPermission = (permission) => {
    return (req, res, next) => {
      const userId = req.headers['x-user-id'];
      
      if (!userId || !ROLES[userId]) {
        return res.status(403).json({ error: 'Invalid user' });
      }
  
      const userPermissions = ROLES[userId].permissions;
      
      if (!userPermissions.includes(permission)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
  
      req.user = { id: userId, ...ROLES[userId] };
      next();
    };
  };
  
  const canEditAnnotation = (annotation, userId) => {
    if (ROLES[userId].role === 'admin') return true;
    if (annotation.createdBy === userId) return true;
    return false;
  };
  
  module.exports = { checkPermission, canEditAnnotation, ROLES };