const mongoose = require('mongoose')

// It defines the structure of a product document in MongoDB.The schema contains various fields such as name, price, description, image, category, company, colors, featured, freeShipping, inventory, averageRating, numOfReviews, and user. Each field has a specified type and additional configurations like required fields, default values, maximum lengths, enumerations, and references to other models.
const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please provide product name'],
      maxlength: [100, 'Name can not be more than 100 characters']
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      default: 0,
      min: 0 // Minimum price value should be greater than or equal to 0
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
      maxlength: [1000, 'Description can not be more than 1000 characters']
    },
    image: {
      type: String,
      default: '/uploads/example.jpeg'
    },
    category: {
      type: String,
      required: [true, 'Please provide product category'],
      enum: ['office', 'kitchen', 'bedroom']
    },
    company: {
      type: String,
      required: [true, 'Please provide company'],
      enum: {
        values: ['ikea', 'liddy', 'marcos'],
        message: '{VALUE} is not supported'
      }
    },
    colors: {
      type: [String],
      default: ['#222'],
      required: true
    },
    featured: {
      type: Boolean,
      default: false
    },
    freeShipping: {
      type: Boolean,
      default: false
    },
    inventory: {
      type: Number,
      required: true,
      default: 15
    },
    averageRating: {
      type: Number,
      default: 0
    },
    numOfReviews: {
      type: Number,
      default: 0
    },

    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  //The { timestamps: true } option adds createdAt and updatedAt fields to the schema for automatic timestamping. The { toJSON: { virtuals: true }, toObject: { virtuals: true } } option allows virtual properties to be included when converting the document to JSON or a plain JavaScript object.
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
)
//This code defines a virtual property called reviews on the ProductSchema. Virtual properties are not stored in the database but can be accessed like regular document properties. In this case, the reviews virtual property is set to refer to the Review model. It specifies that the product field in the Review model is associated with the _id field in the Product model. The justOne option is set to false to indicate that multiple reviews can be associated with a single product
ProductSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
  justOne: false
})
//This code adds a pre-remove middleware function to the ProductSchema. The middleware is triggered before a product document is removed. Inside the middleware function, it uses this.model('Review') to access the Review model and then calls the deleteMany() method to delete all reviews that have the current product's _id as the value of their product field. This ensures that when a product is deleted, all associated reviews are also removed.
ProductSchema.pre('remove', async function (next) {
  await this.model('Review').deleteMany({ product: this._id })
})

module.exports = mongoose.model('Product', ProductSchema)
