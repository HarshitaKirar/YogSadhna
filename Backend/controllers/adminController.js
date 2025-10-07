const { Class, Enrollment, ClassMessage } = require('../model/class');
const { User } = require('../model/user');

const getAdminDashboard = async (req, res) => {
  try {
    const classes = await Class.find().populate('instructor', 'firstName lastName').sort({ createdAt: -1 });
    const users = await User.find({ isAdmin: false }).select('-password').sort({ createdAt: -1 });
    const totalUsers = await User.countDocuments({ isAdmin: false });
    const totalClasses = await Class.countDocuments();
    
    res.render('admin/dashboard', { 
      classes, 
      users, 
      totalUsers, 
      totalClasses,
      user: req.session.user 
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.redirect('/');
  }
};

const createClass = async (req, res) => {
  try {
    const classData = {
      ...req.body,
      instructor: req.session.user._id,
      price: req.body.type === 'free' ? 0 : req.body.price
    };
    
    await Class.create(classData);
    res.redirect('/admin');
  } catch (error) {
    console.error('Create class error:', error);
    res.redirect('/admin');
  }
};

const updateClass = async (req, res) => {
  try {
    await Class.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/admin');
  } catch (error) {
    console.error('Update class error:', error);
    res.redirect('/admin');
  }
};

const deleteClass = async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.redirect('/admin');
  } catch (error) {
    console.error('Delete class error:', error);
    res.redirect('/admin');
  }
};

const getClassChat = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id).populate('instructor participants');
    const messages = await ClassMessage.find({ classId: req.params.id })
      .populate('sender', 'firstName lastName profilePhoto')
      .sort({ createdAt: 1 });
    
    res.render('admin/class-chat', { 
      classData, 
      messages, 
      user: req.session.user 
    });
  } catch (error) {
    console.error('Class chat error:', error);
    res.redirect('/admin');
  }
};

const sendMessage = async (req, res) => {
  try {
    await ClassMessage.create({
      classId: req.params.id,
      sender: req.session.user._id,
      message: req.body.message,
      messageType: req.body.messageType || 'text'
    });
    res.redirect(`/admin/class/${req.params.id}/chat`);
  } catch (error) {
    console.error('Send message error:', error);
    res.redirect(`/admin/class/${req.params.id}/chat`);
  }
};

module.exports = { 
  getAdminDashboard, 
  createClass, 
  updateClass, 
  deleteClass, 
  getClassChat, 
  sendMessage 
};