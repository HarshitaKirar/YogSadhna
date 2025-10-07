const { User } = require('../model/user');
const { Purchase, Batch } = require('../model/batch');
const { Blog, Comment, Bookmark } = require('../model/blog');
const { Book } = require('../model/book');

const getProfile = async (req, res) => {
  try {
    const userId = req.session.user._id;
    
    // Get user data
    const user = await User.findById(userId).select('-password');
    
    // Get purchased batches
    const purchases = await Purchase.find({ userId }).populate('batchId');
    
    // Get user's blogs with comments
    const blogs = await Blog.find({ author: userId }).populate('author', 'firstName lastName profilePhoto');
    
    // Get comments for each blog
    for (let blog of blogs) {
      const comments = await Comment.find({ blogId: blog._id }).populate('author', 'firstName lastName profilePhoto');
      blog.comments = comments;
    }
    
    // Get bookmarked blogs
    const bookmarks = await Bookmark.find({ userId }).populate('blogId');
    
    // Get user's suggested books
    const suggestedBooks = await Book.find({ suggestedBy: userId });
    
    res.render('profile', { 
      user, 
      purchases, 
      blogs, 
      bookmarks,
      suggestedBooks 
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.redirect('/');
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const updateData = req.body;
    
    if (req.file) {
      updateData.profilePhoto = '/uploads/profiles/' + req.file.filename;
    }
    
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
    req.session.user = updatedUser;
    
    res.redirect('/profile');
  } catch (error) {
    console.error('Update profile error:', error);
    res.redirect('/profile');
  }
};

module.exports = { getProfile, updateProfile };