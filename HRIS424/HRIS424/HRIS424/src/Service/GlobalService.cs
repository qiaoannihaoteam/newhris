/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Purpose      :
 * Date         : 2016-09-16
 * Author       : Bruce Liao
 * Note         :
 * -------------------------------------------------
 * 19 Sep 2016      Bruce Liao       the first version
 *
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

namespace HRIS424.src.Service
{
    using System;
    using System.Collections.Generic;
    using System.Data;
    using System.IO;
    using System.Linq;
    using System.Reflection;
    using System.Web;
    using CrystalGroup.Web.Utility;
    using Database;
    using Newtonsoft.Json;
    using HRIS424.View;
    using System.Runtime.Caching;

    /// <summary>
    /// 全局公用的Service，尽量避免修改
    /// </summary>
    public static class GlobalService
    {
        /// <summary>
        /// 获取当前会话的客户IP
        /// </summary>
        public static string CurrentClientIP
        {
            get
            {
                return HttpContext.Current.Request.UserHostAddress.ToString2();
            }
        }

        // 存放锁的RID
        private const string _LockDataRID = "ed6e7270-eab8-41d2-9432-88c5aa8163f8";

        /// <summary>
        /// 所有的锁信息
        /// </summary>
        public static List<LockInfo> LockList
        {
            get
            {
                var a = GetTempData<List<LockInfo>>(_LockDataRID);
                if (a != null)
                {
                    // 删除所有过期的锁
                    a.RemoveAll(t => t.LockAt.AddMinutes(t.LockMinutes) < DateTime.Now);
                    SetTempData(_LockDataRID, a);
                    return a;
                }

                a = new List<LockInfo>();
                SetTempData(_LockDataRID, a);
                return a;
            }
            set
            {
                SetTempData(_LockDataRID, value);
            }
        }

        /// <summary>
        /// 释放某个锁
        /// </summary>
        /// <param name="lockKey"></param>
        public static void Unlock(string lockKey)
        {
            var lockList = LockList;
            lockList.RemoveAll(t => t.LockKey == lockKey);
            LockList = lockList;
        }

        /// <summary>
        /// 加锁，如失败则抛出异常
        /// </summary>
        /// <param name="lockKey">加锁的key</param>
        /// <param name="lockMinutes">锁多少分钟</param>
        public static void SetLock(string lockKey, int lockMinutes)
        {
            var lockList = LockList;
            if (lockKey.IsNullOrEmpty())
            {
                throw new Exception("Lock key can not empty.");
            }

            var lockInfo = lockList.FirstOrDefault(t => t.LockKey.EqualWithTrim(lockKey));
            if (IsLocked(lockKey))
            {
                var msg = string.Format(Commons.Language.GetText("Commons.s_DataLocked", "CN:数据正在被 {0}(IP:{1}) 编辑，请稍后再试！~EN:The current data is being edited by {0}(IP:{1}), please try again later."),
                    lockInfo.LockBy,
                    lockInfo.LockHost);
                throw new Exception(msg);
            }

            if (lockInfo == null)
            {
                lockList.Add(new LockInfo
                {
                    LockKey = lockKey,
                    LockAt = DateTime.Now,
                    LockBy = SccService.CurrentUserId,
                    LockHost = CurrentClientIP,
                    LockMinutes = lockMinutes,
                    SessionID = HttpContext.Current.Session.SessionID
                });
            }
            else
            {
                lockInfo.LockAt = DateTime.Now;
                lockInfo.LockMinutes = lockMinutes;
            }

            LockList = lockList;
        }

        /// <summary>
        /// 检查是否已被锁定
        /// </summary>
        /// <param name="lockKey"></param>
        /// <returns></returns>
        public static bool IsLocked(string lockKey)
        {
            var sessionId = HttpContext.Current.Session.SessionID;
            if (LockList.Any(t => t.LockKey.EqualWithTrim(lockKey) && !t.SessionID.EqualWithTrim(sessionId)))
                return true;

            return false;
        }

        /// <summary>
        /// 保存c#对象到数据库中
        /// </summary>
        /// <param name="key"></param>
        /// <param name="obj"></param>
        public static void SetTempData<T>(string key, T obj) where T : class
        {
            var json = JsonConvert.SerializeObject(obj);
            using (var db = new DB())
            {
                var compressString = Zip(json);
                var old = db.App_Temp_Data.FirstOrDefault(t => t.RID == key);
                if (old != null)
                    old.DATA = compressString;
                else
                    db.App_Temp_Data.Add(new App_Temp_Data { RID = key, DATA = compressString, CREATE_AT = DateTime.Now });

                DateTime before1day = DateTime.Now.AddDays(-1);
                var historyData = db.App_Temp_Data.Where(t => t.CREATE_AT < before1day);
                db.App_Temp_Data.RemoveRange(historyData);
                db.SaveChanges();
            }
        }

        /// <summary>
        /// 从数据库取出数据并还原为c#对象
        /// </summary>
        /// <param name="key"></param>
        /// <returns></returns>
        public static T GetTempData<T>(string key) where T : class
        {
            using (var db = new DB())
            {
                var json = db.App_Temp_Data.FirstOrDefault(t => t.RID == key);

                if (json == null || json.DATA.IsNullOrEmpty())
                    return default(T);

                string deCompressString = UnZip(json.DATA);
                return JsonConvert.DeserializeObject<T>(deCompressString);
            }
        }

        /// <summary>
        /// 压缩字符串
        /// </summary>
        /// <param name="text"></param>
        /// <returns></returns>
        public static string Zip(string text)
        {
            byte[] buffer = System.Text.Encoding.Unicode.GetBytes(text);
            MemoryStream ms = new MemoryStream();
            using (System.IO.Compression.GZipStream zip = new System.IO.Compression.GZipStream(ms, System.IO.Compression.CompressionMode.Compress, true))
            {
                zip.Write(buffer, 0, buffer.Length);
            }

            ms.Position = 0;
            MemoryStream outStream = new MemoryStream();

            byte[] compressed = new byte[ms.Length];
            ms.Read(compressed, 0, compressed.Length);

            byte[] gzBuffer = new byte[compressed.Length + 4];
            System.Buffer.BlockCopy(compressed, 0, gzBuffer, 4, compressed.Length);
            System.Buffer.BlockCopy(BitConverter.GetBytes(buffer.Length), 0, gzBuffer, 0, 4);
            return Convert.ToBase64String(gzBuffer);
        }

        /// <summary>
        /// 解压字符串
        /// </summary>
        /// <param name="compressedText"></param>
        /// <returns></returns>
        public static string UnZip(string compressedText)
        {
            byte[] gzBuffer = Convert.FromBase64String(compressedText);
            using (MemoryStream ms = new MemoryStream())
            {
                int msgLength = BitConverter.ToInt32(gzBuffer, 0);
                ms.Write(gzBuffer, 4, gzBuffer.Length - 4);

                byte[] buffer = new byte[msgLength];

                ms.Position = 0;
                using (System.IO.Compression.GZipStream zip = new System.IO.Compression.GZipStream(ms, System.IO.Compression.CompressionMode.Decompress))
                {
                    zip.Read(buffer, 0, buffer.Length);
                }

                return System.Text.Encoding.Unicode.GetString(buffer, 0, buffer.Length);
            }
        }

        /// <summary>
        /// obj 中必须有last_updated_by，last_updatetime 字段
        /// </summary>
        /// <param name="obj"></param>
        public static void SetLastChangeFields(dynamic obj)
        {
            obj.last_updated_by = SccService.CurrentUserId;
            obj.last_updatetime = DateTime.Now;
        }

        /// <summary>
        /// obj 中必有created_by，creation_datetime 字段
        /// </summary>
        /// <param name="obj"></param>
        public static void SetCreationFields(dynamic obj)
        {
            obj.created_by = SccService.CurrentUserId;
            obj.creation_datetime = DateTime.Now;
        }

        /// <summary>
        /// 断言表模型中string类型的属性的值没有超出长度，否则返回错误提示字符串
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="obj"></param>
        public static string AssertStringFieldNotExceedLength<T>(this T obj) where T : ITable
        {
            var message = CheckModel(obj, (pi, row, msg) =>
            {
                int columnSize = (int)row["ColumnSize"];
                if (pi.PropertyType == typeof(string) && pi.GetValue(obj, null).ToString2().Length > columnSize)
                {
                    msg.Add(string.Format(Commons.Language.GetText(SccService.CurrentLanguageType, "CN:字段:{0} 超出长度，其最大长度是:{1}~EN:Field: {0} exceeds the length, the maximum length is: {1}"),
                            pi.Name,
                            columnSize));
                }
            });

            return message;
        }

        /// <summary>
        /// 断言表模型中string类型的属性的值没有超出长度，否则返回错误提示字符串
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="obj"></param>
        /// <param name="schema">表结构定义</param>
        public static string AssertStringFieldNotExceedLength<T>(this T obj, DataTable schema) where T : ITable
        {
            var message = CheckModel(obj, schema, (pi, row, msg) =>
            {
                int columnSize = (int)row["ColumnSize"];
                if (pi.PropertyType == typeof(string) && pi.GetValue(obj, null).ToString2().Length > columnSize)
                {
                    msg.Add(string.Format(Commons.Language.GetText(SccService.CurrentLanguageType, "CN:字段:{0} 超出长度，其最大长度是:{1}~EN:Field: {0} exceeds the length, the maximum length is: {1}"),
                            pi.Name,
                            columnSize));
                }
            });

            return message;
        }

        /// <summary>
        /// 断言不能为NULL的字段不为NULL，否则返回错误提示字符串
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="obj"></param>
        /// <returns></returns>
        public static string AssertFieldNotNull<T>(this T obj) where T : ITable
        {
            var message = CheckModel(obj, (pi, row, msg) =>
            {
                bool allowDBNull = (bool)row["AllowDBNull"];
                if (!allowDBNull && pi.GetValue(obj, null) == null)
                {
                    msg.Add(string.Format(Commons.Language.GetText(SccService.CurrentLanguageType, "CN:字段:{0} 不能为NULL~EN:Field: {0} can not be NULL"),
                            pi.Name));
                }
            });

            return message;
        }

        /// <summary>
        /// 断言不能为NULL的字段不为NULL，否则返回错误提示字符串
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="obj"></param>
        /// <param name="schema">表结构定义</param>
        /// <returns></returns>
        public static string AssertFieldNotNull<T>(this T obj, DataTable schema) where T : ITable
        {
            var message = CheckModel(obj, schema, (pi, row, msg) =>
            {
                bool allowDBNull = (bool)row["AllowDBNull"];
                if (!allowDBNull && pi.GetValue(obj, null) == null)
                {
                    msg.Add(string.Format(Commons.Language.GetText(SccService.CurrentLanguageType, "CN:字段:{0} 不能为NULL~EN:Field: {0} can not be NULL"),
                            pi.Name));
                }
            });

            return message;
        }

        /// <summary>
        /// 检查模型
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="obj"></param>
        /// <param name="checker"></param>
        /// <returns></returns>
        private static String CheckModel<T>(T obj, Action<PropertyInfo, DataRow, List<string>> checker) where T : ITable
        {
            var msg = new List<string>();
            var properties = obj.GetType().GetProperties();
            var schema = GetSchemaTable<T>();

            foreach (var pi in properties)
            {
                var row = schema.AsEnumerable()
                    .FirstOrDefault(t => t["ColumnName"].ToString2() == pi.Name);
                if (row != null)
                    checker(pi, row, msg);
            }

            if (msg.Count > 0)
                return string.Join(Environment.NewLine, msg) + Environment.NewLine;

            return "";
        }

        /// <summary>
        /// 检查模型
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="obj"></param>
        /// <param name="schema">表定义</param>
        /// <param name="checker"></param>
        /// <returns></returns>
        private static String CheckModel<T>(T obj, DataTable schema, Action<PropertyInfo, DataRow, List<string>> checker) where T : ITable
        {
            var msg = new List<string>();
            var properties = obj.GetType().GetProperties();

            foreach (var pi in properties)
            {
                var row = schema.AsEnumerable()
                    .FirstOrDefault(t => t["ColumnName"].ToString2() == pi.Name);
                if (row != null)
                    checker(pi, row, msg);
            }

            if (msg.Count > 0)
                return string.Join(Environment.NewLine, msg) + Environment.NewLine;

            return "";
        }

        /// <summary>
        /// 获取DB中的类型的表定义
        /// </summary>
        /// <param name="type"></param>
        /// <returns></returns>
        public static DataTable GetSchemaTable<T>() where T : ITable
        {
            return Wrapper.Cache(() =>
            {
                using (var conn = new DB().Database.Connection)
                {
                    conn.Open();
                    var cmd = conn.CreateCommand();
                    cmd.CommandText = string.Format("select * from [{0}]", typeof(T).Name);
                    var reader = cmd.ExecuteReader(CommandBehavior.KeyInfo);
                    return reader.GetSchemaTable();
                }
            }, typeof(T).Name);
        }

        /// <summary>
        /// 执行func并返回AjaxResult的Json
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="func"></param>
        /// <param name="p0"></param>
        /// <returns></returns>
        public static string ExecuteAction<T>(Action<T> func, T p0)
        {
            AjaxResult rst = new AjaxResult();
            try
            {
                func(p0);
            }
            catch (Exception ex)
            {
                rst.IsSuccess = false;
                rst.Message = ex.Message;
                Log4WebStandard.LogManager.GetLogger(typeof(GlobalService)).Error(ex, ex.Message);
            }

            return JsonConvert.SerializeObject(rst);
        }

        /// <summary>
        /// 执行Action并返回AjaxResult的Json
        /// </summary>
        /// <typeparam name="T0"></typeparam>
        /// <typeparam name="T1"></typeparam>
        /// <param name="func"></param>
        /// <param name="p0"></param>
        /// <param name="p1"></param>
        /// <returns></returns>
        public static string ExecuteAction<T0, T1>(Action<T0, T1> func, T0 p0, T1 p1)
        {
            AjaxResult rst = new AjaxResult();
            try
            {
                func(p0, p1);
            }
            catch (Exception ex)
            {
                rst.IsSuccess = false;
                rst.Message = ex.Message;
                Log4WebStandard.LogManager.GetLogger(typeof(GlobalService)).Error(ex, ex.Message);
            }

            return JsonConvert.SerializeObject(rst);
        }

        /// <summary>
        /// 执行Action并返回AjaxResult的Json
        /// </summary>
        /// <typeparam name="T0"></typeparam>
        /// <typeparam name="T1"></typeparam>
        /// <typeparam name="T2"></typeparam>
        /// <param name="func"></param>
        /// <param name="p0"></param>
        /// <param name="p1"></param>
        /// <param name="p2"></param>
        /// <returns></returns>
        public static string ExecuteAction<T0, T1, T2>(Action<T0, T1, T2> func, T0 p0, T1 p1, T2 p2)
        {
            AjaxResult rst = new AjaxResult();
            try
            {
                func(p0, p1, p2);
            }
            catch (Exception ex)
            {
                rst.IsSuccess = false;
                rst.Message = ex.Message;
                Log4WebStandard.LogManager.GetLogger(typeof(GlobalService)).Error(ex, ex.Message);
            }

            return JsonConvert.SerializeObject(rst);
        }

        public static string ExecuteAction<T0, T1, T2, T3>(Action<T0, T1, T2, T3> func, T0 p0, T1 p1, T2 p2, T3 p3)
        {
            AjaxResult rst = new AjaxResult();
            try
            {
                func(p0, p1, p2, p3);
            }
            catch (Exception ex)
            {
                rst.IsSuccess = false;
                rst.Message = ex.Message;
                Log4WebStandard.LogManager.GetLogger(typeof(GlobalService)).Error(ex, ex.Message);
            }

            return JsonConvert.SerializeObject(rst);
        }

        public static string ExecuteFunc<T>(Func<T> func)
        {
            AjaxResult rst = new AjaxResult();
            try
            {
                var data = func();
                rst.Data = data;
            }
            catch (Exception ex)
            {
                rst.IsSuccess = false;
                rst.Message = ex.Message;
                Log4WebStandard.LogManager.GetLogger(typeof(GlobalService)).Error(ex, ex.Message);
            }

            return JsonConvert.SerializeObject(rst);
        }

        /// <summary>
        /// 执行func并返回AjaxResult的Json
        /// </summary>
        /// <typeparam name="T0"></typeparam>
        /// <typeparam name="T"></typeparam>
        /// <param name="func"></param>
        /// <param name="p0"></param>
        /// <returns></returns>
        public static string ExecuteFunc<T0, T>(Func<T0, T> func, T0 p0)
        {
            AjaxResult rst = new AjaxResult();
            try
            {
                var data = func(p0);
                rst.Data = data;
            }
            catch (Exception ex)
            {
                rst.IsSuccess = false;
                rst.Message = ex.Message;
                Log4WebStandard.LogManager.GetLogger(typeof(GlobalService)).Error(ex, ex.Message);
            }

            return JsonConvert.SerializeObject(rst);
        }

        /// <summary>
        /// 执行func并返回AjaxResult的Json
        /// </summary>
        /// <typeparam name="T0"></typeparam>
        /// <typeparam name="T1"></typeparam>
        /// <typeparam name="T"></typeparam>
        /// <param name="func"></param>
        /// <param name="p0"></param>
        /// <param name="p1"></param>
        /// <returns></returns>
        public static string ExecuteFunc<T0, T1, T>(Func<T0, T1, T> func, T0 p0, T1 p1)
        {
            AjaxResult rst = new AjaxResult();
            try
            {
                var data = func(p0, p1);
                rst.Data = data;
            }
            catch (Exception ex)
            {
                rst.IsSuccess = false;
                rst.Message = ex.Message;
                Log4WebStandard.LogManager.GetLogger(typeof(GlobalService)).Error(ex, ex.Message);
            }

            return JsonConvert.SerializeObject(rst);
        }

        /// <summary>
        /// 执行func并返回AjaxResult的Json
        /// </summary>
        /// <typeparam name="T0"></typeparam>
        /// <typeparam name="T1"></typeparam>
        /// <typeparam name="T2"></typeparam>
        /// <typeparam name="T"></typeparam>
        /// <param name="func"></param>
        /// <param name="p0"></param>
        /// <param name="p1"></param>
        /// <param name="p2"></param>
        /// <returns></returns>
        public static string ExecuteFunc<T0, T1, T2, T>(Func<T0, T1, T2, T> func, T0 p0, T1 p1, T2 p2)
        {
            AjaxResult rst = new AjaxResult();
            try
            {
                var data = func(p0, p1, p2);
                rst.Data = data;
            }
            catch (Exception ex)
            {
                rst.IsSuccess = false;
                rst.Message = ex.Message;
                Log4WebStandard.LogManager.GetLogger(typeof(GlobalService)).Error(ex, ex.Message);
            }

            return JsonConvert.SerializeObject(rst);
        }

        public static string ExecuteFunc<T0, T1, T2, T3, T>(Func<T0, T1, T2, T3, T> func, T0 p0, T1 p1, T2 p2, T3 p3)
        {
            AjaxResult rst = new AjaxResult();
            try
            {
                var data = func(p0, p1, p2, p3);
                rst.Data = data;
            }
            catch (Exception ex)
            {
                rst.IsSuccess = false;
                rst.Message = ex.Message;
                Log4WebStandard.LogManager.GetLogger(typeof(GlobalService)).Error(ex, ex.Message);
            }

            return JsonConvert.SerializeObject(rst);
        }
    }

    /// <summary>
    /// 逻辑锁结构
    /// </summary>
    public class LockInfo
    {
        /// <summary>
        /// 加锁对象key
        /// </summary>
        public string LockKey { get; set; }

        /// <summary>
        /// 加锁时间
        /// </summary>
        public DateTime LockAt { get; set; }

        /// <summary>
        /// 加锁人
        /// </summary>
        public string LockBy { get; set; }

        /// <summary>
        /// 加锁机器
        /// </summary>
        public string LockHost { get; set; }

        /// <summary>
        /// 锁多长时间
        /// </summary>
        public int LockMinutes { get; set; }

        /// <summary>
        /// 当前会话ID
        /// </summary>
        public string SessionID { get; set; }
    }
}