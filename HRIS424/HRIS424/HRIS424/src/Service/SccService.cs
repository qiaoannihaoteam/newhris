/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Purpose      : 用户查询

 * Date         : 2016-12-06
 * Author       : Bruce Liao
 * Note         :
 *
 * 2016-12-06      Bruce Liao        the first version
 * 2017-04-21      Bruce Liao        增加方法：CheckUserHasAnyRightBySCC
 * 2017-06-14      Bruce Liao        在 UserTicketIsExists 方法中增加设置seesion langtype 的值，其实最好是增加一个httpmodule，在beginrequest之前的事件中做这件事
 * 2017-09-07      Bruce Liao        将 UserTicketIsExists 方法中设置Session langtype 的值移除，已改到httpmodule： BaseModule 中
 * 2017-11-14      Bruce Liao        加入Cache，提高访问速度
 *
 *      the latest update: 2017-11-14 10:50
*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

namespace HRIS424.src.Service
{
    using System;
    using System.Collections.Generic;
    using System.Configuration;
    using System.Data;
    using System.Data.SqlClient;
    using System.DirectoryServices;
    using System.Linq;
    using System.Web;
    using System.Web.Security;
    using CrystalGroup.Web.Utility;
    using Dapper;
    using Menus;
    using Tools = CrystalGroup.Web.Utility.Tools;

    /// <summary>
    /// SCC相关的方法，尽量避免修改
    /// </summary>
    public class SccService
    {
        // Roles: "Add", "App": Approve, "Delete", "Edit", "SetDeOp": Other

        /// <summary>
        /// SCC中权限字符的映射
        /// </summary>
        public struct Roles
        {
            public const string View = "View";
            public const string Add = "Add";
            public const string Approve = "App";
            public const string Delete = "Delete";
            public const string Edit = "Edit";
            public const string SetDeOp = "SetDeOp";
        }

        /// <summary>
        /// 对应SCC v_user_master_All
        /// </summary>
        public class UserInfo
        {
            public System.String info { get; set; }
            public System.String displayname { get; set; }
            public System.String Eng_Name { get; set; }
            public System.String Dept { get; set; }
            public System.String Dept_Desc { get; set; }
            public System.String mail { get; set; }
            public System.String mail_id { get; set; }
            public System.String dept_code { get; set; }
            public System.String sect_code { get; set; }
            public System.String line_code { get; set; }
            public System.String worker_type { get; set; }
            public System.String title_code { get; set; }
            public System.String grade_code { get; set; }
            public System.String Emp_no { get; set; }
            public System.String company_code { get; set; }
            public System.String Title { get; set; }
            public System.String Pwd { get; set; }
            public System.Boolean IsADUser { get; set; }
        }

        /// <summary>
        /// 对应数据库中User_Language
        /// </summary>
        public class UserLanguage
        {
            public System.String RID { get; set; }
            public System.String User_ID { get; set; }
            public System.String LanguageID { get; set; }
            public System.String CompanyCode { get; set; }
        }

        /// <summary>
        /// 对应数据库中Company
        /// </summary>
        public class Company
        {
            public System.String RID { get; set; }
            public System.String Company_Code { get; set; }
            public System.String Company_Name_CN { get; set; }
            public System.String Company_Name_EN { get; set; }
        }

        /// <summary>
        /// SCC菜单
        /// </summary>
        public class MenuItem
        {
            public string Sys_ID { get; set; }
            public string Fun_Name { get; set; }
            public string SelfID { get; set; }
            public string ParentID { get; set; }
            public string Par_Value { get; set; }
            public string Exe_Path { get; set; }
            public string Fun_Type { get; set; }
            public string OrderByID { get; set; }
            public string UserPars { get; set; }
        }

        /// <summary>
        /// 登录模型
        /// </summary>
        public class LoginModel
        {
            public string UserId { get; set; }
            public string Domain { get; set; }
            public string Language { get; set; }
            public UserInfo UserInfo { get; set; }
        }

        /// <summary>
        /// 获取 web config 中的 SysCode
        /// </summary>
        public static string SysCode
        {
            get
            {
                return Wrapper.Cache(() =>
                {
                    return ConfigurationManager.AppSettings["SysCode"].ToString2();
                });
            }
        }

        /// <summary>
        /// 从当前访问的票据中获取用户信息
        /// </summary>
        public static LoginModel CurrentUserInfo
        {
            get
            {
                try
                {
                    // 从缓存中获取
                    var cookieTicket = Tools.CookieHelper.GetCookie("UserTicket");

                    return Wrapper.Cache(() =>
                    {
                        if (cookieTicket.IsNotNullOrEmpty())
                        {
                            var decyptTicket = FormsAuthentication.Decrypt(cookieTicket);
                            if (decyptTicket != null)
                            {
                                var rst = Newtonsoft.Json.JsonConvert.DeserializeObject<LoginModel>(decyptTicket.UserData);
                                return rst;
                            }
                        }

                        return null;
                    }, cookieTicket);
                }
                catch
                {
                    return null;
                }
            }
        }

        /// <summary>
        /// 获取当前会话的用户ID
        /// </summary>
        public static string CurrentUserId
        {
            get
            {
                return CurrentUserInfo != null ? CurrentUserInfo.UserId : "";
            }
        }

        /// <summary>
        /// 当前用户的语言类别
        /// </summary>
        public static string CurrentLanguageType
        {
            get
            {
                return CurrentUserInfo != null ? CurrentUserInfo.Language : "CN";
            }
        }

        /// <summary>
        /// 检查当前用户是否通过登录验证
        /// 检查的原理，先检查cookie中是否有登录票据，有则表示已经通过登录检查，无则检查当前用户是否通过域环境验证，
        /// 如果通过域环境验证，则进一步检查是否已经在SCC中有分配权限，如果都通过则表示已经通过登录检查，并写入登录ticket到cookie中
        /// 否则，返回检查不通过，需要用户回到login页面登录
        /// </summary>
        /// <returns></returns>
        public static bool Authorized()
        {
            if (CurrentUserInfo != null)
            {
                // 已有登录ticket，表示已经通过登录检查
                return true;
            }
            else if (HttpContext.Current.User.Identity.IsAuthenticated)
            {
                // 通过域环境验证
                var user = HttpContext.Current.User;
                var userId = GetBaseUserId(user.Identity.Name);
                var domain = GetDomain(user.Identity.Name);
                // 检查SCC中是否有分配权限
                if (CheckUserHasAnyRightBySCC(userId))
                {
                    // SCC中有分配权限, 写入登录ticket到cookie
                    SaveAuthCookie(userId, domain, null);
                    return true;
                }
            }

            return false;
        }

        /// <summary>
        /// 检查用户是否有权限
        /// </summary>
        /// <param name="role">权限</param>
        /// <returns></returns>
        public static bool IsInRole(string role, string functionId)
        {
            return Wrapper.Cache(() =>
            {
                var a = role.Split(',');
                var b = SccService.GetRole(SccService.CurrentUserId, functionId);
                var rst = a.All(t => b.Contains(t));
                return rst;
            }, CurrentUserId, functionId, role);
        }

        /// <summary>
        /// 从SCC获取用户权限列表
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <param name="functionId">功能ID</param>
        /// <returns></returns>
        public static List<string> GetRole(string userId, string functionId)
        {
            return Wrapper.Cache(() =>
            {
                var rst = new List<string>();
                // 从SCC获取用户权限
                DataTable dtMenu = Menus.GetData.GetUserRightDtForFunction(functionId, userId);
                if (dtMenu != null && dtMenu.Rows.Count > 0)
                {
                    var rows = dtMenu.Select(string.Format("Sys_Id='{0}'", functionId));
                    var a = rows[0]["UserPars"].ToString().Split('~');
                    if (a != null && a.Length > 0)
                    {
                        foreach (var i in a)
                        {
                            var b = i.Split('=');
                            if (b.Length > 1 && b[1] == "1")
                            {
                                rst.Add(b[0]);
                            }
                        }
                    }
                }

                return rst;
            }, userId, functionId);
        }

        /// <summary>
        /// 验证用户名与密码，验证成功写入当前cookie并返回true
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <param name="domain">域</param>
        /// <param name="pwd">密码</param>
        /// <param name="language">语言</param>
        /// <returns></returns>
        public static bool CheckPassword(string userId, string domain, string pwd, string language)
        {
            return CheckPasswordBySCC(userId, domain, pwd, language)
                || CheckPasswordByAD(userId, domain, pwd, language);
        }

        /// <summary>
        /// 仅获取User Id（不包含域名）
        /// </summary>
        /// <param name="fullUserId"></param>
        /// <returns></returns>
        public static string GetBaseUserId(string fullUserId)
        {
            var sep = fullUserId.Split('\\');
            return sep.Length > 1 ? sep[1] : fullUserId;
        }

        /// <summary>
        /// 从用户名中获取域名
        /// </summary>
        /// <param name="fullUserId"></param>
        /// <returns></returns>
        public static string GetDomain(string fullUserId)
        {
            var sep = fullUserId.Split('\\');
            return sep.Length > 1 ? sep[0] : "";
        }

        /// <summary>
        /// 通过 request path 获取 scc FunctionId
        /// </summary>
        /// <param name="requestPath"></param>
        /// <returns></returns>
        public static string GetFunctionId(string requestPath)
        {
            return Wrapper.Cache(() =>
            {
                DataTable dtMenu = Wrapper.Cache(()
                    => Menus.GetData.GetUserRightDtForFunction(SysCode, CurrentUserId), SysCode, CurrentUserId);

                if (dtMenu != null && dtMenu.Rows.Count > 0)
                {
                    foreach (DataRow row in dtMenu.Rows)
                    {
                        var rowPath = row["Exe_Path"].ToString2();
                        rowPath = rowPath.Split('?')[0];
                        if (rowPath.IsNullOrEmpty()) continue;
                        if (requestPath.ToLower().Contains(rowPath.ToLower()))
                        {
                            return row["Sys_Id"].ToString2();
                        }
                    }
                }

                return "";
            }, requestPath, CurrentUserId);
        }

        /// <summary>
        /// 移除当前的登录凭证
        /// </summary>
        public static void ClearUserTicket()
        {
            Tools.CookieHelper.ClearCookie("UserTicket");
        }

        /// <summary>
        /// 检查用户在当前系统中是否有权限
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        public static bool CheckUserHasAnyRightBySCC(string userId)
        {
            bool rst = false;
            try
            {
                if (userId.IsNullOrEmpty())
                    throw new Exception("user id is empty");
                DataTable dt = GetData.GetUserRightDtForFunction(SysCode, userId);
                if (dt != null && dt.Rows.Count > 0 && dt.Select("Exe_Path <> ''").Count() > 0)
                    rst = true;
            }
            catch
            {
                throw;
            }

            return rst;
        }

        /// <summary>
        /// 通过SCC验证用户名与密码，验证成功返回true
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="domain"></param>
        /// <param name="pwd"></param>
        /// <returns></returns>
        private static bool CheckPasswordBySCC(string userId, string domain, string pwd, string language)
        {
            CrytoLongString Crypwd = new CrytoLongString();
            var enPwd = Crypwd.Encry(pwd);
            GetData GetDataInfo = new GetData();
            DataTable dtUser = GetDataInfo.GetUserID(userId, enPwd);
            if (dtUser != null && dtUser.Rows.Count > 0)
            {
                return true;
            }

            return false;
        }

        /// <summary>
        /// 通过AD验证用户名与密码
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="domain"></param>
        /// <param name="pwd"></param>
        /// <param name="language"></param>
        /// <returns></returns>
        private static bool CheckPasswordByAD(string userId, string domain, string pwd, string language)
        {
            string LDAPPath = "LDAP://" + domain;
            string domainAndUsername = domain + @"\" + userId;
            DirectoryEntry entry = new DirectoryEntry(LDAPPath,
                domainAndUsername,
                pwd);
            Object obj;

            try
            {
                // Bind to the native AdsObject to force authentication.
                obj = entry.NativeObject;
                return true;
            }
            catch
            {
                return false;
            }
            finally
            {
                entry = null;
                obj = null;
            }
        }

        /// <summary>
        /// 将用户信息写入用户cookie做票据
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="domain"></param>
        /// <param name="language"></param>
        public static void SaveAuthCookie(string userId, string domain, string language)
        {
            UserInfo userInfo = GetUserInfoFromSCC(userId);
            SaveLanguageInfo(userInfo, ref language);
            LoginModel model = new LoginModel
            {
                Domain = domain,
                Language = language,
                UserId = userId,
                UserInfo = userInfo
            };

            FormsAuthenticationTicket ticket = new FormsAuthenticationTicket(
                    1,
                    userId,
                    DateTime.Now,
                    DateTime.Now.AddDays(30),
                    true,
                    Newtonsoft.Json.JsonConvert.SerializeObject(model)
                );
            string encryptedTicket = FormsAuthentication.Encrypt(ticket);

            Tools.CookieHelper.SaveCookie("LangType", language, 0);
            Tools.CookieHelper.SaveCookie("UserTicket", encryptedTicket, 0);
        }

        /// <summary>
        /// 将用户选择的语言存入到数据库或从数据库取出用户的语言
        /// </summary>
        /// <param name="user"></param>
        /// <param name="language"></param>
        private static void SaveLanguageInfo(UserInfo user, ref string language)
        {
            if (user == null) return;
            UserLanguage languageInfo = GetUserLanguageByUserId(user.mail_id);
            if (language.IsNullOrEmpty())
            {
                language = languageInfo != null ? languageInfo.LanguageID : Tools.CookieHelper.GetCookie("LangType");
                language = language.IsNullOrEmpty() ? "CN" : language;
            }

            languageInfo = new UserLanguage { LanguageID = language, CompanyCode = user.company_code, User_ID = user.mail_id };
            if (languageInfo == null)
            {
                SaveUserLanguage(languageInfo);
            }
            else
            {
                UpdateUserLanguage(languageInfo);
            }
        }

        /// <summary>
        /// 从SCC 获取用户信息
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <returns></returns>
        private static UserInfo GetUserInfoFromSCC(string userId)
        {
            return Wrapper.Cache(() =>
            {
                using (var conn = new SqlConnection(Menus.MenuSQlHelper._DBConnectionString))
                {
                    return conn.Query<UserInfo>("Select * From v_user_master_All Where [mail_id]=@mail_id",
                            new { mail_id = userId }
                        ).FirstOrDefault();
                }
            });
        }

        /// <summary>
        /// 查询用户语言信息
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        public static UserLanguage GetUserLanguageByUserId(string userId)
        {
            return Wrapper.Cache(() =>
            {
                using (var conn = new SqlConnection(Commons.SQlHelper._DBConnectionString))
                {
                    var sql = @"
                    SELECT * FROM App_User_Language WHERE User_ID=@User_ID;
                    ";
                    return conn.Query<UserLanguage>(sql, new { User_ID = userId }).FirstOrDefault();
                }
            });
        }

        /// <summary>
        /// 保存用户语言信息
        /// </summary>
        /// <param name="userLanguage"></param>
        private static void SaveUserLanguage(UserLanguage userLanguage)
        {
            using (var conn = new SqlConnection(Commons.SQlHelper._DBConnectionString))
            {
                var sql = @"
                    INSERT INTO [dbo].[App_User_Language]([RID],[User_ID],[LanguageID],[CompanyCode])
                    VALUES(NEWID(), @User_ID, @LanguageID, @CompanyCode)
                    ";
                conn.Execute(sql, userLanguage);
            }
        }

        /// <summary>
        /// 更新用户语言信息
        /// </summary>
        /// <param name="userLanguage"></param>
        private static void UpdateUserLanguage(UserLanguage userLanguage)
        {
            using (var conn = new SqlConnection(Commons.SQlHelper._DBConnectionString))
            {
                var sql = @"
                    UPDATE [dbo].[App_User_Language] SET LanguageID=@LanguageID
                    WHERE User_ID=@User_ID ";
                conn.Execute(sql, userLanguage);
            }
        }

        /// <summary>
        /// 获取Company
        /// </summary>
        /// <param name="compCode">公司代码</param>
        /// <returns></returns>
        public static Company GetCompany(string compCode)
        {
            return Wrapper.Cache(() =>
            {
                using (var conn = new SqlConnection(Commons.SQlHelper._DBConnectionString))
                {
                    var sql = @"
                        SELECT * FROM App_Company WHERE Company_Code=@Company_Code;";

                    return conn.Query<Company>(sql, new { Company_Code = compCode }).FirstOrDefault();
                }
            }, compCode);
        }
    }
}