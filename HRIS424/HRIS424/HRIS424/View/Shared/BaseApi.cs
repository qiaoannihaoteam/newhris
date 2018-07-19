/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Purpose      :
 * Date         : 2016-06-06
 * Author       : Bruce Liao
 * Note         :
 * -------------------------------------------------
 * 06 Jun 2016      Bruce Liao        the first version
 * 07 Sep 2017      Bruce Liao        增加继承IReadOnlySessionState，Ajax时由原来一次只能单个请求响应的阻塞模式变成一次多个请求响应的并发模式，以改善用户体验
 * 28 Feb 2018      Bruce Liao        增加 image, filedownload 的 Processor

 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

namespace HRIS424.View
{
    using System;
    using System.Collections.Generic;
    using System.Configuration;
    using System.IO;
    using System.Linq;
    using System.Web;
    using System.Web.SessionState;
    using CrystalGroup.Web.Utility;
    using Newtonsoft.Json;
    using src.Service;

    /// <summary>
    /// API的基类
    /// </summary>
    public abstract class BaseApi : IHttpHandler, IRequiresSessionState, IReadOnlySessionState
    {
        /// <summary>
        /// 当前会话的HttpContext
        /// </summary>
        protected HttpContext _ctx;

        /// <summary>
        /// API代理
        /// </summary>
        /// <returns></returns>
        protected delegate string JsonProcess();
        /// <summary>
        /// 返回图片的API代理
        /// </summary>
        /// <returns></returns>
        public delegate byte[] ImageProcess();
        /// <summary>
        /// 返回文件下载的API代理
        /// </summary>
        /// <returns></returns>
        public delegate Tuple<byte[], string> FileDownloadProcess();

        /// <summary>
        /// 所有的API处理字典, 所有Action字符串大小写敏感
        /// </summary>
        protected Dictionary<string, JsonProcess> JsonProcessor = new Dictionary<string, JsonProcess>();
        /// <summary>
        /// 返回图片的处理字典，Action大小写敏感
        /// </summary>
        protected Dictionary<string, ImageProcess> ImageProcessor = new Dictionary<string, ImageProcess>();
        /// <summary>
        /// 返回文件下载的处理字典，Action大小写敏感
        /// </summary>
        protected Dictionary<string, FileDownloadProcess> FileDownloadProcessor = new Dictionary<string, FileDownloadProcess>();

        /// <summary>
        /// 添加API处理方法到处理器字典
        /// </summary>
        protected abstract void AddProcess();

        /// <summary>
        /// API 入口方法
        /// </summary>
        /// <param name="context"></param>
        public virtual void ProcessRequest(HttpContext context)
        {
            this.LoadFunctionId();
            this._ctx = context;
            AjaxResult rst = new AjaxResult();
            string action = context.Request["action"];
            if (action.IsNotNullOrEmpty())
            {
                this.JsonProcessor.Push("ShowAllLock", this.GetAllLock)
                    .Push("Unlock", this.Unlock)
                    .Push("Lock", this.Lock);
                using (var t2 = new Log4WebStandard.Tracker(action))
                {
                    this.AddProcess();
                    //this.Authorize(action);
                    if (this.JsonProcessor.ContainsKey(action))
                    {
                        var json = this.JsonProcessor[action]();
                        this.ReturnJson(json);
                    }
                    else if (this.ImageProcessor.ContainsKey(action))
                    {
                        var image = this.ImageProcessor[action]();
                        this.ReturnImage(image);
                    }
                    else if (this.FileDownloadProcessor.ContainsKey(action))
                    {
                        var file = this.FileDownloadProcessor[action]();
                        this.DownloadFile(file.Item1, file.Item2);
                    }
                    else
                    {
                        rst = new AjaxResult { IsSuccess = false, Message = "Please send correct action" };
                        this.ReturnJson(JsonConvert.SerializeObject(rst));
                    }
                }
            }
        }

        /// <summary>
        /// 初始化 FunctionID
        /// </summary>
        private void LoadFunctionId()
        {
            if (this.FunctionID.IsNullOrEmpty())
            {
                var sccFunAttr = this.GetType()
                    .GetCustomAttributes(typeof(SccFunctionAttribute), false)
                    .OfType<SccFunctionAttribute>()
                    .FirstOrDefault();
                if (sccFunAttr == null)
                    throw new Exception(this.GetType().Name + " Class not defined SccFunction Attribute, Please check.");

                this.FunctionID = sccFunAttr.WebConfigAppKey;
            }

            this.FunctionCode = ConfigurationManager.AppSettings[this.FunctionID];
        }

        /// <summary>
        /// 获取所有上锁的数据
        /// </summary>
        /// <returns></returns>
        private string GetAllLock()
        {
            return JsonConvert.SerializeObject(GlobalService.LockList);
        }

        /// <summary>
        /// 解锁
        /// </summary>
        /// <returns></returns>
        private string Unlock()
        {
            var lockKey = this._ctx.Request["key"];
            if (lockKey.IsNullOrEmpty())
                return "Please send the lock key";
            GlobalService.Unlock(lockKey);
            return "OK";
        }

        /// <summary>
        /// 上锁
        /// </summary>
        /// <returns></returns>
        private string Lock()
        {
            var data = this.GetModelFromRequest<LockParameter>();
            if (data != null && data.Action.EqualWithTrim("edit"))
            {
                try
                {
                    GlobalService.SetLock(data.RID, data.Minutes);
                    return "OK";
                }
                catch (Exception ex)
                {
                    return ex.Message;
                }
            }

            return "Please post lock data";
        }

        /// <summary>
        /// 从Request Form 中获取 'model' 参数中的值并转为某类型
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <returns></returns>
        protected T GetModelFromRequest<T>(string requestName = "model")
        {
            return this.GetModelsFromRequest<T>(requestName);
        }

        /// <summary>
        /// 从request form中获取 'models'参数中的值并转为某类型
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <returns></returns>
        protected T GetModelsFromRequest<T>(string requestName = "models")
        {
            if (this._ctx.Request.Form == null
                || this._ctx.Request.Form[requestName] == null)
                return default(T);
            try
            {
                var reqData = this._ctx.Request.Form[requestName];
                reqData = reqData.Replace("\"$id\"", "\"id\"");
                return JsonConvert.DeserializeObject<T>(reqData);
            }
            catch
            {
                return default(T);
            }
        }

        /// <summary>
        /// 返回Json字串
        /// </summary>
        /// <param name="json"></param>
        protected void ReturnJson(string json)
        {
            string isFormat = this._ctx.Request["print"].ToString2();
            this._ctx.Response.ContentType = "text/plain";
            if (isFormat.IsNullOrEmpty())
                this._ctx.Response.Write(json);
            else
                this._ctx.Response.Write(json.PrettyPrintJson());
            this._ctx.Response.End();
        }

        /// <summary>
        /// 返回图片
        /// </summary>
        /// <param name="image"></param>
        protected void ReturnImage(byte[] image)
        {
            if (image == null) return;

            this._ctx.Response.Clear();
            this._ctx.Response.ContentType = "image/jpeg";
            this.WriteStream(image);
            this._ctx.Response.End();
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
            this._ctx.Response.Clear();
            this._ctx.Response.ContentType = "application/octet-stream; charset=utf-8";
            this._ctx.Response.AddHeader("content-disposition", "attachment;filename=" + filename);
            this.WriteStream(fileContent);
            this._ctx.Response.End();
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
                    this._ctx.Response.OutputStream.Write(buffer, 0, count);
                    count = stream.Read(buffer, 0, buffersize);
                }
            }
        }

        /// <summary>
        /// 权限验证
        /// </summary>
        /// <param name="action"></param>
        private void Authorize(string action)
        {
            if (this.JsonProcessor.ContainsKey(action)
                || this.ImageProcessor.ContainsKey(action)
                || this.FileDownloadProcessor.ContainsKey(action)
                )
            {
                System.Reflection.MethodInfo methodInfo = this.JsonProcessor.ContainsKey(action)
                    ? this.JsonProcessor[action].Method
                    : this.ImageProcessor.ContainsKey(action)
                        ? this.ImageProcessor[action].Method
                        : this.FileDownloadProcessor[action].Method;

                var attr = methodInfo.GetCustomAttributes(false).OfType<AuthorizeAttribute>().FirstOrDefault();
                if (attr != null)
                {
                    if (SccService.Authorized()
                        && SccService.IsInRole(attr.Role, this.FunctionCode))
                    {
                        //通过权限检查
                    }
                    else
                    {
                        this.ReturnJson(JsonConvert.SerializeObject(new AjaxResult
                        {
                            Message = Commons.Language.GetText("UnAuthorized",
                                        "CN:你无权访问！~EN:UnAuthorized",
                                        SccService.CurrentLanguageType),
                            IsSuccess = false
                        }));
                    }
                }
            }
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }

        public string FunctionID { get; set; }
        public string FunctionCode { get; set; }
    }

    /// <summary>
    /// Ajax 返回对象
    /// </summary>
    public class AjaxResult
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; }
        public object Data { get; set; }

        public AjaxResult()
        {
            this.IsSuccess = true;
            this.Message = "OK";
        }
    }

    /// <summary>
    /// 加锁时前台返回的对象
    /// </summary>
    public class LockParameter
    {
        public string RID { get; set; }
        public string Action { get; set; }
        public int Minutes { get; set; }
    }

    /// <summary>
    /// 权限标识
    /// </summary>
    [AttributeUsage(AttributeTargets.Method)]
    public class AuthorizeAttribute : Attribute
    {
        /// <summary>
        /// 权限列表，逗号分隔
        /// </summary>
        public string Role { get; set; }
    }

    /// <summary>
    /// 定义页面对应SCC中哪个Function
    /// </summary>
    [AttributeUsage(AttributeTargets.Class)]
    public class SccFunctionAttribute : Attribute
    {
        /// <summary>
        /// Web Config appSettings 中的Key, 其 Value 对应于 SCC 中Function Id
        /// </summary>
        public string WebConfigAppKey { get; set; }
    }
}