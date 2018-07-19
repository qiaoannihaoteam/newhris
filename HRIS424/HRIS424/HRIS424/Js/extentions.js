/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* Purpose      :
* Date         :
* Author       : Gavin
* Note         :
* -------------------------------------------------
* 05 Jul 2017     Gavin        修改Date转化JSON格式
*
*    the latest update: 2017-07-05 17:30
*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

; (function ($, window, kendo) {
    // 重写Date的toJSON方法(JSON.stringify内部也是调用toJSON)，解决时区问题
    Date.prototype.toJSON = function () {
        return kendo.toString(this, "yyyy-MM-dd HH:mm:ss");
    };

    // 添加提示框元素
    $(window.document).find("body")
        .append('<span id="notification" style="display: none;"></span>')
        .find("#notification")
        .kendoNotification({
            position: {
                pinned: true,
                top: 50,
                left: function () {
                    return ($(window).width() - 300) / 2;
                }
            },
            autoHideAfter: 0,
            stacking: "down",
            templates: [{
                type: "error",
                template: '<div class="wrong-pass">' +
                            '<h3>Wrong</h3>' +
                            '<p>#= message.replace(/[\\r|\\n]+/g, \"<br />\") #</p>' +
                        '</div>'
            }, {
                type: "upload-success",
                template: '<div class="upload-success">' +
                                '<h3>Success</h3>' +
                                '<p>#= message.replace(/[\\r|\\n]+/g, \"<br />\") #</p>' +
                            '</div>'
            }]
        });

    // 添加等待动画元素
    $(window.document).find("body")
            .append('<div id="cover" class="k-loading-mask" style="width: 100%; height: 100%; display: none;">' +
                        '<span class="k-loading-text">Loading...</span><div class="k-loading-image">' +
                            '<div class="k-loading-color">' +
                            '</div>' +
                        '</div>' +
                    '</div>');

    // 添加按钮的hover效果
    $.fn.addHoverClass = function () {
        this.hover(function () {
            $(this).addClass("hover");
        }, function () {
            $(this).removeClass("hover");
        });
    }

    // 检测日期是否合法
    $.fn.kendoDateCheck = function () {
        //检测日期
        var $self = this;
        var date = new RegExp(/^\d{2}\s[a-z|A-Z]{3}\s\d{4}$/),
            value = $self.val();
        if (!date.test(value)) {
            $self.data("kendoDatePicker").value("");
        }
    }

    // 回车切换焦点
    $.fn.focusNextByEnter = function () {
        var inputs = this;
        inputs.on('keypress', function (e) {
            if (e.which === 13) {
                var idx = inputs.index(this);
                if (idx !== inputs.length - 1) {
                    inputs[idx + 1].focus();
                    e.preventDefault();
                }
            }
        });
    }

    /*
    * Purpose: 生成Combobox
    * Parameters:
    *   target: 需要进行渲染的DOM元素
    *   valuePrimitive: 默认true，主要配合MVVM使用
    *   text: 默认code，显示文本
    *   value: 默认code，值
    *   dataSource: 数据源，数组
    *   enable: 默认true，是否可用
    *   cascade: 级联事件
    *   change: 改变事件（无法监听使用代码更改的情况）
    *   dataBound: 数据绑定的事件
    *   listWidth: 设置下拉列表的宽度
    *   columns: 设置下拉列表中的列模版（前提是isUseTemplate为true）
    *       数组:[{ header: '模版头部名称', field: '绑定的字段名，与返回的dataSource要一致', width: '100px' //每一列的宽度 }]
    *   isUseTemplate: 默认false，是否使用模版
    *
    */
    $.fn.initKendoCombobox = function (options) {
        var defaultOptions = {
            valuePrimitive: true,
            text: "code",
            value: "code",
            dataSource: null,
            enable: true,
            cascade: null,
            change: null,
            dataBound: null,
            listWidth: null,
            columns: [],
            isUseTemplate: false,
            cascadeFrom: ""
        },
            opts = $.extend({}, defaultOptions, options),
            defaultHeaderTemplate = null,
            defaultItemTemplate = null;
        if (opts.isUseTemplate) {
            defaultHeaderTemplate = '<div class="listrow" style="margin-left: 3px;">';
            defaultItemTemplate = '<div class="listrow">';
            for (var i = 0; i < opts.columns.length; i++) {
                defaultHeaderTemplate += '<b class="col" style="width: ' + opts.columns[i].width + ' ">' + opts.columns[i].header + '</b>';
                defaultItemTemplate += '<span class="col" style="width: ' + opts.columns[i].width + ' ">#: ' + opts.columns[i].field + ' #</span>';
            }
            defaultHeaderTemplate += '</div>';
            defaultItemTemplate += '</div>';
        }
        this.kendoComboBox({
            valuePrimitive: opts.valuePrimitive,
            dataSource: opts.dataSource,
            dataTextField: opts.text,
            dataValueField: opts.value,
            headerTemplate: defaultHeaderTemplate,
            template: defaultItemTemplate,
            enable: opts.enable,
            cascadeFrom: opts.cascadeFrom,
            dataBound: function () {
                opts.dataBound && opts.dataBound(opts, this);
            },
            cascade: function () {
                opts.cascade && opts.cascade(opts, this);
            },
            change: function () {
                if (!this.dataItem() && this.value() !== '') {
                    this.value('');
                    this.trigger('change');
                } else {
                    opts.change && opts.change(opts, this);
                }
            }
        });
        opts.listWidth && this.data('kendoComboBox').list.width(opts.listWidth);
    }

    $.extend({
        // 从url中获取参数
        getParameter: function (uri, paramName) {
            var argsIndex = uri.indexOf("?");
            var arg = uri.substring(argsIndex + 1);
            args = arg.split("&");
            var valParameters = "";
            for (var i = 0; i < args.length; i++) {
                str = args[i];
                var arg = str.split("=");

                if (arg.length <= 1) continue;
                if (arg[0] == paramName) {
                    valParameters = arg[1];
                }
            }
            return valParameters;
        },

        // 获取cookie
        getCookie: function (name) {
            var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");

            if (arr = document.cookie.match(reg)) {
                return unescape(arr[2]);
            }
            else {
                return null;
            }
        },

        // 显示提示信息
        showNotification: function (message, type) {
            var messageType = {
                success: "upload-success",
                error: "error",
                warning: "warning"
            };

            var allowHideAfter = 0;
            switch (type) {
                case "success":
                    allowHideAfter = 3000;
                    break;
                case "warning":
                case "error":
                    allowHideAfter = 0;
                    break;
            }
            $("#notification").data("kendoNotification").options.autoHideAfter = allowHideAfter;

            $("#notification").data("kendoNotification").show({
                message: message
            }, messageType[type]);
        },

        // 显示等待动画
        showCover: function () {
            $('#cover').show();
        },

        // 隐藏等待动画
        hideCover: function () {
            $('#cover').hide();
        },

        // 刷新对应的index页面
        refreshIndex: function (indexPageName, refreshButtonID) {
            var iframes = parent.document.getElementsByTagName("iframe"),
                indexPage = new RegExp(indexPageName, 'i');

            for (var i = 0; i < iframes.length; i++) {
                if (indexPage.test(iframes[i].src)) {
                    iframes[i].contentDocument.getElementById(refreshButtonID).click();
                    return;
                }
            }
        },

        // 获取对应的index页面的数据
        getDataFromIndex: function (indexPageName, dataName) {
            var iframes = parent.document.getElementsByTagName("iframe"),
                indexPage = new RegExp(indexPageName, 'i');

            for (var i = 0; i < iframes.length; i++) {
                if (indexPage.test(iframes[i].src)) {
                    return iframes[i].contentWindow[dataName];
                }
            }
        },

        // 当为编辑时，锁定当前编辑项, 每6分钟执行一次
        lockWhenEdit: function (url, action, rid, intervalTime) {
            setInterval(function () {
                if (action === 'edit' && (typeof rid !== "undefined")) {
                    $.ajax({
                        type: "post",
                        url: url,
                        dataType: "json",
                        data: {
                            model: JSON.stringify({ RID: rid, Action: action, Minutes: 2 })
                        },
                        success: function () { },
                        error: function () { }
                    });
                }
            }, intervalTime || 60 * 1000);
        }
    });
})(jQuery, window, kendo);

// 初始化界面语言
function LangInit() {
    //IE兼容
    document.createElement("Language");
    document.createElement("Row");

    //设置当前页面的多语言显示
    if (Debug != null && Debug == "True") {
        Language.SaveAllLanguage(FunctionID, PageID);
    }
    Language.LoadLanguage(FunctionID, PageID, $("#LangXML"), "", "");
}