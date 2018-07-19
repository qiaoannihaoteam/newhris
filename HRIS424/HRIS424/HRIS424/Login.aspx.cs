/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Purpose      : 登录

 * Date         :
 * Author       :
 * Note         :
 * -------------------------------------------------
 * 03 Sep 2016              the first version
 * 07 Jun 2017              取消自动登录
 *      the latest update: 07 Jun 2017 11:18:37
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

using System;
using System.Configuration;
using Commons;
using CrystalGroup.Web.Utility;
using HRIS424.src.Service;
using Tools = CrystalGroup.Web.Utility.Tools;

namespace HRIS424.Web
{
    public partial class Login : System.Web.UI.Page
    {
        //语言
        public String LangType;

        //登录用户ID
        public String LoginUserID;

        public String CompanyCode;

        //菜单编号(在SCC数据库中生成的ID)
        public String SysCode;

        public String FunctionCode;

        //当前系统中的识别号
        public String SysID;

        public String FunctionID;
        public String PageID;

        //后台执行所用时间
        public TimeSpan BlackRunTime;

        public DateTime StartTime;

        //调试
        public bool Debug = false;

        //与前端交互的一次性的消息变量
        public string FlashMessage = string.Empty;

        public String LangXML = "";

        private String ReturnURL = string.Empty;
        private String Domain = String.Empty;
        private String Password = String.Empty;

        protected void Page_Load(object sender, EventArgs e)
        {
            using (var t = new Log4WebStandard.Tracker("Page_Load"))
            {
                LoadBaseData();

                if (this.Request.HttpMethod.EqualWithTrim("post"))
                {
                    this.TryLogin();
                }
            }
        }

        /// <summary>
        /// 初始化系统/页面基本信息
        /// </summary>
        public void LoadBaseData()
        {
            LangType = Tools.CookieHelper.GetCookie("LangType");
            LoginUserID = Tools.CookieHelper.GetCookie("LoginUserID");

            if (LangType.IsNullOrEmpty() && LoginUserID.IsNotNullOrEmpty())
            {
                var userLanguage = SccService.GetUserLanguageByUserId(LoginUserID);
                if (userLanguage != null)
                {
                    LangType = userLanguage.LanguageID;
                }
            }

            //当前系统中的识别号
            SysID = ConfigurationManager.AppSettings["SysID"];
            FunctionID = "Home";
            PageID = "Login";

            //菜单编号(在SBA数据库中生成的ID)
            SysCode = ConfigurationManager.AppSettings["SysCode"];
            FunctionCode = ConfigurationManager.AppSettings["SysCode"];

            //调试
            Debug = Tools.DataTypeConvertHelper.ToBoolean(ConfigurationManager.AppSettings["Debug"]);
        }

        /// <summary>
        /// 尝试登录
        /// </summary>
        protected void TryLogin()
        {
            string txtUserName = this.Request["user"];
            string txtPassword = this.Request["password"];
            string txtDomain = this.Request["domain"];
            string txtLanguageType = this.Request["language"];

            SavePostForm(txtUserName, txtDomain, txtLanguageType);

            if (txtUserName.IsNullOrEmpty())
            {
                this.FlashMessage = Language.GetText("Common.s_NotValidUserID",
                    "CN:请输入一个有效的用户ID！~EN:Sorry,the userid or password is not right!",
                    txtLanguageType);
                return;
            }

            if (txtPassword.IsNullOrEmpty())
            {
                this.FlashMessage = Language.GetText("Common.s_PleaseTypePassword",
                    "CN:请输入一个有效的密码！~EN:Please input a valid password!",
                    txtLanguageType);
                return;
            }

            txtDomain = txtDomain.IsNullOrEmpty() ? SccService.GetDomain(txtUserName) : txtDomain;
            txtUserName = SccService.GetBaseUserId(txtUserName);

            if (!SccService.CheckPassword(txtUserName, txtDomain, txtPassword, txtLanguageType))
            {
                this.FlashMessage = Language.GetText("Common.s_InvalidUserIdOrPassword",
                    "CN:用户名或密码不正确！~EN:User Name Or Password invalid!",
                    txtLanguageType);
                return;
            }

            if (SccService.CheckUserHasAnyRightBySCC(txtUserName))
            {
                SccService.SaveAuthCookie(txtUserName, txtDomain, txtLanguageType);
                Response.Redirect("Index.aspx");
            }
            else
            {
                this.FlashMessage = Language.GetText("Common.s_UserHasNoRightAccess",
                    "CN:您无权访问，请联系管理员设置权限！~EN:You are not authorized to access, please contact the administrator set permissions!",
                    txtLanguageType);
            }
        }

        private void SavePostForm(string txtUserName, string txtDomain, string txtLanguageType)
        {
            Tools.CookieHelper.SaveCookie("LangType", txtLanguageType, 30);
            Tools.CookieHelper.SaveCookie("Domain", txtDomain, 30);
            Tools.CookieHelper.SaveCookie("LoginUserID", txtUserName, 30);

            if (txtLanguageType.IsNotNullOrEmpty())
                this.LangType = txtLanguageType;
            if (txtUserName.IsNotNullOrEmpty())
                this.LoginUserID = txtUserName;
        }
    }
}