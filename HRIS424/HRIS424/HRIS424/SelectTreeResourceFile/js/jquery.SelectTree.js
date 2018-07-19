/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* Purpose      : SelectTree控件插件
* Date         : 23 Jul 2015
* Author       : Finn
* Note         : 
* -------------------------------------------------
* 23 Jul 2015     Finn       the first version
*      the latest update: 2015-07-23 17:30 
*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

(function ($) {
    $.fn.SelectTree = function (options, dataJSON) {

        var PubObject = {
            //公共变量
            variable: {
                isSearch: false, //是否需要开始关键字查询（关键字搜索时使用）
                isOpenNode: false //是否需要展开所有树形节点（关键字搜索时使用）

            },
            //方法
            methods: {
                beforeClick: function (treeId, treeNode) {
                    var zTree = $.fn.zTree.getZTreeObj(treeId);
                    zTree.checkNode(treeNode, !treeNode.checked, null, true);
                    return false;

                },
                onCheck: function (e, treeId, treeNode) {
                    var treeObj = $.fn.zTree.getZTreeObj(treeId),
			            nodes_All = treeObj.transformToArray(treeObj.getNodes()),
                        txt = "",
                        val = "",
                        item = new Object(),
                        nodes = [],
                        arrValue = ""

                    if (!settings.defaults.isAsyncQuery) {
                        //获取已经选择的项
                        for (var i = 0; i < nodes_All.length; i++) {
                            if (nodes_All[i].checked) {
                                nodes.push(nodes_All[i]);
                            }
                        }

                        //alert(nodes.length);
                        if (nodes.length <= settings.defaults.maxSelectNum) {

                            //移除所有选择项

                            settings.object.dvMain.find("li.search-choice").remove();

                            for (var i = 0, l = nodes.length; i < l; i++) {
                                txt += PubObject.methods.getFullText(nodes[i]) + settings.defaults.textChar;
                                val += nodes[i].value + settings.defaults.textChar;

                                item.text = PubObject.methods.getFullText(nodes[i])
                                item.value = nodes[i].value
                                settings.methods.choiceBuild(item);

                            }

                            if (txt.length > 0) txt = txt.substring(0, txt.length - 1);
                            if (val.length > 0) val = val.substring(0, val.length - 1);
                            settings.object.Text.val(txt);
                            settings.object.Value.val(val);

                            settings.methods.setSearchStyle();

                            if ($.isFunction(settings.callback.onchange)) {
                                settings.callback.onchange(settings);

                            }

                        }
                        else {
                            //var msgText = settings.methods.getLangText("CN:最多只能选择 [ " + settings.defaults.maxSelectNum + " ] 项~EN:Can only choose [ " + settings.defaults.maxSelectNum + " ]");
                            var msgText = settings.methods.getLangText(settings.defaults.defaultText.selectText);
                            msgText = msgText.replace(/\{0}/g, settings.defaults.maxSelectNum);
                            alert(msgText);
                            treeObj.checkNode(treeNode, false, null, false);

                        }

                    }
                    else {
                        //获取已经选择的项
                        var txt = settings.object.Text.val(),
                            val = settings.object.Value.val(),
                            arrText = settings.object.Text.val().split(settings.defaults.textChar),
                            arrValue = settings.object.Value.val().split(settings.defaults.textChar);

                        if (txt != "" && val != "") {
                            txt += settings.defaults.textChar;
                            val += settings.defaults.textChar;
                        }

                        if (treeNode.checked) {
                            if (arrValue.length >= settings.defaults.maxSelectNum) {
                                //var msgText = settings.methods.getLangText("CN:最多只能选择 [ " + settings.defaults.maxSelectNum + " ] 项~EN:Can only choose [ " + settings.defaults.maxSelectNum + " ]");
                                var msgText = settings.methods.getLangText(settings.defaults.defaultText.selectText);
                                msgText = msgText.replace(/\{0}/g, settings.defaults.maxSelectNum);
                                alert(msgText);
                                treeObj.checkNode(treeNode, false, null, false);
                                return false;
                            }

                            if (settings.defaults.selectType == "multi") {
                                item.text = PubObject.methods.getFullText(treeNode)
                                item.value = treeNode.value
                                settings.methods.choiceBuild(item);

                                txt += item.text + settings.defaults.textChar;
                                val += item.value + settings.defaults.textChar;
                            }
                            else if (settings.defaults.selectType == "radio") {
                                //移除所有选择项

                                settings.object.dvMain.find("li.search-choice").remove();

                                item.text = PubObject.methods.getFullText(treeNode)
                                item.value = treeNode.value
                                settings.methods.choiceBuild(item);

                                txt = item.text + settings.defaults.textChar;
                                val = item.value + settings.defaults.textChar;

                            }
                        }
                        else {
                            item.text = PubObject.methods.getFullText(treeNode)
                            item.value = treeNode.value
                            settings.methods.choiceRemove(item);
                            txt = "";
                            val = "";
                            for (var i = 0; i < arrValue.length; i++) {
                                if (arrValue[i] != item.value) {
                                    txt += arrText[i] + settings.defaults.textChar;
                                    val += arrValue[i] + settings.defaults.textChar;
                                }

                            }

                        }

                        if (txt.length > 0) txt = txt.substring(0, txt.length - 1);
                        if (val.length > 0) val = val.substring(0, val.length - 1);
                        //alert(val + "|" + txt);
                        settings.object.Text.val(txt);
                        settings.object.Value.val(val);

                        if ($.isFunction(settings.callback.onchange)) {
                            settings.callback.onchange(settings);

                        }

                    }

                    settings.object.Search.val("");
                    //PubObject.variable.isSearch = true;
                    //settings.object.Search.focus();

                    //设置树形下拉菜单的位置和宽度
                    settings.methods.setTreeMenu();

                    //alert($("#SelectTree_Value").val());

                },
                //获取节点的全文本描述
                getFullText: function (treeNode) {
                    var rText = treeNode.text;
                    //alert(settings.defaults.isFullText)
                    if (settings.defaults.isFullText) {
                        var pNode = treeNode.getParentNode();
                        //alert(pNode.text);
                        while (pNode != null) {
                            rText = pNode.text + settings.defaults.fullTextChar + rText;
                            pNode = pNode.getParentNode();

                        }
                    }
                    else {
                        rText = treeNode.text;
                    }
                    return rText;

                }
            }

        };

        //定义控件设置参数
        var settings = {
            //定义默认参数   
            defaults: {
                ControlId: "SelectTree", //控件ID：确保在一个页面上控件ID是唯一的

                Language: "CN", //控件语言代码：EN/CH
                Width: "100%", //控件宽度：树形下拉框宽度默认不会小于控件宽度。支持宽度单位(%)
                Height: 300, //控件高度: 尽量显示在窗口的可视区域内，如果页面下部空白区放不下，则会自动向上展开；如果上部也放不下，下拉列表的高度会正好到页面可视区域的底部，并出现滚动条。

                maxWidth: 500, //下拉框的最大宽度（单位px）：如果项目内容长度超过控件的宽度时，下拉框可以自适用宽度，但不会超过最大宽度。

                Enable: true, //控件是否可用：true/false
                selectedItem: "|",  //控件设置的默认项：value|item              
                selectedValue: "", //控件设置选中项的value,如果这里有值将优先于selectedItem项的设置，且它将自己找回对应的text显示在控件中。设置的值必须在控件的数据源中，否则显示为空。

                selectType: "radio", //控件类型：radio(单选)/multi(单选)
                showIcon: true, //是否显示图标：true/false
                iconSkin: "default", //控件图标样式：default(默认)/common(通用)/person(人物)
                maxSelectNum: 3, //多选控件最多可选择的个数

                checkType: null, //控件可选项控制：可选项的类型或层级对象（[{type:"a",level:null},{type:null,level:1},{type:"a",level:1}]）

                openLevel: null, //控件展开的节点层级：默认展开的节点层级数,null表示全部收缩显示
                Style: "default", //控件样式：default普通/highlight(高亮)
                isFullText: false, //是否返回全路径节点的文本值：true全路径节点的文本值，false表示当前节点的文本值

                fullTextChar: ">", //节点文本值连接符
                textChar: ",", //多选时节点的Text和Value分隔符

                itemChar: "|", //返回Item项时，text和value的分隔符
                isFilter: true, //是否在下拉控件中增加关键字查询过滤文本框。

                defaultText: { replaceText: "CN:请选择...~EN:Please choose...", searchText: "CN:没有结果匹配 [ {0} ]~EN:No results match [ {0} ]", selectText: "CN:最多只能选择 [ {0} ]~EN:Can only choose [ {0} ]" }, //下拉控件默认的数据占位符
                isAsyncQuery: false //是否异步获取用户查询数据：true/false。如果开启此项，设置默认值时请使用SelectedItem

            },

            //控件里的对象ID
            object: {
                dvControl: null,
                dvMain: null,
                Text: null,
                Select: null,
                Value: null,
                Content: null,
                liSearch: null,
                Search: null,
                Tree: null,
                TreeSearchText: null
            },

            //树形控件类型参数配置
            treeType: {
                //单选

                radio: {
                    check: {
                        enable: true,
                        chkStyle: "radio",
                        radioType: "all"
                    },
                    view: {
                        showIcon: true,
                        dblClickExpand: false

                    },
                    data: {
                        simpleData: {
                            enable: true
                        },
                        key: {
                            name: "text"
                        }
                    },
                    callback: {
                        beforeClick: PubObject.methods.beforeClick,
                        onCheck: PubObject.methods.onCheck

                    }
                },
                //多选

                multi: {
                    check: {
                        enable: true,
                        chkboxType: { "Y": "", "N": "" }
                    },
                    view: {
                        showIcon: true,
                        dblClickExpand: false

                    },
                    data: {
                        simpleData: {
                            enable: true
                        },
                        key: {
                            name: "text"
                        }
                    },
                    callback: {
                        beforeClick: PubObject.methods.beforeClick,
                        onCheck: PubObject.methods.onCheck

                    }

                }

            },

            //控件JSON数据
            dataJSON: dataJSON,

            //控件数据：Ajax获取
            dataAjax: {
                url: null,  //"SelectTreeResourceFile/action/Base.ashx", //url方式设置数据源

                params: null    //{ action: "getdataJSON", cls: "SelectTree", id: "1"}//参数
            },

            //定义方法
            methods: {
                init: function () {
                    var obj = settings;
                    obj.object.dvControl = $("#" + obj.defaults.ControlId);

                    //创建控件对象
                    obj.methods.createObj(obj);

                    obj.object.dvMain = $("#" + obj.defaults.ControlId + "_dvMain");
                    obj.object.Text = $("#" + obj.defaults.ControlId + "_Text");
                    obj.object.Select = $("#" + obj.defaults.ControlId + "_Select");
                    obj.object.Value = $("#" + obj.defaults.ControlId + "_Value");
                    obj.object.Content = $("#" + obj.defaults.ControlId + "_Content");
                    obj.object.liSearch = obj.object.dvMain.find('li.search-field').first();
                    obj.object.Search = $("#" + obj.defaults.ControlId + "_Search");
                    obj.object.Tree = $("#" + obj.defaults.ControlId + "_Tree");
                    obj.object.TreeSearchText = $("#" + obj.defaults.ControlId + "_TreeSearchText");

                    //设置控件宽度
                    obj.object.dvMain.css("width", obj.defaults.Width);
                    var dvMainActureWidth = obj.object.dvMain.outerWidth();
                    dvMainActureWidth = dvMainActureWidth - 2;
                    obj.object.dvMain.css("width", dvMainActureWidth + "px");
                    //obj.object.Search.css("width", dvMainActureWidth + "px");

                    //obj.object.Text.attr("readonly", true);
                    //obj.object.Text.css("width", (dvMainActureWidth - 22) + "px");
                    //obj.object.Tree.attr("style", "height:400px;");

                    obj.object.Search.unbind()
                        .bind("focus", obj.methods.searchFocus)
			            .bind("blur", obj.methods.searchBlur)
                    //.bind("click", function(){alert("dbclick");obj.methods.searchSearchNode();)
                    .bind("propertychange", obj.methods.searchSearchNode)
                    .bind("input", obj.methods.searchSearchNode);

                    //设置控件是否使用查询过滤文本框

                    obj.methods.setFilter(obj.defaults.isFilter);

                    //设置控件样式风格(只有当控件可用时才能应用)
                    obj.methods.setStyle(obj.defaults.Style);

                    //设置控件默认值

                    obj.methods.setItem(obj.defaults.selectedItem);

                    //默认图标设置(是否显示图标)
                    if (obj.defaults.showIcon) {
                        //默认图标都显示

                        obj.treeType.radio.view.showIcon = true;
                        obj.treeType.multi.view.showIcon = true;
                    }
                    else {
                        //默认图标都不显示
                        obj.treeType.radio.view.showIcon = false;
                        obj.treeType.multi.view.showIcon = false;

                    }

                    //绑定树形控件数据
                    obj.methods.DataBind();


                    //                    //设置控件类型（单选/多选）
                    //                    if (obj.defaults.selectType == "radio") {
                    //                        //绑定树形控件数据
                    //                        $.fn.zTree.init($("#SelectTree_Tree"), obj.treeType.radio, obj.dataJSON);
                    //                    } else if (obj.defaults.selectType == "multi") {
                    //                        //绑定树形控件数据
                    //                        $.fn.zTree.init($("#SelectTree_Tree"), obj.treeType.multi, obj.dataJSON);
                    //                    }

                    //绑定事件
                    //                    obj.object.Text.unbind("change")
                    //                        .bind("change", function () {
                    //                            //alert($.isFunction(settings.callback.onchange));
                    //                            //if ($.isFunction(obj.callback.onchange)) {
                    //                            //obj.callback.onchange.apply(obj);
                    //                            obj.callback.onchange(obj);
                    //                            //}

                    //                        });



                    //alert(obj.defaults.Width + "_" + obj.defaults.ControlId + "_" + obj.defaults.selectType);

                },
                getDefaultText: function () {
                    var defaultText = settings.methods.getLangText(settings.defaults.defaultText.replaceText);
                    return defaultText;

                },
                createObj: function () {
                    var obj = settings;
                    var defaultText = obj.methods.getDefaultText();

                    obj.object.dvControl.html(
                        "<div id=\"" + obj.defaults.ControlId + "_dvMain\" class=\"SelectTree_dvMain SelectTree_dvDef\">" +
                        "   <ul class=\"chosen-choices\">" +
                        "       <li class=\"search-field\">" +
                        "           <input type=\"text\" id=\"" + obj.defaults.ControlId + "_Search\" name=\"" + obj.defaults.ControlId + "_Search\" value=\"" + defaultText + "\"  style=\"width:25px;\" autocomplete=\"off\" class=\"SelectTree_Search SelectTree_Search_Def\" />" +
                        "       </li>" +
                        "   </ul>" +
                        "    <input type=\"hidden\" id=\"" + obj.defaults.ControlId + "_Text\" name=\"" + obj.defaults.ControlId + "_Text\" value=\"\" />" +
                        "    <input type=\"hidden\" id=\"" + obj.defaults.ControlId + "_Value\" name=\"" + obj.defaults.ControlId + "_Value\" value=\"\" />" +
                        "</div>" +
                        "<div id=\"" + obj.defaults.ControlId + "_Content\" class=\"menuContent\" style=\"display:none; position: absolute;\">" +
	                    "    <ul id=\"" + obj.defaults.ControlId + "_Tree\" class=\"ztree\"></ul>" +
                        "    <ul id=\"" + obj.defaults.ControlId + "_TreeSearchText\" class=\"TreeSearchText\"><li></li></ul>" +
                        "</div>"
                    );

                    $("#" + obj.defaults.ControlId + "_Content").appendTo("body");
                },
                choiceBuild: function (item) {
                    var choice, close_link;

                    choice = $('<li />', {
                        "class": "search-choice"
                    }).html("<span>" + item.text + "</span>");

                    close_link = $('<a />', {
                        "class": 'search-choice-close',
                        'data-value': item.value
                    });

                    close_link.bind('click', function (evt) {
                        settings.methods.choiceClose(evt);

                    });

                    choice.append(close_link);

                    settings.object.liSearch.before(choice);

                },
                choiceRemove: function (item) {
                    //移除所有选择项

                    settings.object.dvMain.find("a[data-value='" + item.value + "']").parent().remove();

                },
                choiceClose: function (evt) {
                    evt.preventDefault();
                    evt.stopPropagation();

                    var link = $(evt.target),
                         txt = "",
                         val = ""
                    link.parents('li').first().remove();

                    settings.object.dvMain.find("li.search-choice").each(function () {
                        txt += $(this).find("span").text() + settings.defaults.textChar;
                        val += $(this).find("a").attr("data-value") + settings.defaults.textChar;
                    });

                    if (txt.length > 0) txt = txt.substring(0, txt.length - 1);
                    if (val.length > 0) val = val.substring(0, val.length - 1);
                    settings.object.Text.val(txt);
                    settings.object.Value.val(val);

                    settings.methods.setSearchStyle();

                },
                //更新控件的默认参数，一般是用在不需要同步改变控件样式时使用此方法。

                setDefaults: function (opts) {
                    //var obj = settings;
                    $.extend(true, settings, opts);

                },
                setSearchStyle: function () {
                    var activeID = document.activeElement.id;
                    var searchID = settings.object.Search.attr("id");
                    var value = settings.object.Search.val();
                    var defaultText = settings.methods.getDefaultText();
                    var choicesCount = settings.object.dvMain.find("li[class='search-choice']").size(); //返回已经选择的项数

                    if (value == "" || value == defaultText) {
                        //查询文本框是否获得焦点

                        if (activeID != searchID) {
                            if (choicesCount < 1) {
                                settings.object.Search.val(defaultText);
                                settings.object.Search.addClass("SelectTree_Search_Def");

                            } else {
                                settings.object.Search.val("");
                                settings.object.Search.removeClass("SelectTree_Search_Def");

                            }
                        }
                    }

                    settings.methods.setSearchWidth();

                },
                //设置查询文本框的宽度，自适用输入的文本宽度

                setSearchWidth: function () {
                    var div, f_width, h, style, style_block, styles, w, _i, _len;

                    style_block = "position:absolute; left: -1000px; top: -1000px; display:none;";
                    styles = ['font-size', 'font-style', 'font-weight', 'font-family', 'line-height', 'text-transform', 'letter-spacing'];
                    for (_i = 0, _len = styles.length; _i < _len; _i++) {
                        style = styles[_i];
                        style_block += style + ":" + settings.object.Search.css(style) + ";";
                    }
                    div = $('<div />', {
                        'style': style_block
                    });
                    div.text(settings.object.Search.val());
                    $('body').append(div);
                    w = div.width() + 25;
                    div.remove();
                    f_width = settings.object.dvMain.outerWidth();
                    if (w > f_width - 10) {
                        w = f_width - 10;
                    }

                    settings.object.Search.css({
                        'width': w + 'px'
                    });

                },
                setFilter: function (isFilter) {
                    var obj = settings;
                    obj.defaults.isFilter = isFilter;

                    if (obj.defaults.isFilter) {
                        //obj.object.dvSearch.css("display", "");

                    }
                    else {
                        //obj.object.dvSearch.css("display", "none");

                    }

                },
                setEnable: function (isEnable) {
                    var obj = settings;
                    //alert(obj.defaults.Enable);
                    obj.defaults.Enable = isEnable;
                    if (obj.defaults.Enable) {
                        obj.methods.setStyle(settings.defaults.Style);
                        //obj.object.dvMain.unbind("click").bind("click", function () { obj.methods.showMenu(); });                        
                        settings.object.Search.removeAttr("disabled");
                        obj.object.dvMain.unbind().bind("click", function () { settings.object.Search.focus(); })
                            .bind("dblclick", function () { settings.methods.searchSearchNode(); })
                        settings.object.dvMain.find("li.search-choice").each(function () {
                            $(this).find("a").css("display", "");
                        });
                        //obj.object.Select.bind("click", function () { obj.methods.showMenu(); });
                        //obj.object.Text.bind("click", function () { obj.methods.showMenu(); });

                    }
                    else {
                        obj.methods.hideMenu();
                        obj.object.dvMain.removeClass("SelectTree_dvDef SelectTree_dvHig").addClass("SelectTree_dvDis");
                        obj.object.dvMain.unbind();
                        settings.object.Search.attr("disabled", "disabled");
                        settings.object.dvMain.find("li.search-choice").each(function () {
                            $(this).find("a").css("display", "none");
                        });
                        //obj.object.Select.unbind("click");
                        //obj.object.Text.unbind("click");
                    }
                },
                setFullText: function (isFullText) {
                    var obj = settings;
                    var val = obj.object.Value.val();

                    obj.defaults.isFullText = isFullText;

                    obj.methods.setValue(val);

                },
                setStyle: function (cls) {
                    var obj = settings;
                    obj.defaults.Style = cls;
                    if (obj.defaults.Enable) {
                        if (obj.defaults.Style == "default") {
                            obj.object.dvMain.removeClass("SelectTree_dvDis SelectTree_dvHig").addClass("SelectTree_dvDef");

                        }
                        else if (obj.defaults.Style == "highlight") {
                            obj.object.dvMain.removeClass("SelectTree_dvDis SelectTree_dvDef").addClass("SelectTree_dvHig");

                        }
                    }
                },
                //设置当前控件默认item项，如果selectedValue也设置了的话，selectedValue优先应用
                setItem: function (nodeItem) {
                    var obj = settings;
                    var dItem = "" + obj.defaults.itemChar + "";

                    if (nodeItem != null && dItem != nodeItem
                            && (settings.defaults.selectedValue == null || settings.defaults.selectedValue == "")) {
                        obj.defaults.selectedItem = nodeItem;

                        //需要设置选中的项的Value数组
                        var arrSelValues = nodeItem.split(settings.defaults.itemChar)[0].split(settings.defaults.textChar);
                        //需要设置选中的项的Text数组
                        var arrSelTexts = nodeItem.split(settings.defaults.itemChar)[1].split(settings.defaults.textChar);
                        var item = new Object();

                        //设置默认选择项

                        for (var i = 0; i < arrSelValues.length; i++) {

                            item.value = arrSelValues[i];
                            item.text = arrSelTexts[i];

                            obj.methods.choiceBuild(item);
                        }

                        obj.object.Value.val(nodeItem.split(settings.defaults.itemChar)[0]);
                        obj.object.Text.val(nodeItem.split(settings.defaults.itemChar)[1]);

                        //设置查询框默认文本

                        obj.methods.setSearchStyle();

                    }


                },
                setEmpty: function () {
                    var obj = settings;
                    var item = "" + obj.defaults.itemChar + "";

                    //移除所有选择项

                    settings.object.dvMain.find("li.search-choice").remove();

                    settings.methods.setItem(item);
                    obj.defaults.selectedValue = "";

                    //设置查询框默认文本

                    obj.methods.setSearchStyle();

                },
                getItem: function (cls) {
                    var obj = settings;
                    var retval = obj.object.Value.val() + obj.defaults.itemChar + obj.object.Text.val();
                    cls = cls.toLowerCase();
                    if (cls == "text")
                    { retval = obj.object.Text.val(); }
                    else if (cls == "value")
                    { retval = obj.object.Value.val(); }
                    else {
                        if (retval == obj.defaults.itemChar) { retval = ""; }
                    }
                    return retval;

                },
                getLangText: function (msgText) {
                    var obj = settings;
                    var langType = obj.defaults.Language;

                    if (msgText == null || msgText == "") {
                        return null;
                    }
                    if (langType == null || langType == "") {

                        langType = this.LangType;
                    }

                    var ltext = "";
                    var engtext = "";

                    if (msgText.indexOf("~") != -1) {
                        var langArry = msgText.split("~")

                        for (i = 0; i < langArry.length; i++) {
                            if (langArry[i] != null && langArry[i] != "") {
                                if (langArry[i].indexOf(langType + ":") != -1) {

                                    ltext = langArry[i].substring(langArry[i].indexOf(":") + 1);
                                    break;
                                }
                                if (langArry[i].indexOf("EN:") != -1) {
                                    engtext = langArry[i].substring(langArry[i].indexOf(":") + 1);
                                }
                            }
                        }

                    } else {
                        if (msgText.indexOf(langType + ":")) {
                            ltext = msgText.replace(LangType + ":", "");
                        }
                    }
                    if (ltext != null && ltext != "") {
                        return ltext;

                    }

                    return engtext;


                },
                setType: function (cls) {
                    var obj = settings;
                    cls = cls.toLowerCase();
                    obj.defaults.selectType = cls;
                    //var treeObj = $.fn.zTree.getZTreeObj(obj.defaults.ControlId + "_Tree");
                    //单选类控件
                    obj.methods.treeDataBind();
                    //                    if (cls == "radio") {
                    //                        $.fn.zTree.init($("#" + obj.defaults.ControlId + "_Tree"), obj.treeType.radio, obj.dataJSON);

                    //                    }
                    //                    else if (cls == "multi") {
                    //                        $.fn.zTree.init($("#" + obj.defaults.ControlId + "_Tree"), obj.treeType.multi, obj.dataJSON);

                    //                    }

                },
                setShowIcon: function (isShow) {
                    var obj = settings;
                    var treeType = obj.treeType.radio;
                    if (obj.defaults.selectType == "multi") {
                        treeType = obj.treeType.multi;
                    }

                    obj.defaults.showIcon = isShow;

                    if (obj.defaults.showIcon) {
                        //默认图标都显示                        
                        obj.treeType.radio.view.showIcon = true;
                        obj.treeType.multi.view.showIcon = true;
                    }
                    else {
                        //默认图标都不显示
                        obj.treeType.radio.view.showIcon = false;
                        obj.treeType.multi.view.showIcon = false;
                    }

                    zTreeObj = $.fn.zTree.init($("#" + obj.defaults.ControlId + "_Tree"), treeType, obj.dataJSON);

                    return zTreeObj;

                },
                setIconSkin: function (cls) {
                    var obj = settings;
                    var treeObj = $.fn.zTree.getZTreeObj(obj.defaults.ControlId + "_Tree"); //树形控件对象

                    //如果默认图标都不显示时

                    if (!obj.defaults.showIcon) {
                        //设置图标显示
                        //有延时加载的情况，在此方法后直接获取树形菜单项会有问题，取不到数据项
                        treeObj = obj.methods.setShowIcon(true);

                    }

                    obj.defaults.iconSkin = cls;

                    obj.methods.setIconSkinBase(treeObj);


                },
                setIconSkinBase: function (treeObj) {
                    var obj = settings;
                    if (obj.defaults.showIcon) {
                        if (obj.defaults.iconSkin == "default") {
                            //图标样式：通用样式
                            var nodes = treeObj.transformToArray(treeObj.getNodes());
                            for (var i = 0; i < nodes.length; i++) {
                                if (!nodes[i].isParent) {
                                    nodes[i].iconSkin = null;

                                }
                                else {
                                    nodes[i].iconSkin = null;

                                }
                                treeObj.updateNode(nodes[i]);
                            }
                        }
                        else if (obj.defaults.iconSkin == "common") {
                            //图标样式：通用样式
                            var nodes = treeObj.transformToArray(treeObj.getNodes());
                            for (var i = 0; i < nodes.length; i++) {
                                if (!nodes[i].isParent) {
                                    nodes[i].iconSkin = "detail";
                                }
                                else {
                                    nodes[i].iconSkin = null;

                                }
                                treeObj.updateNode(nodes[i]);
                            }
                        }
                        else if (obj.defaults.iconSkin == "person") {
                            //图标样式：人物样式

                            var nodes = treeObj.transformToArray(treeObj.getNodes());
                            for (var i = 0; i < nodes.length; i++) {
                                if (!nodes[i].isParent) {
                                    nodes[i].iconSkin = "user";
                                }
                                else {
                                    nodes[i].iconSkin = null;

                                }
                                treeObj.updateNode(nodes[i]);
                            }
                        }
                    }

                    return treeObj;

                },
                //设置控件的默认值

                setValue: function (v) {
                    var obj = settings;
                    var treeObj = $.fn.zTree.getZTreeObj(obj.defaults.ControlId + "_Tree"); //树形控件对象

                    if (v != null && v != "") {

                        //清空选择框内容

                        settings.methods.setEmpty();

                        obj.defaults.selectedValue = v;

                        obj.methods.setValueBase(treeObj);


                    }

                },
                setValueBase: function (treeObj) {
                    var obj = settings;
                    var item = new Object();
                    //var treeObj = $.fn.zTree.getZTreeObj(obj.defaults.ControlId + "_Tree"); //树形控件对象


                    if (!settings.defaults.isAsyncQuery) {
                        if (obj.defaults.selectedValue != null && obj.defaults.selectedValue != "") {
                            var arrSelValues = obj.defaults.selectedValue.split(obj.defaults.textChar); //需要设置选中的项的值数组

                            var itemText = "";
                            var itemValue = obj.defaults.selectedValue;

                            //移除所有选择项

                            settings.object.dvMain.find("li.search-choice").remove();

                            //设置已选择项的选中状态

                            for (var i = 0; i < arrSelValues.length; i++) {
                                var treeNode = treeObj.getNodeByParam("value", arrSelValues[i]); //查找已选择项

                                if (treeNode != null) {
                                    var iText = PubObject.methods.getFullText(treeNode);
                                    itemText += iText + settings.defaults.textChar;

                                    item.value = arrSelValues[i];
                                    item.text = iText;
                                    obj.methods.choiceBuild(item);

                                }

                            }

                            if (itemText.length > 0) itemText = itemText.substring(0, itemText.length - 1);

                            obj.object.Value.val(itemValue);
                            obj.object.Text.val(itemText);

                        }

                    }

                    //设置查询框默认文本

                    obj.methods.setSearchStyle();

                },
                setCheckType: function (typeObj) {
                    var obj = settings;
                    var treeObj = $.fn.zTree.getZTreeObj(obj.defaults.ControlId + "_Tree"); //树形控件对象

                    obj.defaults.checkType = typeObj;

                    obj.methods.setCheckTypeBase(treeObj);

                },
                setCheckTypeBase: function (treeObj) {
                    var obj = settings;
                    var nodes = treeObj.transformToArray(treeObj.getNodes());
                    var TypeObj = obj.defaults.checkType


                    var isAll = TypeObj.isAll;
                    if (isAll == null) {
                        isAll = false;
                    }

                    if (isAll) {
                        for (var i = 0; i < nodes.length; i++) {
                            nodes[i].nocheck = false;

                        }
                    } else {
                        //取消控件所有项的可选框
                        for (var i = 0; i < nodes.length; i++) {
                            nodes[i].nocheck = true;

                        }



                        //alert(JSON.stringify(TypeObj))

                        for (var tObj in TypeObj) {
                            //alert(TypeObj[tObj].type + "/" + TypeObj[tObj].level);
                            if (TypeObj[tObj].type != null) {
                                //alert("type");
                                for (var i = 0; i < nodes.length; i++) {
                                    if (nodes[i].type != null && nodes[i].type == TypeObj[tObj].type && nodes[i].nocheck) {
                                        nodes[i].nocheck = false;
                                    }
                                    treeObj.updateNode(nodes[i]);

                                }
                            }
                            if (TypeObj[tObj].level != null) {
                                //alert("level");
                                for (var i = 0; i < nodes.length; i++) {
                                    //                                if (nodes[i].text == "GQC                           ") {
                                    //                                    alert(nodes[i].level + "_" + TypeObj[tObj].level + "_" + nodes[i].nocheck)
                                    //                                }
                                    if (nodes[i].level == TypeObj[tObj].level && nodes[i].nocheck) {
                                        nodes[i].nocheck = false;
                                    }
                                    treeObj.updateNode(nodes[i]);

                                }
                            }
                        }
                    }

                },
                //设置打开节点的层级

                setOpenLevel: function (lv) {
                    var obj = settings;

                    obj.defaults.openLevel = lv;

                    treeObj = obj.methods.treeDataBind();

                    var nodes = treeObj.transformToArray(treeObj.getNodes());
                    if (obj.defaults.openLevel != null) {
                        for (var i = 0; i < nodes.length; i++) {
                            //展开指定层数节点
                            if (nodes[i].level <= obj.defaults.openLevel) {
                                //alert(nodes[i].level + "/" + obj.defaults.openLevel);
                                //                                nodes[i].open = true;
                                //                                treeObj.updateNode(nodes[i]);
                                treeObj.expandNode(nodes[i], true, false, false);
                            }

                        }
                    }

                },
                setOpenLevelBase: function (treeObj) {
                    var obj = settings;
                    var nodes = treeObj.transformToArray(treeObj.getNodes());

                    //收缩控件的所有节点

                    treeObj.expandAll(false);

                    //alert(obj.defaults.openLevel);
                    if (obj.defaults.openLevel != null) {
                        for (var i = 0; i < nodes.length; i++) {
                            //展开指定层数节点
                            if (nodes[i].level <= obj.defaults.openLevel) {
                                //alert(nodes[i].level + "/" + obj.defaults.openLevel);
                                //                                nodes[i].open = true;
                                //                                treeObj.updateNode(nodes[i]);
                                treeObj.expandNode(nodes[i], true, false, false);
                            }

                        }
                    }

                },
                searchFocus: function () {
                    //settings.object.Search.val("");
                    //settings.object.Search.removeClass("SelectTree_Search_Def");

                    //alert("searchFocus");

                    //settings.methods.searchSearchNode();
                    //PubObject.variable.isSearch = false;

                    settings.methods.showMenu();

                    settings.object.Search.removeClass("SelectTree_Search_Def");
                    var defaultText = settings.methods.getDefaultText();
                    if (settings.object.Search.val() == defaultText) {
                        settings.object.Search.val("");

                    }


                    settings.methods.setSearchWidth();

                    //设置查询框默认文本

                    //settings.methods.setSearchStyle();

                },
                searchBlur: function () {
                    //alert("searchBlur");
                    //var obj = settings;                    
                    //if (obj.object.Search.val() != "") {
                    //obj.object.Search.removeClass("SelectTree_Search_Def SelectTree_Search_Foc").addClass("SelectTree_Search_Val");

                    //}
                    //else {
                    //obj.object.Search.removeClass("SelectTree_Search_Def SelectTree_Search_Foc").addClass("SelectTree_Search_Def");

                    //}
                    settings.object.Search.val("");
                    settings.methods.setSearchStyle();
                    //alert("aaa");
                },
                searchBegin: function () {
                    //alert("searchBegin");
                }
                ,
                searchSearchNode: function () {

                    //alert("1.searchSearchNode:" + PubObject.variable.isSearch);
                    //只在异步加载数据时，增加此控制。

                    if (!PubObject.variable.isSearch && settings.defaults.isAsyncQuery) {
                        return false;
                    }

                    settings.methods.searchBegin()

                    //alert("2.searchSearchNode:" + PubObject.variable.isSearch);

                    var obj = settings;

                    //获取查询的关键字
                    var value = obj.object.Search.val();
                    //alert(value + "searchSearchNode");

                    //如果在做查询，需要展开所有查询到的节点，以便用户选择。

                    if (value != "") {
                        PubObject.variable.isOpenNode = true;
                    }
                    else {
                        PubObject.variable.isOpenNode = false;
                    }

                    //如果开起异步查询

                    if (settings.defaults.isAsyncQuery) {
                        var key = { keywords: value };
                        var opts = $.extend(true, settings.dataAjax.params, key);

                        //alert("3.isAsyncQuery:" + settings.defaults.isAsyncQuery);

                        settings.methods.ajaxDataBind(settings.dataAjax);

                    }
                    else {
                        //获取树形控件对象
                        var treeObj = $.fn.zTree.getZTreeObj(obj.defaults.ControlId + "_Tree");
                        //获取树形控件的全部节点

                        var NodesAll = treeObj.transformToArray(treeObj.getNodes());

                        if (value != "") {
                            var msgText = settings.methods.getLangText(settings.defaults.defaultText.searchText);
                            msgText = msgText.replace(/\{0}/g, "<span>" + value + "</span>");

                            //获取条件模糊匹配的节点数据 JSON 对象集合
                            var SearchNodes = treeObj.getNodesByParamFuzzy("text", value);
                            //alert(SearchNodes.length);

                            //隐藏树形控件的全部节点

                            treeObj.hideNodes(NodesAll);

                            //显示已经查询到的节点
                            treeObj.showNodes(SearchNodes);


                            for (var i = 0, l = SearchNodes.length; i < l; i++) {
                                var pNode = SearchNodes[i].getParentNode();
                                while (pNode != null) {
                                    treeObj.showNode(pNode); //显示查询到的节点的所有父节点
                                    treeObj.expandNode(pNode, true, false, false); //展开所有父节点
                                    //alert(pNode.text);
                                    pNode = pNode.getParentNode();

                                }
                            }

                            if (SearchNodes.length > 0) {
                                //如果查询到节点时，展开全部节点
                                treeObj.expandAll(true);

                                settings.object.Tree.css("display", "");

                                settings.object.TreeSearchText.hide();
                                settings.object.TreeSearchText.find("li").html("");
                            }
                            else {
                                //如果没有查询到节点数据，给出提示。 
                                settings.object.Tree.css("display", "none");

                                settings.object.TreeSearchText.show();
                                settings.object.TreeSearchText.find("li").html(msgText);


                            }

                        }
                        else {
                            //显示树形控件的全部节点

                            treeObj.showNodes(NodesAll);

                            settings.object.Tree.css("display", "");

                            settings.object.TreeSearchText.hide();
                            settings.object.TreeSearchText.find("li").html("");

                        }

                    }

                    //查询完成后，关闭此标识，以免在其他方法里改变查询文本框时多次执行此事件。

                    PubObject.variable.isSearch = false;

                    //设置查询输入框的宽度
                    settings.methods.setSearchWidth();

                    //设置树形下拉菜单的位置和宽度
                    settings.methods.setTreeMenu();

                },
                setTreeMenu: function () {
                    var dvMainObj = settings.object.dvMain;
                    var dvMainOffset = settings.object.dvMain.offset();

                    var h = settings.defaults.Height;
                    var w = 0;

                    var pos = dvMainOffset;
                    var iheight = dvMainObj.outerHeight();


                    //                    if (self != top) {
                    //                        pos.top = pos.top ;
                    //                    } else {
                    //                        pos.top = pos.top - 115;
                    //                    }
                    //pos.top = pos.top + $("#ContentBox").scrollTop();
                    //pos.top = pos.top - 115;
                    var newpos = { left: pos.left, top: pos.top + iheight + 5 }
                    var bw = document.documentElement.clientWidth;
                    var bh = document.documentElement.clientHeight;

                    var TreeHeight = settings.defaults.Height;
                    //alert(pos.top);
                    //alert(pos.top + height + 5)

                    if ((newpos.left + w) >= bw) {
                        newpos.left = bw - w - 2;
                    }

                    //alert("(" + newpos.top + "+" + h + ")" + ">=" + bh + "&&" + bw + ">" + newpos.top)
                    if ((newpos.top + h) >= bh && bh > newpos.top) {
                        //newpos.top = pos.top - h - 2;
                        //newpos.top = newpos.top - h - 2;
                        //alert(h + "/" + bh);
                    }

                    settings.object.Content.css({ left: newpos.left + "px", top: newpos.top + "px" });

                    /*
                    //设置下拉框显示的高度
                    //控件上部的可视高度 = 控件的所在位置Y位置-滚动条的高度
                    //var TreeVisualUpHeight = dvMainOffset.top - $(document).scrollTop();
                    var TreeVisualUpHeight = dvMainOffset.top - $("#ContentBox").scrollTop(); 
                    //var TreeVisualUpHeight = dvMainOffset.top;
                    //控件下部的可视高度 = (窗口可视高度+滚动条的高度)-(控件的所在位置Y位置+控件本身高度)
                    //var TreeVisualDownHeight = ($(window).height() + $(document).scrollTop()) - (dvMainOffset.top + dvMainObj.outerHeight());
                    var TreeVisualDownHeight = ($(document).height() + $("#ContentBox").scrollTop()) - (dvMainOffset.top + dvMainObj.outerHeight());
                    var TreeLeft = dvMainOffset.left;
                    var TreeTop = dvMainOffset.top + dvMainObj.outerHeight();
                    var TreeHeight = settings.defaults.Height;

                    //alert(dvMainOffset.top);

                    //如果启用节点过滤功能，树形下拉框的高度等于控件设置的高度减去搜索框的高度
                    if (settings.defaults.isFilter) {
                    //TreeHeight = TreeHeight - settings.object.Search.outerHeight();
                    }

                    //当树形下拉框选项过多时，如果页面下部空白区放不下，则会自动向上展开；

                    //如果上部也放不下，下拉列表的高度会正好到页面可视区域的底部，并出现滚动条；

                    if (TreeVisualDownHeight >= settings.defaults.Height) {
                    if (self == top) {
                    TreeTop = dvMainOffset.top + dvMainObj.outerHeight() - 1 - 95;
                    } else {
                    TreeTop = dvMainOffset.top + dvMainObj.outerHeight() - 1 - 55;
                    }
                    //alert("aaa" + "/" + TreeVisualDownHeight + "/" + settings.defaults.Height);

                    }
                    else if (TreeVisualUpHeight >= settings.defaults.Height) {
                    if (self == top) {
                    TreeTop = dvMainOffset.top - settings.defaults.Height - 11 - 95;
                    } else {
                    TreeTop = dvMainOffset.top - settings.defaults.Height - 11 - 55;
                    }
                    //如果启用节点过滤功能，树形下拉框亮度需要再加22
                    if (settings.defaults.isFilter) {
                    //TreeTop = TreeTop - 22;

                    }

                    //alert("aaa" + "/" + dvMainOffset.top + "/" + dvMainObj.outerHeight() + "/" + settings.defaults.Height);

                    //alert("bbb" + "/" + dvMainOffset.top + "/" + dvMainObj.outerHeight() + "/" + settings.defaults.Height);

                    }
                    else {
                    if (self == top) {
                    TreeTop = dvMainOffset.top + dvMainObj.outerHeight() - 1 - 95;
                    } else {
                    TreeTop = dvMainOffset.top + dvMainObj.outerHeight() - 1 - 55;
                    }
                    TreeHeight = TreeVisualDownHeight - 18;
                    //如果启用节点过滤功能，树形下拉框亮度需要再减少12
                    if (settings.defaults.isFilter) {
                    //TreeHeight = TreeHeight - 12;
                    }
                    //alert("ccc" + "/" + TreeVisualDownHeight);

                    }

                    //settings.object.Content.css({ left: TreeLeft + "px", top: TreeTop + "px" }).slideDown("fast");

                    //如果Tree是隐藏的,说明用户正在做查询操作且未找到任何节点数据。

                    if (!settings.object.Tree.is(':visible')) {
                    if (self == top) {
                    TreeTop = dvMainOffset.top + dvMainObj.outerHeight() - 2 - 95;
                    } else {
                    TreeTop = dvMainOffset.top + dvMainObj.outerHeight() - 2 - 55;
                    }
                    }
                    settings.object.Content.css({ left: TreeLeft + "px", top: TreeTop + "px" })
                    */

                    settings.object.Tree.attr("style", "height:" + TreeHeight + "px;display:" + settings.object.Tree.css("display") + ";");

                    //设置下拉框宽度                    
                    var dvMainActureWidth = settings.object.dvMain.outerWidth(); //dvMain的宽度

                    var TreeActureWidth = settings.object.Tree.outerWidth(); //Tree的宽度

                    var TreeScrollWidth = settings.object.Tree[0].scrollWidth + 2; //Tree的有滚动条时的宽度

                    //alert(TreeActureWidth + "/" + TreeScrollWidth);
                    //alert(TreeActureWidth + "/" + dvMainActureWidth + "/" + settings.defaults.maxWidth + "/" + settings.defaults.ControlId);
                    if (TreeActureWidth < (dvMainActureWidth - 12)) {
                        //当Tree的宽度少于dvMain的宽度时，调整Tree的宽度等于dvMain的宽度

                        settings.object.Tree.css("width", (dvMainActureWidth - 12) + "px");

                    }
                    else if (TreeActureWidth > settings.defaults.maxWidth) {
                        //当Tree的宽度大于控件的最大宽度时，调整Tree的宽度等于控件的最大宽度

                        settings.object.Tree.css("width", (settings.defaults.maxWidth) + "px");

                    }
                    else if (TreeActureWidth > TreeScrollWidth) {
                        //当Tree的宽度大于dvMain的宽度且少于控件的最大宽度范围内时

                        //调整Tree的宽度等于Tree内容自适应的宽度。

                        //如果Tree有竖向滚动条时，宽度需要加2(线条的宽度)
                        settings.object.Tree.css("width", (TreeActureWidth + 2) + "px");

                    }

                    settings.object.TreeSearchText.css("width", (dvMainActureWidth - 2) + "px");
                    //settings.object.Search.css("width", (settings.object.Tree.width() + 4) + "px");


                },
                setCheckNode: function (treeObj) {
                    //$("#combbEmployee_Type_Combobox_value").val(JSON.stringify(treeObj))
                    var arrSelValues = settings.object.Value.val().split(settings.defaults.textChar); //需要绑定选中的项的值数组

                    treeObj.checkAllNodes(false); //取消多选树形控件所有项的选中状态


                    var nodes = treeObj.getCheckedNodes(true); //取消单选树形控件所有项的选中状态

                    for (var i = 0, l = nodes.length; i < l; i++) {
                        //alert(nodes[i].name);
                        treeObj.checkNode(nodes[i], false, null, false);

                    }

                    //设置已选择项的选中状态

                    for (var i = 0; i < arrSelValues.length; i++) {
                        var treeNode = treeObj.getNodeByParam("value", arrSelValues[i]); //查找已选择项

                        if (treeNode != null) {
                            treeObj.checkNode(treeNode, true, null, false);

                        }

                    }

                },
                showMenu: function () {
                    //var obj = settings;  
                    //alert("showMenu");
                    var arrSelValues = settings.object.Value.val().split(settings.defaults.textChar); //需要绑定选中的项的值数组

                    var treeObj = $.fn.zTree.getZTreeObj(settings.defaults.ControlId + "_Tree"); //树形控件对象
                    $(".menuContent").hide();
                    settings.object.Content.slideDown("fast");
                    //设置树形下拉菜单的位置和宽度
                    settings.methods.setTreeMenu();

                    //设置已选择项的选中状态

                    settings.methods.setCheckNode(treeObj);

                    //settings.methods.setSearchStyle();
                    //settings.object.Search.focus();

                    //settings.object.dvMain.unbind("click");

                    $("html").unbind("mousedown")
                        .bind("mousedown", function (e) { settings.methods.onBodyDown(e); });


                },
                hideMenu: function () {
                    //var obj = settings;

                    //$(".menuContent").hide();
                    settings.object.Content.fadeOut("fast");

                    settings.object.Search.val("");
                    //settings.methods.searchSearchNode();

                    if (settings.defaults.Enable) {
                        //settings.object.dvMain.unbind("click")
                        //.bind("click", function () { settings.methods.showMenu(); });
                        settings.object.dvMain.unbind("click").bind("click", function () { settings.object.Search.focus(); });
                    }
                    else {
                        settings.object.dvMain.unbind("click");
                    }

                    $("html").unbind("mousedown");

                },
                //设置或隐藏查询文本

                setSearchText: function (treeObj) {
                    if (settings.dataJSON.length > 0) {

                        settings.object.Tree.css("display", "");

                        settings.object.TreeSearchText.hide();
                        settings.object.TreeSearchText.find("li").html("");

                    }
                    else {
                        var value = settings.object.Search.val(); //获取查询的关键字
                        var msgText = settings.methods.getLangText(settings.defaults.defaultText.searchText);
                        msgText = msgText.replace(/\{0}/g, "<span>" + value + "</span>");

                        //如果没有查询到节点数据，给出提示。 
                        settings.object.Tree.css("display", "none");

                        settings.object.TreeSearchText.show();
                        settings.object.TreeSearchText.find("li").html(msgText);

                    }

                },
                onBodyDown: function (event) {
                    //alert("aaa");
                    var obj = settings;
                    //var event = $(event)[0];
                    //alert($(event.target).attr("class"));
                    if (!(event.target.id == (obj.defaults.ControlId + "_Select") || event.target.id == (obj.defaults.ControlId + "_dvMain")
                            || event.target.id == (obj.defaults.ControlId + "_Search") || event.target.id == obj.defaults.ControlId + "_Content"
                            || $(event.target).parents("#" + obj.defaults.ControlId + "_Content").length > 0
                            || $(event.target).attr("class") == "chosen-choices")
                            ) {
                        obj.methods.hideMenu();
                    }

                },
                //树形控件数据绑定
                treeDataBind: function () {
                    var obj = settings;
                    var treeObj = null;
                    //alert(obj.defaults.selectType)
                    if (obj.defaults.selectType == "radio") {
                        treeObj = $.fn.zTree.init($("#" + obj.defaults.ControlId + "_Tree"), obj.treeType.radio, obj.dataJSON, obj.dataAjax.url);

                    }
                    else if (obj.defaults.selectType == "multi") {
                        treeObj = $.fn.zTree.init($("#" + obj.defaults.ControlId + "_Tree"), obj.treeType.multi, obj.dataJSON, obj.dataAjax.url);

                    }


                    //if (!settings.defaults.isAsyncQuery) {
                    //设置控件默认值

                    obj.methods.setValueBase(treeObj);
                    //                    }
                    //                    else{
                    //                        //如果查询到节点时，展开全部节点
                    //                        treeObj.expandAll(true);

                    //                        //设置已选择项的选中状态

                    //                        settings.methods.setCheckNode(treeObj);

                    //                        //设置控件默认值

                    //                        //obj.methods.setValueBase(treeObj);
                    //                        settings.methods.setSearchWidth();
                    //                    }

                    if (settings.defaults.isAsyncQuery) {
                        //设置已选择项的选中状态

                        settings.methods.setCheckNode(treeObj);

                        PubObject.variable.isSearch = true;

                    }

                    //如果图标设置显示时，设置树形控件图标样式
                    obj.methods.setIconSkinBase(treeObj);

                    //设置可以选择项的类型或层级

                    obj.methods.setCheckTypeBase(treeObj);

                    //设置可以展开的节点

                    obj.methods.setOpenLevelBase(treeObj);

                    //如果查询到节点时，展开全部节点
                    if (PubObject.variable.isOpenNode) {
                        treeObj.expandAll(true);
                        PubObject.variable.isOpenNode = false;

                    }

                    //设置或隐藏查询文本

                    obj.methods.setSearchText(treeObj);

                    //设置控件是否可用
                    obj.methods.setEnable(obj.defaults.Enable);

                    return treeObj;

                },
                //控件数据绑定
                DataBind: function () {
                    var obj = settings;
                    var treeObj = null;
                    //alert("DataBind");

                    //如果未设置异步获取数据时,使用固定JSON数据
                    if (obj.dataAjax.url == null) {

                        treeObj = obj.methods.treeDataBind();

                    }
                    else { //否则从Ajax中异步获取数据

                        //alert("bbb");

                        $.ajax({
                            type: "post",
                            url: obj.dataAjax.url,
                            cache: false,
                            async: true, //默认为true，所有请求均为异步请求。如果需要发送同步请求，请将此选项设置为 false。注意，同步请求将锁住浏览器，用户其它操作必须等待请求完成才可以执行。

                            data: obj.dataAjax.params,
                            dataType: "json", //指明文件类型为“json” 
                            timeout: 10000, //超时设置，单位为毫秒
                            success: function (data) {
                                if (data.msg == "ok") {
                                    obj.dataJSON = data.dataJSON;
                                }

                                treeObj = obj.methods.treeDataBind();

                            }

                        });

                    }

                },
                //Ajax方法控件数据绑定
                ajaxDataBind: function (opt) {
                    var obj = settings;

                    //alert("ajaxDataBind");
                    obj.dataAjax = opt;
                    if (obj.dataAjax == null) {
                        obj.dataAjax = { url: null, params: null };
                    }

                    //alert(obj.dataAjax.url + "/" + obj.dataAjax.params);

                    obj.methods.DataBind();

                },
                //固定数据控件绑定
                fixedDataBind: function (objData) {
                    var obj = settings;

                    //清空ajax调用方法，以固定数据控件绑定
                    obj.dataAjax = { url: null, params: null };

                    obj.dataJSON = objData;

                    obj.methods.DataBind();

                }
            },

            //定义事件
            callback: {
                onchange: null //选项改变事件
            }


        };



        //options中如果存在defaults中的值，则覆盖defaults中的值 
        var opts = $.extend(true, settings, options);
        var zNodes = $.extend(true, dataJSON, zNodes);
        //alert(opts.defaults.selectType);
        //获取控件所有的jquery对象
        settings.methods.init();

        return opts;

    }


})(jQuery);