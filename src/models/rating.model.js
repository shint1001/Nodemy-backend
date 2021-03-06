const mongoose = require("mongoose");
const NodemyResponseError = require("../utils/NodemyResponseError");

const User = require('./user.model');

const ratingSchema = new mongoose.Schema({
  userId: {
    type: String,
    trim: true,
    require: true,
    minlength: 24,
    maxlength: 24,
  },
  courseId: {
    type: String,
    trim: true,
    require: true,
    minlength: 24,
    maxlength: 24,
  },
  description: {
    default: '',
    type: String,
    trim: true,
    minlength: 1,
    maxlength: 500,
  },
  rating: {
    type: Number,
    require: true,
    min: 1,
    max: 5,
    validate(value) {
      if (value !== 1 && value !== 2 && value !== 3 && value !== 4 && value !== 5) {
        throw new NodemyResponseError(400, 'Rating\'s value must be 1, 2, 3, 4 or 5!');
      }
    },
  },
}, {
  timestamps: true,
});

ratingSchema.methods.toJSON = function () {
  const rating = this;
  const ratingObject = rating.toObject();
  delete ratingObject.__v;
  delete ratingObject.createdAt;

  return ratingObject;
};

ratingSchema.statics.getListRatings = async (page = 1, courseId = '') => {
  const ratingsPerPage = 10;
  const skip = ratingsPerPage * (page - 1);
  const query = {
    courseId
  };

  const totalRatings = await Rating.find(query).countDocuments();
  const ratings = await Rating.find(query)
  .skip(skip)
  .limit(ratingsPerPage);
  
  for (let i = 0; i < ratings.length; ++i) {
    let user = await User.findById(ratings[i].userId);
    user = user.toJSON();
    ratings[i] = {
      ...ratings[i].toJSON(),
      fullname: user.fullname,
      avatar: `${process.env.HOST}/users/${user._id.toString()}/avatar`,
    }
  }

  return {
    ratings,
    totalRatings,
    totalPages: Math.ceil(totalRatings / ratingsPerPage),
  };
};

const Rating = mongoose.model("Rating", ratingSchema);
module.exports = Rating;
