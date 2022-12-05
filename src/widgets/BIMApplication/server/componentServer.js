/*
 * @Author: luojh
 * @Date: 2020-09-22 17:01:56
 * @LastEditors: pwz
 * @LastEditTime: 2020-09-22 18:05:04
 * @FilePath: \village-building-design\src\net\server\componentServer.js
 */

import axiosWraper from "@/views/js/net/axiosWraper";

let proxyUrl = '/agsupport-rest';

const componentServer = {
    /**
     * 构件列表,按条件查询
     * @param params.page, params.rows分页
     * @param params [catagory, name, page, rows, objectid, materialid, id...]
     * @returns {Promise<*>}
     */
    
    findComponent: async params => {
        let url = `/agsupport/BIM/Component/find`;
        return axiosWraper.getData(proxyUrl + url, params);
    },

    previewComponentUrl: proxyUrl + '/agsupport/BIM/Component/preview',

    /**
     * 构件预览
     * @param params.id 材料id
     * @param params.type type=1预览图片；type=2预览构件glb
     * @returns {Promise<*>}
     */
    previewComponent: async (params = {id}) => {
        if (params.id === undefined) return;
        let url = `/agsupport/BIM/Component/preview`;
        return axiosWraper.getData(proxyUrl + url, params);
    },

    /**
     * 添加构件zip
     * @param params.modelFile 材料模型（只支持ip压缩文件）
     * @returns {AxiosPromise<any>}
     */
    addComponent: params => {
        let url = `/agsupport/BIM/Component/add`;
        return axiosWraper.getDataByPost(proxyUrl + url, params);
    },
}

export default componentServer;