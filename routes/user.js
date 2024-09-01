var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers');
var userHelpers = require('../helpers/user-helpers');
var paymentStatus_orderId;

const verifyLogin = (req,res,next)=>{
  if(req.session.userloggedIn){
    next();
  }
  else{
    res.redirect('/login');
  }
}


/* GET home page. */
router.get('/', async function (req, res, next) {
    let user = req.session.user;
    console.log("newbie",user);
    let cartCount = null;
    if(user){
      cartCount = await userHelpers.getCartCount(user._id);
    }
    console.log("new",user)
    productHelpers.getProductAll().then((products) => {
    res.render('user/view-products', { products, user, cartCount });
  })

});

router.get('/login', (req, res) => {
  if(req.session.user){
    res.redirect('/');
  }
  else{
    res.render('user/login',{loginErr:req.session.userLoginErr});
    req.session.userLoginErr=false;
  }
});

router.get('/signup', (req, res) => {
  res.render('user/signup');

});

router.post('/signup', (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    console.log(response.user);
    req.session.userloggedIn = true;
    req.session.user = response;
    res.redirect('/');

  })

});


router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user;
      req.session.userloggedIn = true;
      res.redirect('/');
    }
    else {
      req.session.userLoginErr=true;
      res.redirect('/login');
    }

  })

});

router.get('/logout', (req, res) => {
  req.session.user=null;
  res.redirect('/');
})


router.get('/cart',verifyLogin,async(req,res)=>{
  let products = await userHelpers.getCartProducts(req.session.user._id);
  let totalValue = await userHelpers.getTotalAmount(req.session.user._id);
  console.log(products);
  let user = req.session.user;
    res.render('user/cart',{products,user,totalValue});
})

router.get('/add-to-cart/:id',verifyLogin,(req,res)=>{
  userHelpers.addToCart(req.params.id,req.session.user._id).then((response)=>{
    res.json({status:true});

    //res.redirect('/');
  })
  
})

router.post('/change-product-quantity',verifyLogin,(req,res)=>{
  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
    await userHelpers.getTotalAmount(req.body.user).then((totalValue)=>{
      response.total=totalValue;
      res.json(response);
    });
  })
})

router.get('/place-order',verifyLogin,async(req,res)=>{
  let total = await userHelpers.getTotalAmount(req.session.user._id);
  let user = req.session.user;
  res.render('user/place-order',{total,user});
})
router.post('/remove-product',verifyLogin,(req,res)=>{
  console.log(req.body)
  userHelpers.removeProductFromCart(req.body).then((response)=>{
    res.json(response);
    console.log(response)
  })
})

router.post('/place-order',verifyLogin,async(req,res)=>{
  let products = await userHelpers.getCartProductList(req.body.userId);
  let total = await userHelpers.getTotalAmount(req.body.userId);
  await userHelpers.placeOrder(req.body,products,total);
  await userHelpers.getOrderId(req.body).then((response)=>{
    let orderId = response;
    paymentStatus_orderId = orderId;
    if(req.body['payment-method']=='COD'){
      res.json({CodStatus:true});
    }
    else{
      userHelpers.generateRazorpay(orderId,total).then((response)=>{
        res.json(response);
      })
    }
  });

})

router.get('/order-success',verifyLogin,(req,res)=>{
  let user = req.session.user;
  res.render('user/order-success',user)

})

router.get('/orders', verifyLogin, async (req, res) => {
  try {
    let orders = await userHelpers.getUserOrders(req.session.user._id);
    let user = req.session.user;
    
    res.render('user/orders', { orders, user });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send('Internal Server Error');
  }
});


router.get('/view-order-products/:id',verifyLogin,async(req,res)=>{
  let products = await userHelpers.getOrderProducts(req.params.id);
  let user = req.session.user;
  console.log(req.params.id);
  res.render('user/view-order-products',{products,user});
})

router.post('/verify-payment',verifyLogin,async(req,res)=>{
  await userHelpers.verifyPayment(req.body).then(async()=>{
    console.log("bewbhcWFIFIBw;if;"+paymentStatus_orderId)
    await userHelpers.changePaymentStatus(paymentStatus_orderId).then(()=>{
      res.redirect('/order-success')
      console.log("payment succcess")
    })
  }).catch((err)=>{
    console.log(err);
    res.json({status:false})

  })
})


module.exports = router;
