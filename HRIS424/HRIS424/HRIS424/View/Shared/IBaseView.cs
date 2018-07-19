/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* Purpose      :
* Date         : 17 Dec 2016
* Author       : Bruce Liao
* Note         :
* -------------------------------------------------
* 17 Dec 2016      Bruce Liao        the first version

*      the latest update: 17 12 2016 12:00
*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

namespace HRIS424.View
{
    /// <summary>
    /// 通用页面的接口
    /// </summary>
    public interface IBaseView
    {
        /// <summary>
        /// 新建
        /// </summary>
        void Create();

        /// <summary>
        /// 查看
        /// </summary>
        void View();

        /// <summary>
        /// 拷贝
        /// </summary>
        void Copy();

        /// <summary>
        /// 编辑
        /// </summary>
        void Edit();
    }
}