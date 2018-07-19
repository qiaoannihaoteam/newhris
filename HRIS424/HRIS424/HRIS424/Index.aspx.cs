/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Purpose      : 首页,读取菜单

 * Date         : 03 Sep 2016
 * Author       :
 * Note         :
 * -------------------------------------------------
 * 03 Sep 2016              the first version
 *      the latest update: 03 Sep 2016 17:18:37
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using Commons;
using CrystalGroup.Web.Utility;
using Menus;
using HRIS424.src.Service;
using Tools = CrystalGroup.Web.Utility.Tools;

namespace HRIS424.Web
{
    public partial class Index : System.Web.UI.Page
    {
        //语言
        public String LangType;

        public String LoginUserID;
        public String CompanyCode;

        //菜单编号(在SBA数据库中生成的ID)
        public String SysCode;

        public String FunctionCode;

        //当前系统中的识别号
        public String SysID;

        public String FunctionID;
        public String PageID;

        //后台执行所用时间
        public TimeSpan BlackRunTime;

        public DateTime StartTime;

        //访问量
        public bool Debug = false;

        public String LangXML = "";

        protected void Page_Load(object sender, EventArgs e)
        {
            StartTime = DateTime.Now;
            using (var t = new Log4WebStandard.Tracker("Page_Load"))
            {
                // 验证权限
                if (!SccService.Authorized())
                {
                    throw new System.Web.HttpException(401, "Auth Failed");
                }

                LoadBaseData();
                SetLangAttribute();

                GetMenu();

                lblLoginerName.Text = SccService.CurrentUserInfo.UserInfo.displayname;

                if (!String.IsNullOrEmpty(this.CompanyCode))
                {
                    var company = SccService.GetCompany(this.CompanyCode);
                    if (company != null)
                    {
                        lblComapnyName.Text = this.LangType.EqualWithTrim("CN") ?
                            company.Company_Name_CN.SafeTrim() :
                            company.Company_Name_EN.SafeTrim();
                    }
                    else
                    {
                        lblComapnyName.Text = this.CompanyCode;
                    }

                    CompanyGroup.Visible = true;
                }
            }
            TimeSpan BlackRunTime = DateTime.Now.Subtract(StartTime);
        }

        /// <summary>
        /// 获取菜单
        /// </summary>
        private void GetMenu()
        {
            DataTable DtTree = GetData.GetUserRightDtForFunction(SysCode, this.LoginUserID, this.LangType);
            //加密链接参数
            if (DtTree != null && DtTree.Rows.Count > 0)
            {
                foreach (DataRow row in DtTree.Rows)
                {
                    String EncryptPata = String.Empty;
                    String baseUrl = "";
                    String path = Tools.DataTypeConvertHelper.ToString(row["Exe_Path"]);
                    String urlparas = string.Empty;

                    if (!String.IsNullOrEmpty(path))
                    {
                        if (path.Contains("?") && !path.Contains("http:") && !path.Contains("?paras="))
                        {
                            urlparas = path.Substring(path.IndexOf("?") + 1).Replace("?", "&");
                            baseUrl = path.Substring(0, path.IndexOf("?"));

                            if (!String.IsNullOrEmpty(urlparas))
                            {
                                try
                                {
                                    EncryptPata = Tools.DESEncrypt.Encrypt(urlparas);
                                }
                                catch (Exception ex) { }
                            }

                            if (!String.IsNullOrEmpty(EncryptPata))
                            {
                                row["Exe_Path"] = baseUrl + "?paras=" + EncryptPata;
                            }
                        }

                        //row["UserPars"] = EncryptPata.Replace("~", "&");
                    }
                }
            }

            //转换成List
            List<SccService.MenuItem> menuList = (List<SccService.MenuItem>)Tools.ModelConvertHelper<SccService.MenuItem>.ConvertToModelList(DtTree);
            System.Web.Script.Serialization.JavaScriptSerializer serial = new System.Web.Script.Serialization.JavaScriptSerializer();
            string obj = serial.Serialize(menuList);
            ViewState["data"] = obj;
        }

        /// <summary>
        /// 初始化系统/页面基本信息
        /// </summary>
        public void LoadBaseData()
        {
            this.LangType = SccService.CurrentUserInfo.Language;
            this.LoginUserID = SccService.CurrentUserInfo.UserId;
            this.CompanyCode = SccService.CurrentUserInfo.UserInfo.company_code;

            //当前系统中的识别号
            this.SysID = ConfigurationManager.AppSettings["SysID"];
            this.FunctionID = "Home";
            this.PageID = "Index";

            //菜单编号(在SBA数据库中生成的ID)
            this.SysCode = ConfigurationManager.AppSettings["SysCode"];
            this.FunctionCode = ConfigurationManager.AppSettings["SysCode"];
            this.Debug = Tools.DataTypeConvertHelper.ToBoolean(ConfigurationManager.AppSettings["Debug"]);
        }

        /// <summary>
        /// 初始化语言属性
        /// </summary>
        public void SetLangAttribute()
        {
            LangXML = Language.GetXML(FunctionID + "." + PageID + ".HTMLControls");
        }
    }
}