/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Purpose      : gobal

 * Date         : 03 Sep 2016
 * Author       : Max Chen (ISD/CSC)
 * Note         :
 * -------------------------------------------------
 * 03 Sep 2016      Max Chen (ISD/CSC)        the first version
 *      the latest update: 03 Sep 2016 17:18:37
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

using System;
using System.Web;
using System.Web.Configuration;
using System.Linq;

namespace HRIS424.Web
{
    public class Global : System.Web.HttpApplication
    {
        private void Application_Start(object sender, EventArgs e)
        {
            // Code that runs on application startup
            log4net.Config.XmlConfigurator.Configure();
        }

        private void Application_End(object sender, EventArgs e)
        {
            //  Code that runs on application shutdown
        }

        private void Application_Error(object sender, EventArgs e)
        {
            Exception ex = HttpContext.Current.Server.GetLastError();
            log4net.LogManager.GetLogger(sender.GetType()).Error(ex.Message, ex);
            Log4WebStandard.LogManager.GetLogger(sender.GetType()).Error(ex, ex.Message);

            #region 跳转错误页面
            CustomErrorsSection ce = (CustomErrorsSection)WebConfigurationManager.GetSection("system.web/customErrors");
            string errorPage = ce.DefaultRedirect;

            if (ex is HttpException)
            {
                string errorCode = (ex as HttpException).GetHttpCode().ToString();
                if (ce.Errors.AllKeys.Contains(errorCode))
                    errorPage = ce.Errors.Get(errorCode).Redirect;
            }

            HttpContext.Current.Response.Redirect(errorPage);
            #endregion
        }

        private void Session_Start(object sender, EventArgs e)
        {
            // Code that runs when a new session is started
        }

        private void Session_End(object sender, EventArgs e)
        {
            // Code that runs when a session ends.
            // Note: The Session_End event is raised only when the sessionstate mode
            // is set to InProc in the Web.config file. If session mode is set to StateServer
            // or SQLServer, the event is not raised.
        }
    }
}