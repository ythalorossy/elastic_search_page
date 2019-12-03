var conf = require('./config')
var elasticsearch = require('elasticsearch')
var fs = require('fs');

/* creates an elasticsearch client that can be used to send requests to ES */
var elasticClient = new elasticsearch.Client(conf.es);

/* default index to search */
var SEARCH_INDEX = "blogs"
var FILE_PATH = "/Users/pmusa/Coding/elastic/education/courses/ilt/EngineerI/front_end/test.txt"

/* base query body that will be edited and then added to the query and post_filter */
var generate_base_query = function () {
  return {
    "bool": {
      "filter":[],
      "should": []
    }
  }
}

/* multi_match query to be added inside a should in the query */
var multi_match = function (q) {
  return [
    {
      "multi_match": {
        "query": q,
        "fuzziness": 1,
        "operator": "AND",
        "fields": [
          "title",
          "title.*",
          "content",
          "content.*"
        ],
        "type": "most_fields",
      },
    },
    {
      "multi_match": {
        "type": "phrase_prefix", 
        "slop": 1,
        "query": q,
        "operator": "AND",
        "fields": [
          "title",
          "title.*",
          "content",
          "content.*"
        ],
        "type": "most_fields",
      },
    }
  ]
}

/* function to change the date format into a date format elasticsearch understands
 * date_str: string containing a date with any non digit separator with the format yyyy/MM/dd
 * returns: yyyy-MM-dd
 */
function formated_date (date_str) {
  var date_arr = date_str.split(/[^\d]+/)
  return date_arr[0] + "-" + date_arr[1] + "-" + date_arr[2]
}

function search(params) {
  try {
    var query = fs.readFileSync(FILE_PATH, "utf8");
  } catch(err) {
    console.log("using the default query")
    return default_search(params);
  }
  var query = query.replace("QUERY_TERMS", params.query_term);
  var search = {
    index: SEARCH_INDEX,
    body: query 
  }

  return elasticClient.search(search)
}

/* Main search function to get data from ES */
function default_search(params) {
  var query = generate_base_query()
  var functions = []
  var post_filter = generate_base_query()
  var sort = []

  /* adds the multi_match with the correct terms to the query.should */
  if (params.query_term) {
    query.bool.should = multi_match(params.query_term)
    query.bool.minimum_should_match = 1
  }

  /* add range filter based on start and end dates */
  if (params.start_date || params.end_date) {
    var range = { "publish_date": {} }
    if (params.start_date)
      range["publish_date"].gte = formated_date(params.start_date)
    if (params.end_date)
      range["publish_date"].lte = formated_date(params.end_date)
    query.bool.filter.push({ range: range })
  }

  /* add sites as a post_filter (change results but not facets) */
  if (params.categories) {
    if (typeof params.categories == "string")
      params.categories = [ params.categories ]
    post_filter.bool.filter.push({"terms":{"category.keyword":params.categories}})
  }

  if (params.sort) {
    var s = params.sort.split("-")
    if (s[1]) {
      var sclause = {}
      sclause[s[0]] = { "order": s[1] }
      sort.push(sclause)
    }
  }
  sort.push("_score")

  var search = {
    index: SEARCH_INDEX,
    body: {
      track_total_hits: true,
      from: params.page * params.size,
      size: params.size,
      sort: sort,
      query: query,
      post_filter: post_filter,
      aggs: {
        "categories": {
          "terms": {
            "field": "category.keyword",
            "size": 5
          }
        }
      },
      "highlight": { /* highlight the main fields */
        "fields": {
          "title": {},
          "content": {}
        },
        "pre_tags": [
          "<mark>"
        ],
        "post_tags": [
          "</mark>"
        ]
      }
    }
  }

  return elasticClient.search(search)
}

exports.search = search
