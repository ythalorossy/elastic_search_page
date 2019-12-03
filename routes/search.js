var express = require('express');
var router = express.Router();
var elastic = require('../elasticsearch');
var conf = require('../config');

var DEFAULT_SIZE = 3;
var DEFAULT_PAGE = 0;

function validate(params) {
  params.page = params.page || DEFAULT_PAGE
  params.size = params.size || DEFAULT_SIZE
}

/* GET search page. */
/* execute search and render search.hbs with the search result and URL params */
router.get('/', function(req, res, next) {
  validate(req.query)
  elastic.search(req.query).then(
    function (qres, err) {
      res.render('search', {
        /* header definitions */
        title: 'Elasticsearch Blogs Search Page',

        /* enable suggester */
        suggester: conf.suggester,

        /* 
         * URL parameters: categories, query_term, start_date,
         *                 end_date, sort, page, size 
         */
        params: req.query,

        /* search response */
        qres: qres
      });
  });
});

module.exports = router;
