const mongoose = require('mongoose')

//The ReviewSchema defines the structure of a review document in MongoDB. It includes fields such as rating, title, comment, user, and product. Some fields have validation rules defined, such as minimum and maximum values for rating and a maximum length for title. The user and product fields reference other models in the database.
const ReviewSchema = mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Please provide rating']
    },
    title: {
      type: String,
      trim: true,
      required: [true, 'Please provide review title'],
      maxlength: 100
    },
    comment: {
      type: String,
      required: [true, 'Please provide review text']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true
    }
  },
  { timestamps: true }
)
//This line defines an index on the product and user fields to enforce uniqueness. It ensures that a user can only submit one review for a particular product.
ReviewSchema.index({ product: 1, user: 1 }, { unique: true })

//This code defines a static method calculateAverageRating on the Review model. It performs an aggregate pipeline operation to calculate the average rating and the number of reviews for a specific product
ReviewSchema.statics.calculateAverageRating = async function (productId) {
  const result = await this.aggregate([
    //The $match stage filters the reviews by the specified productId.
    { $match: { product: productId } },
    {
      //$group stage calculates the average rating and the count of reviews.
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        numOfReviews: { $sum: 1 }
      }
    }
  ])
  console.log(result)
  //After calculating the values, it updates the corresponding Product document using findOneAndUpdate. The averageRating is rounded up to the nearest integer, and any errors encountered during the update are logged to the console.
  try {
    await this.model('Product').findOneAndUpdate(
      { _id: productId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numOfReviews: result[0]?.numOfReviews || 0
      }
    )
  } catch (error) {
    console.log(error)
  }
}
// The post('save', ...) middleware is triggered after a review document is successfully saved
ReviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.product)
})
//he post('remove', ...) middleware is triggered after a review document is successfully removed. Inside these middleware functions, the calculateAverageRating method is called to update the average rating and the number of reviews for the corresponding product.
ReviewSchema.post('remove', async function () {
  await this.constructor.calculateAverageRating(this.product)
})

module.exports = mongoose.model('Review', ReviewSchema)
