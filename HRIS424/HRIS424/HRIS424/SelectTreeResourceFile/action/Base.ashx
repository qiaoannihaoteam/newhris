<%@ WebHandler Language="C#" Class="Base" %>

using System;
using System.Web;
using System.Web.SessionState;
using System.Text;
using System.Data;
using System.Collections.Generic;

/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ 
 * Purpose     : 树形控件的相关操作
 * Date        : 27 Jul 2015 
 * Author      : Finn 
 * Note        : 
 * ------------------------------------------------- 
 * 27 Jul 2015       Finn        the first version
 *      the latest update: 2013-07-27 16:50 
 *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ 
 */


/// <summary>     
/// 树形控件的相关操作
/// </summary>
public class Base : IHttpHandler, IRequiresSessionState
{
    public string msg = "ok";
    public string txt = string.Empty;
    public string action = string.Empty,sql=string.Empty;
    string _result = "";
    public void ProcessRequest (HttpContext context) 
    {
        
        context.Response.ContentType = "text/plain";
        action = SelectTree.Tools.RequestHelper.GetRequest("action");        
        //SiteCMS.CommonClass.Admin AdminLogin = new SiteCMS.CommonClass.Admin();
        //SiteCMS.CommonClass.SystLog SystLog = new SiteCMS.CommonClass.SystLog();                        
        
        //if (!AdminLogin.CheckIsLogin())
        //{
        //    Yesina.Common.WebSet.ExecuteJs("parent.top.location='../Login.aspx';");
        //}
        //AdminLogin.Jurisdiction = AdminLogin.GetSingleInfo(AdminLogin.Id, "Jurisdiction");

        if (action.Equals("getdataJSON"))
        {
            string Rstr = string.Empty;
            string cls = SelectTree.Tools.RequestHelper.GetRequest("cls");
            string keywords = SelectTree.Tools.RequestHelper.GetRequest("keywords");
            //string id = SelectTree.Tools.RequestHelper.GetRequest("id");
            if (cls == "user")
            {
                Rstr = "[" +
                       "    { \"id\": \"1\", \"pId\": \"0\", \"text\": \"ISD\", \"value\": \"ISD\" }," +
                       "    { \"id\": \"11\", \"pId\": \"1\", \"text\": \"Finn He (ISD/CSC)\", \"value\": \"lwfhe\" }," +
                       "    { \"id\": \"12\", \"pId\": \"1\", \"text\": \"Dom Chen (ISD/CSC)\", \"value\": \"lwydchen\" }," +
                       "    { \"id\": \"13\", \"pId\": \"1\", \"text\": \"Andrew Zeng (ISD/CSC)\", \"value\": \"lwdyzeng\" }" +
                       "]";
            }
            else if (cls == "city")
            {
                if (keywords == "")
                {
                    Rstr = "[" +
                           "     { \"id\": \"lwfhe\", \"pId\": 0, \"text\": \"Finn He(ISD/CSC)\", \"value\": 5 }," +
                           "     { \"id\": \"lwfhe1\", \"pId\": 0, \"text\": \"Finn He1(ISD/CSC)\", \"value\": 51 }," +
                           "     { \"id\": \"lwfhe2\", \"pId\": 0, \"text\": \"Finn He2(ISD/CSC)\", \"value\": 52 }," +
                           "     { \"id\": \"lwfhe3\", \"pId\": 0, \"text\": \"Finn He3(ISD/CSC)\", \"value\": 53 }" +
                           "]";
                }
               
                
            }
            
            context.Response.Write("{\"msg\":\"" + msg + "\",\"dataJSON\":" + Rstr + "}");
                        
            
        }        
        else
        {
            context.Response.Write("{msg:'error'}");
        }

    }
        
                
    
    public bool IsReusable
    {
        get
        {
            return false;
        }
    }
         
}