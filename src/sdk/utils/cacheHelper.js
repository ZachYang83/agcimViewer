class CacheHelper {
    constructor() {

    }

    //判断请求数据是否存在于local或session里
    //若在，将结果直接返回给请求
    //若不在，请求后将返回数据放入local中
    //cacheHelper框架，由于目前cache获取速度提升，暂缓开发
    isExistInCache(key) {
        
    }

    saveToLocal(res, code) {
        var promise = new Promise(function (accept, reject) {
            res.then(function (data) {
                window.localStorage.setItem(code, JSON.stringify(data));
                accept(data);
            }).catch(function (error) {
                var data = window.localStorage.getItem(code);
                if (!data) {
                    reject();
                    return
                };
                data = JSON.parse(data);
                accept(data);
            })
        })
        return promise;
    }

    saveToCache(res, code) {
        var promise = new Promise(function (accept, reject) {
            res.then(function (data) {
                window.sessionStorage.setItem(code, JSON.stringify(data));
                accept(data);
            }).catch(function (error) {
                var data = window.sessionStorage.getItem(code);
                if (!data) {
                    reject();
                    return
                };
                data = JSON.parse(data);
                accept(data);
            })
        })
        return promise;
    }

};

export default new CacheHelper();