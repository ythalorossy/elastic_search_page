var express = require('express');
var router = express.Router();
var elastic = require('elasticsearch');
var conf = require('../config');

// create a new client
var suggest_client = new elastic.Client({
  host: conf.es.host,
  log: 'warning'
});

// Starting Defaults
var sortBy = 'frequency';
var suggestProperty = 'content';
var index = 'blogs'

router.get('/', function(req, res, next) {
  suggest_client.search({
    index: index,
    body: {
      suggest: {
        my_suggestion: {
          text: req.query.term,
          term: {
            field: suggestProperty,
            sort: sortBy
          }
        }
      }
    }
  }).then(function (qres, err) {
    res.render('suggest', { 
        qres: qres, 
        layout: false 
	});
  }, function (err) {
    console.log(err.message);
  });

});

module.exports = router;
