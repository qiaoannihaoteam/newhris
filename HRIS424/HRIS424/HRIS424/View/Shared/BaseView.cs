/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Purpose      :
 * Date         : 17 Dec 2016
 * Author       : Bruce Liao
 * Note         :
 * -------------------------------------------------
 * 17 Dec 2016      Bruce Liao        the first version
 * 22 Aug 2017      Bruce Liao        从url获取语言信息
 * 09 Nov 2017      Bruce Liao        修改 GetModelFromRequest
 * 09 May 2018      Bruce Liao        修改 GetModelFromRequest, 增加文件下载处理器

 *      the latest update: 09 May 2018 18:00
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.UI;
using Tools = CrystalGroup.Web.Utility.Tools;

namespace HRIS424.View
{
    using Controls;
    using CrystalGroup.Web.Utility;
    using src.Service;
    using Newtonsoft.Json;

    /// <summary>
    /// 所有VIEW页面的基类
    /// </summary>
    public class BaseView : Page
    {
        /// <summary>
        /// 当前页面的唯一标识ID
        /// </summary>
        protected string GUID = string.Empty;

        /// <summary>
        /// 一次性消息变量
        /// </summary>
        protected string FlashMessage = string.Empty;

        /// <summary>
        /// Action代理
        /// </summary>
        protected delegate void Process();

        /// <summary>
        /// 返回文件下载的API代理
        /// </summary>
        /// <returns></returns>
        public delegate Tuple<byte[], string> FileDownloadProcess();

        /// <summary>
        /// 所有的Action处理字典, 所有Action字符串大小写敏感
        /// </summary>
        protected Dictionary<string, Process> Processor = new Dictionary<string, Process>();

        /// <summary>
        /// 返回文件下载的处理字典，Action大小写敏感
        /// </summary>
        protected Dictionary<string, FileDownloadProcess> FileDownloadProcessor = new Dictionary<string, FileDownloadProcess>();

        /// <summary>
        /// 在Page_Load事件中增加额外的处理方法
        /// </summary>
        protected virtual void AddProcess() { }

        #region 方法

        /// <summary>
        /// 页面载入处理方法
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        protected virtual void Page_Load(object sender, EventArgs e)
        {
            using (var t1 = new Log4WebStandard.Tracker("Page_Load"))
            {
                this.Action = this.Request["action"];
                this.LoadBaseData();
                this.AddProcess();

                if (this.Request.HttpMethod.EqualWithTrim("GET")
                    && this.Action.IsNotNullOrEmpty())
                {
                    try
                    {
                        this.Authorize(this.Action);
                        using (var t2 = new Log4WebStandard.Tracker(this.Action))
                        {
                            if (this.Processor.Keys.Contains(this.Action))
                            {
                                this.Processor[this.Action]();
                            }
                            else if (this.FileDownloadProcessor.Keys.Contains(this.Action))
                            {
                                var file = this.FileDownloadProcessor[this.Action]();
                                this.DownloadFile(file.Item1, file.Item2);
                            }
                            else
                            {
                                //当处理器中没有相应Action的处理方法时提示参数错误
                                throw new System.Web.HttpException(400, "参数错误");
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        Log4WebStandard.LogManager.GetLogger(this.GetType()).Error(ex, ex.Message);
                        this.FlashMessage = HttpUtility.JavaScriptStringEncode(ex.Message);
                    }
                }
            }
        }

        /// <summary>
        /// 验证Processor相应的Action的权限
        /// </summary>
        /// <param name="action"></param>
        private void Authorize(string action)
        {
            var attr = this.Processor[action].Method
                .GetCustomAttributes(false)
                .OfType<AuthorizeAttribute>()
                .FirstOrDefault();
            if (attr != null)
            {
                if (!SccService.IsInRole(attr.Role, this.FunctionCode))
                {
                    //没有通过权限检查则跳转
                    throw new System.Web.HttpException(403, "没有权限，访问禁止");
                }
            }
        }

        /// <summary>
        /// 断言参数不为空，如果为空则跳到参数错误页
        /// </summary>
        /// <param name="parameters"></param>
        protected void AssertNoNull(params string[] parameters)
        {
            foreach (var p in parameters)
            {
                if (p.IsNullOrEmpty())
                    throw new System.Web.HttpException(400, "参数错误");
            }
        }

        /// <summary>
        /// 从Request对象中获取T类型数据
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <returns></returns>
        public T GetModelFromRequest<T>()
        {
            Dictionary<string, string> d = new Dictionary<string, string>();
            foreach (var k in this.Request.Form.AllKeys)
            {
                d.Add(k, this.Request.Form[k]);
            }

            foreach (var k in this.Request.Params.AllKeys)
            {
                d.Add(k, this.Request.Params[k]);
            }

            var t = JsonConvert.SerializeObject(d);

            return JsonConvert.DeserializeObject<T>(t);
        }

        /// <summary>
        /// 检查Session中是否存在指定的Key
        /// </summary>
        /// <param name="sessionName"></param>
        /// <returns></returns>
        public bool SessionIsNullOrEmpty(params string[] sessionName)
        {
            foreach (var name in sessionName)
            {
                if (this.Session[name] == null
                    || string.IsNullOrWhiteSpace(this.Session[name].ToString()))
                    return true;
            }

            return false;
        }

        /// <summary>
        /// 从配置文件中载入基本数据和初始化基本参数，并检验是否有权限访问
        /// </summary>
        /// <param name="functionID">web config 中功能Key</param>
        /// <param name="pageID"></param>
        /// <param name="functionName"></param>
        private void LoadBaseData()
        {
            //当前系统中的识别号
            this.SysID = ConfigurationManager.AppSettings["SysID"];
            this.SysCode = ConfigurationManager.AppSettings["SysCode"];
            if (String.IsNullOrEmpty(SysCode))
            {
                this.SysCode = SysID;
            }

            //菜单编号(在SBA数据库中生成的ID)
            this.LoadFunctionId();
            this.PageID = this.GetType().BaseType.Name;
            this.Debug = Tools.DataTypeConvertHelper.ToBoolean(ConfigurationManager.AppSettings["Debug"]);
            this.FunctionName = Commons.Language.GetText(this.FunctionID + ".Name", this.FunctionID);
            this.LanguageSourceType = Tools.ConfigHelper.GetConfigString("LanguageSourceType").ToUpper();

            //获取加密参数
            this.EncryptionParas = new Dictionary<string, string>();
            String paras = Tools.DataTypeConvertHelper.ToString(Request["paras"]);
            if (!String.IsNullOrEmpty(paras))
            {
                paras = Tools.DESEncrypt.Decrypt(paras);
                this.EncryptionParas = Tools.DataTypeConvertHelper.StringToDictionary(paras, '&', '=');
            }

            //验证是否有查看权限，查看为最基本权限
            if (SccService.Authorized()
                && SccService.IsInRole(SccService.Roles.View, this.FunctionCode))
            {
                //通过权限检查
                this.LangType = SccService.CurrentLanguageType;
                this.LoginUserID = SccService.CurrentUserId;
            }
            else
            {
               // throw new System.Web.HttpException(403, "没有权限，访问禁止");
            }
        }

        /// <summary>
        /// 此处主要是插入LangXML信息
        /// </summary>
        /// <param name="writer"></param>
        protected override void Render(HtmlTextWriter writer)
        {
            if (IsPostBack || IsCallback)
            {
                base.Render(writer);
            }
            else
            {
                using (var output = new StringWriter())
                {
                    base.Render(new HtmlTextWriter(output));
                    string outputAsString = output.ToString();
                    string langJs = Language.GetLanguageJavascript(this.PageID);
                    outputAsString = outputAsString.Replace("</head>", langJs + Environment.NewLine + "</head>");
                    writer.Write(outputAsString);
                }
            }
        }

        /// <summary>
        /// 提供文件给客户端下载
        /// </summary>
        /// <param name="fileContent"></param>
        /// <param name="fileName"></param>
        protected void DownloadFile(byte[] fileContent, string fileName)
        {
            if (fileContent == null) return;

            string filename = HttpUtility.UrlEncode(fileName).Replace('+', ' ');
            this.Response.Clear();
            this.Response.ContentType = "application/octet-stream; charset=utf-8";
            this.Response.AddHeader("content-disposition", "attachment;filename=" + filename);
            this.WriteStream(fileContent);
            this.Response.End();
        }

        /// <summary>
        /// 给Response对象写入流
        /// </summary>
        /// <param name="content"></param>
        private void WriteStream(byte[] content)
        {
            if (content == null) return;
            MemoryStream stream = new MemoryStream(content);
            if (stream != null)
            {
                const int buffersize = 1024 * 16;
                byte[] buffer = new byte[buffersize];
                int count = stream.Read(buffer, 0, buffersize);
                while (count > 0)
                {
                    this.Response.OutputStream.Write(buffer, 0, count);
                    count = stream.Read(buffer, 0, buffersize);
                }
            }
        }

        /// <summary>
        /// 初始化 FunctionID, FunctionCode
        /// </summary>
        private void LoadFunctionId()
        {
            if (this.FunctionCode.IsNullOrEmpty())
            {
                var sccFunAttr = this.GetType()
                    .GetCustomAttributes(typeof(SccFunctionAttribute), true)
                    .OfType<SccFunctionAttribute>()
                    .FirstOrDefault();

                if (sccFunAttr == null)
                {
                    var getFunctionIdFromRequestPath = SccService.GetFunctionId(this.Request.Path);
                    if (getFunctionIdFromRequestPath.IsNullOrEmpty())
                    {
                        throw new Exception(this.GetType().Name + " Class not defined SccFunction Attribute, Please check.");
                    }

                    this.FunctionID = getFunctionIdFromRequestPath;
                    this.FunctionCode = getFunctionIdFromRequestPath;
                }
                else
                {
                    this.FunctionID = sccFunAttr.WebConfigAppKey;
                    this.FunctionCode = ConfigurationManager.AppSettings[this.FunctionID];
                }
            }
        }

        #endregion 方法

        #region 公共属性

        public string SysID { get; set; }
        public string FunctionID { get; set; }
        public string PageID { get; set; }
        public string SysCode { get; set; }
        public string FunctionCode { get; set; }
        public bool Debug { get; set; }
        public string FunctionName { get; set; }
        public string LanguageSourceType { get; set; }
        public Dictionary<string, string> EncryptionParas { get; set; }
        public string Action { get; set; }
        public string LangType { get; set; }
        public string LoginUserID { get; set; }

        #endregion 公共属性
    }
}