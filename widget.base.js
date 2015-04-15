/**
 * 
 */

var widget = widget||{};
/*
* 获取鼠标的位置
*/
widget.getMousePos = function(event){
	var ev = event || window.event;
    if (ev.pageX || ev.pageY) {
        return {
            x: ev.pageX,
            y: ev.pageY
        };
    }
    return {
        x: ev.clientX + document.body.scrollLeft - document.body.clientLeft,
        y: ev.clientY + document.body.scrollTop - document.body.clientTop
    };
};

/*
 * 开始拖拽
 */
widget.dragSetCapture = function(o) {
    if (o.setCapture) {
        o.setCapture();
    }
    else if (window.captureEvents) {
        window.captureEvents(Event.MOUSEMOVE | Event.MOUSEDOWN);
    }
};

/*
 * 结束拖拽
 */
widget.dragReleaseCapture = function (o) {
    if (o.releaseCapture) {
        o.releaseCapture();
    }
    else if (window.captureEvents) {
        window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
    }
};

/*
 * 获得触发键盘事件的键值
 */
widget.getKeyCode = function(ev){
	ev = ev || window.event;
    var code = (ev.keyCode || ev.which);
    return code;
};

/*
* 调用方式
* var template1="apple is {0}，banana is {1}";
* var result1=widget.stringFormat(template1,"red","yellow"); 
*/
widget.stringFormat = function(strTmp, args) {
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            if (arguments[i] != undefined) {
            	strTmp = strTmp.replace(new RegExp("({[" + (i-1) + "]})", "g"), arguments[i]);
            }
        }
    }
    return strTmp;
};

$.support.selectstart = "onselectstart" in document.createElement( "div" );
$.fn.extend({
	disableSelection: function() {
		return this.bind( ( $.support.selectstart ? "selectstart" : "mousedown" ) +
			".wb-disableSelection", function( event ) {
				event.preventDefault();
			});
	},

	enableSelection: function() {
		return this.unbind( ".wb-disableSelection" );
	}
});