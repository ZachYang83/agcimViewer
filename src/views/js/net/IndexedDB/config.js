/**
 * @author:pwz
 * 数据库配置，包括数据库名称，建表名称等
 */
export const TABLENAMES = {
    "json": ["/Longshantang/yunfu/","/Longshantang/yunfu_3dtiles_road/","/agsupport-rest/agsupport/project/getProjectLayerTree/"],
    "b3dm": ["/Longshantang/yunfu/","/Longshantang/yunfu_3dtiles_road/"],
    // "s=Gali": ["mt1.google.cn"]
}; //表名称(需要拦截的请求类型，比如对.json,.terrain格式数据做缓存)
export const DBNAME = "ag_db"; //数据库名称
export const VERSION = 1.0; //数据库版本号
export const EXPIREDAYS = 24; //缓存过期时间 单位小时
export const AUTOCHECK = false; //是否自动更新数据库
export const AUTOCHECKDAYS = 0.5; //数据库自动更新的时间 单位小时
