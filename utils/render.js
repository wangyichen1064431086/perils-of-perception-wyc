const fs = require('mz/fs');
const path = require('path');
const nunjucks = require('nunjucks');
const markdownTag = require('nunjucks-markdown');

const markdownIt = require('markdown-it')({
  html: true,// Enable HTML tags in source
  linkify:true,// Autoconvert URL-like text to links
  typographer:true,// Enable some language-neutral replacement + quotes beautification
  breaks:true// Convert '\n' in paragraphs into <br>
});

const env = new nunjucks.Environment(
  new nunjucks.FileSystemLoader(
    [
      path.resolve(process.cwd(),'views'),
      path.resolve(process.cwd(),'bower_components/ftc-footer')
    ],
    {
      watch: false,
      noCache: true
    }
  ),
  {
    autoescape: false
  }
);

function isotime(date) {
  if(!date) {
    return '';
  } else if (!(date instanceof Date)) {
    return date;
  }

  return date.toISOString();//returns a string in simplified extended ISO format
}

function md(str, inline) {
  return !str ? '' : (inline ? markdownIt.renderInline(str) : markdownIt.render(str));
  /* 
   * markdownIt.render(src[,env]) -> String
   * Render markdown string into html.
   *  - src(String) —— source string
      - env(Object) —— environment sandbox
   * MarkdownIt.renderInline(src[, env])String
   * Similar to MarkdownIt.render but for single paragraph content. Result will NOT be wrapped into <p> tags.
   */
}

env.addFilter('isotime',isotime);
env.addFilter('md',md);
/**
 * env.addFilter(name, func, [async])
 * Add a custom filter named 'name' which calls 'func' whenever invoked. If the filter needs to be async, async must be true 
 * @returns  env for further method chaining.
 */

 function now(unixtime) {
   return unixtime ? Date.now() : new Date();
 }
/**
 * Date.now()
 * @returns the number of milliseconds elapsed since 1 January 1970 00:00:00 UTC.
 */

 env.addGlobal('now', now);
 /**
  * env.addGlobal(name,value)
  * Add a global value that will be available to all templates. 
  * @note: this will overwrite any existing global called name.  
  * @returns env for further method chaining.
  */

  markdownTag.register(env, md);


  function render(template, context, name) {
    return new Promise(function(resolve, reject) {
      env.render(template,context,function(err,result) {
        if (err) {
          reject(err);
        } else {
          if (typeof context === 'string') {
            resolve({
              name: context,
              content: result
            });
          } else if (name && (typeof name === 'string')) {
            resolve({
              name: name,
              content: result
            });
          } else {
            resolve(result);
          }
        }
      });
    });
  }

  module.exports = render;