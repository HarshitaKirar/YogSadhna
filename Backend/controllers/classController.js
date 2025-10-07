const { Class, Enrollment } = require('../model/class');

const getClasses = async (req, res) => {
  try {
    const freeClasses = await Class.find({ type: 'free', isActive: true })
      .populate('instructor', 'firstName lastName profilePhoto')
      .sort({ scheduledDate: 1 });
    
    const paidClasses = await Class.find({ type: 'paid', isActive: true })
      .populate('instructor', 'firstName lastName profilePhoto')
      .sort({ scheduledDate: 1 });

    // Group classes by category
    const serviceCategories = {
      yoga: { name: 'Yoga', icon: 'fas fa-om', color: 'orange' },
      zumba: { name: 'Zumba', icon: 'fas fa-music', color: 'pink' },
      pranayam: { name: 'Pranayam', icon: 'fas fa-wind', color: 'blue' },
      meditation: { name: 'Meditation', icon: 'fas fa-leaf', color: 'green' },
      fitness: { name: 'Fitness', icon: 'fas fa-dumbbell', color: 'red' },
      pilates: { name: 'Pilates', icon: 'fas fa-spa', color: 'purple' },
      aerobics: { name: 'Aerobics', icon: 'fas fa-running', color: 'yellow' }
    };

    // Get user enrollments if logged in
    let userEnrollments = [];
    if (req.session.user) {
      userEnrollments = await Enrollment.find({ userId: req.session.user._id });
    }

    res.render('classes', { 
      freeClasses, 
      paidClasses, 
      serviceCategories,
      userEnrollments,
      user: req.session.user 
    });
  } catch (error) {
    console.error('Classes error:', error);
    res.render('classes', { 
      freeClasses: [], 
      paidClasses: [], 
      serviceCategories: {},
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

const getServices = async (req, res) => {
  try {
    const allClasses = await Class.find({ isActive: true })
      .populate('instructor', 'firstName lastName profilePhoto')
      .sort({ category: 1, scheduledDate: 1 });

    const serviceCategories = {
      yoga: { name: 'Yoga', icon: 'fas fa-om', color: 'orange', description: 'Traditional yoga practices for flexibility and strength' },
      zumba: { name: 'Zumba', icon: 'fas fa-music', color: 'pink', description: 'High-energy dance fitness workouts' },
      pranayam: { name: 'Pranayam', icon: 'fas fa-wind', color: 'blue', description: 'Breathing techniques for wellness' },
      meditation: { name: 'Meditation', icon: 'fas fa-leaf', color: 'green', description: 'Mindfulness and mental clarity practices' },
      fitness: { name: 'Fitness', icon: 'fas fa-dumbbell', color: 'red', description: 'General fitness and strength training' },
      pilates: { name: 'Pilates', icon: 'fas fa-spa', color: 'purple', description: 'Core strengthening and flexibility' },
      aerobics: { name: 'Aerobics', icon: 'fas fa-running', color: 'yellow', description: 'Cardiovascular fitness workouts' }
    };

    // Group classes by category
    const classesByCategory = {};
    Object.keys(serviceCategories).forEach(category => {
      classesByCategory[category] = allClasses.filter(cls => cls.category === category);
    });

    let userEnrollments = [];
    if (req.session.user) {
      userEnrollments = await Enrollment.find({ userId: req.session.user._id });
    }

    res.render('services', { 
      serviceCategories,
      classesByCategory,
      userEnrollments,
      user: req.session.user 
    });
  } catch (error) {
    console.error('Services error:', error);
    res.render('services', { 
      serviceCategories: {},
      classesByCategory: {},
      userEnrollments: [],
      user: req.session.user 
    });
  }
};

module.exports = { getClasses, getServices, enrollClass };