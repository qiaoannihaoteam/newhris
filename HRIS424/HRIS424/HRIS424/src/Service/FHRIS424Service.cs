

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* Purpose      : FHRIS424的Service
* Date         : 17 Jul 2018 
* Author       : Eva Liao (ISD/CSC)
* Note         : 
* -------------------------------------------------
* 17 Jul 2018	Eva Liao (ISD/CSC)	the first version
*
*	the latest update: 17 Jul 2018 11:02
*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

namespace CrystalISD.src.Service
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using CrystalGroup.Web.Utility;
    using Newtonsoft.Json;
    // using Database;
    using HRIS424.src.Database;
    using HRIS424.src.Service;
    using System.Data.SqlClient;
    using System.Data;
    using Commons;
    using System.Reflection;
    using Crystal.Demo.src.ViewModel;
    using System.Web;

    public class FHRIS424Service
    {
        public static object SelectTree { get; private set; }

        public class CostPers
        {
            public List<Cost_Per> CostPerList { get; set; }
            public String[] DeleteList { get; set; }
        }

        //查询条件
        public class Cost_PerCondition
        {

            public string Emp_No { get; set; }

            public string Sect_RID_Value { get; set; }
            public string Effect_DateFrom { get; set; }
            public string Effect_DateTo { get; set; }

            public string Customer_id { get; set; }
            public string Cost_Ratio { get; set; }
            public string CheckDate { get; set; }
            public bool? ActiveVal { get; set; }

        }

        /// <summary>
        /// 获取或者保存多语言信息，英文不写默认使用中文做英文
        /// </summary>
        /// <param name="chinese">中文信息</param>
        /// <param name="english">英文信息</param>
        /// <returns></returns>
        private static string GetOrSetLanguage(string chinese, string english = "")
        {
            var txt = string.Format("CN:{0}~EN:{1}", chinese, english.IsNullOrEmpty() ? chinese : english);

            return Commons.Language.GetText(string.Format("Service.FHRIS424Service.ErrorMsg.{0}", txt.GetMD5Code()), txt);
        }


        /// <summary>
        /// 获取费用分配数据
        /// </summary>
        /// <param name="total"></param>
        /// <param name="pageIndex"></param>
        /// <param name="pageSize"></param>
        /// <param name="condition"></param>
        /// <param name="sortSql"></param>
        /// <param name="DataID"></param>
        /// <returns></returns>
        public static DataTable GetDataTable(out int total, int pageIndex, int pageSize, Cost_PerCondition condition, string sortSql, string DataID = null)
        {
            DataTable dt = null;
            int CurrorPage, PageSize;
            string SortStr;
            if (pageIndex != 0)
            {
                CurrorPage = pageIndex;
                PageSize = pageSize;
            }
            else
            {
                CurrorPage = 1;
                PageSize = 99999999;
            }

            SortStr = sortSql;
            total = 0;
            dt = FindByPage(CurrorPage, PageSize, out total, SortStr, condition, DataID);

            return dt;
        }


        /// <summary>
        /// 获取费用分配数据底层调用
        /// </summary>
        /// <param name="CurrorPage"></param>
        /// <param name="PageSize"></param>
        /// <param name="Total"></param>
        /// <param name="sortStr"></param>
        /// <param name="condition"></param>
        /// <param name="DataID"></param>
        /// <returns></returns>
        public static DataTable FindByPage(int CurrorPage, int PageSize, out int Total, string sortStr, Cost_PerCondition condition, string DataID = null)
        {
            SqlParameter[] sqlParas = new SqlParameter[] {
                 new SqlParameter("@SourceID ",SqlDbType.VarChar,100)
                ,new SqlParameter("@LangType",SqlDbType.VarChar,20)
                ,new SqlParameter("@Sect_RID",SqlDbType.VarChar,50)
                ,new SqlParameter("@Emp_No",SqlDbType.VarChar,10)
                ,new SqlParameter("@Effect_Date",SqlDbType.VarChar,20)
                ,new SqlParameter("@Effect_Date_To",SqlDbType.VarChar,20)
                ,new SqlParameter("@CursorPage",SqlDbType.Int)
                ,new SqlParameter("@PageSize",SqlDbType.Int)
                ,new SqlParameter("@SortStr",SqlDbType.NVarChar,200)
                ,new SqlParameter("@DataID",SqlDbType.VarChar,50)
                ,new SqlParameter("@CheckDate",SqlDbType.VarChar,20)
                ,new SqlParameter("@ActiveVal",SqlDbType.VarChar,10)
                };

            sqlParas[0].Value = "getPagerData";
            sqlParas[1].Value = "CN";// LangType;
            sqlParas[2].Value = condition.Sect_RID_Value;// this.SelectTree.GetItem("value");
            sqlParas[3].Value = condition.Emp_No;
            sqlParas[4].Value = condition.Effect_DateFrom;
            sqlParas[5].Value = condition.Effect_DateTo;
            sqlParas[6].Value = CurrorPage;
            sqlParas[7].Value = PageSize;
            sqlParas[8].Value = sortStr;
            sqlParas[9].Value = DataID;
            sqlParas[10].Value = condition.CheckDate;
            sqlParas[11].Value = condition.ActiveVal;
            DataSet ds = SQlHelper.ExecuteToDataSet("p_HRIS424SearchData", CommandType.StoredProcedure, sqlParas);
            DataTable dt = ds.Tables[1];
            Total = Convert.ToInt32(ds.Tables[0].Rows[0][0]);
            return dt;
        }

        /// <summary>
        /// 浏览页获取数据
        /// </summary>
        /// <param name="condition"></param>
        /// <returns></returns>
        public static List<Cost_Per_ViewModel> Search(Cost_PerCondition condition)
        {

            int total = 0;
            return ConvertToModel<Cost_Per_ViewModel>(GetDataTable(out total, 0, 30, condition, "Effect_Date Desc"));
        }


        /// <summary>
        /// 编辑查看页，获取数据
        /// </summary>
        /// <param name="key"></param>
        /// <returns></returns>
        public static Cost_Per Get(string key)
        {
            using (var db = new DB())
            {
                var rst = GlobalService.GetTempData<Cost_Per>(key);
                return rst;
            }
        }

        /// <summary>
        /// 页面打开时创建本页面会话数据
        /// </summary>
        /// <param name="key"></param>
        /// <param name="guid"></param>
        /// <returns></returns>
        public static Cost_Per Get(string key, out string guid)
        {
            using (var db = new DB())
            {
                Cost_Per rst = null;
                guid = Guid.NewGuid().ToString();

                if (key.IsNullOrEmpty())
                {
                    // 新增
                    rst = new Cost_Per();
                }
                else
                {
                    // 编辑，查看等
                    rst = db.Cost_Per.FirstOrDefault(t => t.RID == key);
                }

                // 将数据保存到临时表中
                GlobalService.SetTempData(guid, rst);
                return rst;
            }
        }

        /// <summary>
        /// copy
        /// </summary>
        /// <param name="key"></param>
        /// <returns></returns>
        public static Cost_Per Copy(string key, out string guid)
        {
            using (var db = new DB())
            {
                var rst = db.Cost_Per.FirstOrDefault(t => t.RID == key);
                // TODO:修改原始中的一些值
                rst.RID = Guid.NewGuid().ToString();

                guid = Guid.NewGuid().ToString();
                GlobalService.SetTempData(guid, rst);
                return rst;
            }
        }

        /// <summary>
        /// 更新
        /// </summary>
        /// <param name="model"></param>
        public static Cost_Per Update(string key, Cost_Per model)
        {
            return Save(key, model);
        }

        /// <summary>
        /// 批量更新
        /// </summary>
        /// <param name="model"></param>
        public static String UpdateAll(CostPers all)
        {
            String[] deleteArray = all.DeleteList;
            String message_Delete = "";
            String message_Update = "";
            String message = "";
            using (var db = new DB())
            {
                //检查要删除的数据是否已被使用
                foreach (String rid in deleteArray)
                {
                    var rst = db.Cost_Per.FirstOrDefault(t => t.RID == rid);
                    if (rst != null)
                    {
                        message_Delete += isDataUsed(rst);
                    }
                }


                //检查RID重复
                var dupRID =
                all.CostPerList
                   .GroupBy(x => x.RID)
                   .Where(x => x.Count() > 1);
                foreach (var ctg in dupRID)
                {
                    message_Update += String.Format("{0} repeated: {0} \"" + ctg.Key + "\".\n", Commons.Language.GetText("HRIS424.Service.RID_text", "CN:RID~EN:RID"));
                }


                //检查要新增的记录是否合法
                foreach (Cost_Per rst in all.CostPerList)
                {
                    message_Update += isDataUsed(rst, "upd");
                    message_Update += Validate(rst, all.CostPerList);
                }

                if (message_Delete.IsNotNullOrEmpty())
                {
                    message += "Delete Error:\n" + message_Delete + "\n";
                }

                if (message_Update.IsNotNullOrEmpty())
                {
                    message += "Update Error:\n" + message_Update;
                }

                if (message.IsNotNullOrEmpty())
                {
                    throw new Exception(message);
                }
                else
                {
                    //删除
                    foreach (String rid in deleteArray)
                    {
                        var rst = db.Cost_Per.FirstOrDefault(t => t.RID == rid);
                        if (rst != null)
                        {
                            try
                            {
                                Delete(rid, false);
                            }
                            catch (Exception e)
                            {
                                message += e.Message;
                            }
                        }
                    }
                    //更新

                    foreach (var item in all.CostPerList)
                    {
                        if (item.RID == null || item.RID.Equals(""))
                        {
                            //为新增的记录的RID赋值
                            item.RID = Guid.NewGuid().ToString();
                        }
                    }
                    db.Cost_Per.AddOrUpdateExtension(all.CostPerList);

                    if (message.IsNotNullOrEmpty())
                    {
                        throw new Exception(message);
                    }
                    else
                    {
                        db.SaveChangesAndWriteLog();
                    }
                }
            }
            return message;
        }

        /// <summary>
        /// 删除
        /// </summary>
        /// <param name="rid"></param>
        public static void Delete(string rid, Boolean isNeedValidate)
        {
            using (var db = new DB())
            {
                var rst = db.Cost_Per.FirstOrDefault(t => t.RID == rid);
                if (rst != null)
                {
                    if (isNeedValidate)
                    {
                        var msg = isDataUsed(rst);
                        if (msg.IsNotNullOrEmpty())
                        {
                            throw new Exception(msg);
                        }
                    }
                    db.Cost_Per.Remove(rst);
                    db.SaveChangesAndWriteLog();
                }
            }
        }

        /// <summary>
        /// 检查数据是否正确
        /// </summary>
        /// <param name="model"></param>
        private static String Validate(Cost_Per model, List<Cost_Per> DataList = null)
        {
            var msg = "";
            //TODO: 检查各字段是否正确
            //TODO: Primary Key重复性检查
            using (var db = new DB())
            {

                //检查RID重复		
                var dupRID = db.Cost_Per.FirstOrDefault(t => t.RID == model.RID && t.RID != model.RID);
                if (dupRID != null)
                {
                    /*
                    判断该条重复记录是否在本批更新的记录内，倘若在本批更新内，则放行
                    （例如：本批更新里a记录的key1与当前数据库里b的key1相同，b也在本批更新内,但前面的处理已经可以防止本批更新“内”存在重复记录,故本批更新里a.key1!=b.key1,更新完成不会导致重复）
                     */
                    if (!CheckInList(dupRID, DataList))
                    {
                        //msg += Commons.Language.GetText("HRIS424.Service.RID_text", "CN:RID~EN:RID")+" \"" + model.RID + "\" is already exists!\n";
                        msg += (string.Format(Commons.Language.GetText("HRIS424.Service.RID_Repeated", "CN:RID“{0}”已经存在！~EN:RID\"{0}\" is already exists!"), model.RID) + "\n");
                    }
                }


            }
            // 检查字符字段是否超出长度
            msg += model.AssertStringFieldNotExceedLength();
            return msg;
        }


        /// <summary>
        /// 判断某记录是否存在于某记录集合内（根据RID判断）
        /// </summary>
        /// <param name="model"></param>
        public static Boolean CheckInList(Cost_Per rst, List<Cost_Per> DataList)
        {
            Boolean isExist = false;
            if (DataList != null)
            {
                var a = DataList.FirstOrDefault(x => x.RID == rst.RID);
                if (a != null)
                {
                    isExist = true;
                }
            }
            return isExist;
        }



        /// <summary>
        /// 检查数据是否被使用（既然是Mst表，已经被使用了，该记录就不允许删除或修改与其他表有关联的字段）
        /// </summary>
        /// <param name="model"></param>
        private static String isDataUsed(Cost_Per rst, String type = "dlt")
        {
            var msg = "";
            /*            using (var db = new DB())
                        {			
                            if ()
                            {
                                if (type.Equals("dlt"))
                                {
                                    msg += "Can not delete RID \"" + rst.RID + "\",because it has been used!\n";
                                }
                                else
                                {
                                                        Cost_Per h = null;

                                }
                            }

                        }
            */
            return msg;
        }



        /// <summary>
        /// 保存数据
        /// </summary>
        /// <param name="key"></param>
        /// <param name="model"></param>
        /// <returns></returns>
        private static Cost_Per Save(string key, Cost_Per model)
        {
            // 先将前台传来的数据保存到临时表
            GlobalService.SetTempData(key, model);
            var msg0 = isDataUsed(model, "upd");
            if (msg0.IsNotNullOrEmpty())
            {
                throw new Exception(msg0);
            }
            var msg = Validate(model);
            if (msg.IsNotNullOrEmpty())
            {
                throw new Exception(msg);
            }
            using (var db = new DB())
            {
                db.Cost_Per.AddOrUpdateExtension(model);
                db.SaveChangesAndWriteLog();
                return model;
            }
        }

        /// <summary>
        /// 把datatable转成list
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="dt"></param>
        /// <returns></returns>
        private static List<T> ConvertToModel<T>(DataTable dt) where T : class, new()
        {
            // 定义集合    
            List<T> ts = new List<T>();

            // 获得此模型的类型   
            Type type = typeof(T);
            string tempName = "";

            foreach (DataRow dr in dt.Rows)
            {
                T t = new T();
                // 获得此模型的公共属性      
                PropertyInfo[] propertys = t.GetType().GetProperties();
                foreach (PropertyInfo pi in propertys)
                {
                    tempName = pi.Name;  // 检查DataTable是否包含此列    

                    if (dt.Columns.Contains(tempName))
                    {
                        // 判断此属性是否有Setter      
                        if (!pi.CanWrite) continue;

                        object value = dr[tempName];
                        if (value != DBNull.Value)
                        {
                            if (pi.PropertyType.Name.Contains("DateTime"))
                            {
                                value = DateTime.Parse(value.ToString());
                            }
                            pi.SetValue(t, value, null);
                        }
                    }
                }
                ts.Add(t);
            }
            return ts;
        }

        /// <summary>
        /// 获取组织架构的
        /// </summary>
        /// <param name="httpContext"></param>
        /// <returns></returns>
        public static string GetSectTreeData(HttpContext httpContext)
        {
            string msg = "ok";
            string Rstr = string.Empty;
            string keywords = httpContext.Request["keywords"];// SelectTree.Tools.RequestHelper.GetRequest("keywords");

            String pid = httpContext.Request["pid"];// SelectTree.Tools.RequestHelper.GetRequest("pid");
            String action = httpContext.Request["treeAction"];// SelectTree.Tools.RequestHelper.GetRequest("action");//为getchild时表示需要获取pid对应的子节点

            SqlParameter[] sqlParas = new SqlParameter[] {
                           new SqlParameter("@SourceID",SqlDbType.VarChar,50)
                           ,new SqlParameter("@ParentRID",SqlDbType.VarChar,50)
                           ,new SqlParameter("@TextInput",SqlDbType.NVarChar,100)
                        };

            if (!String.IsNullOrEmpty(pid))//如果是点击树形控件的加号,异步查询子节点
            {
                sqlParas[0].Value = "AjaxGetTreeDataByParentRID";
                sqlParas[1].Value = pid;
                sqlParas[2].Value = "";
                DataTable dt = SQlHelper.ExecuteToDataTable("p_AjaxGetOrgTreeData", CommandType.StoredProcedure, sqlParas);
                Rstr += JsonConvert.SerializeObject(dt);//SelectTree.Tools.JsonHelper.ToJson(dt);
            }
            else
            {
                if (String.IsNullOrEmpty(keywords))//如果文本框没有输入值,则加载默认数据
                {
                    sqlParas[0].Value = "AjaxGetTreeDataDefault";
                    sqlParas[1].Value = "";
                    sqlParas[2].Value = "";
                    DataTable dt = SQlHelper.ExecuteToDataTable("p_AjaxGetOrgTreeData", CommandType.StoredProcedure, sqlParas);
                    Rstr += JsonConvert.SerializeObject(dt);//SelectTree.Tools.JsonHelper.ToJson(dt);
                }
                else//按输入文本框内容检索
                {
                    sqlParas[0].Value = "AjaxGetTreeDataByText";
                    sqlParas[1].Value = "";
                    sqlParas[2].Value = keywords;
                    DataTable dt = SQlHelper.ExecuteToDataTable("p_AjaxGetOrgTreeData", CommandType.StoredProcedure, sqlParas);
                    Rstr += JsonConvert.SerializeObject(dt);// SelectTree.Tools.JsonHelper.ToJson(dt);
                }
            }
            return "{\"msg\":\"" + msg + "\",\"dataJSON\":" + Rstr + "}";

        }

        /// <summary>
        /// 从工号得到员工信息
        /// </summary>
        /// <param name="httpContext"></param>
        /// <returns></returns>
        public static string GetEmpInfoByEmp_No(HttpContext httpContext)
        {
            String keyword = httpContext.Request["keyword"];
            string sJSON2 = String.Empty;
            SqlParameter[] sqlParas = new SqlParameter[] {
                       new SqlParameter("@SourceID",SqlDbType.VarChar,100)
                       ,new SqlParameter("@LangType",SqlDbType.VarChar,20)
                       ,new SqlParameter("@Keyword",SqlDbType.NVarChar,200)
                       ,new SqlParameter("@Keyword1",SqlDbType.NVarChar,200)
                       ,new SqlParameter("@Keyword2",SqlDbType.NVarChar,200)
                       ,new SqlParameter("@Keyword3",SqlDbType.NVarChar,200)
                       ,new SqlParameter("@Keyword4",SqlDbType.NVarChar,200)
                       ,new SqlParameter("@Keyword5",SqlDbType.NVarChar,200)
                   };
            sqlParas[0].Value = "CostPercombbEmpNo_Search";
            sqlParas[1].Value = httpContext.Session["LangType"] ?? "";
            sqlParas[2].Value = keyword;
            DataSet dt = SQlHelper.ExecuteToDataSet("p_HRIS424ControlDataSource", CommandType.StoredProcedure, sqlParas);
            sJSON2 = JsonConvert.SerializeObject(dt.Tables[0]);
            return sJSON2;
        }

        /// <summary>
        /// 从工号得到组织架构和职位
        /// </summary>
        /// <param name="httpContext"></param>
        /// <returns></returns>
        public static string GetorganizationLevelEmp_No(HttpContext httpContext)
        {
            String keyword = httpContext.Request["keyword"];
            string sJSON2 = String.Empty;
            SqlParameter[] sqlParas = new SqlParameter[] {
                       new SqlParameter("@SourceID",SqlDbType.VarChar,100)
                       ,new SqlParameter("@LangType",SqlDbType.VarChar,20)
                       ,new SqlParameter("@Keyword",SqlDbType.NVarChar,200)
                       ,new SqlParameter("@Keyword1",SqlDbType.NVarChar,200)
                       ,new SqlParameter("@Keyword2",SqlDbType.NVarChar,200)
                       ,new SqlParameter("@Keyword3",SqlDbType.NVarChar,200)
                       ,new SqlParameter("@Keyword4",SqlDbType.NVarChar,200)
                       ,new SqlParameter("@Keyword5",SqlDbType.NVarChar,200)
                   };
            sqlParas[0].Value = "GetorganizationLevelEmp_No";
            sqlParas[1].Value = httpContext.Session["LangType"] ?? "";
            sqlParas[2].Value = keyword;
            DataSet dt = SQlHelper.ExecuteToDataSet("p_HRIS424ControlDataSource", CommandType.StoredProcedure, sqlParas);
            sJSON2 = JsonConvert.SerializeObject(dt.Tables[0]);
            return sJSON2;
        }


        /*如果有下拉框，可以用下面的代码获取需要的数据源，请根据实际需要进行处理
                /// <summary>
                /// 获取Category数据
                /// </summary>
                /// <returns></returns>

                public static String GetCategory()
                {
                    object result;
                    DB db = new DB();
                    result =
                    db.Mst_Category
                      .AsNoTracking()
                      .OrderBy(x => x.SeqNo)
                      .Select(x => new
                      {
                          code = x.Category,
                          desc_en = x.Category_Desc_EN,
                          desc_cn = x.Category_Desc
                      })
                      .ToList();
                    return JsonConvert.SerializeObject(result);
                }
        */


    }
}