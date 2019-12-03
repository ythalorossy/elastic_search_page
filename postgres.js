var conf = require('./config')
/* creates an elasticsearch client that can be used to send requests to ES */
const { Client } = require('pg')

const client = new Client(conf.pg)

client.connect()

var FROM = " FROM Blogs as b LEFT JOIN categories c on b.category = c.id"

function formatedDate (date_str) {
  var date_arr = date_str.split(/[^\d]+/)
  return date_arr[0] + "-" + date_arr[1] + "-" + date_arr[2]
}

function getWhere(params) {
  var stmt = " WHERE b.current_locales = 1"

  // add query terms
  if (params.query_term) {
    stmt = stmt + " AND (b.title ILIKE '%" + params.query_term + 
                   "%' OR b.content ILIKE '%" + params.query_term + "%')"
  }

  /* add date filter */
  if (params.start_date)
    stmt = stmt + " AND b.publish_date > '"+formatedDate(params.start_date)+"'"
  if (params.end_date)
    stmt = stmt + " AND b.publish_date < '"+formatedDate(params.end_date)+"'"

  /* add category filter */
  if (params.categories) {
    if (typeof params.categories == "string") {
      stmt = stmt + " AND c.category = '" + params.categories + "'"
    } else {
      var filter = " AND (c.category = '" + params.categories[0] + "'"
      for(var i=1; i < params.categories.length; i++) {
        filter = filter + " OR c.category = '" + params.categories[i] + "'"
      }
      stmt = stmt + filter + ")"
    }
  }
  return stmt
}

function search(params) {
  var stmt = "SELECT b.id, b.title, b.url, b.publish_date, c.category, b.content"
  stmt = stmt + FROM + getWhere(params)

  // add sorting
  if (params.sort) {
    var s = params.sort.split("-")
    if (s[1]) {
      stmt = stmt + " ORDER BY b." + s[0] + " " + s[1]
    }
  }

  // define page size
  stmt = stmt +" LIMIT "+ params.size +" OFFSET "+ (params.page * params.size)

  return client.query(stmt)
}

function total(params) {
  var stmt = "SELECT count(*)"
  stmt = stmt + FROM + getWhere(params)
  return client.query(stmt)
}

function aggs(params) {
  var stmt = "SELECT c.category, count(*)"
  var cat = params.categories
  params.categories = null
  stmt = stmt + FROM + getWhere(params)
  params.categories = cat
  stmt = stmt + "GROUP BY c.category ORDER BY count desc"
  return client.query(stmt)
}

exports.search = search
exports.total = total
exports.aggs = aggs
