var db = require('../config/connection');
var collection = require('../config/collection');
var bcrypt = require('bcrypt');
require('dotenv').config();
var objectId = require('mongodb').ObjectId;
var Razorpay = require('razorpay');
var instance = new Razorpay({
    //make sure to enter key id and key secret 
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = {
    doSignup(userData) {
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10);
            db.get().collection(collection.USER_COLLECTIONS).insertOne(userData).then((data) => {
                resolve(userData);
            })
            

        })

    },

    doLogin(userData) {
        let response = {};
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTIONS).findOne({ email: userData.email })
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        console.log('login succesfull');
                        response.user = user;
                        response.status = status;
                        resolve(response);
                    }
                    else {
                        console.log('login Failed');
                        resolve({ status: false })
                    }
                })
            }
            else {
                console.log("user not found");
                resolve({ status: false });
            }

        })

    },
    addToCart(proId, userId) {

        let proObj = {
            item: new objectId(proId),
            quantity: 1
        }


        return new Promise(async (resolve, reject) => {
            try {
                let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new objectId(userId) });
                if (userCart) {
                    let proExist = userCart.products.findIndex(product => product.item.equals(proObj.item));

                    if (proExist != -1) {
                        // Product exists in cart, increment quantity
                        db.get().collection(collection.CART_COLLECTION).updateOne(
                            { user: new objectId(userId), 'products.item': new objectId(proId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            }
                        ).then(() => {
                            resolve();
                        }).catch((error) => {
                            console.error("Error updating product quantity:", error);
                            reject(error);
                        });
                    } else {
                        // Product does not exist in cart, push new product
                        db.get().collection(collection.CART_COLLECTION).updateOne(
                            { user: new objectId(userId) },
                            {
                                $push: { products: proObj }
                            }
                        ).then((response) => {
                            resolve(response);
                        }).catch((error) => {
                            console.error("Error adding new product to cart:", error);
                            reject(error);
                        });
                    }
                } else {
                    // User cart does not exist, create new cart
                    let cartObj = {
                        user: new objectId(userId),
                        products: [proObj]
                    };
                    console.log("here")
                    db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                        resolve(response);
                    }).catch((error) => {
                        console.error("Error creating new cart:", error);
                        reject(error);
                    });
                }
            } catch (error) {
                console.error("Error in addToCart function:", error);
                reject(error);
            }
        });
    },

    getCartProducts(userId) {
        return new Promise(async (resolve, reject) => {
            try {
                let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                    {
                        $match: { user: new objectId(userId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTIONS,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                        }
                    }

                ]).toArray();
                console.log(cartItems)
                resolve(cartItems);
            } catch (error) {
                reject(error);
            }
        });
    },
    getCartCount(userId) {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new objectId(userId) });
            if (cart) {
                let count = cart.products.length;
                resolve(count);

            }
            else {
                resolve()
            }

        })
    },
    changeProductQuantity(details) {

        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)
        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                db.get().collection(collection.CART_COLLECTION).updateOne({ _id: new objectId(details.cart) },
                    {
                        $pull: { products: { item: new objectId(details.product) } }
                    }).then((response) => {
                        resolve({ removeProduct: true })

                    })

            }
            else {
                db.get().collection(collection.CART_COLLECTION).updateOne(
                    { _id: new objectId(details.cart), 'products.item': new objectId(details.product) },
                    {
                        $inc: { 'products.$.quantity': details.count }
                    }
                ).then((response) => {
                    resolve({ status: true });
                })



            }
        })


    },
    getTotalAmount(userId) {
        return new Promise(async (resolve, reject) => {
            try {
                console.log("Calculating total amount for user:", userId);

                let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                    {
                        $match: { user: new objectId(userId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTIONS,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            item: 1,
                            quantity: 1,
                            product: { $arrayElemAt: ['$product', 0] }
                        }
                    },
                    {
                        $project: {
                            item: 1,
                            quantity: 1,
                            price: { $toDouble: '$product.price' }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: { $multiply: ['$quantity', '$price'] } }
                        }
                    }
                ]).toArray();
                resolve(total[0] ? total[0].total : 0); // Handle the case where the total is empty
            } catch (error) {
                reject(error);
            }
        });
    },
    removeProductFromCart(details) {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).updateOne(
                { _id: new objectId(details.cart) },
                {
                    $pull: { products: { item: new objectId(details.product) } }
                }
            ).then((response) => {
                resolve(true);
            }).catch((error) => {
                reject(error);
            });
        });
    },
    getCartProductList(userId) {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new objectId(userId) });
            console.log(cart.products)
            resolve(cart.products);
        })
    },
    placeOrder(order, products, total) {
        return new Promise((resolve, reject) => {
            let status = order['payment-method'] == 'COD' ? 'placed' : 'pending';
            let orderObj = {
                deliveryDetails: {
                    mobile: order.mobile,
                    address: order.address,
                    pincode: order.pincode
                },
                userId: new objectId(order.userId),
                paymentMethod: order['payment-method'],
                products: products,
                status: status,
                totalAmount: total,
                date: new Date()
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then(() => {
                db.get().collection(collection.CART_COLLECTION).deleteOne({ user: new objectId(order.userId) });
                resolve();
            })

        })

    },
    getOrderId(order) {
        return new Promise(async (resolve, reject) => {
            console.log(order)
            let orderId = await db.get().collection(collection.ORDER_COLLECTION).findOne({ userId: new objectId(order.userId) },{ sort: { _id: -1 }});
            console.log("bdjcAC" + orderId._id);
            resolve(orderId._id);

        })

    },
    getUserOrders(userId) {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION)
                .find({ userId: new objectId(userId) }).toArray();
            resolve(orders);

        })

    },
    getOrderProducts(orderId) {
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: new objectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTIONS,
                        localField: 'products.item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }


            ]).toArray();
            console.log(orderItems)
            resolve(orderItems);
        });
    },
    generateRazorpay(orderId, total) {
        return new Promise((resolve, reject) => {
            console.log(orderId)
            var options = {
                amount: total*100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: "" + orderId
            };
            instance.orders.create(options, function (err, order) {
                if (err) {
                    console.log(err);
                }
                console.log("new order", order);
                resolve(order)
            });

        })
    },
    verifyPayment(details) {
        return new Promise((resolve, reject) => {
            const { createHmac } = require('node:crypto');
            console.log(details);

            const secret = 'DhO1dFVKVuTKCzmiaW6uOS1S';
            const hash = createHmac('sha256', secret)
                .update(details.razorpay_order_id+'|'+details.razorpay_payment_id)
                .digest('hex');
            if(hash == details.razorpay_signature){
                resolve()
            }
            else{
                reject()
            }
            
        })
    },
    changePaymentStatus(orderId){
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id: new objectId(orderId)},
         {
            $set:{
                status:'placed',
            }
         }).then(()=>{
            resolve()
         })

        })
    }








}
