const { Book, BookReview, BookComment } = require('../model/book');

const getLibrary = async (req, res) => {
  try {
    const books = await Book.find({ isApproved: true })
      .populate('suggestedBy', 'firstName lastName profilePhoto')
      .sort({ createdAt: -1 });
    
    // Get reviews and comments for each book
    for (let book of books) {
      const reviews = await BookReview.find({ bookId: book._id }).populate('reviewer', 'firstName lastName profilePhoto');
      const comments = await BookComment.find({ bookId: book._id }).populate('author', 'firstName lastName profilePhoto');
      book.reviews = reviews;
      book.comments = comments;
      book.avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    }
    
    res.render('library', { books, user: req.session.user });
  } catch (error) {
    console.error('Library error:', error);
    res.render('library', { books: [], user: req.session.user });
  }
};

const suggestBook = async (req, res) => {
  try {
    const bookData = {
      ...req.body,
      suggestedBy: req.session.user._id,
      coverImage: req.file ? `/uploads/books/${req.file.filename}` : null
    };
    
    await Book.create(bookData);
    res.redirect('/library');
  } catch (error) {
    console.error('Suggest book error:', error);
    res.redirect('/library');
  }
};

const likeBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    const userId = req.session.user._id;
    
    if (book.likes.includes(userId)) {
      book.likes.pull(userId);
    } else {
      book.likes.push(userId);
    }
    
    await book.save();
    res.json({ likes: book.likes.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addReview = async (req, res) => {
  try {
    await BookReview.create({
      bookId: req.params.id,
      reviewer: req.session.user._id,
      rating: req.body.rating,
      review: req.body.review
    });
    res.redirect('/library');
  } catch (error) {
    console.error('Add review error:', error);
    res.redirect('/library');
  }
};

const addComment = async (req, res) => {
  try {
    await BookComment.create({
      bookId: req.params.id,
      author: req.session.user._id,
      content: req.body.content
    });
    res.redirect('/library');
  } catch (error) {
    console.error('Add comment error:', error);
    res.redirect('/library');
  }
};

module.exports = { getLibrary, suggestBook, likeBook, addReview, addComment };