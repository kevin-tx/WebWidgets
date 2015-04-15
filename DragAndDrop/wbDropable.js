/**
* 可放置对象--只能配合wbDragable使用
*/

(function ($) {
    //定义JQuery全局变量
    $.extend({
        wbDrop_obj: null//当前可放置对象
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
                inDropAreaClass: "drop-inDropArea",
                dropedClass: "drop-droped",
                dropMatch: function (key) { return true; }, //放置匹配函数--function(key)//拖拽对象的匹配关键字，返回true时才可以放置
                //回调函数
                inDropArea: null, //进入可放置对象区域事件--function(e,dragObj,dropObj)//标准事件对象，拖拽对象，放置对象
                outDropArea: null, //离开可放置对象区域事件--function(e,dragObj,dropObj)//标准事件对象，拖拽对象，放置对象
                droped: null//放置完成事件--function(e,dragObj,dropObj)//标准事件对象，拖拽对象，放置对象
            }, options || {});

            return this.each(function () {
                //每个对象拥有不同的settings对象
                var st = $.extend(true, {}, settings);
                var $this = $(this);
                $this.data('WidgetData', {
                    target: $this,
                    settings: st
                });

                //是否进入过本放置对象区域
                st._inDrop = false;

                $(document).mousemove(function (e) {
                    var pos = widget.getMousePos(e), //鼠标位置
                    thisPos = $this.offset();
                    if (pos.x > thisPos.left && pos.x < thisPos.left + $this.width()
                    		&& pos.y > thisPos.top && pos.y < thisPos.top + $this.height()) {
                        if (!st._inDrop && $.wbDrag_obj && $.wbDrag_obj.data('WidgetData').settings.canDrop
    							&& st.dropMatch($.wbDrag_obj.data('WidgetData').settings.dropMatchKey)) {
                            //    						$("#log").html("in------"+ $this.attr("id") + "<br/>" + $("#log").html());
                            //进入可放置对象区域事件
                            $.wbDrop_obj = $this;
                            st._inDrop = true;
                            $this.addClass(st.inDropAreaClass);
                            if (st.inDropArea) {
                                st.inDropArea(e, $.wbDrag_obj, $this);
                            }
                        }
                    }
                    else {
                        //离开可放置对象区域事件
                        if (st._inDrop && $.wbDrag_obj) {
                            st._inDrop = false;
                            //    						$("#log").html("out-----"+ $this.attr("id") + "<br/>" + $("#log").html());    						
                            $this.removeClass(st.inDropAreaClass);
                            //有可能是先执行了进入逻辑，再执行离开逻辑，所以要判断当前放置对象是不是自己，如果是再置空，否则就是已经被新的放置对象覆盖了，不可置空
                            if ($.wbDrop_obj === $this) $.wbDrop_obj = null;
                            if (st.outDropArea) {
                                st.outDropArea(e, $.wbDrag_obj, $this);
                            }
                        }
                    }
                });
            });
        },
        doDrop: function (e) {
            var $this = $(this), settings = $this.data('WidgetData').settings;
            //放置完成事件
            if ($.wbDrop_obj && settings.droped) {
                settings.droped(e, $.wbDrag_obj, $this);
                $this.removeClass(settings.inDropAreaClass).addClass(settings.dropedClass);
                $.wbDrag_helper.parent().remove();
                $.wbDrag_obj = null;
                $.wbDrag_parent = null;
                $.wbDrag_helper = null;
                $.wbDrop_obj = null;
            }
        }
    };

    $.fn.wbDropable = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(
					arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.wbDropable');
        }
    };
})(jQuery);