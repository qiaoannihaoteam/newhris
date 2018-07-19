

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* Purpose      : FHRIS424的API
* Date         : 17 Jul 2018 
* Author       : Eva Liao (ISD/CSC)
* Note         : 
* -------------------------------------------------
* 17 Jul 2018	Eva Liao (ISD/CSC)	the first version
*
*	the latest update: 17 Jul 2018 11:02
*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

namespace CrystalISD.View
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Web;
    using CrystalGroup.Web.Utility;
    using Newtonsoft.Json;
    using src.Service;
    using HRIS424.View;
    using HRIS424.src.Service;
    using HRIS424.src.Database;

    // using src.Database;

    /// <summary>
    /// 注意：此处必须定义SCC Function，否则不能进行权限验证
    /// </summary>
    [SccFunction(WebConfigAppKey = "HRIS424")]
    public class FHRIS424Api : BaseApi
    {
        /// <summary>
        /// 添加API
        /// </summary>
        protected override void AddProcess()
        {
            this.JsonProcessor
                .Push("GetFHRIS424ValidationDefine", this.GetFHRIS424ValidationDefine)
                .Push("Get", this.Get)
                .Push("Updata", this.Updata)
                .Push("UpdataAll", this.UpdataAll)
                .Push("Delete", this.Delete)
                //.Push("Get《字段名》", this.Get《字段名》)
                .Push("Search", this.Search)
                .Push("GetTreeData", this.GetTreeData)
                .Push("GetEmp_NoData", this.GetEmp_NoData)
                .Push("GetorganizationLevelEmp_No", this.GetorganizationLevelEmp_No);
        }

        /// <summary>
        /// 获取Cost_Per表的定义
        /// </summary>
        /// <returns></returns>
        [Authorize(Role = SccService.Roles.View)]
        private string GetFHRIS424ValidationDefine()
        {
			return JsonConvert.SerializeObject(GlobalService.GetSchemaTable<Cost_Per>());            
        }

        /// <summary>
        /// 客户端获取数据，EDIT页面
        /// </summary>
        /// <returns></returns>
        private string Get()
        {
            var key = this._ctx.Request["key"];
            return GlobalService.ExecuteFunc(FHRIS424Service.Get, key);
        }

        /// <summary>
        /// 客户端获取全部数据，浏览页，需要有查询
        /// </summary>
        /// <returns></returns>
        private string Search()
        {
            var condition = this.GetModelFromRequest<FHRIS424Service.Cost_PerCondition>();
            return GlobalService.ExecuteFunc(FHRIS424Service.Search, condition);
        }
		
		/*
		/// <summary>
        /// 客户端获取《字段名》
        /// </summary>
        /// <returns></returns>
        private string Get《字段名》()
        {
            return FHRIS424Service.Get《字段名》();
        }
*/
        
        /// <summary>
        /// 更新提交的数据
        /// </summary>
        /// <returns></returns>
        private string Updata()
        {
            var key = this._ctx.Request["key"];
            var model = this.GetModelFromRequest<Cost_Per>();
            return GlobalService.ExecuteFunc(FHRIS424Service.Update, key, model);
        }
        
        /// <summary>
        /// 批量更新提交的数据
        /// </summary>
        /// <returns></returns>
        private string UpdataAll()
        {
            var model = this.GetModelFromRequest<FHRIS424Service.CostPers>();
            return GlobalService.ExecuteFunc(FHRIS424Service.UpdateAll, model);
        }        

        /// <summary>
        /// 删除提交的数据
        /// </summary>
        /// <returns></returns>
        private string Delete()
        {
            var rid = this._ctx.Request["key"];
            return GlobalService.ExecuteAction(FHRIS424Service.Delete, rid, true);
        }


        /// <summary>
        /// 获取组织架构的树
        /// </summary>
        /// <returns></returns>
        private string GetTreeData()
        {
            return FHRIS424Service.GetSectTreeData(this._ctx);
        }

        /// <summary>
        /// 获取员工号
        /// </summary>
        /// <returns></returns>
        private string GetEmp_NoData()
        {
            return FHRIS424Service.GetEmpInfoByEmp_No(this._ctx);
        }

        /// <summary>
        /// 根据工号获取组织组织代码
        /// </summary>
        /// <returns></returns>
        private string GetorganizationLevelEmp_No()
        {
            return FHRIS424Service.GetorganizationLevelEmp_No(this._ctx);
        }
    }
}