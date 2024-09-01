var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers');
var dataTable = require('datatables.net-dt');

const verifyLogin = (req,res,next)=>{
  if(req.session.adminLoggedIn){
    next();
  }
  else{
    res.redirect('/login');
  }
}

router.get('/login', (req, res) => {
  if(req.session.adminLoggedIn){
    res.redirect('/');
  }
  else{
    res.render('admin/login',{loginErr:req.session.adminLoginErr});
    req.session.adminLoginErr=false;
  }
});


router.post('/login', (req, res) => {
  productHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.admin = response.admin;
      console.log("there",req.session.admin)
      req.session.adminLoggedIn = true;
      res.redirect('/admin');
    }
    else {
      req.session.adminLoginErr=true;
      res.redirect('/admin/login');
    }

  })

});

/* GET users listing. */
router.get('/', function (req, res, next) {

  if(req.session.adminLoggedIn){
    productHelpers.getProductAll().then((products)=>{
     let admin = req.session.admin;
     console.log("there",req.session.admin)
     res.render('admin/view-products', {  products,admin });
   })
  }
  else{
    res.render('admin/login',{loginErr:req.session.adminLoginErr});
    req.session.adminLoginErr=false;
  }


});

router.get('/logout', (req, res) => {
  req.session.adminLoggedIn=null;
  res.redirect('/admin');
})

router.get('/add-product',verifyLogin, (req, res) => {
  let admin = req.session.admin;
  res.render('admin/add-product',{admin});
})

router.post('/add-product',verifyLogin, (req, res) => {
  productHelpers.addProduct(req.body, (id) => {
    let image = req.files.Image;
    image.mv('./public/product-images/' + id + '.jpeg', (err) => {
      if (!err)
        res.redirect('/admin/');
      else
        console.log(err)
    })
  })



})

router.get('/delete-product/:id',verifyLogin,(req,res)=>{
  var proId = req.params.id;
  productHelpers.deleteProduct(proId).then((response)=>{
    console.log(response)
    res.redirect('/admin/');
  })

})

router.get('/edit-product/:id',verifyLogin,(req,res)=>{
  productHelpers.getProductDetails(req.params.id).then((product)=>{
    let admin = req.session.admin;
    res.render('admin/edit-product',{product,admin});

  })
})

router.post('/edit-product/:id',verifyLogin,(req,res)=>{
  productHelpers.UpdateProduct(req.params.id,req.body).then(()=>{
    res.redirect('/admin/');
    if(req.files!=null){
      let image = req.files.Image;
      if(req.files.Image){
        image.mv('./public/product-images/' + req.params.id + '.jpeg');
      }

    }
  })
})


module.exports = router;
