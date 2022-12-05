/*
 * @Author: pwz
 * @Date: 2020-09-22 17:01:56
 * @LastEditors: pwz
 * @LastEditTime: 2020-09-22 17:07:53
 * @FilePath: \village-building-design\src\net\IndexedDB\index.js
 */
/**
 * @author:pwz
 * 拦截特定请求，比如。terrain,.json,.b3dm格式的数据，添加到浏览器indexedDB数据库中。
 * 并对发送请求做控制
 */
import initDBS from "./initDB.js";
import interfas from "./interfas.js";
import {
    proxy
} from "ajax-hook";

class Filter {
    constructor() {
        this.init();
        this.nowPending = 0
        this.maxPending = 0
    }
    init() {
        proxy({
            //请求发起前进入
            onRequest: (config, handler) => {
                this.nowPending += 1
                if (this.maxPending < this.nowPending) {
                    this.maxPending = this.nowPending
                }
                // console.log(this.nowPending, this.maxPending)
                let url = handler.xhr.config.url;
                let tableName = initDBS.getTableNameByUrl(url);
                if (tableName == undefined) {
                    //不在拦截范围，放过
                    return handler.next(config);
                }
                if (initDBS.db == undefined) {
                    return handler.next(config);
                }
                //先查询数据库，确认数据是否存在
                var id = initDBS.urlToId(url)
                interfas.query(initDBS.db, tableName, id).then(result => {
                    if (result) {
                        //存在的直接返回
                        this.nowPending -= 1
                        handler.resolve({
                            config: config,
                            status: 200,
                            headers: result.headers,
                            response: result.value
                        })
                        return
                    }
                    handler.next(config)
                })
            },
            //请求发生错误时进入，比如超时；注意，不包括http状态码错误，如404仍然会认为请求成功
            onError: (err, handler) => {
                handler.next(err)
            },
            //请求成功后进入
            onResponse: (response, handler) => {
                this.nowPending -= 1
                //储存数据到浏览器缓存
                handler.next(response)
                let url = handler.xhr.config.url;
                let tableName = initDBS.getTableNameByUrl(url);
                if (tableName == undefined) {
                    //不在拦截范围，不存
                    return
                }
                var id = initDBS.urlToId(url)
                interfas.add(initDBS.db, tableName, {
                    id,
                    value: response.response,
                    headers: response.headers,
                    time: initDBS.setCaseTime()
                })
            }
        })
    }

}
export default new Filter();
