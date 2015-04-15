/**
* 可拖动大小对象
*/

(function ($) {
    //定义JQuery全局变量
    $.extend({
        wbResizable_obj: null //当前拖动大小的对象
    });

    var methods = {
        /**
        * 初始化
        * @param options 初始化参数
        * @returns
        */
        init: function (options) {
            // 设定属性--覆盖默认属性
            var settings = $.extend(true, {
                minWidth: 10,//最小宽度，单位像素
                minHeight: 10, //最小高度，单位像素
                maxWidth: 500, //最大宽度，单位像素
                maxHeight: 500, //最大高度，单位像素
                //回调函数
                resizeStart: null, //拖动开始--function(e,mPostion,resizeObj)//标准事件对象，鼠标位置，拖拽对象
                resizing: null, //拖动中--function(e,mPostion,resizeObj)
                resizeStop: null//拖动结束--function(e,mPostion,resizeObj)
            }, options || {});

            return this.each(function () {
                // 解决IE8以下OCX加载后拖动不正常问题的hack
                var hack = $("#___hack");
                if (hack.size() == 0) {
                    hack = $("<div id=\"___hack\"></div>");
                    hack.appendTo("body");
                }

                //每个对象拥有不同的settings对象
                settings = $.extend(true, {}, settings);
                var $target = $(this);
                $target.data('WidgetData', {
                    target: $target,
                    settings: settings
                });

                $target.addClass("wb-resizable");
                $("<div class=\"wb-resizble-hand wb-resizable-e\"></div>").appendTo($target);
                $("<div class=\"wb-resizble-hand wb-resizable-s\"></div>").appendTo($target);
                $("<div class=\"wb-resizble-hand wb-resizable-se\"></div>").appendTo($target);

                //向右拉宽
                $(">.wb-resizble-hand", $target).mousedown(function (ev) {
                    if (ev.stopPropagation)
                        ev.stopPropagation();

                    //拖拽边的父元素，就是被拉伸的对象
                    var $this = $(this).parent();

                    //拉伸方向
                    var resizeType = "se";
                    if ($(this).hasClass("wb-resizable-e")) {
                        resizeType = "e";
                    }
                    else if ($(this).hasClass("wb-resizable-s")) {
                        resizeType = "s";
                    }

                    $(document).mousemove(eMousemove);
                    $(document).bind("mouseup", eMouseup);
                    var mousedownPos = widget.getMousePos(ev); //鼠标位置

                    function eMousemove(e) {
                        var fistMovePos = widget.getMousePos(e); //鼠标位置
                        if (mousedownPos && fistMovePos.x == mousedownPos.x && fistMovePos.y == mousedownPos.y)
                            return;
                        // 解决IE8以下OCX加载后滑动条拖动不正常问题的hack
                        hack.html(" ");
                        if (mousedownPos) {
                            mousedownPos = null;
                            widget.dragSetCapture(this);

                            //记录拖动对象
                            $.wbResizable_obj = $this;

                            //设置大小
                            var pos = widget.getMousePos(e); //鼠标相对位置
                            setSize(pos);

                            //触发开始拖拽事件
                            if (settings.resizeStart) {
                                settings.resizeStart(e, pos, $this);
                            }
                        }
                        else {
                            //设置大小
                            var pos = widget.getMousePos(e); //鼠标相对位置
                            setSize(pos);

                            //触发拖拽中事件
                            if (settings.resizing) {
                                settings.resizing(e, pos, $this);
                            }
                        }
                        return true;
                    }

                    function eMouseup(e) {
                        if (!$.wbResizable_obj) {
                            $(document).unbind("mousemove", eMousemove);
                            $(document).unbind("mouseup", eMouseup);
                            return;
                        }
                        $("body").css('cursor', 'default');
                        widget.dragReleaseCapture(this);

                        //设置大小
                        var pos = widget.getMousePos(e); //鼠标相对位置
                        setSize(pos);

                        $(document).unbind("mousemove", eMousemove);
                        $(document).unbind("mouseup", eMouseup);

                        //触发拖拽结束事件
                        if (settings.resizeStop) {
                            settings.resizeStop(e, pos, $this);
                        }
                    }

                    function setSize(pos) {
                        var settings = $target.data('WidgetData').settings;
                        var objOff = $this.offset(); //对象相对body的偏移
                        switch (resizeType) {
                            case "e":
                                var w = pos.x - objOff.left;
                                w = w < settings.minWidth ? settings.minWidth : w;
                                w = w > settings.maxWidth ? settings.maxWidth : w;
                                $this.width(w);
                                break;
                            case "s":
                                var h = pos.y - objOff.top;
                                h = h < settings.minHeight ? settings.minHeight : h;
                                h = h > settings.maxHeight ? settings.maxHeight : h;
                                $this.height(h);
                                break;
                            default:
                                var w = pos.x - objOff.left;
                                w = w < settings.minWidth ? settings.minWidth : w;
                                w = w > settings.maxWidth ? settings.maxWidth : w;
                                var h = pos.y - objOff.top;
                                h = h < settings.minHeight ? settings.minHeight : h;
                                h = h > settings.maxHeight ? settings.maxHeight : h;
                                $this.width(w);
                                $this.height(h);
                                break;
                        }
                    }
                });
            });
        }
    };

    $.fn.wbResizable = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(
					arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.wbDragable');
        }
    };
})(jQuery);