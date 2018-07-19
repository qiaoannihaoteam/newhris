<%--

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Purpose      : FHRIS424 index  

  Date         : 17 Jul 2018
  Author       : Eva Liao (ISD/CSC)
  Note         : 
  -------------------------------------------------
  17 Jul 2018      Eva Liao (ISD/CSC)        the first version

       the latest update: 17 Jul 2018 11:02
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

--%>

<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="FHRIS424Index.aspx.cs" Inherits="CrystalISD.View.FHRIS424Index" %>

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


    <link href="../../SelectTreeResourceFile/css/main.css" rel="stylesheet" type="text/css" />
    <link href="../../SelectTreeResourceFile/css/zTree/zTreeStyle.css" rel="stylesheet" type="text/css" />
    <script src="http://cdn.crystal.local/assets/kendo/2016.3.1028/js/jquery.min.js"></script>
    <script src="../../SelectTreeResourceFile/js/zTree/jquery.ztree.core-3.5.js" type="text/javascript"></script>
    <script src="../../SelectTreeResourceFile/js/zTree/jquery.ztree.excheck-3.5.js" type="text/javascript"></script>
    <script src="../../SelectTreeResourceFile/js/zTree/jquery.ztree.exhide-3.5.js" type="text/javascript"></script>
    <script src="../../SelectTreeResourceFile/js/jquery.SelectTree.js" type="text/javascript"></script>
    <style>
        #search-content .item{
            width:50%;
        }
    </style>
</head>
<body>
    <div id="cover" class="k-loading-mask" style="width: 100%; height: 100%"><span id="cover_loading" class="k-loading-text" lang="CN:載入...~EN:Loading...">Loading...</span><div class="k-loading-image">
        <div class="k-loading-color"></div>
    </div>
    </div>
    <div id="container">
        <span id="notification" style="display: none;"></span>
        <div class="pageContent">
            <div class="panelBar" style="position: fixed; z-index: 50; width: 100%;">
                <ul class="toolBar">
                    <li><a id="btnCreate" class="add" data-bind="click: create"><span id="create" lang="CN:添加~EN:Add"></span></a></li>
                    <li><a id="btnView" class="view" data-bind="click: view"><span id="view" lang="CN:查看~EN:View"></span></a></li>
                    <li><a id="btnEdit" class="edit" data-bind="click: edit"><span id="edit" lang="CN:編輯~EN:Edit"></span></a></li>                    
                    <li><a id="btnDelete" class="delete" data-bind="click: delete0"><span id="delete" lang="CN:刪除~EN:Delete"></span></a></li>
                    <li><a id="btnCopy" class="copy" data-bind="click: copyToNew"><span id="copy" lang="CN:复制~EN:Copy"></span></a></li>
                    <li><a id="btnRefresh" class="reset" data-bind="click: refreshGrid"><span id="refresh" lang="CN:刷新~EN:Refresh"></span></a></li>                    
                    <li><a id="btnExportExcel" class="export" data-bind="click: exportExcel"><span id="excel" lang="CN:导出Excel~EN:Export Excel"></span></a></li>
                </ul>
            </div>
            <div class="panel" style="margin-top: 30px;">
                <div class="panelHeader">
                    <div class="panelHeaderContent" style="cursor: pointer;" data-bind="click: toggleSearch">
                        <h1>
                            <span id="title-shrink" class="k-icon k-i-pin"></span>
                            <span id="title-spread" class="k-icon k-i-unpin" style="display: none;"></span>
                            <span id="label_search" style="position: absolute; left: 30px;" lang="CN:搜索~EN:Search"></span>
                        </h1>
                    </div>
                </div>
                <div class="panelContent" style="height: auto; display: none">
                    <div id="search-container">
                        <div id="search-content" class="search-content">
                            <div class="item">
                                <div class="label">
                                    <label id="lbl_Sect_RID" lang="CN:Sect_RID~EN:Sect_RID"></label>
                                </div>
                                <div id="Sect_RID"></div>
                                <script type="text/javascript">
                                    var SelectTree_SelectTree;
                                    var SelectTree_dataJSON = [];
                                    $(document).ready(function () {
                                        SelectTree_SelectTree = $.fn.SelectTree({
                                            defaults: {
                                                ControlId: "Sect_RID",
                                                Language: "CN",
                                                Width: "500px",
                                                Height: 300,
                                                maxWidth: 500,
                                                Enable: true,
                                                selectedItem: "|",
                                                selectedValue: "",
                                                selectType: "radio",
                                                showIcon: true,
                                                iconSkin: "default",
                                                maxSelectNum: 10,
                                                checkType: { isAll: true, levels: [{ type: null, level: 0 }, { type: null, level: 1 }] },
                                                openLevel: 0,
                                                Style: "default",
                                                isFullText: true,
                                                fullTextChar: ">",
                                                textChar: ",",
                                                itemChar: "|",
                                                isFilter: true,
                                                defaultText: { replaceText: "CN:~EN:", searchText: "CN:没有结果匹配 [ {0} ]~EN:No results match [ {0} ]", selectText: "CN:最多只能选择 [ {0} ]~EN:Can only choose [ {0} ]" },
                                                isAsyncQuery: true
                                            },
                                            callback: {
                                                onchange: function (obj) { }
                                            },
                                            dataJSON: SelectTree_dataJSON,
                                            dataAjax: {
                                                url: "/View/Api/FHRIS424Api.ashx?action=GetTreeData",
                                                params: { action: "getdataJSON", cls: "city" }
                                            }
                                        });
                                    });
                                </script>
                            </div>
                            <div class="item">
                                <div class="label">
                                    <label id="lbl_Emp_No" lang="CN:工号~EN:Emp_No"></label>
                                </div>
                                <input id="txt_Emp_No" data-bind="value: conditionModel.Emp_No" />
                            </div>
                            <div class="item">
                                <div class="label">
                                    <label id="lbl_Effect_Date" lang="CN:生效日期~EN:Effect_Date"></label>
                                </div>
                                <input id="txt_Effect_DateFrom" data-bind="value: conditionModel.Effect_DateFrom" />
                                <label id="txt_To" lang="CN:至~EN:To">
                                </label>
                                <input id="txt_Effect_DateTo" data-bind="value: conditionModel.Effect_DateTo" />
                            </div>
                            <div class="item">
                                <div class="label">
                                    <label id="lbl_Check_Date" lang="CN:查看日期~EN:CheckDate"></label>
                                </div>
                                <input id="txt_Check_Date" data-bind="value: conditionModel.CheckDate" />
                            </div>
                            <div class="item">
                                <div class="label">
                                    <label id="lbl_ActiveVal" lang="CN:在职状态~EN:ActiveVal"></label>
                                </div>
                                <input id="txt_ActiveVal" class="textInput textInput-size" data-bind="value: conditionModel.ActiveVal" />
                            </div>
                        </div>
                        <div class="button-bar">
                            <div class="item">
                                <button id="btnSearch" data-bind="click: search">
                                    <span class="k-icon k-i-search"></span><span id="lblSearch" lang="CN:搜索~EN:Search"></span>
                                </button>
                            </div>
                            <div class="item">
                                <button id="btnClear" data-bind="click: clearCondition">
                                    <span class="k-icon k-i-close"></span><span id="lblClear" lang="CN:清除~EN:Clear"></span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="panelFooter">
                    <div class="panelFooterContent">
                    </div>
                </div>
            </div>
        </div>
        <div id="grid" style="position: absolute; bottom: 0; height: 92%;">
        </div>
    </div>
    <div id="LangXML"></div>

 
    <script src="http://cdn.crystal.local/assets/kendo/2016.3.1028/js/jszip.min.js"></script>
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
    <!-- #include file="../Js/CrystalISD.FHRIS424.index.js.inc" -->
</body>
</html>
