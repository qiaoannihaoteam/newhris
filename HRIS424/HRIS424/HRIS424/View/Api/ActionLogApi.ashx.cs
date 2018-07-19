/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* Purpose      : ActionLog的API
* Date         : 16 Feb 2017 
* Author       : KT Chen (ISD/CSC)
* Note         : 
* -------------------------------------------------
* 16 Feb 2017      KT Chen (ISD/CSC)        the first version
*      the latest update: 16 Feb 2017 18:36
*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

namespace HRIS424.View
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Web;
    using CrystalGroup.Web.Utility;
    using Newtonsoft.Json;
    using src.Service;
    using src.Database;

    public class ActionLogApi : BaseApi
    {
        public override void ProcessRequest(HttpContext context)
        {
            this.FunctionCode = this.FunctionID = context.Request["FunctionID"];
            base.ProcessRequest(context);
        }

        /// <summary>
        /// 添加API
        /// </summary>
        protected override void AddProcess()
        {
            this.JsonProcessor
                .Push("Search", this.Search)
                ;
        }

        /// <summary>
        /// 客户端获取全部数据，浏览页，需要有查询
        /// </summary>
        /// <returns></returns>
        [Authorize(Role = "P0")]
        private string Search()
        {
            string RID = this._ctx.Request["RID"];
            string Table = this._ctx.Request["Table"];
            Boolean IsShowAll = this._ctx.Request["ShowType"].Equals("all");
            return GlobalService.ExecuteFunc(ActionLogService.Search, RID, Table, IsShowAll);
        }
    }
}