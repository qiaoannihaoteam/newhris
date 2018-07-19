<%@ Page Language="C#" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title></title>
</head>
<body style="zoom: 1; background-color: #A1C0EE;">
    <h1 style="font-size: 200px; text-align: center; font-family: Comic Sans MS; color: #ffffff;">
        Sorry，<span style="font-size: 33px; font-family: 黑体; margin-left: -105px;" lang="CN:你没有权限访问该页面，如有问题请联系管理员。~EN:You do not have permission to view this page, pls contact administrator"></span></h1>
    <script src="http://cdn.crystal.local/assets/jquery/jquery-1.9.0.min.js"></script>
    <script src="../../Controls/Language/language.js" type="text/javascript"></script>
    <script>
        $(parent.document).find("#background,#progressBar").hide();
        var FunctionID = "401Error"
        var PageID = "401Error";
        var LangType = '<%=Session["LangType"]%>';
        var Language = new Language("../../Controls/Language/Language.aspx", LangType);
        //IE兼容
        document.createElement("Language");
        document.createElement("Row");
        Language.LoadLanguage(FunctionID, PageID, $("#LangXML"), "", "");
    </script>
</body>
</html>