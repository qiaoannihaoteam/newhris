
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

using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace HRIS424.View
{
    public partial class ActionLogIndex : BaseView
    {
        public string RID;
        public string Table;
        public string ShowType;

        protected override void Page_Load(object sender, EventArgs e)
        {
            this.FunctionCode = this.FunctionID = Request["FunctionID"];
            base.Page_Load(sender, e);
        }

        protected override void AddProcess()
        {
            this.Processor.Add("view", view);
        }

        [Authorize(Role = "P0")]
        void view()
        {
            RID = Request["RID"];
            Table = Request["Table"];
            ShowType = Request["ShowType"];
            var a = "";
        }
    }
}