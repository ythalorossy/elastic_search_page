var express = require('express');
var router = express.Router();
var sql = require('../postgres');

var DEFAULT_SIZE = 3;
var DEFAULT_PAGE = 0;

function validate(params) {
  params.page = params.page || DEFAULT_PAGE
  params.size = params.size || DEFAULT_SIZE
}

/* GET search page. */
/* execute search and render search.hbs with the search result and URL params */
router.get('/', function(req, res, next) {
  var result = {}
  validate(req.query)
  sql.search(req.query).then(
    function (qres, error) {
      result.blogs = qres.rows;
      sql.aggs(req.query).then(
        function (qres, err) {
          result.categories = qres.rows
          sql.total(req.query).then(
            function (qres, err) {
              result.total = qres.rows[0].count
              //console.log(result);
              res.render('search_sql', {
                /* header definitions */
                title: 'PostgreSQL Blogs Search Page',

                /* 
                 * URL parameters: categories, query_term, start_date,
                 *                 end_date, sort, page, size 
                 */
                params: req.query,

                /* search response */
                qres: result
              });
          });
      });
  });
});

module.exports = router;
