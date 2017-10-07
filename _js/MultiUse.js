//Multi Use Functions
String.prototype.rsplit = function(sep, maxsplit) {
    var split = this.split(sep);
    return maxsplit ? [ split.slice(0, -maxsplit).join(sep) ].concat(split.slice(-maxsplit)) : split;
};
String.prototype.strip = function() {
return this.replace(/^\s*|\s*$/g, "")
};
String.prototype.lstrip = function() {
return this.replace(/^\s*/g, "")
};
String.prototype.rstrip = function() {
return this.replace(/\s*$/g, "")
}
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

Array.prototype.sortOn = function(key){
    this.sort(function(a, b){
        if(a[key] < b[key]){
            return -1;
        }else if(a[key] > b[key]){
            return 1;
        };
        return 0;
    });
    return this;
};

function getBase64FromImageUrl(url) {
    var canvas = document.createElement("canvas");
    canvas.width = 178;
    canvas.height = 100;
    var ctx = canvas.getContext("2d");

    var img = new Image();
    img.src = url;
    ctx.drawImage(img,0,0,178,100);
    var dataURL = canvas.toDataURL("image/jpeg"); 
    return dataURL;
};

function stepTo(element, property, targetValue, metric, time, steps, retFunction, valInterval, timeInterval, curValue, inputCheck) {
    if (typeof inputCheck == undefined || inputCheck != false) {
        if (typeof element == 'string') {
            element = document.getElementById(element);
        };
        var inputCheck = false;
        var curValue = parseFloat(getStyle(element,property));
        var valInterval = (targetValue-curValue)/steps;
        var timeInterval = time/steps;
    };
    if (absoluteValue(curValue-targetValue)>absoluteValue(valInterval)) {
        curValue = curValue+valInterval;
        eval('element.style.'+property+' = curValue+metric');
        setTimeout(function(){ stepTo(element, property, targetValue, metric, time, steps, retFunction, valInterval, timeInterval, curValue, inputCheck)},timeInterval);
    } else {
        eval('element.style.'+property+' = targetValue+metric');
        var inputCheck = true;
        if (typeof retFunction != 'undefined'){
            retFunction();
        };
        return
    };
};
function getStyle(element,styleProp){
    if (typeof element == 'string') {
        element = document.getElementById(element);
    };
    return eval('window.getComputedStyle(element).'+styleProp);
};
function absoluteValue(integer) {
    if (integer < 0) {
        return 0-integer
    } else { 
        return integer
    };
};
function isNear(element, distance, event) {
    element = document.getElementById(element);
    var left = element.offsetLeft - distance;
    var top = element.offsetTop - distance;
    var right = left + element.offsetWidth + (2 * distance);
    var bottom = top + element.offsetHeight + (2 * distance);
    if(event){
        var x = event.clientX;
        var y = event.clientY;
        return ( x > left && x < right && y > top && y < bottom );  
    }; 
};
function invertHex(hex,guaranteeContrast,guaranteedRange) { 
    var hex = hex.substr(1);
    var oColors = new Array(hex.substr(0,2),hex.substr(2,2),hex.substr(4,2)); 
    var nColors = new Array();
	for (i=0;i<3;i++) { 
		nColors[i] = (parseInt('FF',16)-parseInt(oColors[i], 16)).toString(16);
		if (nColors[i].length == 1) { nColors[i] = "0" + nColors[i]; };
	};
    var contrast = 0
    var direction = 0
    for (i=0;i<3;i++) { 
        contrast = contrast+absoluteValue(parseInt(nColors[i],16)-parseInt('77',16))
        direction = contrast+parseInt(nColors[i],16)-parseInt('77',16)
    };
	var newColor = '#'+nColors[0] + nColors[1] + nColors[2];
    if (guaranteeContrast) {
        if (contrast < guaranteedRange) {
            if (direction < 0) {
                newColor = '#FFFFFF'
            } else {
                newColor = '#000000'
            };
        };
    };
    return newColor;
};
function appendContent(itemName) {
    var a = document.getElementById(itemName);
    a.onclick = function() { alert ("hi"); };

    var a = document.getElementById(itemName);
    var newcontent = document.createElement('div');
    newcontent.innerHTML = "bar";

    while (newcontent.firstChild) {
        a.appendChild(newcontent.firstChild);
    }
};