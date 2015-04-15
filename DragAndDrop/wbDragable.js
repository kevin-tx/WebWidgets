/**
 * 可拖拽对象--可单独使用，也可配合wbDropable使用
 */

(function ($) {
    //定义JQuery全局变量
    $.extend({
        wbDrag_obj: null, //当前拖拽的对象
        wbDrag_parent: null, //当前拖拽对象的父对象
        wbDrag_helper: null//当前拖拽对象的移动对象
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
                appendTo: "parent", //控件在拖动过程中helper的容器, 默认情况下, ui.helper使用和初始定义的draggable相同的容器, 也就是其父元素
                dragThumb: '', //可拖拽区域，是指对象内可触发拖拽行为的区域，为空时，表示整个对象自己，不为空时，表示一个指示对象内部子元素的选择器表达式
                helper: "original", //拖拽对象的移动对象（跟随鼠标移动的对象），可选值:original,clone,function(event){return element;}，（注意，当original,clone时，不要通道ID选择器(#)给对象添加样式，否则通过ID选择器(#)添加的样式无法体现在helper中）
                helperOpacity: false, //移动对象透明度--false表示不透明，数字表示透明度，范围0-1
                canDrop: false, //是否可放置，即是否和放置对象配合使用
                dropMatchKey: "", //放置匹配字段，只要符合放置对象要求的拖拽对象，才可以在该放置对象中放置
                revert: false, //鼠标释放时，如果没有被成功drop，是否回到原始位置
                //自定义helper（function）时，helper相对于鼠标位置的偏移
                reTop: 5,
                reLeft: 5,
                //回调函数
                dragStart: null, //拖动开始--function(e,mPostion,dragObj,helper)//标准事件对象，鼠标位置，拖拽对象，移动对象
                draging: null, //拖动中--function(e,mPostion,dragObj,helper)
                dragStop: null//拖动结束--function(e,mPostion,dragObj)
                //				droped: null//放置完成事件--function(e,dragObj,helper,dropObj)
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
                var $this = $(this);
                $this.data('WidgetData', {
                    target: $this,
                    settings: settings
                });

                $this.addClass("wb-dragable");

                //获取可拖拽区域
                var $dragThumb = $this;
                if (settings.dragThumb) {
                    $dragThumb = $(settings.dragThumb, $this);
                }

                $dragThumb.mousedown(function (ev) {
                    if (ev.stopPropagation)
                        ev.stopPropagation();

                    //获取可拖拽对象
                    var $this = $(this);
                    if ($this.hasClass("wb-dragable")) {
                    }
                    else {
                        $this = $this.closest(".wb-dragable");
                    }

                    var helper, helperContainer, helperBorder,
        	    	reTop, reLeft; //相对偏移

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

                            if ($.isFunction(settings.helper)) {
                                helper = settings.helper(e);
                            }
                            else if (settings.helper == "clone") {
                                helper = $this.clone().removeAttr("id");
                            }
                            else {
                                helper = $this.clone().removeAttr("id");
                                $this.css("visibility", "hidden");
                            }

                            //记录拖动对象的原始状态
                            $.wbDrag_obj = $this;
                            $.wbDrag_parent = $this.parent();
                            $.wbDrag_helper = helper;

                            //移动对象所属容器
                            helperContainer = settings.appendTo == "parent" ? $.wbDrag_parent : $(settings.appendTo);
                            if (helperContainer.length == 0)
                                throw "appendTo type error";

                            var pos = widget.getMousePos(e); //鼠标相对于文档的位置
                            var bo = $this.offset();//相对于文档的位置
                            var dragObjPos = $this.position();//相对于父元素的位置
                            helper.css({ "top": "0px", "left": "0px" });

                            //移动对象透明度
                            var optStr = settings.helperOpacity === false ? "" : "filter:alpha(opacity=" + settings.helperOpacity * 100 + ");-moz-opacity:" + settings.helperOpacity + ";-khtml-opacity:" + settings.helperOpacity + ";opacity:" + settings.helperOpacity + ";";

                            if ($.isFunction(settings.helper)) {
                                reTop = settings.reTop;
                                reLeft = settings.reLeft;
                                helperBorder = $("<div style=\"position:absolute;top:" + (pos.y - reTop) + "px;left:" + (pos.x - reLeft) + "px;" + optStr + "\"></div>")
        						.append(helper).appendTo(helperContainer);
                            }
                            else {
                                var martop = parseInt($this.css("margin-top")); martop = isNaN(martop) ? 0 : martop;
                                var marleft = parseInt($this.css("margin-left")); marleft = isNaN(marleft) ? 0 : marleft;
                                reTop = pos.y - bo.top + martop;
                                reLeft = pos.x - bo.left + marleft;
                                helperBorder = $("<div style=\"position:absolute;top:" + (dragObjPos.top - martop) + "px;left:" + (dragObjPos.left - marleft) + "px;" + optStr + "\"></div>")
        						.append(helper).appendTo(helperContainer);
                            }
                            $("body").css('cursor', 'pointer');

                            //触发开始拖拽事件
                            if (settings.dragStart) {
                                settings.dragStart(e, pos, $this, helper);
                            }
                        }
                        else {
                            var pos = widget.getMousePos(e);
                            helperBorder.offset({ top: pos.y - reTop, left: pos.x - reLeft });

                            //触发拖拽中事件
                            if (settings.draging) {
                                settings.draging(e, pos, $this, helper);
                            }
                        }
                        return true;
                    }

                    function eMouseup(e) {
                        if (!$.wbDrag_obj) {
                            $(document).unbind("mousemove", eMousemove);
                            $(document).unbind("mouseup", eMouseup);
                            return;
                        }
                        $("body").css('cursor', 'default');
                        widget.dragReleaseCapture(this);
                        //当拖拽对象可放置，且到达放置对象区域时，如何处理由wbDropable对象的droped事件决定
                        if (settings.canDrop && $.wbDrop_obj) {
                            //完成放置
                            $.wbDrop_obj.wbDropable("doDrop");
                        }
                        else {
                            if (settings.revert) {
                                helperBorder.remove();
                                $this.css("visibility", "visible");
                            }
                            else {
                                $this.css({ "position": "absolute", "visibility": "visible", "top": helperBorder.css("top"), "left": helperBorder.css("left") }).appendTo(helperContainer);
                                helperBorder.remove();
                            }
                            $.wbDrag_obj = null;
                            $.wbDrag_parent = null;
                            $.wbDrag_helper = null;
                        }

                        $(document).unbind("mousemove", eMousemove);
                        $(document).unbind("mouseup", eMouseup);

                        var pos = widget.getMousePos(e);
                        //触发拖拽结束事件
                        if (settings.dragStop) {
                            settings.dragStop(e, pos, $this);
                        }
                    }
                });
            });
        },
        //获得参数
        getOption: function () {
            return $(this).data('WidgetData').settings;
        },
        //设置参数
        setOption: function (options) {
            return $.extend(true, $(this).data('WidgetData').settings, options || {});
        }
    };

    $.fn.wbDragable = function (method) {
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