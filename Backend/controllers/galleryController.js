const { Gallery } = require('../model/gallery');

const getGallery = async (req, res) => {
  try {
    const posts = await Gallery.find()
      .populate('createdBy', 'firstName lastName profilePhoto')
      .populate('comments.user', 'firstName lastName profilePhoto')
      .sort({ createdAt: -1 });
    
    res.render('gallery', { posts, user: req.session.user });
  } catch (error) {
    console.error('Gallery error:', error);
    // Fallback with empty posts array
    res.render('gallery', { posts: [], user: req.session.user || null });
  }
};

const createPost = async (req, res) => {
  try {
    const { title, description, sessionType } = req.body;
    const images = req.files.images ? req.files.images.map(file => `/uploads/gallery/${file.filename}`) : [];
    const videos = req.files.videos ? req.files.videos.map(file => `/uploads/gallery/${file.filename}`) : [];

    const post = new Gallery({
      title,
      description,
      sessionType,
      images,
      videos,
      createdBy: req.session.user._id
    });

    await post.save();
    res.redirect('/gallery');
  } catch (error) {
    console.error('Create post error:', error);
    res.redirect('/gallery');
  }
};

const deletePost = async (req, res) => {
  try {
    await Gallery.findByIdAndDelete(req.params.id);
    res.redirect('/gallery');
  } catch (error) {
    console.error('Delete post error:', error);
    res.redirect('/gallery');
  }
};

const likePost = async (req, res) => {
  try {
    const post = await Gallery.findById(req.params.id);
    const userId = req.session.user._id;
    
    if (post.likes.includes(userId)) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }
    
    await post.save();
    res.json({ likes: post.likes.length });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
};

const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Gallery.findById(req.params.id);
    
    post.comments.push({
      user: req.session.user._id,
      text
    });
    
    await post.save();
    res.redirect('/gallery');
  } catch (error) {
    console.error('Add comment error:', error);
    res.redirect('/gallery');
  }
};

module.exports = {
  getGallery,
  createPost,
  deletePost,
  likePost,
  addComment
};