<%--

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Purpose      : 首页,框架

 * Date         : 03 Sep 2016
 * Author       : Max Chen (ISD/CSC)
 * Note         :
 * -------------------------------------------------
 * 03 Sep 2016      Max Chen (ISD/CSC)        the first version
 * 10 Jul 2017      Gavin Feng                重写navTab中的
 *
 *      the latest update: 2017-07-10 14:06
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

--%>

<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Index.aspx.cs" Inherits="HRIS424.Web.Index" %>

<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=10,chrome=1" />
        <title>HRIS424 System</title>
        <link href="favicon.ico" rel="Shortcut Icon" />
        <script type="text/javascript">
            var time1 = new Date().getTime();
        </script>
        <!--DWZ框架样式-->
        <link href="http://cdn.crystal.local/assets/dwz/themes/default/style.css" rel="stylesheet" type="text/css" media="screen"
        />
        <link href="http://cdn.crystal.local/assets/dwz/themes/css/core.css" rel="stylesheet" type="text/css" media="screen" />
        <link href="http://cdn.crystal.local/assets/dwz/themes/css/print.css" rel="stylesheet" type="text/css" media="print" />
        <!--[if IE]>
        <link href="themes/css/ieHack.css" rel="stylesheet" type="text/css" media="screen" />
        <![endif]-->
        <!--[if lte IE 10]>
        <script src="dwz/Js/speedup.js" type="text/javascript"></script>
        <![endif]-->
        <script src="http://cdn.crystal.local/assets/jquery/jquery-1.7.2.min.js" type="text/javascript"></script>
        <script src="Controls/Language/language.js" type="text/javascript"></script>
        <script src="http://cdn.crystal.local/assets/jquery/jquery.validate.js" type="text/javascript"></script>
        <script src="http://cdn.crystal.local/assets/dwz/Js/dwz.min.js" type="text/javascript"></script>
        <script>
            // 以键值对的方式存储callback函数，以tabid作为key方便确认每个页面中是否有需要执行回调。
            navTab._closeCallback = {};

            // 提供外部方法将需要执行的函数注入到_closeCallback属性中。tabid为当前tab的id
            navTab.registerCloseCallback = function (tabid, f) {
                this._closeCallback[tabid] = f;
            };

            // 重写navTab的私有方法_closeTab, 在关闭页面前，提供一个回调函数
            navTab._closeTab = function (index, openTabid) {

                // 获取当前的tabid
                var tabid = this._getTabs().eq(index).attr('tabid');

                // 判断当前页面是否有注入回调函数(需要返回boolean值), 有则执行回调, 无则默认为true直接关闭页面
                var isClose = this._closeCallback[tabid] ? this._closeCallback[tabid]() : true;

                if (isClose) {
                    this._getTabs().eq(index).remove();
                    this._getPanels().eq(index).trigger(DWZ.eventType.pageClear).remove();
                    this._getMoreLi().eq(index).remove();
                    if (this._currentIndex >= index) this._currentIndex--;

                    if (openTabid) {
                        var openIndex = this._indexTabId(openTabid);
                        if (openIndex > 0) this._currentIndex = openIndex;
                    }

                    this._init();
                    this._scrollCurrent();
                    this._reload(this._getTabs().eq(this._currentIndex));

                    // 页面关闭后，删除对应该tabil的属性
                    delete this._closeCallback[tabid];
                }
            }

            // 获取当前Tab的Id
            navTab.getCurrentTabId = function () {
                return this._getTabs().eq(this._currentIndex).attr('tabid');
            };
        </script>
        <!-- 可以用dwz.min.js替换前面全部dwz.*.js (注意：替换是下面dwz.regional.zh.js还需要引入)
        <script src="bin/dwz.min.js" type="text/javascript"></script>
        -->
        <script src="http://cdn.crystal.local/assets/dwz/Js/dwz.regional.zh.js" type="text/javascript"></script>
        <script type="text/javascript">
            //全局变量--start-------
            var SysID = "<%=SysID %>"
            var SysCode = "<%=SysCode %>"
            var FunctionID = "<%=FunctionID %>"
            var PageID = "<%=PageID%>"; //定义页面的编号ID
            var LangType = "<%=LangType%>";
            var BlackRunTime = "<%=BlackRunTime.TotalSeconds%>";
            var StartTime = "<%=StartTime.ToLongTimeString()%>";
            var Debug = "<%=Debug%>";
            var Language = new Language("Controls/Language/Language.aspx", LangType);
            var LoginUserID = "<%=LoginUserID%>";

            $(function () {
                if (self != top) {
                    top.location = self.location;
                    return;
                }

                DWZ.init("dwz.frag.xml", {
                    debug: false, // 调试模式 【true|false】
                    callback: function () {
                        initEnv();

                        $("#splitBar").mousedown(function () {
                            $("#leftside").addClass("MenuContent");
                        });

                        $("#splitBar,#splitBarProxy").mouseup(function () {
                            $("#leftside").removeClass("MenuContent")
                        });

                        $("#themeList").theme({
                            themeBase: "//cdn.crystal.local/assets/dwz/themes"
                        }); // themeBase 相对于index页面的主题base路径
                    }
                });
                $.ajaxSettings.global = false;
                $("#background,#progressBar").hide();

                BuildMenu();

                LangInit();

                $("a[target='navTab']").click(function () {
                    $("#background,#progressBar").show();
                });

                // 关闭窗口时，回调写到此处
                $(window).unload(function (evt) {

                    if (typeof evt == 'undefined') {
                        evt = window.event;
                    }

                });

                //当窗口改变时，改变iframe的高度（为了让横滚动条暴露出来）
                $(window).resize(function () {
                    setTimeout(function () {
                        var $iframe = $("iframe"),
                            height = $(document).height() - 83;

                        $iframe.height(height);
                    }, 150);
                });

                // 关闭窗口前，回调写到此处
                $(window).bind('beforeunload',
                    function () {
                        if (self == top && !$.browser.msie) {
                            return "";
                        }
                    }
                );

            });

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

            function OpenTabJS(tabid, url, titleTxt) {
                navTab.openTab(tabid, url, {
                    title: titleTxt,
                    fresh: false,
                    external: true,
                    data: {}
                });

            }

            function CloseTabJS(tabid) {
                navTab.closeTab(tabid);
            }

            function BuildMenu() {
                var jsonObj = '<%= ViewState["data"] %>';
                var $menus = eval(jsonObj);

                var tree = "";
                tree += "<div class='accordionheader'><h2><span>folder</span><a id=' 983' >费用</a></h2></div>";
                tree += "<div class='accordioncontent'>"
                tree += "<ul class='tree treefolder'>";
                tree += "<li><a href='/view/fhris424index.aspx' target='navtab' external='true'  rel='page983'>费用分配比率 </a></li>";
                tree += "</ul>";
                tree += "</div>"
               //var tree = getTree($menus, SysCode);
                //tree += "<div class='accordionHeader'><h2><span>Folder</span><a id='" + data[i].SelfID +
                //               "' >" + data[i].Fun_Name + "</a></h2></div>";

                //tree += "<div class='accordionContent'>"
                //tree += "<ul class='tree treeFolder'>";
                //tree += "<li><a href='/View/FHRIS424Index.aspx' target='navTab' external='true'  rel='page983'>" + 费用分配比率 + "</a></li>";
                //tree += "</ul>";
                //tree += "</div>"
                //var tree = "<a href='/View/FHRIS424Index.aspx'>费用分配比率</a>";

                $("#sidebar").find(".accordion").empty().html(tree);
            }

            function getTree(data, PID) {
                if (data == null || data.length == 0) {
                    return "";
                }
                var tree = "";
                //alert(data)

                for (var i = 0; i < data.length; i++) {
                    if (data[i].ParentID != null && data[i].ParentID.length != 0 && data[i].ParentID == PID) {
                        if (data[i].SelfID == SysCode) {} else if (data[i].ParentID == SysCode) {
                            //alert(data[i].Fun_Name)
                            tree += "<div class='accordionHeader'><h2><span>Folder</span><a id='" + data[i].SelfID +
                                "' >" + data[i].Fun_Name + "</a></h2></div>";

                            tree += "<div class='accordionContent'>"
                            tree += "<ul class='tree treeFolder'>";
                            var children = getTree(data, data[i].SelfID);
                            tree += children;
                            tree += "</ul>";
                            tree += "</div>"
                        } else {
                            if (data[i].Exe_Path == null || data[i].Exe_Path.length == 0) {
                                //alert( data[i].Fun_Name)

                                tree += "<li><a href='javascript:void(0);'>" + data[i].Fun_Name + "</a>";

                                tree += "<ul>";
                                tree += getTree(data, data[i].SelfID);

                                tree += "</ul>";
                                tree += "</li>"
                                // }
                            } else {

                                tree += "<li><a href='" + data[i].Exe_Path /*+ "?paras=" + data[i].UserPars.replaceAll("~", "&")*/ +
                                    "'  target='navTab' external='true'  rel='page" + data[i].Sys_ID + "'>" + data[
                                        i].Fun_Name + "</a></li>";
                            }

                        }
                    }

                }

                return tree;
            }

            function ClearTree() {
                $("#sidebar").find(".accordion").empty();
            }

            // tabid :要关闭的Tab的ID,
            // rtabid 接收value的Tab的id
            //controlID :Jquery选择器,一般指在rtabid的Tab中的一个控件的ID值,一般可以设置”#id”,”.Class”…
            // value:值
            function SetOtherIframeValue(tabid, rtabid, controlID, value) {

                if (rtabid == null || rtabid == "") {
                    return false;
                }

                var rtabindex = navTab._indexTabId(rtabid);

                if (rtabindex == null || rtabid.length == 0) {
                    return false;
                }

                var $panel = navTab.getPanel(rtabid);
                if ($panel == null || $panel.length == 0) {
                    $panel = this._getPanels().eq(rtabindex);
                }

                if ($panel != null && $panel.length != 0) {
                    var $control = $panel.find("iframe").contents().find(controlID)
                    if ($control.length > 0) {
                        if ($control[0].tagName.toLowerCase() == "input") {
                            $control.val(value)
                        } else {
                            $control.text(value)
                        }
                    }

                }

                if (rtabindex != null) {
                    navTab._switchTab(rtabindex)
                }

                if (tabid == null || tabid == "") {
                    navTab.closeCurrentTab();
                } else {
                    navTab.closeTab(tabid, false);
                }
            }

            //rtabid:目标tab的ID,
            //controlID:取值目标控件ID
            function GetOtherIframeValue(rtabid, controlID) {

                var value = "";
                if (rtabid == null || rtabid == "") {
                    return false;
                }

                var rtabindex = navTab._indexTabId(rtabid);

                if (rtabindex == null || rtabid.length == 0) {
                    return false;
                }

                var $panel = navTab.getPanel(rtabid);
                if ($panel == null || $panel.length == 0) {
                    $panel = this._getPanels().eq(rtabindex);
                }

                if ($panel != null && $panel.length != 0) {
                    var $control = $panel.find("iframe").contents().find(controlID)
                    if ($control.length > 0) {
                        if ($control[0].tagName.toLowerCase() == "input") {
                            value = $control.val()
                        } else {
                            value = $control.text()
                        }
                    }

                }

                return value;
            }
        </script>
        <style>
            .SysName {
                vertical-align: middle;
            }

            .MenuContent {
                width: 100%;
                height: 10000px;
                background-color: rgba(255, 255, 255, 0.01);
            }

            #splitBarProxy {
                width: 5px;
                border: none;
                background: none;
            }

            #splitBarProxy>div {
                width: 3px;
                height: 100%;
                position: absolute;
                top: 0px;
                left: 0px;
                z-index: 10;
                background-color: #CCC;
                border: solid 1px #C0C0C0;
            }

            #splitBarProxy>iframe {
                width: 100%;
                height: 100%;
                position: absolute;
                top: 0px;
                left: 0px;
                z-index: 1;
                background-color: rgba(255, 255, 255, 0.01);
                border: 0;
            }
        </style>
    </head>

    <body scroll="no">
        <form id="Form1" runat="server">
            <div id="layout">
                <div id="header">
                    <div class="headerNav">
                        <div style="position: absolute; top: 5px; left: 30px;">
                            <img src="Images/crystalLogo.png" width="50px" style="vertical-align: middle;">
                            <span id="LabelSysName" class="SysName" lang="CN:HRIS424~EN:HRIS424" style="color: White;
                    font-family: 微软雅黑; font-size: 22px; font-weight: bold;">HRIS424</span>
                        </div>
                        <div style="position: absolute; top: 18px; left: 30%;">
                        </div>
                        <!--放置图标等-->
                        <ul class="nav">
                            <li id="CompanyGroup" runat="server" visible="false" style="color: White;">
                                <label id="labelForlblComapnyName" for="lblComapnyName" lang="CN:公司~EN:Company" style='display: none'>
                                </label>
                                :&nbsp;
                                <asp:Label ID="lblComapnyName" runat="server" Text=""></asp:Label>
                            </li>
                            <li style="color: White;">
                                <label id="labelForLoginerName" for="LabelLoginerName" lang="CN:当前用户~EN:User Name">
                                </label>
                                :&nbsp;
                                <asp:Label ID="lblLoginerName" runat="server" Text=""></asp:Label>
                            </li>
                            <li>
                                <a href="Login.aspx" id="LinkButtonOut" lang="CN:退出~EN:Sign Out" onclick='javascript:(function(){document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); }); })();'>
                                    Sign Out</a>
                            </li>
                        </ul>
                        <ul class="themeList" id="themeList">
                            <li theme="default">
                                <div class="selected">
                                    蓝色</div>
                            </li>
                            <li theme="green">
                                <div>
                                    绿色</div>
                            </li>
                            <li theme="purple">
                                <div>
                                    紫色</div>
                            </li>
                            <li theme="silver">
                                <div>
                                    银色</div>
                            </li>
                            <li theme="azure">
                                <div>
                                    天蓝</div>
                            </li>
                        </ul>
                    </div>
                    <!-- navMenu -->
                </div>
                <div id="leftside">
                    <div id="sidebar_s">
                        <div class="collapse">
                            <div class="toggleCollapse">
                                <div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="sidebar">
                        <div class="toggleCollapse">
                            <h2 id="h2emenu" lang="CN:菜单~EN:Menu">
                            </h2>
                            <div>
                                <!--收缩-->
                            </div>
                        </div>
                        <div class="accordion" fillspace="sidebar">
                            <div class="accordionHeader">
                                <h2>
                                    <span>Folder</span>
                                    <a id="spanSystemMenuFoloderName" class="LangType">System Menu</a>
                                </h2>
                            </div>
                            <%--<div class="accordionContent">
                    <ul class="tree treeFolder">
                        <li><a href="javascript:void(0);">功能分组1</a>
                            <ul>
                                <li><a href="View/Function1/Index.aspx" external='true' target='navTab' rel="page1"
                                    id="navTab1">功能1</a></li>
                            </ul>
                        </li>
                    </ul>
                </div>
                <div class="accordionHeader">
                    <h2>
                        <span>Folder</span><a id="spanSystemSettingMenuFoloderName" class="LangType">系统设置</a>(此部分未做)</h2>
                </div>
                <div class="accordionContent">
                    <ul class="tree treeFolder">
                        <li><a href="javascript:void(0);" target="navTab" rel="demo_page1">菜单项管理</a></li>
                        <li><a href="javascript:void(0);" target="navTab" rel="demo_page2">用户权限管理</a></li>
                        <li><a href="javascript:void(0);" target="navTab" rel="demo_page4">语言管理</a></li>
                        <li><a href="javascript:void(0);" target="navTab" rel="demo_page4">日志管理</a></li>
                        <li><a href="javascript:void(0);" target="navTab" rel="demo_page4">系统参数设置</a></li>
                    </ul>
                </div>--%>
                        </div>
                    </div>
                </div>
                <div id="container">
                    <div id="navTab" class="tabsPage">
                        <div class="tabsPageHeader">
                            <div class="tabsPageHeaderContent">
                                <!-- 显示左右控制时添加 class="tabsPageHeaderMargin" -->
                                <ul class="navTab-tab">
                                    <li tabid="main" class="main">
                                        <a href="javascript:;">
                                            <span>
                                                <span class="home_icon" id="spanBackHome" lang="CN:返回首页~EN:Home"></span>
                                            </span>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div class="tabsLeft">
                                left</div>
                            <!-- 禁用只需要添加一个样式 class="tabsLeft tabsLeftDisabled" -->
                            <div class="tabsRight">
                                right</div>
                            <!-- 禁用只需要添加一个样式 class="tabsRight tabsRightDisabled" -->
                            <div class="tabsMore">
                                more</div>
                        </div>
                        <ul class="tabsMoreList">
                            <li>
                                <a href="javascript:;" id="aBackHome" lang="CN:返回首页~EN:Home">
                                    <!--返回主页-->
                                </a>
                            </li>
                        </ul>
                        <div class="navTab-panel tabsPageContent layoutBox">
                            <div class="page unitBox">
                                <div style="width: 99%; height: 900px; background: #FFF;">
                                    <img src="images/workFlow.png" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="footer">
                <div>
                    <strong style="font-family: @宋体; font-size: 11px;"></strong>
                    <strong style="color: #5f5f5f;" id="runtime">Copyright &copy; 2014 .Crystal ISD Team</strong>
                </div>
            </div>
            <!--底部版权信息等-->
            <!--语言XML-->
            <div id="LangXML">
                <%=LangXML %>
            </div>
        </form>
    </body>
</html>