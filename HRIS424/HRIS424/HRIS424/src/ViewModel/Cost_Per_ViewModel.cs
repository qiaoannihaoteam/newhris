using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Crystal.Demo.src.ViewModel
{
    public class Cost_Per_ViewModel
    {
        public string RID { get; set; }
        public string Emp_No { get; set; }
        public string Emp_Name { get; set; }
        public string Sect { get; set; }
        public string Sect_RID { get; set; }
        public DateTime Effect_Date { get; set; }
        public DateTime? Resign_Date { get; set; }
        public string Position_Code { get; set; }
        public string customer_id { get; set; }
        public string customer_name { get; set; }
        public decimal Cost_Ratio { get; set; }
    }
}