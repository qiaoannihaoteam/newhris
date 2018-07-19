

<%--

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Purpose      : FHRIS424 editAll  

  Date         : 17 Jul 2018
  Author       : Eva Liao (ISD/CSC)
  Note         : 
  -------------------------------------------------
  17 Jul 2018	Eva Liao (ISD/CSC)	the first version

	the latest update: 17 Jul 2018 11:02
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

--%>

<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="FHRIS424EditAll.aspx.cs" Inherits="CrystalISD.View.FHRIS424EditAll" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <title></title>
    <link href="http://cdn.crystal.local/assets/dwz/themes/default/style.css" rel="stylesheet" type="text/css" />
    <link href="http://cdn.crystal.local/assets/dwz/themes/css/core.css" rel="stylesheet" type="text/css" />
    <link href="http://cdn.crystal.local/assets/kendo/2016.3.1028/styles/kendo.common-bootstrap.min.css" rel="stylesheet" type="text/css" />
    <link href="http://cdn.crystal.local/assets/kendo/2016.3.1028/styles/kendo.bootstrap.min.css" rel="stylesheet" type="text/css" />
    <link href="../Css/mainpage.css" rel="stylesheet" type="text/css" />
</head>
<body>
    <div id="cover" class="k-loading-mask" style="width:100%;height:100%"><span id="cover_loading" class="k-loading-text" lang="CN:載入...~EN:Loading...">Loading...</span><div class="k-loading-image"><div class="k-loading-color"></div></div></div>
    <div id="container">
        <span id="notification" style="display: none;"></span>
        <div class="pageContent">
            <div class="panelBar" style="position: fixed; z-index: 50; width: 100%;">
                <ul class="toolBar">
				                    <li><a id="btnSave" class="save" data-bind="click: save"><span id="lblsave" lang="CN:保存~EN:Save"> </span>
                    </a></li>
                    <%--<li><a id="btnCreate" class="add" data-bind="click: create"><span id="create" lang="CN:添加~EN:Add"></span></a></li>--%>
                                        <%--                    <li><a id="btnCopy" class="copy" data-bind="click: copyToNew"><span id="copy" lang="CN:复制~EN:Copy"></span>
                    </a></li>--%>
                    <li><a id="btnDelete" class="delete" data-bind="click: delete0"><span id="delete" lang="CN:刪除~EN:Delete"></span> </a></li>
                    <li><a id="btnRefresh" class="reset" data-bind="click: refreshGrid"><span id="refresh" lang="CN:刷新~EN:Refresh"></span> </a></li>
					                    <li><a id="btnExit" class="exit" data-bind="click: exit"><span id="lblexit" lang="CN:退出~EN:Exit"> </span>
                    </a></li>
                </ul>
            </div>
        </div>
        <div id="grid" style="position: absolute; bottom: 0; height: 92%;">
        </div>
    </div>
    <div id="LangXML"></div>

    <script type="text/javascript" src="http://cdn.crystal.local/assets/jquery/jquery-1.9.0.min.js"></script>
    <script type="text/javascript" src="http://cdn.crystal.local/assets/kendo/2016.3.1028/js/kendo.all.min.js" defer="defer"></script>
    <script type="text/javascript" src="../Controls/Language/language.js"></script>
        <script type="text/javascript">

            //全局变量--start-------
            var SysID = "<%=SysID %>"
            var SysCode = "<%=SysCode %>"
            var FunctionID = "<%=FunctionID %>"
            var PageID = "<%=PageID%>"; //定义页面的编号ID
            var LangType = "<%=LangType%>";
            var Debug = "<%=Debug%>";
            var Language = new Language("../Controls/Language/Language.aspx", LangType);
            var LoginUserID = "<%=LoginUserID%>";

    </script>
    <!-- #include file="../Js/extentions.js.inc" -->
    <!-- #include file="../Js/CrystalISD.FHRIS424.editAll.js.inc" -->
</body>
</html>
