var express = require('express');
var router = express.Router();
var {database} = require('../config/helpers');

/* GET ALL PRODUCTS */
router.get('/', (req, res) => {
    let page = (req.query.page != undefined && req.query.page != 0) ? req.query.page : 1; // set the current page number
    let limit = (req.query.limit != undefined && req.query.limit != 0) ? req.query.limit : 10; // set the limit of items per page

    let startValue;
    let endValue;

    if (page > 0) {
      startValue = (page * limit) - limit; // 0,10,20,30..
      endValue = page * limit;
    } else {
      startValue = 0;
      endValue = 10;
    }

    database.table('products as p')
      .join([{
        table: 'categories as c',
        on: 'c.id = p.cat_id'
      }])
      .withFields([
        'c.title as category',
        'p.title as name',
        'p.price',
        'p.quantity',
        'p.description',
        'p.image',
        'p.id'
      ])
      .slice(startValue, endValue)
      .sort({ id: .1 })
      .getAll()
      .then(prods => {
        if (prods.length > 0) {
          res.status(200).json({
            count: prods.length,
            products: prods
          });
        } else {
          res.json({ message: 'No products founds' });
        }
      }).catch(err => console.log(err));
  });


/* GET SINGLE PRODUCT */
router.get('/:prodid', function(req, res) {
  let productId = req.params.prodid;

  database.table('products as p')
    .join([{
      table: 'categories as c',
      on: 'c.id = p.cat_id'
    }])
    .withFields([
      'c.title as category', 'p.title as name', 'p.price', 'p.description',
      'p.quantity', 'p.image', 'p.images', 'p.id'
    ])
    .filter({'p.id': productId})
    .get()
    .then(prod => {
      if (prod) {
        res.status(200).json(prod);
      } else {
        res.json({message: `No product found with product ID ${productId}`});
      }
    }).catch(err => console.log(err));
});

/* GET ALL PRODUCTS FROM ONE PARTICULAR CATEGORY */
router.get('/category/:catname', function(req, res) {
  let page = (req.query.page != undefined && req.query.page != 0) ? req.query.page : 1; // set the current page number
  let limit = (req.query.limit != undefined && req.query.limit != 0) ? req.query.limit : 10; // set the limit of items per page

  let startValue;
  let endValue;

  if (page > 0) {
    startValue = (page * limit) - limit; // 0,10,20,30..
    endValue = page * limit;
  } else {
    startValue = 0;
    endValue = 10;
  }

  // Fetch the category name from the url
  const cat_title = req.params.catname; 

  database.table('products as p')
    .join([{
      table: 'categories as c',
      on: `c.id = p.cat_id WHERE c.title LIKE '%${cat_title}%'`
    }])
    .withFields([
      'c.title as category',
      'p.title as name',
      'p.price',
      'p.description',
      'p.quantity',
      'p.image',
      'p.id'
    ])
    .slice(startValue, endValue)
    .sort({id: .1})
    .getAll()
    .then(prods => {
      if (prods.length > 0) {
        res.status(200).json({
          count: prods.length,
          products: prods
        });
      } else {
        res.json({message: `No products found from ${cat_title} category`});
      }
    }).catch(err => console.log(err));
});

router.delete("/delete/:prodId", (req, res) => {
  let prodId = req.params.prodId;

  if (!isNaN(prodId)) {
    database
      .table("products")
      .filter({ id: prodId })
      .remove()
        .then(successNum => {
            if (successNum == 1) {
                res.status(200).json({
                    message: `Record deleted with product id ${prodId}`,
                    status: 'success'
                });
            } else {
                res.status(500).json({status: 'failure', message: 'Cannot delete the product'});
          }
      })
      .catch((err) => res.status(500).json(err));
  } else {
    res
      .status(500)
      .json({ message: "ID is not a valid number", status: "failure" });
  }
});


module.exports = router;
