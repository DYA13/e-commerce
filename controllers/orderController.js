const Order = require('../models/Order')
const Product = require('../models/Product')

const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const { checkPermissions } = require('../utils')

//This is a dummy function that simulates the behavior of a Stripe API. It takes an object with amount and currency as parameters and returns an object with client_secret and amount values.
const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = 'someRandomValue'
  return { client_secret, amount }
}

const createOrder = async (req, res) => {
  // Extracting data from the request body
  const { items: cartItems, tax, shippingFee } = req.body

  // Checking if there are any items in the cart
  if (!cartItems?.length > 0) {
    throw new CustomError.BadRequestError('No cart items provided')
  }
  // Checking if tax and shipping fee are provided
  if (!tax || !shippingFee) {
    throw new CustomError.BadRequestError('Please provide tax and shipping fee')
  }

  let orderItems = []
  let subtotal = 0
  // suggest reduce
  // Iterating over the cart items
  for (const item of cartItems) {
    // Finding the product in the database based on the item's product ID
    const dbProduct = await Product.findOne({ _id: item.product })
    if (!dbProduct) {
      throw new CustomError.NotFoundError(
        `No product with id : ${item.product}`
      )
    }
    // Creating an object for each item in the order
    const { name, price, image, _id } = dbProduct
    console.log(name, price, image)
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id
    }

    // Adding the item to the order
    orderItems = [...orderItems, singleOrderItem]
    // Calculating the order subtotal
    subtotal += item.amount * price
  }

  // Calculating the total order amount
  const total = tax + shippingFee + subtotal
  // Getting the client secret from the fake Stripe API
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: 'usd'
  })

  // Creating an order in the database
  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId
  })
  // Sending the response with the created order and client secret
  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret })
}
const getAllOrders = async (req, res) => {
  const orders = await Order.find({})
  res.status(StatusCodes.OK).json({ orders, count: orders.length })
}
const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params
  const order = await Order.findOne({ _id: orderId })
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${orderId}`)
  }
  checkPermissions(req.user, order.user)
  res.status(StatusCodes.OK).json({ order })
}
const getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId })
  res.status(StatusCodes.OK).json({ orders, count: orders.length })
}
// suggest renaming function
const updateOrder = async (req, res) => {
  const { id: orderId } = req.params
  const { paymentIntentId } = req.body

  const order = await Order.findOne({ _id: orderId })
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${orderId}`)
  }
  checkPermissions(req.user, order.user)

  order.paymentIntentId = paymentIntentId
  order.status = 'paid'
  await order.save()

  res.status(StatusCodes.OK).json({ order })
}

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder
}
