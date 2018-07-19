
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* Purpose      : ActionLog的Service
* Date         : 16 Feb 2017 
* Author       : KT Chen (ISD/CSC)
* Note         : 
* -------------------------------------------------
* 16 Feb 2017      KT Chen (ISD/CSC)        the first version
*      the latest update: 16 Feb 2017 18:36
*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/


namespace HRIS424.src.Service
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using CrystalGroup.Web.Utility;
    using Newtonsoft.Json;
    using Database;
    using Commons;

    public class ActionLogService
    {

        public static object Empty = new object[0];
        /// <summary>
        /// 获取或者保存多语言信息，英文不写默认使用中文做英文
        /// </summary>
        /// <param name="chinese">中文信息</param>
        /// <param name="english">英文信息</param>
        /// <returns></returns>
        private static string GetOrSetLanguage(string chinese, string english = "")
        {
            var txt = string.Format("CN:{0}~EN:{1}", chinese, english.IsNullOrEmpty() ? chinese : english);

            return Commons.Language.GetText(string.Format("Service.ActionLogService.ErrorMsg.{0}", txt.GetMD5Code()), txt);
        }

        /// <summary>
        /// 浏览页获取数据
        /// </summary>
        /// <param name="condition"></param>
        /// <returns></returns>
        public static object Search(string RID, string table, Boolean IsShowAll)
        {
            //string sqlText =
            //            @"
            //            if(object_id('@tbl') is null)
            //            select '' where 1=2
            //            else
            //            select * from [@tbl] where RID = '@RID'
            //            order by ACTION_DATE desc
            //            "
            string sqlText =
            @"
            if(object_id('@tbl') is null)
            select '' where 1=2
            else
            select * from [@tbl] where @Condition
            order by ACTION_DATE desc
            "
            .Replace("@tbl", table.Replace("'", ""))
            .Replace("@Condition", (IsShowAll ? "1=1" : "RID ='" + RID.Replace("'", "") + "'"));
            var rst = new System.Data.DataTable();
            using (DB db = new DB())
            {
                rst = SQlHelper.ExecuteToDataTable(sqlText, System.Data.CommandType.Text);
                if (rst != null)
                {
                    var cols = new System.Data.DataColumn[rst.Columns.Count];
                    rst.Columns.CopyTo(cols, 0);
                    cols = cols.Where(x => !(x.ColumnName.Equals("RID", StringComparison.CurrentCultureIgnoreCase) || x.ColumnName.Equals("LOG_ID", StringComparison.CurrentCultureIgnoreCase)))
                               .ToArray();
                    var o = new
                    {
                        columns = cols.Select(x => new { title = x.ColumnName.Replace("_", " "), field = x.ColumnName, width = "165px", format = x.DataType.Name == "DateTime" ? "{0:yyyy-MM-dd HH:mm:ss}" : "" }),
                        schema = new
                        {
                            model = new
                            {
                                fields = cols.ToDictionary(k => k.ColumnName, v => new { type = v.DataType.Name == "DateTime" ? "date" : "string" })
                            }
                        },
                        Data = rst
                    };
                    return o;
                }
            }
            return rst;
        }
    }
}