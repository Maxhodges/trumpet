// Copyright (C) 2012 Martin Reistadbakk
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

CloudFlare.define("trumpet", ["cloudflare/config"], function(_config) {

    if ('addEventListener' in window) {
      on  = function (obj,type,fn) { obj.addEventListener(type,fn,false)    };
      off = function (obj,type,fn) { obj.removeEventListener(type,fn,false) };
    }
    else {
      on  = function (obj,type,fn) { obj.attachEvent('on'+type,fn) };
      off = function (obj,type,fn) { obj.detachEvent('on'+type,fn) };
    }
    

    var Trumpet = function Trumpet(config) {
            this.trumpetEl = null;
            this.useFilter = /msie [678]/i.test(navigator.userAgent); // sniff, sniff
            this.message_dismissed = "";
            this.animate_status = 0;
            this.config = config
            this.cookie = "__trumpetapp_dm"
        }
    var trumpet = new Trumpet(_config)


    Trumpet.prototype.activate = function() {
        if (this.config.message != "") {
            this.setup();
        }
    }

    Trumpet.prototype.setup = function() {
        var theme = document.createElement('style');
        theme.setAttribute("type", "text/css")
		var colorbackground = this.config.colorbackground;
		var colortext = this.config.colortext;
		var colorlink = this.config.colorlink;
        var style = "STYLEHERE";
        if(theme.styleSheet){
            theme.styleSheet.cssText = style;
        }
        else{
            theme.innerHTML = style;
        }
        document.getElementsByTagName("head")[0].appendChild(theme);

        this.trumpetEl = document.createElement('div');
        this.trumpetEl.id = 'trumpet';
        this.trumpetEl.className = 'trumpet';
        document.getElementsByTagName("body")[0].appendChild(this.trumpetEl);
        var trumpet_logo = document.createElement('span');
        trumpet_logo.id = 'trumpet_logo';
        this.trumpetEl.appendChild(trumpet_logo);
        var trumpet_message = document.createElement('span');
        trumpet_message.id = 'trumpet_message';
        this.trumpetEl.appendChild(trumpet_message);
        var  trumpet_close = document.createElement('span');
        trumpet_close.id = 'trumpet_close';
        trumpet_close.innerHTML="click to close"
        this.trumpetEl.appendChild(trumpet_close);

        this.message_dismissed = this.readCookie();
        on (this.trumpetEl,'click',function () {
            trumpet.animate(0);
            trumpet.message_dismissed = trumpet.murmurhash3_32_gc(trumpet.config.message, 1) + "";
            trumpet.createCookie(trumpet.message_dismissed);
        });
        setTimeout(function() {trumpet.showMessage();},100);
        

    }
    Trumpet.prototype.showMessage = function(self) {
        if (this.message_dismissed != this.murmurhash3_32_gc(this.config.message, 1) + "") {
			var message = this.config.message;
			console.log(this.config);
			if (this.config.link != ""){
				message = message + " <a href='"+this.config.link+"'>"+this.config.linktext+"</a>";
			}
            document.getElementById("trumpet_message").innerHTML = message;
            this.animate(1);
        }

    }
        

    Trumpet.prototype.animate = function(level) {
        this.animate_status = level;
        if (level === 1) {
            this.trumpetEl.className = "trumpet trumpet-animate";
        } else {
            this.trumpetEl.className = this.trumpetEl.className.replace(" trumpet-animate", "");
            this.end();
        }
    }



    Trumpet.prototype.end = function () {
        setTimeout(function(self) {
            self.trumpetEl.className = "trumpet";
            self.trumpetEl.innerHTML = "";
            self.config.message = "";

        }, 500,this);
    }

    Trumpet.prototype.createCookie = function(value) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + 1);
        var c_value = escape(value) + "; expires=" + exdate.toUTCString();
        document.cookie = this.cookie + "=" + c_value + "; path=/";
    }

    Trumpet.prototype.readCookie = function (name) {
        return null;
        var nameEQ = this.cookie + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    Trumpet.prototype.murmurhash3_32_gc = function(key, seed) {
        var remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i;

        remainder = key.length & 3; // key.length % 4
        bytes = key.length - remainder;
        h1 = seed;
        c1 = 0xcc9e2d51;
        c2 = 0x1b873593;
        i = 0;

        while (i < bytes) {
            k1 = ((key.charCodeAt(i) & 0xff)) | ((key.charCodeAt(++i) & 0xff) << 8) | ((key.charCodeAt(++i) & 0xff) << 16) | ((key.charCodeAt(++i) & 0xff) << 24);
            ++i;

            k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
            k1 = (k1 << 15) | (k1 >>> 17);
            k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

            h1 ^= k1;
            h1 = (h1 << 13) | (h1 >>> 19);
            h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
            h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
        }

        k1 = 0;

        switch (remainder) {
        case 3:
            k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
        case 2:
            k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
        case 1:
            k1 ^= (key.charCodeAt(i) & 0xff);

            k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
            k1 = (k1 << 16) | (k1 >>> 16);
            k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
            h1 ^= k1;
        }

        h1 ^= key.length;

        h1 ^= h1 >>> 16;
        h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
        h1 ^= h1 >>> 13;
        h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
        h1 ^= h1 >>> 16;

        return h1 >>> 0;
    }
    
    if (!window.jasmine) {
        trumpet.activate();
    }

    return trumpet
});
