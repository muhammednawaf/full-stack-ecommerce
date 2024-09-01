var db = require('../config/connection');
var collection = require('../config/collection');
var objectId = require('mongodb').ObjectId;
var bcrypt = require('bcrypt');


module.exports={

    addProduct(product,callback){
        db.get().collection('product').insertOne(product).then((data)=>{
            callback(data.insertedId);
        })

    },

    getProductAll(){
        return new Promise(async(resolve,reject)=>{
            let products = await db.get().collection(collection.PRODUCT_COLLECTIONS).find().toArray();
            resolve(products);

        })

    },
    deleteProduct(proId){
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTIONS).deleteOne({_id:new objectId(proId)}).then((response)=>{
                resolve(response);
            })

        })
    },
    getProductDetails(proId){
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id: new objectId(proId)}).then((response)=>{
                resolve(response);
            })
        })

    },
    UpdateProduct(proId,proDetails){
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id: new objectId(proId)},{
                $set:{
                    name:proDetails.name,
                    description:proDetails.description,
                    price:proDetails.price,
                    category:proDetails.category

                }
            }).then(()=>{
                resolve();
            })

        })
    },
    doLogin(adminData) {
        let response = {};
        return new Promise(async (resolve, reject) => {
            let admin = await db.get().collection(collection.USER_COLLECTIONS).findOne({ email: adminData.email })
            if (admin) {
                bcrypt.compare(adminData.password, admin.password).then((status) => {
                    if (status) {
                        console.log('login succesfull');
                        response.admin = admin;
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



}