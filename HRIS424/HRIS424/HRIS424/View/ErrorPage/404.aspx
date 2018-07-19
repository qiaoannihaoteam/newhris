<%@ Page Language="C#" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>404 Page not found</title>
</head>
<body style="zoom: 1; background-color: #A1C0EE;">
    <h1 style="font-size: 200px; text-align: center; font-family: Comic Sans MS; color: #ffffff;">
        404，<span style="font-size: 33px; font-family: 黑体; margin-left: -105px;" lang="CN:无法找到当前页面，请稍后重试~EN:404, Page not found"></span></h1>
    <div id="LangXML">
    </div>
    <script src="http://cdn.crystal.local/assets/jquery/jquery-1.9.0.min.js"></script>
    <script src="../../Controls/Language/language.js" type="text/javascript"></script>
    <script>
        $(parent.document).find("#background,#progressBar").hide();
        var FunctionID = "404Error"
        var PageID = "404Error";
        var LangType = '<%=Session["LangType"]%>';
        var Language = new Language("../../Controls/Language/Language.aspx", LangType);
        //IE兼容
        document.createElement("Language");
        document.createElement("Row");
        Language.LoadLanguage(FunctionID, PageID, $("#LangXML"), "", "");
    </script>
</body>
</html>