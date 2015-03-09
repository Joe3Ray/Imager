var imgs = require('./imgs');
var config = require('./config');
var images = require('images');
var usage = config.usage;

var cssStr = '';
var frames = [];
switch (usage) {
    case 'combine':
        var wid = 0, hei = 0;
        var x = 0, y = 0;
        var bg;
        if (config.horizontal) {
            imgs.forEach(function (img, i) {
                cssStr += "." + img.name + " {left: " + wid + "px; top: " + hei + "; width: " + img.img.width() + "px; height: " + img.img.height() + "px;}\n";
                //frames.push([i * img.img.width(), 0, img.img.width(), img.img.height(), 0, 0, 0]);
                var height = img.img.height();
                hei = (hei > height) ? hei : height;
                wid += img.img.width();
                if (i != imgs.length - 1) {
                    wid += config.gap;
                }
            });
            bg = images(wid, hei);
            imgs.forEach(function (img, i) {
                bg.draw(img.img, x, y);
                x += img.img.width();
                if (i != imgs.length - 1) {
                    x += config.gap;
                }
            });
        }
        else {
            imgs.forEach(function (img, i) {
                cssStr += "." + img.name + " {left: " + wid + "px; top: " + hei + "px; width: " + img.img.width() + "px; height: " + img.img.height() + "px;}\n";
                //frames.push([0, i * img.img.height(), img.img.width(), img.img.height(), 0, 0, 0]);
                var width = img.img.width();
                wid = (wid > width) ? wid : width;
                hei += img.img.height();
                if (i != imgs.length - 1) {
                    hei += config.gap;
                }
            });
            bg = images(wid, hei);
            imgs.forEach(function (img, i) {
                bg.draw(img.img, x ,y);
                y += img.img.height();
                if (i != imgs.length - 1) {
                    y += config.gap;
                }
            });
        }

        bg.save(config.dest + '/' + config.name, config.type);
        console.log(cssStr);
        //console.log(frames);
        break;

    case 'scale':
        imgs.forEach(function (img, i) {
            console.log(img.img.size());
            img = img.img.resize(config.xScaleTo);
            img.save(config.dest + '/' + config.name, config.type);
        });
        break;
    case 'sprite':
        var img_size = imgs[0].img.size();
        var maxCols = Math.floor(config.maxWidth / img_size.width);
        var maxRows = Math.floor(config.maxHeight / img_size.height);
        var index = 0;
        function doSprite(imgs, isForced) {
            if (maxCols * maxRows >= imgs.length && maxCols >= config.cols && maxRows >= config.rows) {
                var len = imgs.length;
                if (isForced) {
                    var real_rows = Math.ceil(len / maxCols);
                    var real_cols = maxCols;
                    if (real_rows === 1 && maxCols > len) {
                        real_cols = len;
                    }
                }
                else {
                    var real_rows = Math.ceil(len / config.cols);
                    var real_cols = config.cols;
                    if (real_cols === 1 && config.cols > len) {
                        real_cols = len;
                    }
                }

                var wid = real_cols * img_size.width;
                var hei = real_rows * img_size.height;
                var bg = images(wid, hei);
                imgs.forEach(function (img, i) {
                    var x = Math.floor(i / real_cols);
                    var y = i % real_cols;
                    var img_x = img_size.width * y;
                    var img_y = img_size.height * x;
                    bg.draw(img.img, img_x, img_y);
                    frames.push([img_x, img_y, img_size.width, img_size.height, index, 0, 0]);
                });
                bg.save(config.dest + '/' + config.name + index + '.png', config.type);
                console.log(index, frames);
                frames = [];
            }
            else {
                var wid = maxCols * img_size.width;
                var hei = maxRows * img_size.height;
                var bg = images(wid, hei);
                var num = maxCols * maxRows;
                for (var i = 0; i < num; i++) {
                    var x = Math.floor(i / maxCols);
                    var y = i % maxCols;
                    var img_x = img_size.width * y;
                    var img_y = img_size.height * x;
                    bg.draw(imgs[i].img, img_x, img_y);
                    frames.push([img_x, img_y, img_size.width, img_size.height, index, 0, 0]);
                }
                bg.save(config.dest + '/' + config.name + index + '.png', config.type);
                //console.log(index, frames);
                //frames = [];
                index++;
                imgs = imgs.slice(maxCols * maxRows);
                doSprite(imgs, true);
            }
        }
        doSprite(imgs);
        break;
    case 'CSSSprite':
        var maxWidth = config.maxWidth || 2048;
        var maxHeight = config.maxHeight || Infinity;
        var width = 0, height = 0;
        var nowLineHeight = 0;
        var maxLineWidth = 0;
        var info = []; 
        var sprite_item = {width: 0, height: 0, items: []};
        for (var i = 0, len = imgs.length; i < len; i++) {
            var img = imgs[i];
            var name = img.name;
            img = img.img;
            var img_wid = img.width();
            var img_hei = img.height();
            var img_x, img_y;
            if (width !== 0 && (img_wid <= maxWidth) && (img_hei <= maxHeight)) {
                width += config.gap;    
            }
            if (img_wid > maxWidth || img_hei > maxHeight) {
                console.log('skip ' + name);
                continue;
            }
            else if (width + img_wid > maxWidth) {
                (maxLineWidth < width) && (maxLineWidth = width);
                height += nowLineHeight;
                height += config.gap;
                width = 0;
                width += img_wid;
                img_x = 0;
                img_y = height;
                nowLineHeight = img_hei;
                if (height + nowLineHeight > maxHeight) {
                    sprite_item.width = maxLineWidth;
                    sprite_item.height = height - config.gap;
                    info.push(sprite_item);
                    sprite_item = {width: 0, height: 0, items: []};
                    img_x = 0;
                    img_y = 0;
                    height = 0;
                    maxLineWidth = 0;
                }
            }
            else {
                img_x = width;
                img_y = height;
                width += img_wid;
                (nowLineHeight < img_hei) && (nowLineHeight = img_hei);
            }
            sprite_item.items.push({
                name: name,
                width: img_wid,
                height: img_hei,
                x: img_x,
                y: img_y,
                img: img
            });
            if (i + 1 == len) {
                (maxLineWidth < width) && (maxLineWidth = width);
                sprite_item.width = maxLineWidth;
                sprite_item.height = height + nowLineHeight;
                info.push(sprite_item);
            }
        }
        info.forEach(function (inf, i) {
            console.log(inf.width, inf.height, inf.items);
            var bg = images(inf.width, inf.height);
            inf.items.forEach(function (item) {
                bg.draw(item.img, item.x, item.y);
            });
            bg.save(config.dest + '/' + i + config.name, config.type);
        });
        break;
}
if (config.compress) {
    var Imagemin = require('imagemin');
    var imagemin = new Imagemin();
    imagemin = imagemin.src(config.dest + '/' + config.name).dest(config.dest);
    switch (config.type) {
        case 'jpg':
            imagemin = imagemin.use(Imagemin.jpegtran({progressive: true}));
            break;
        case 'gif':
            imagemin = imagemin.use(Imagemin.gifsicle({ interlaced: true }));
            break;
        case 'png':
            imagemin = imagemin.use(Imagemin.optipng({ optimizationLevel: 3 }));
            break;
    }
    imagemin.run(function (err, files) {
        if (err) {
            console.error(err);
        }
        else {
        }
    });
}
