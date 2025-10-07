const { DincharyaMessage } = require('../model/dincharya');
const { User } = require('../model/user');

const getDincharya = async (req, res) => {
  try {
    const messages = await DincharyaMessage.find()
      .populate('sender', 'firstName lastName profilePhoto phone isAdmin')
      .sort({ createdAt: -1 })
      .limit(100);

    // Get users with phone numbers for auto-add feature
    const usersWithPhone = await User.find({ 
      phone: { $exists: true, $ne: null, $ne: '' },
      isActive: true 
    }).select('firstName lastName phone profilePhoto');
    
    // Hide phone numbers from non-admin users
    if (!req.session.user.isAdmin) {
      usersWithPhone.forEach(user => {
        user.phone = undefined;
      });
    }

    res.render('dincharya', { 
      messages: messages.reverse(), 
      usersWithPhone,
      user: req.session.user 
    });
  } catch (error) {
    console.error('Dincharya error:', error);
    res.render('dincharya', { 
      messages: [], 
      usersWithPhone: [],
      user: req.session.user 
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const messageData = {
      sender: req.session.user._id,
      message: req.body.message,
      messageType: req.body.messageType || 'text',
      isAdminMessage: req.session.user.isAdmin || false
    };

    if (req.file) {
      messageData.mediaUrl = `/uploads/dincharya/${req.file.filename}`;
      messageData.messageType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
    }

    await DincharyaMessage.create(messageData);
    res.redirect('/dincharya');
  } catch (error) {
    console.error('Send message error:', error);
    res.redirect('/dincharya');
  }
};

const deleteMessage = async (req, res) => {
  try {
    const message = await DincharyaMessage.findById(req.params.id);
    
    // Only allow deletion by sender or admin
    if (message.sender.toString() === req.session.user._id.toString() || req.session.user.isAdmin) {
      await DincharyaMessage.findByIdAndDelete(req.params.id);
    }
    
    res.redirect('/dincharya');
  } catch (error) {
    console.error('Delete message error:', error);
    res.redirect('/dincharya');
  }
};

module.exports = { getDincharya, sendMessage, deleteMessage };