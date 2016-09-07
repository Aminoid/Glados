var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Testbed = mongoose.model('Testbed');
var Device = mongoose.model('Device');



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/rack', function(req, res, next) {
  console.log(req.body);
});
module.exports = router;
