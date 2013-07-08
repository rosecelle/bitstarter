#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "tempindex.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://fierce-reaches-1073.herokuapp.com";
var rest = require('restler');
var util = require('util');

var buildfn = function() {
    var response2console = function(result, response) {
        if (result instanceof Error) {
            console.error('Error: ' + util.format(response.message));
        } else {
            fs.writeFileSync(HTMLFILE_DEFAULT, result);

        }
    };
    return response2console;
};

var assertValidUrl = function(url) {
     if (url != undefined && url.length > 0) {
       
        return true;
    }
    return false;
 //   var response2console = buildfn();
 //   var funcres = rest.get(url).on('complete', response2console);
                                                                           
 //    return funcres;
}

var assertInfileExists = function(infile) {
    var instr = infile;
    if(!fs.existsSync(instr)) {
           //    process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
        return false;
    }
    return true;
};
var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};
var cheerioHtmlUrl = function(urlfile) {
    return cheerio.load(urlfile);
};
var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, htmlurl,checksfile) {
  var out = {};

    if (assertInfileExists(htmlfile)) { 
       $ = cheerioHtmlFile(htmlfile);
       console.log("%s == htmlfile ", htmlfile);
    } else if (assertValidUrl(htmlurl)) {
       var response2console = buildfn();
        rest.get(htmlurl).on('complete', response2console);
//        console.log("result %s, response %s",util.format(result),response);
        $ = cheerioHtmlFile(HTMLFILE_DEFAULT);
//        console.log("%s = url   %s = response ", htmlurl,result );
    } else {
       console.error("%s does not exist. ", htmlfile);
       console.error("%s does not exist. ", htmlurl);
    }

    var checks = loadChecks(checksfile).sort();
        for(var ii in checks) {
          var present = $(checks[ii]).length > 0;
          out[checks[ii]] = present;
        }
        return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html')
        .option('-u, --url <url>', 'URL')
        .parse(process.argv);
    var checkJson = checkHtmlFile(program.file, program.url, program.checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
