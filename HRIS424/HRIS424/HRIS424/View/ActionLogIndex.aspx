<%--

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Purpose      : ActionLog index  

  Date         : 16 Feb 2017
  Author       : KT Chen (ISD/CSC)
  Note         : 
  -------------------------------------------------
  16 Feb 2017      KT Chen (ISD/CSC)        the first version

       the latest update: 16 Feb 2017 18:36
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

--%>

<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="ActionLogIndex.aspx.cs"
    Inherits="HRIS424.View.ActionLogIndex" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <title></title>
    <link href="http://cdn.crystal.local/assets/dwz/themes/default/style.css" rel="stylesheet"
        type="text/css" />
    <link href="http://cdn.crystal.local/assets/dwz/themes/css/core.css" rel="stylesheet"
        type="text/css" />
    <link href="http://cdn.crystal.local/assets/kendo/2016.3.1028/styles/kendo.common-bootstrap.min.css"
        rel="stylesheet" type="text/css" />
    <link href="http://cdn.crystal.local/assets/kendo/2016.3.1028/styles/kendo.bootstrap.min.css"
        rel="stylesheet" type="text/css" />
    <link href="../Css/mainpage.css" rel="stylesheet" type="text/css" />
    <style>
        #grid tbody
        {
            text-align: left;
        }
        .k-i-calendar
        {
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div id="cover" class="k-loading-mask" style="width: 100%; height: 100%">
        <span id="cover_loading" class="k-loading-text" lang="CN:載入...~EN:Loading...">Loading...</span>
        <div class="k-loading-image">
            <div class="k-loading-color">
            </div>
        </div>
    </div>
    <div id="container">
        <span id="notification" style="display: none;"></span>
        <div class="pageContent">
            <div class="panelBar" style="position: fixed; z-index: 50; width: 100%">
                <ul class="toolBar">
                    <li><a id="btnRefresh" class="reset"><span id="refresh" lang="CN:Refresh~EN:Refresh">
                    </span></a></li>
                    <li><a id="btnExportExcel" class="export"><span id="excel" lang="CN:Export Excel~EN:Export Excel">
                    </span></a></li>
                    <li><a id="btnExit" class="exit"><span id="exit" lang="CN:Exit~EN:Exit"></span></a>
                    </li>
                </ul>
            </div>
        </div>
        <div id="ShowTypeRadio" style="position: absolute; top: 35px; height: 30px;">
            <input id="all" type="radio" name="ShowType" />
            <label id="showAll" class="ridio" lang="CN:显示所有~EN:Show All">
            </label>
            <input id="current" type="radio" name="ShowType" style="margin-left: 30px;" />
            <label id="currentRecord" class="ridio" lang="CN:仅当前记录~EN:Current Record">
            </label>
        </div>
        <div id="logDate" style="position: absolute; margin-left: 256px; top: 30px; height: 30px;">
            <label id="actionDate" lang="CN:操作日期~EN:ACTION DATE">
            </label>
            <input id="dateFrom" />
            <label id="to" lang="CN:至~EN:To">
            </label>
            <input id="dateEnd" />
        </div>
        <div id="grid" style="position: absolute; top: 65px; bottom: 4px; height: auto;">
        </div>
    </div>
    <div id="LangXML">
    </div>
    <script src="http://cdn.crystal.local/assets/kendo/2016.3.1028/js/jquery.min.js"></script>
    <script src="http://cdn.crystal.local/assets/kendo/2016.3.1028/js/jszip.min.js"></script>
    <script type="text/javascript" src="http://cdn.crystal.local/assets/kendo/2016.3.1028/js/kendo.all.min.js"></script>
    <script type="text/javascript" src="../Controls/Language/language.js"></script>
    <script type="text/javascript">
        //全局变量--start------- 
        var SysID = "<%=SysID %>"
        var SysCode = "<%=SysCode %>"
        var FunctionID = "<%=FunctionID %>"
        var PageID = "<%=PageID%>";
        //定义页面的编号ID 
        var LangType = "<%=LangType%>";
        var Debug = "<%=Debug%>";
        var Language = new Language("../Controls/Language/Language.aspx", LangType);
        var LoginUserID = "<%=LoginUserID%>";
        var RID = "<%=RID %>";
        var Table = "<%=Table %>";
        var ShowType = "<%=ShowType %>";
    </script>
    <!-- #include file="../Js/extentions.js.inc" -->
    <!-- #include file="../Js/ActionLog.index.js.inc" -->
</body>
</html>
