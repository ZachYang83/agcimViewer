/*
 * @Author: your name
 * @Date: 2020-12-08 17:07:55
 * @LastEditTime: 2021-02-25 14:28:16
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \agcimViewer_v2\src\views\js\net\serverData4BIM.js
 */
import axiosWraper from "@/views/js/net/axiosWraper";

class serverData4BIM {
    /**
     * 
     *
     * 获取aabb包围盒信息
     * @param {*} tableName 要查询的表名
     * @param {*} option 条件参数，{filterKey,profession,level,catagory,familyname,familytype,infotype}  其中filterKey是必需的
     * @return {*} data{success：,content: }
     */
    async getFileterData(tableName,option) {
        var sql = `tableName=${tableName}&filterKey=${option.filterKey}&profession=${option.profession}`;

        if (option.level) sql += `&level=${option.level}`;
        if (option.catagory) sql += `&catagory=${option.catagory}`;
        if (option.familyname) sql += `&familyname=${option.familyname}`;
        if (option.familytype) sql += `&familytype=${option.familytype}`;
        if (option.infotype) sql += `&infotype=${option.infotype}`;

        var data = await axiosWraper.getData(
            `/agsupport-rest/agsupport/BIM/dentitya/filter?${sql}`
        );
        return data;
    }

    /**
    * 
    *
    * 根据id获取构件、房间、楼层详细信息
    * @param {*} tableName 要查询的表名
    * @param {*} id objectid字段
    * @return {*} data{success：,content: }
    */
    async getProperty(tableName,id) {
        var re=id;
        if (Array.isArray(id)) {
            re=id.join(",");
        }
        var sql = `tableName=${tableName}&objectid=${re}`;
        let data = await axiosWraper.getData(
            `/agsupport-rest/agsupport/BIM/dentitya/find?${sql}`
        );
        return data;
    }



    /**
    * 
    *
    * 获取某一类别的所有信息
    * @param {*} tableName 要查询的表名
    * @param {*} type 类别:窗,门
    * @return {*} data{success：,content: }
    */
    async getAllComponents(tableName,type) {
        var sql = `tableName=${tableName}&catagory=${encodeURIComponent(type)}`;
        let data = await axiosWraper.getData(
            `/agsupport-rest/agsupport/BIM/dentitya/find?${sql}`
        );
        return data;
    }

    /**
     * 
     *
     * 获取统计信息
     * @param {*} tableName 要查询的表名
     * @param {*} countKey 
     * @return {*} data{success：,content: }
     */
    async getStatics(tableName,countKey,option) {
        var sql = `tableName=${tableName}&countKey=${countKey}&groupKey=${countKey}&profession=${option.profession}`;

        if (option.level) sql += `&level=${option.level}`;
        if (option.catagory) sql += `&catagory=${option.catagory}`;
        if (option.familyname) sql += `&familyname=${option.familyname}`;
        if (option.familytype) sql += `&familytype=${option.familytype}`;

        var data = await axiosWraper.getData(
            `/agsupport-rest/agsupport/BIM/dentitya/statistics?${sql}`
        );
        return data;
    }

     /**
     * 
     *
     * 获取表名
     * @param {*} projectId 要查询模型id
     * @return {*} data{success：,content: }
     */
    async getTableName(projectId){
        let data = await axiosWraper.getData(`/agsupport-rest/agsupport/bimParamethy/building/get?paramType=1&projectid=${projectId}`)
        return data;
    }
    /**
     * 比较两个表的信息
     * @create zgf
     * @date 20210117
     * @param {*} baseTableName 基础表，需要返回数据的表
     * @param {*} targetTableName 目标表，需要比较的表
     * @param {*}  type  比较类型，1：比较id相同情况下，某列值是否相同，不相同则返回  2：比较两个表的新增或删除
     * @param {*}  columns  比较类型2中，需要比较的列名
     * @param {*}  option  {id,objectid,revitid,dtgcid,projectcode,projectnum,name,version,infotype,profession,familyname,familytype,materialid,elementattributes,categorypath,geometry,topologyelements,page}
     * @return {*} data{success：,content: }
     */
    async getCompareDataTwo(baseTableName, targetTableName, type, columns,option) {
        var sql = `paramType=${type}&baseTableName=${baseTableName}&targetTableName=${targetTableName}&columns=${columns}&page=1&rows=50`;
        //可选
        if (option.dtgcid) sql += `&dtgcid=${option.dtgcid}`;
        if (option.projectcode) sql += `&projectcode=${option.projectcode}`;
        if (option.projectnum) sql += `&projectnum=${option.projectnum}`;
        //比对的两个版本，版本中间用逗号隔开"1.0,3.0""
        if (option.version) sql += `&version=${option.version}`;
        if (option.profession) sql += `&profession=${option.profession}`;
        //可选
        if (option.level) sql += `&level=${option.level}`;
        if (option.catagory) sql += `&catagory=${option.catagory}`;
        if (option.boundingbox) sql += `&boundingbox=${option.boundingbox}`;
        if (option.userdata) sql += `&userdata=${option.userdata}`;
        if (option.objectid) sql += `&objectid=${option.objectid}`;
        //需要的列,中间用逗号隔开
        if (option.columns)
            sql += `&columns=${columns}`;
        var data = await axiosWraper.getData(
            `/agsupport-rest/agsupport/bimParamethy/dentity/get?${sql}`
        );
        return data;
    }
}

export default new serverData4BIM();