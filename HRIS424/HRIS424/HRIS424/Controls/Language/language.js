/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Purpose     : 页面的多语言显示类
 * Date        : 27 May 2014
 * Author      : Finn
 * Note        :
 * -------------------------------------------------
 * 27 May 2014     Finn        the first version
 * 05 Jun 2014     Dom         修改xml结构(在Page外面增加Function),取语言的方式改为不用LangID ,
 * 10 Jul 2014     Dom         修改xml结构<Row ItemID="" Text=""/>,配合Commons.Language.cs的方法用
 * 04 Aug 2017     Bruce       修改GetText方法，改成从缓存中获取，提高效率
 *       the latest update: 04 Aug 2017 09:00
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

/// <summary>
/// 页面的多语言显示类构造函数
/// </summary>
/// <param name="XmlFile">XmlFile:语言文件相对路径</param>
/**************************************************
 * 使用示列:
 * var FunctionID = "Function1"; //功能ID(每个页面中有要有这个参数)
 * var PageID = "Login"; //定义页面的编号ID
 * var XmlFile = "Language/zh.xml?" + new Date(); //当前语言文件
 * var Language= new Language(XmlFile);
 * Language.LoadLanguage(PageID);
 ************************************************/
function Language(XmlFile, LangType) {
    this.LangType = LangType; //语言类型
    this.XmlFile = XmlFile; //语言文件相对路径

    /// Bruce Added
    this.Cache = window.PageLangCache || {}; // 用于缓存当前页面js的语言
    window.PageLangCache = null;

    /// 将保存在xml node中的语言信息保存到Cache中
    this.setCache = function (langNode) {
        var keyword = PageID;
        langNode.find("[ItemID]").each(function (index, item) {
            var key = $(item)
                .attr("ItemID")
                .replace(keyword + ".", ""),
                value = $(item).attr("Text");

            if (!Language.Cache[key] && key != "") {
                Language.Cache[key] = value;
            }
        });
    };

    /// 新增方法，调用示例: Language.getLang("CN:中文~EN:English")
    this.getLang = function (text) {
        var key = this.hashCode(text),
            keyword = PageID + "." + key;

        // 当缓存中有时，取缓存，否则，将语言保存到DB并直接从文本拆分返回
        if (this.Cache[key]) {
            return this.Cache[key];
        } else {
            // 异步保存
            $.ajax({
                url: this.XmlFile + "?actiontype=gettext&langType=" + this.LangType,
                data: {
                    keyword: keyword,
                    langText: text
                },
                type: "Post",
                dataType: "text",
                async: true,
                cache: false,
                success: function (data) {
                    Language.Cache[key] = data;
                }
            });
            // 直接从文本中拆分返回
            return this.GetLangFromText(text);
        }
    };

    /// 新增方法，用于哈希一段文本，哈希值用于保存到db的key
    this.hashCode = function (s) {
        var hash = 0,
            i = 0,
            len = s.length;
        while (i < len) {
            hash = ((hash << 5) - hash + s.charCodeAt(i++)) << 0;
        }
        return hash.toString();
    };

    /// 更改旧的GetText方法
    this.GetText = function (keyword, langText) {
        return this.getLang(langText);
    };

    /// Bruce Added End

    /// <summary>
    /// 在页面加载当前显示的语言
    /// </summary>
    /// <param name="PageID">页面在对应在xml的ID。用于取相对应的值</param>
    /**************************************************
     * 使用示列:
     * var PageID = "Login"; //定义页面的编号ID
     * var XmlFile = "Language/zh.xml?" + new Date(); //当前语言文件
     * var Language= new Language(XmlFile);
     * Language.LoadLanguage(PageID);
     ************************************************/
    this.LoadLanguage = function (functionID, pageID, LangXML, filepath, action) {
        $("#background,#progressBar", parent.document).show();
        var keyword;
        if (functionID == null) {
            $("#background,#progressBar", parent.document).hide();
            return;
        }

        if (pageID == null) {
            pageID = "";
        }

        if (filepath == null) {
            filepath = "";
        }

        if (action == null && action == "") {
            try {
                action = Action;
            } catch (e) {}
        }

        if (PageID == null) {
            PageID = "";
            keyword = FunctionID;
        } else {
            keyword = FunctionID + "." + PageID;
        }

        //alert(LangXML.find("Row").length)
        if (
            LangXML == null ||
            LangXML.length == 0 ||
            LangXML.find("Row").length == 0
        ) {
            $.ajax({
                url: this.XmlFile +
                    "?actiontype=getxml&langType=" +
                    this.LangType +
                    "&filepath=" +
                    filepath, //XML文件相对路径
                data: {
                    keyword: keyword + ".HTMLControls"
                },
                type: "Post", //发送请求的方式
                dataType: "html", //指明文件类型为“xml”
                timeout: 2000, //超时设置，单位为毫秒
                async: false, //默认值: true。默认设置下，所有请求均为异步请求。如果需要发送同步请求，请将此选项设置为 false。
                cache: false,
                error: function (xml) {
                    //解析XML文件错误时的处理
                    $("#background,#progressBar", parent.document).hide();
                },
                success: function (xml) {
                    //alert($(xml).html())
                    var keyWord = functionID + "." + pageID + ".HTMLControls";
                    SetPageLanguage($(xml), keyWord, action);
                }
            });
        } else {
            var keyWord = functionID + "." + pageID + ".HTMLControls";
            SetPageLanguage(LangXML, keyWord, action);
            $("#background,#progressBar", parent.document).hide();
            var time2 = new Date().getTime();

            if (Debug == "True") {
                try {
                    if (time1 != null && BlackRunTime != null) {
                        $("#runtime", parent.document).html(
                            PageID +
                            "_后台执行时间:" +
                            BlackRunTime +
                            "\n" +
                            "前台执行时间:" +
                            (time2 - time1) / 1000 +
                            "\n" +
                            "合计:" +
                            (parseFloat(BlackRunTime) +
                                (time2 - time1) /
                                1000) /*+ "访问一共用时:" + ((time2 - parent.LoadTime1) / 1000)*/
                        );
                        //parent.LoadTime1 = new Date().getTime();
                    } else {
                        $("#runtime", parent.document).html("");
                    }
                } catch (e) {}
            }

            LangXML.remove();
        }
    };

    this.SaveAllLanguage = function (functionID, pageID) {
        $("#background,#progressBar", parent.document).show();
        //拼出所有ID和语言
        var keyword = "hc";
        var msgText = "^$";
        $("[Lang]").each(function () {
            if ($(this).attr("Lang") != null && $(this).attr("Lang") != "") {
                if (msgText.indexOf($(this).attr("id")) == -1) {
                    msgText +=
                        "id:" +
                        keyword +
                        "." +
                        $(this).attr("id") +
                        "~" +
                        $(this).attr("lang") +
                        "^$";
                }
            }
        });
        keyword = "sc";
        $("[ServerLang]").each(function () {
            if (
                $(this).attr("ServerLang") != null &&
                $(this).attr("ServerLang") != ""
            ) {
                if (msgText.indexOf($(this).attr("id")) == -1) {
                    msgText +=
                        "id:" +
                        keyword +
                        "." +
                        $(this).attr("id") +
                        "~" +
                        $(this).attr("ServerLang") +
                        "^$";
                }
            }
        });
        msgText = msgText
            .replace(new RegExp("<", "gm"), "&lt;")
            .replace(new RegExp(">", "gm"), "&gt;");
        //alert(msgText)
        $.ajax({
            url: this.XmlFile + "?actiontype=saveall", //XML文件相对路径
            data: {
                functionID: functionID,
                pageID: pageID,
                msgText: msgText
            },
            type: "Post", //发送请求的方式
            dataType: "JSON", //指明文件类型为“xml”
            timeout: 2000, //超时设置，单位为毫秒
            async: true, //默认值: true。默认设置下，所有请求均为异步请求。如果需要发送同步请求，请将此选项设置为 false。
            cache: false,
            error: function (xml) {
                //解析XML文件错误时的处理
            },
            success: function (data) {
                if (data != null && data.toString() == "True") {
                    return true;
                }
            }
        });
    };

    //页面上需要设置多语言的标签。
    function SetPageLanguage(xmlNote, keyWord, action) {
        var lang = xmlNote;
        Language.setCache(lang);

        if (action == null && action == "") {
            try {
                action = Action;
            } catch (e) {}
        }

        var title;
        title = lang
            .find("[ItemID='" + keyWord + "." + action + ".title']")
            .attr("Text");
        if (title == null || title.length == 0) {
            title = lang.find("[ItemID='" + keyWord + ".title']").attr("Text");
        }

        if (title != null && title != "") {
            document.title = title;
        }
        //$(document).attr("title", title); //修改title值

        $("input[type='radio'],input[type='checkbox']").each(function () {
            $this = $(this);
            var $par = $this.parent("span:first");
            if (
                $par.length > 0 &&
                $par.attr("Lang") != null &&
                $par.attr("Lang") != ""
            ) {
                if (
                    $par.find("input[type='radio'],input[type='checkbox']").length == 1
                ) {
                    $label = $("label[for='" + $this.attr("id") + "']");
                    if ($label.length > 0) {
                        $label.attr("id", "lblfor" + $this.attr("id"));
                        $label.attr("Lang", $par.attr("Lang"));
                    } else {
                        $label = $(
                            "<label id='" +
                            "lblfor" +
                            $this.attr("id") +
                            "' for='" +
                            $this.attr("id") +
                            "'  Lang='" +
                            $par.attr("Lang") +
                            "' />"
                        );
                        $this.after($label);
                    }
                }
                $par.removeAttr("Lang");
            }
        });

        //Dom add
        $("[Lang]").each(function () {
            var text;

            text = lang
                .find("[ItemID='" + keyWord + "." + $(this).attr("id") + "']")
                .attr("Text");
            if (text == null || text.length == 0) {
                if ($(this).attr("lang") != null && $(this).attr("lang") != "") {
                    text = getLangFromText($(this).attr("lang"));
                }
            }

            // alert(text)

            if (text != null && text.length > 0) {
                if ($(this)[0].tagName.toLowerCase() == "input") {
                    $(this).val(text);
                } else if (
                    $(this).length > 0 &&
                    $(this)[0].tagName.toLowerCase() == "a"
                ) {
                    if ($(this).find("span").length == 0 || text.indexOf("span") != -1) {
                        $(this).html(text);
                    } else {
                        $(this)
                            .find("span")
                            .eq(0)
                            .html(text);
                    }
                } else if (
                    $(this).length > 0 &&
                    $(this)[0].tagName.toLowerCase() == "span"
                ) {
                    $(this).html(text);
                } else {
                    $(this).text(text);
                }
            }
        });

        $("#background,#progressBar", parent.document).hide();
    }

    this.GetLangFromText = function (msgText, langType) {
        if (msgText == null || msgText == "") {
            return null;
        }
        if (langType == null || langType == "") {
            langType = this.LangType;
        }

        var ltext = "";
        var engtext = "";

        if (msgText.indexOf("~") != -1) {
            var langArry = msgText.split("~");

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
    };

    function getLangFromText(msgText, langType) {
        if (msgText == null || msgText == "") {
            return null;
        }
        if (langType == null || langType == "") {
            langType = this.LangType;
        }

        var ltext = "";
        var engtext = "";

        if (msgText.indexOf("~") != -1) {
            var langArry = msgText.split("~");

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
    }

    /// <summary>
    /// 获取单个节点的语言信息
    /// </summary>
    /// <param name="Node">xml的节点,例:"Language>Function[ID=FunctionID]>Page[ID=PageID]"</param>
    /// <param name="Attribute">Node对应节点的属性,默认是text</param>
    /// <returns>返回对应的语言</returns>
    /**************************************************
     * 使用示列:
     * var Node = "Language>Function[ID=FunctionID]>Page[ID=PageID]";
     * var Attribute = "text";
     * var XmlFile = "Language/zh.xml?" + new Date(); //当前语言文件
     * var Language= new Language(XmlFile);
     * 1.var msg = Lang.GetLanguageByNode(Node);
     *2.var msg = Lang.GetLanguageByNode(Node,Attribute);
     ************************************************/
    this.GetLanguageByAttribute = function (keyword, Attribute) {
        var rStr = "";
        $.ajax({
            url: this.XmlFile + "?actiontype=gettext&langType=&langText=" + langText, //XML文件相对路径
            data: {
                keyword: keyword
            },
            type: "Post", //发送请求的方式
            dataType: "xml", //指明文件类型为“xml”
            timeout: 2000, //超时设置，单位为毫秒
            async: false, //默认值: true。默认设置下，所有请求均为异步请求。如果需要发送同步请求，请将此选项设置为 false。
            cache: false,
            error: function (xml) {
                //解析XML文件错误时的处理
                alert("Error loading XML document!");
            },
            success: function (xml) {
                if (Attribute == null || Attribute == "" || Attribute.length == 0) {
                    Attribute = "text";
                }

                rStr = $(xml)
                    .find("[ItemID='" + keyword + "']")
                    .attr(Attribute);
            }
        });

        return rStr;
    };
}