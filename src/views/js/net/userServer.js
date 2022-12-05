/*
 * @Author: luojh
 * @Date: 2020-09-22 17:01:56
 * @LastEditors: pwz
 * @LastEditTime: 2020-09-23 10:55:22
 * @FilePath: \village-building-design\src\net\server\userServer.js
 */


import axios from './http';

let proxyUrl = '/agsupport-rest';

const userServer = {
    /**
     * 添加用户机构信息
     * @param params.userId必填
     * @param params [id, securityAnswer, securityQuestion, userId, userType]
     * @returns {AxiosPromise<any>}
     */
    addUser: async params => {
    

        let url = `/agsupport/BIM/user/add`;
        let results = await axios({
            url: proxyUrl + url,
            method: 'post',
            data: params,
            transformRequest: [function (data) {
                let ret = ''
                for (let it in data) {
                    ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
                }
                return ret
            }],
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
    }
}

export default userServer;