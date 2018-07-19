/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Purpose      :
 * Date         : 2017-09-07
 * Author       : Bruce Liao
 * Note         :
 *
 * 2017-09-07      Bruce Liao        the first version
 *
 *      the latest update: 2017-09-07 10:08
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

using System;
using System.Web;
using Tools = CrystalGroup.Web.Utility.Tools;

public class BaseModule : IHttpModule
{
    public BaseModule()
    {
    }

    public void Dispose()
    {
    }

    public void Init(HttpApplication context)
    {
        context.PreRequestHandlerExecute += new EventHandler(context_PreRequestHandlerExecute);
    }

    /// <summary>
    /// 主要用于设置Session，此处主要用于设置语言类别
    /// </summary>
    /// <param name="sender"></param>
    /// <param name="e"></param>
    private void context_PreRequestHandlerExecute(object sender, EventArgs e)
    {
        HttpApplication app = sender as HttpApplication;
        HttpContext context = app.Context;
        if (context.Session != null)
        {
            context.Session["LangType"] = context.Session["LangType"] ?? Tools.CookieHelper.GetCookie("LangType");
        }
    }
}