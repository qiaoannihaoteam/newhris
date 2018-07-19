<%@ Page Language="C#" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>Error</title>
</head>
<body>
    <h1 lang="CN:功能异常~EN:Function Error">
    </h1>
    <div id="LangXML">
    </div>
    <script src="http://cdn.crystal.local/assets/jquery/jquery-1.9.0.min.js"></script>
    <script src="../../Controls/Language/language.js" type="text/javascript"></script>
    <script>
        $(parent.document).find("#background,#progressBar").hide();
        var FunctionID = "500Error"
        var PageID = "500Error";
        var LangType = '<%=Session["LangType"]%>';
        var Language = new Language("../../Controls/Language/Language.aspx", LangType);
        //IE兼容
        document.createElement("Language");
        document.createElement("Row");
        Language.LoadLanguage(FunctionID, PageID, $("#LangXML"), "", "");
    </script>
</body>
</html>