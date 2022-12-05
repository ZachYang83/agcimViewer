import axiosWraper from "@/views/js/net/axiosWraper";
import defined from "@/views/js/utils/defined";

/**
 * 后台管理系统--材料相关Ajax请求Api
 */
class AxiosHouse {

    /**
     * 材料模型上传
     * @param params.userId:用户id
     * @param params.modelZipFile:材料模型文件
     * @returns {AxiosPromise}
     */
    uploadModel(params = {
        userId,
        modelZipFile
    }) {
        let {userId, modelZipFile} = params;
        defined(modelZipFile, "modelZipFile")
        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("modelZipFile", modelZipFile);
        return axiosWraper.post('/agsupport-rest/agsupport/BIM/Component/add', formData)
    }

    /**
     * 批量删除材料
     * @param params.ids：多个id以逗号隔开
     * @returns {Promise<AxiosResponse<any>>}
     */
    delete(params = {
        ids
    }) {
        let {ids} = params
        defined(ids, "ids")
        return axiosWraper.deleteDate('/agsupport-rest/agsupport/BIM/Component/delete', params)
    }

    /**
     * 获取材料列表
     * @param params.page:页码
     * @param params.rows：一页显示条数
     * @param params.name：搜索字段（可选）
     * @param params.texture：表头筛选字段（可选）
     * @param params.vendor：表头筛选字段（可选）
     * @param params.userId：用户id）
     * @returns {*}
     */
    getList(params = {
        page,
        rows,
        name,
        texture,
        vendor,
        userId
    }) {
        return axiosWraper.getData("/agsupport-rest/agsupport/BIM/Component/find", params)
    }

    /**
     * 更新材料数据
     * @param params.name：材料名称
     * @param params.texture：材质
     * @param params.vendor：厂商
     * @param params.singlePrice：单价
     * @param params.auths：数据访问权限
     * @param params.remark：材料简介
     * @param params.userId：用户id
     * @param params.id：材料id
     * @param params.thumbFile：缩略图
     * @param params.tableCode：分类名称代码
     * @param params.tableCodeName：分类名称
     * @param params.largeCode：构件类型一级代码
     * @param params.mediumCode：构件类型二级代码
     * @param params.smallCode：构件类型三级代码
     * @param params.detailCode：构件类型四级代码
     * @param params.largeCodeName：构件类型一级中文名
     * @param params.mediumCodeName：构件类型二级中文名
     * @param params.smallCodeName：构件类型三级中文名
     * @param params.detailCodeName：构件类型四级中文名
     * @returns {AxiosPromise}
     */
    updateDate(params = {
        name,
        texture,
        vendor,
        singlePrice,
        auths,
        remark,
        userId,
        id,
        thumbFile,
        tableCode,
        tableCodeName,
        largeCode,
        mediumCode,
        smallCode,
        detailCode,
        largeCodeName,
        mediumCodeName,
        smallCodeName,
        detailCodeName
    }) {
        return axiosWraper.put('/agsupport-rest/agsupport/BIM/Component/update', params)
    }

    /**
     * 数据访问权限列表
     * @returns {AxiosPromise}
     */
    selectList() {
        return axiosWraper.get('/agsupport-rest/agsupport/dic/getAgDicByTypeCode/DATA_ACCESS_PERMISSION')
    }

    /**
     * 获取系统配置信息
     * @returns {Promise<AxiosResponse<any>>}
     */
    getPicDate() {
        return axiosWraper.get("/agsupport-rest/agsupport/BIM/Project/get?paramType=2");
    }

    /**
     * 分类名称列表
     * @returns {AxiosPromise}
     */
    itemizeList() {
        return axiosWraper.get("/agsupport-rest/agsupport/dic/getAgDicByTypeCode/BUILDING_MODEL_TYPE")
    }

    /**
     * 获取列表的过滤筛选条件
     * @returns {Promise<AxiosResponse<any>>}
     */
    dateFilterList() {
        return axiosWraper.get("/agsupport-rest/agsupport/BIM/Component/statistics")
    }

    /**
     * 构件类型一级列表数据
     * @param params.tableCode：分类名称代码
     * @param params.mediumCode = "00"：二级代码
     * @param params.smallCode = "00"：三级代码
     * @param params.filterType = "1"：列表类型
     * @returns {Promise<AxiosResponse<any>>}
     */
    listDataFirst(params = {
        tableCode,
        mediumCode,
        smallCode,
        filterType
    }) {
        return axiosWraper.getMaterialType(params)
    }

    /**
     * 构件类型二级列表数据
     * @param params.tableCode：分类名称代码
     * @param params.largeCode：一级代码
     * @param params.filterType = "2"：列表类型
     * @returns {Promise<AxiosResponse<any>>}
     */
    listDataSecond(params = {
        tableCode,
        largeCode,
        filterType
    }) {
        return axiosWraper.getMaterialType(params)
    }

    /**
     * 构件类型三级列表数据
     * @param params.tableCode：分类名称代码
     * @param params.largeCode：一级代码
     * @param params.mediumCode：二级代码
     * @param params.filterType = "3"：列表类型
     * @returns {Promise<AxiosResponse<any>>}
     */
    
    listDataThird(params = {
        tableCode,
        largeCode,
        mediumCode,
        filterType
    }) {
        return axiosWraper.getMaterialType(params)
    }

    /**
     * 构件类型四级列表数据
     * @param params.tableCode：分类名称代码
     * @param params.largeCode：一级代码
     * @param params.mediumCode：二级代码
     * @param params.smallCode：三级代码
     * @param params.filterType = "4"：列表类型
     * @returns {Promise<AxiosResponse<any>>}
     */
    
    listData(params = {
        tableCode,
        largeCode,
        mediumCode,
        smallCode,
        filterType
    }) {
        return axiosWraper.getMaterialType(params)
    }


}

export default new AxiosHouse();