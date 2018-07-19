using System;
using System.Web;
using System.Linq;
using System.Xml.Linq;
using System.Text;
using Tools = CrystalGroup.Web.Utility.Tools;
using CrystalGroup.Web.Utility;


namespace HRIS424.Controls
{
    public partial class Language : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            String actiontype = Request["actiontype"];

            if (!String.IsNullOrEmpty(actiontype))
            {
                switch (actiontype.ToUpper())
                {
                    case "SAVEALL":
                        {
                            String msgText = Tools.DataTypeConvertHelper.ToString(Request["msgText"]);

                            msgText = msgText.Replace("&lt;", "<").Replace("&gt;", ">");
                            String functionID = Tools.DataTypeConvertHelper.ToString(Request["functionID"]);
                            String pageID = Tools.DataTypeConvertHelper.ToString(Request["pageID"]);

                            String keyword = functionID + "." + pageID;
                            msgText = msgText.Replace("id:hc", "id:" + keyword + ".HTMLControls").Replace("id:sc", "id:" + keyword + ".ServerControls");

                            Boolean saveFlag = Commons.Language.SaveAllLanguage(msgText);
                            System.Web.Script.Serialization.JavaScriptSerializer serial = new System.Web.Script.Serialization.JavaScriptSerializer();
                            string obj = serial.Serialize(saveFlag);
                            Response.Write(obj);
                            Response.End();
                        }
                        break;

                    case "GETXML":
                        {
                            String keyword = Request["keyword"];
                            String langType = Request["langType"];
                            bool useLocalFileForLanguage = Tools.DataTypeConvertHelper.ToBoolean(System.Configuration.ConfigurationManager.AppSettings["useLocalFileForLanguage"]);
                            String filepath = Request["filepath"];
                            String xml = Commons.Language.GetXML(keyword, langType, filepath, useLocalFileForLanguage);
                            Response.ContentType = "application/xml";
                            Response.Write(xml.Replace("<Language", "<div class='Language' ").Replace("</Language", "</div").Replace("<Row", "<div class='Row' ").Replace("</Row", "</div").Replace("<?xml version='1.0' encoding='utf-8' ?>", ""));
                            Response.End();
                        }
                        break;

                    case "GETTEXT":
                        {
                            String keyword = Request["keyword"];
                            String langType = Request["langType"];
                            bool useLocalFileForLanguage = Tools.DataTypeConvertHelper.ToBoolean(System.Configuration.ConfigurationManager.AppSettings["useLocalFileForLanguage"]);
                            String langText = Request["langText"];
                            String text = Commons.Language.GetText(keyword, langText, langType, useLocalFileForLanguage);
                            Response.Write(text);
                            Response.End();
                        }
                        break;
                }
            }
        }

        public static string GetLanguageXml(string keyword)
        {
            return Wrapper.Cache(() =>
            {
                var langType = HttpContext.Current != null && HttpContext.Current.Session["LangType"] != null
                    ? HttpContext.Current.Session["LangType"].ToString()
                    : "EN";
                String xml = Commons.Language.GetXML(keyword, langType, "", false);
                return string.IsNullOrWhiteSpace(xml)
                    ? string.Empty
                    : xml.Replace("<Language>", "")
                        .Replace("</Language>", "")
                        .Replace("<?xml version='1.0' encoding='utf-8' ?>", "");
            }, keyword);
        }

        public static string GetLanguageJavascript(string keyword)
        {
            return Wrapper.Cache(() =>
            {
                var langType = HttpContext.Current != null && HttpContext.Current.Session["LangType"] != null
                    ? HttpContext.Current.Session["LangType"].ToString()
                    : "EN";
                String xml = Commons.Language.GetXML(keyword, langType, "", false);
                if (string.IsNullOrWhiteSpace(xml)) return string.Empty;

                var xDoc = XDocument.Parse(xml);
                var rows = from r in xDoc.Descendants("Row")
                           select new
                           {
                               k = r.Attribute("ItemID").Value.Replace(keyword + ".", ""),
                               v = r.Attribute("Text").Value
                           };
                StringBuilder sb = new StringBuilder();
                sb.Append("<script>var PageLangCache = {");
                foreach (var r in rows)
                {
                    sb.Append("\"")
                        .Append(r.k)
                        .Append("\"")
                        .Append(":")
                        .Append("\"")
                        .Append(r.v)
                        .Append("\",");
                }
                sb.Remove(sb.Length - 1, 1);
                sb.Append("};</script>");

                return sb.ToString();
            }, keyword);
        }
    }
}