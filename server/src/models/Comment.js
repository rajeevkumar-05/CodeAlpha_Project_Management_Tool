const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Comment must belong to a task']
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Comment must have an author']
    },
    message: {
      type: String,
      required: [true, 'Comment message cannot be empty'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Comment', commentSchema);
