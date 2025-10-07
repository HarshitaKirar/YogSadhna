const { Class, Enrollment } = require('../model/class');

const getClasses = async (req, res) => {
  try {
    const freeClasses = await Class.find({ type: 'free', isActive: true })
      .populate('instructor', 'firstName lastName profilePhoto')
      .sort({ scheduledDate: 1 });
    
    const paidClasses = await Class.find({ type: 'paid', isActive: true })
      .populate('instructor', 'firstName lastName profilePhoto')
      .sort({ scheduledDate: 1 });

    // Get user enrollments if logged in
    let userEnrollments = [];
    if (req.session.user) {
      userEnrollments = await Enrollment.find({ userId: req.session.user._id });
    }

    res.render('classes', { 
      freeClasses, 
      paidClasses, 
      userEnrollments,
      user: req.session.user 
    });
  } catch (error) {
    console.error('Classes error:', error);
    res.render('classes', { 
      freeClasses: [], 
      paidClasses: [], 
      userEnrollments: [],
      user: req.session.user 
    });
  }
};

const enrollClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      userId: req.session.user._id,
      classId: req.params.id
    });

    if (existingEnrollment) {
      return res.status(400).json({ error: 'Already enrolled' });
    }

    // Check capacity
    if (classData.participants.length >= classData.maxParticipants) {
      return res.status(400).json({ error: 'Class is full' });
    }

    // Create enrollment
    await Enrollment.create({
      userId: req.session.user._id,
      classId: req.params.id
    });

    // Add to class participants
    classData.participants.push(req.session.user._id);
    await classData.save();

    res.redirect('/classes');
  } catch (error) {
    console.error('Enroll error:', error);
    res.redirect('/classes');
  }
};

module.exports = { getClasses, enrollClass };