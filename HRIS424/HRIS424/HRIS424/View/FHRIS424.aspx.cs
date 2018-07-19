
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* Purpose      : FHRIS424的Service
* Date         : 17 Jul 2018 
* Author       : Eva Liao (ISD/CSC)
* Note         : 
* -------------------------------------------------
* 17 Jul 2018      Eva Liao (ISD/CSC)        the first version
*      the latest update: 17 Jul 2018 11:02
*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using CrystalGroup.Web.Utility;
using System.Configuration;

namespace CrystalISD.View
{
    using HRIS424.src.Service;
    using HRIS424.View;
    using src.Service;

    /// <summary>
    /// 注意：须继承 BaseView, IBaseView
    /// 此处必须定义SCC Function，否则不能进行权限验证
    /// </summary>
    [SccFunction(WebConfigAppKey = "HRIS424")]
    public partial class FHRIS424 : BaseView, IBaseView
    {
        /// <summary>
        /// 添加Action处理方法
        /// </summary>
        protected override void AddProcess()
        {
            // 在处理器中加入4个方法
            this.Processor
                .Push("add", this.Create)
                .Push("view", this.View)
                .Push("edit", this.Edit)
                .Push("copytonew", this.Copy);
        }

        /// <summary>
        /// 对应新建事件
        /// </summary>
        [Authorize(Role = SccService.Roles.Add)]
        public void Create()
        {
            var vm = FHRIS424Service.Get("", out this.GUID);            
        }

        /// <summary>
        /// 对应查看事件
        /// </summary>
        [Authorize(Role = SccService.Roles.View)]
        public void View()
        {
            string key = Request["key"];
            if (!key.IsNullOrEmpty())
            {
                var vm = FHRIS424Service.Get(key, out this.GUID);                  
                return;
            }
        }

        /// <summary>
        /// 对应复制事件
        /// </summary>
        [Authorize(Role = SccService.Roles.Add)]
        public void Copy()
        {
            string key = Request["key"];
            this.AssertNoNull(key);
            var vm = FHRIS424Service.Copy(key, out this.GUID);  
        }

        /// <summary>
        /// 对应编辑事件
        /// </summary>
        [Authorize(Role = SccService.Roles.Edit)]
        public void Edit()
        {
            string key = Request["key"];
            this.AssertNoNull(key);
            var vm = FHRIS424Service.Get(key, out this.GUID);    

            try
            {
                // 编辑时加锁
                GlobalService.SetLock(vm.RID, 2);
            }
            catch (Exception ex)
            {
			this.FlashMessage += ex.Message;
                this.Action = "VIEW";
                throw ex;
            }
        }
    }
}