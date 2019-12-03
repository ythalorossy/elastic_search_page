var conf = require('./config')
var apm = require('elastic-apm-node').start(conf.apm)
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('hbs')
var striptags = require('striptags');

var search = require('./routes/search');
var search_sql = require('./routes/search_sql');
var js_error = require('./routes/js_error');
// add route for suggest
var suggest = require('./routes/suggest');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('html', hbs.__express);

/* Add a 'function' called eachCheckbox that can be used in the hbs files.
 * eachCheckbox will generate a list of 
 *   <input type="checkbox" name="$name" value="$values[i]">
 * If $values[i].key is an element of $checks (which means an URL parameter)
 * eachCheckboxit adds "checked" to the input (so it is checked in the interface).
 */
hbs.registerHelper('eachCheckbox', function(name, key, values, checks, options) {
  var ret = "";
  var input = '<li><label><input type="checkbox" name="' + name + '" value="'

  if (!values) {return ret;}
  for(var i=0, j=values.length; i<j; i++) {
    ret = ret + input + values[i][key] +'" '
    if (checks && checks.indexOf(values[i][key]) > -1) {
      ret = ret + "checked"
    }
    ret = ret + ">" + options.fn(values[i]) + "</label></li>";
  }

  return ret;
});

hbs.registerHelper('select', function(selected, options) {
  return options.fn(this).replace(
    new RegExp(' value=\"' + selected + '\"'), '$& selected="selected"'
  );
});

function input(page, name, params) {
  var a = '<a href="?page=' + page
  for (var key in params) {
    if (key == "page") continue;
    if (params[key] instanceof Array) {
      for (var i in params[key]) {
        a = a + '&' + key + '=' + params[key][i]
      }
    } else if (params[key]) {
      a = a + '&' + key + '=' + params[key]
    }
  }
  a = a + '">' + (name || page+1) + '</a>\n'
  return a
}

hbs.registerHelper('eachPage', function(hits, params) {
    
  var NUMBER_OF_PAGES = 5;
  var OFFSET = Math.floor(NUMBER_OF_PAGES/2);
  var page = parseInt(params.page);
  var total_pages = Math.floor(hits/params.size);
  var ret = "";

  if (page > total_pages) {
    return "No documents for this page :/"
  } else if (page == 0) {
    ret = ret + "&laquo;\n1\n"
    for (i = 1; i < NUMBER_OF_PAGES && i <= total_pages; i++) {
      ret = ret + input(i, i+1, params);
    }
    if (total_pages > page) {
      ret = ret + input(page+1, "&raquo;", params)
    } else {
      ret = ret + "&raquo;\n"
    }
  } else if (page < 3) {
    ret = ret + input(page-1, '&laquo', params);
    ret = ret + input(0, null, params)
    if (page == 1) {
      ret = ret + "2\n"
    } else {
      ret = ret + input(1, null, params)
      ret = ret + "3\n"
    }
    for (i = page + 1; i < NUMBER_OF_PAGES && i <= total_pages; i++) {
      ret = ret + input(i, null, params)
    } 
    if (total_pages > page) {
      ret = ret + input(page+1, "&raquo;", params)
    } else {
      ret = ret + "&raquo;\n"
    }
  } else if (page == total_pages) {
    ret = ret + input(page-1, '&laquo;', params)
    for (i = page - NUMBER_OF_PAGES + 1; i < page; i++) {
      if (i < 0) continue
      ret = ret + input(i, null, params)
    }
    ret = ret + (page+1) + "\n&raquo;\n"
  } else if (page == total_pages - 1) {
    ret = ret + input(page-1, '&laquo;', params)
    for (i = page - NUMBER_OF_PAGES + OFFSET; i < page; i++) {
      if (i < 0) continue
      ret = ret + input(i, null, params)
    }
    ret = ret + (page+1) + "\n" 
    ret = ret + input(page+1, null, params)
    ret = ret + input(page+1, '&raquo;', params)
  } else {
    ret = ret + input(page-1, '&laquo;', params)
    for (i = 0; i < NUMBER_OF_PAGES; i++) {
      if (page == page + i - OFFSET) {
        ret = ret + (page+1) + "\n"
      } else {
        ret = ret + input(page + i - OFFSET, null, params);
      }
    }
    ret = ret + input(page+1, '&raquo;', params)
  }

  return ret;
});

hbs.registerHelper('trimString', function(str) {
    return new hbs.SafeString(striptags(str.substring(0,400)));
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// add paths to jquery scripts
app.use('/jquery',express.static(path.join(__dirname, '/node_modules/jquery/dist/')));
app.use('/jquery-ui',express.static(path.join(__dirname, '/node_modules/jquery-ui-dist/')));

app.use(['/'], search);
app.use(['/search_es'], search);
app.use(['/search_sql'], search_sql);
app.use(['/js_error'], js_error);
// add path for suggest
app.use(['/suggest'], suggest);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
