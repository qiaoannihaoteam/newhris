

<%--
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Purpose      : FHRIS424
    Date         : 17 Jul 2018 
    Author       : Eva Liao (ISD/CSC)
    Note         :
    -------------------------------------------------
     17 Jul 2018	Eva Liao (ISD/CSC)	the first version

		the latest update: 17 Jul 2018 11:02
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    */
    --%>
<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="FHRIS424.aspx.cs"
    Inherits="CrystalISD.View.FHRIS424" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
    <link href="http://cdn.crystal.local/assets/dwz/themes/default/style.css" rel="stylesheet" type="text/css" />
    <link href="http://cdn.crystal.local/assets/dwz/themes/css/core.css" rel="stylesheet" type="text/css" />
    <link href="http://cdn.crystal.local/assets/bootstrap/bootstrap-3.3.7-dist/css/bootstrap.min.css" rel="stylesheet" type="text/css" />
    <link href="http://cdn.crystal.local/assets/kendo/2016.3.1028/styles/kendo.common-bootstrap.min.css" rel="stylesheet" type="text/css" />
    <link href="http://cdn.crystal.local/assets/kendo/2016.3.1028/styles/kendo.bootstrap.min.css" rel="stylesheet" type="text/css" />
    <link href="../Css/public01.css" rel="stylesheet" type="text/css" />
</head>
<body>
    <div class="page unitBox">
        <form id="form" method="post">
        <div class="pageFormContent" layouth="60" style="overflow: auto; padding: 0;">
            <div class="panelBar">
                <!-- 顶部按钮栏 -->
                <ul class="toolBar">
                    <li><a id="btnEdit" class="edit" data-bind="click: edit"><span id="lbledit" lang="CN:編輯~EN:Edit"></span></a>
                    </li>
                    <li><a id="btnSave" class="save" data-bind="click: save"><span id="lblsave" lang="CN:保存~EN:Save"></span> </a>
                    </li>
					<li><a id="btnDelete" class="delete" data-bind="click: delete0"><span id="delete" lang="CN:删除~EN:Delete"></span></a></li>
                    <li><a id="btnExit" class="exit" data-bind="click: exit"><span id="lblexit" lang="CN:退出~EN:Exit"></span></a>
                    </li>
                </ul>
            </div>
            <!-- 页面内容 -->
            <div id="content" class="container-fluid" style="background-color: #E9F2F7;">
					<div class="row">
                    <div class="label col-sm-2">
                        <label id="lblEmp_No" lang="CN:工号~EN:Emp_No" required-mark>
                        </label>
                    </div>
                    <input id="txt_Emp_No" class="col-sm-2" required data-bind="value: data.Emp_No" name="Emp_No" />
					</div>
					<div class="row">
                    <div class="label col-sm-2">
                        <label id="lblEffect_Date" lang="CN:生效日期~EN:Effect_Date" required-mark>
                        </label>
                    </div>
                    <input id="txt_Effect_Date" class="col-sm-2" required data-bind="value: data.Effect_Date" name="Effect_Date" />
					</div>
					<div class="row">
                    <div class="label col-sm-2">
                        <label id="lblCustomer_id" lang="CN:客户代码~EN:Customer_id" required-mark>
                        </label>
                    </div>
                    <input id="txt_Customer_id" class="col-sm-2" required data-bind="value: data.Customer_id" name="Customer_id" />
					</div>
					<div class="row">
                    <div class="label col-sm-2">
                        <label id="lblCost_Ratio" lang="CN:费用分配比率~EN:Cost_Ratio" required-mark>
                        </label>
                    </div>
                    <input id="txt_Cost_Ratio" class="col-sm-2" required data-bind="value: data.Cost_Ratio" name="Cost_Ratio" />
					</div>
            </div>
        </div>
        </form>
    </div>
    <script src="http://cdn.crystal.local/assets/kendo/2016.3.1028/js/jquery.min.js"></script>
    <script src="../Controls/Language/language.js" type="text/javascript"></script>
    <script type="text/javascript" src="http://cdn.crystal.local/assets/kendo/2016.3.1028/js/kendo.all.min.js"></script>
    <!-- #include file="../Js/extentions.js.inc" -->
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
        var Action = "<%= this.Action %>";
        var GUID = "<%= this.GUID %>";
        var FlashMessage = "<%=this.FlashMessage %>";

    </script>
    <!-- #include file="../Js/CrystalISD.FHRIS424.js.inc" -->
</body>
</html>
