const { Blog, Comment } = require('../model/blog');

const createBlog = async (req, res) => {
  try {
    const blogData = {
      ...req.body,
      author: req.session.user._id,
      images: req.files?.images?.map(file => `/uploads/blogs/${file.filename}`) || [],
      videos: req.files?.videos?.map(file => `/uploads/blogs/${file.filename}`) || []
    };
    
    await Blog.create(blogData);
    res.redirect('/profile');
  } catch (error) {
    console.error('Create blog error:', error);
    res.redirect('/profile');
  }
};

const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    if (req.files?.images) {
      updateData.images = req.files.images.map(file => `/uploads/blogs/${file.filename}`);
    }
    if (req.files?.videos) {
      updateData.videos = req.files.videos.map(file => `/uploads/blogs/${file.filename}`);
    }
    
    await Blog.findByIdAndUpdate(id, updateData);
    res.redirect('/profile');
  } catch (error) {
    console.error('Update blog error:', error);
    res.redirect('/profile');
  }
};

const deleteBlog = async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.redirect('/profile');
  } catch (error) {
    console.error('Delete blog error:', error);
    res.redirect('/profile');
  }
};

const likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    const userId = req.session.user._id;
    
    if (blog.likes.includes(userId)) {
      blog.likes.pull(userId);
    } else {
      blog.likes.push(userId);
    }
    
    await blog.save();
    res.json({ likes: blog.likes.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    await Comment.create({
      blogId: req.params.id,
      author: req.session.user._id,
      content: req.body.content
    });
    res.redirect('back');
  } catch (error) {
    console.error('Add comment error:', error);
    res.redirect('back');
  }
};

module.exports = { createBlog, updateBlog, deleteBlog, likeBlog, addComment };