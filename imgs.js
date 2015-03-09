var images = require('images');
var fs = require('fs');
var path = require('path');
var config = require('./config');

//var exts = ['.png', '.jpg', '.gif'];
var exts = {
    '.png': true,
    '.jpg': true,
    '.gif': true
};
var src = config.src;
var files = fs.readdirSync(src);
files = files.filter(function (item) {
    var extname = path.extname(item);
    /*var isImg = exts.some(function (ext) {
        return ext === extname;
    });*/
    return exts[extname];
});
files.sort(function (a, b) {
    return parseInt(a) - parseInt(b);
});

files = files.map(function (item) {
    return {
        img: images(src + '/' + item),
        name: path.basename(item, path.extname(item))
    }
});
module.exports = files;
