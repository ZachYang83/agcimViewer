/**
 * @author:pwz
 * 初始化index数据库，创建数据表，提供向数据库存储数据，查询数据的入口
 */
import {
    TABLENAMES,
    DBNAME,
    VERSION,
    EXPIREDAYS,
    AUTOCHECKDAYS,
    AUTOCHECK
} from "./config.js";
import initTable from "./interfas.js";

import md5 from "js-md5";

//请求队列
class initDBS {
    constructor() {
        //数据库示例对象
        this.db;
        //是否自动更新数据库
        this.autoCheck = AUTOCHECK;
        //设置单挑记录的缓存时间
        this.expireDays = EXPIREDAYS;
        //数据库自动更新的时间
        this.autoCheckDays = AUTOCHECKDAYS;
        //创建数据库
        this.init(DBNAME, VERSION, TABLENAMES);
        //定期更新数据库，检查是否有过期数据
        this.autoUpdateDB();
    }
    /**
     * 创建数据库,创建表
     */
    init(dbName, version, TABLENAMES) {
        let request = initTable.createDB(dbName, version);
        request.onerror = event => {
            error(event)
        };
        request.onupgradeneeded = event => {
            this.db = event.target.result;
            initTable.createTables(this.db, Object.keys(TABLENAMES), "id");
        };
        request.onsuccess = event => {
            this.db = event.target.result;
        };
        request.onblocked = function(event) {
            rej(event);
        };
    }
    /**
     * 处理url
     *
     */
    urlToId(url) {
        return md5(url);
    }

    /**
     * 通过url获取tableName
     */
    getTableNameByUrl(url) {
        if (!url) {
            return undefined
        }
        for (let item in TABLENAMES) {
            if (url.includes(item)) {
                var valueList = TABLENAMES[item]
                if (Array.isArray(valueList)) {
                    if (valueList.find(value => {
                            return url.includes(value)
                        }) != undefined) {
                        return item
                    }
                } else {
                    return item;
                }
            }
        }
        return undefined;
    }

    /**
     * 设置缓存过期时间
     * @param {Number} expireDays:过期时间，单位为天 默认1天
     */
    setCaseTime(expireDays) {
        if (expireDays) this.expireDays = expireDays;
        return Date.now() + this.expireDays * 3600 * 1000 + Math.floor(Math.random() * 2 * 3600 * 1000)
    }
    /**
     * 定期更新缓存，清除过期数据
     *
     */
    autoUpdateDB() {
        if (!this.autoCheck) {
            return
        }
        setInterval(() => {
            initTable.autoUpdateTables(this.db, Object.keys(TABLENAMES));
        }, 1000 * 60 * 60 * this.autoCheckDays)
    }
}

export default new initDBS();
