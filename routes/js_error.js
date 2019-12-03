var express = require('express');
var router = express.Router();

/* render simple page with a javascript error */
router.get('/', function(req, res, next) {
  res.render('js_error', {
    /* header definitions */
    title: 'JavaScript Error',
  });
});

module.exports = router;
