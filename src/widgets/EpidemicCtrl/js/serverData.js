import axiosWraper from "@/views/js/net/axiosWraper" 
class ServerData {
    //获取国家级疫情数据-county-echarts
    getCountryInfo() {
        return axiosWraper.getData(`/MongoDBTable/getAll/epidemic_t_country`);
    };
    //获取省级疫情数据-city-ehcarts
    getProvinceInfoEhcarts() {
        // return axiosWraper.getData(`/MongoDBTable/getAll/epidemic_s_province`);
        return axiosWraper.getData(`/MongoDBTable/getAll/epidemic_t_province`);
    }
    //获取城市级疫情数据-city-echarts
    getCityInfo() {
        // return axiosWraper.getData(`/MongoDBTable/getAll/epidemic_s_city`);
        return axiosWraper.getData(`/MongoDBTable/getAll/epidemic_t_city`);
    };
    //获取城市级疫情数据-city-echarts
    getCityInfo() {
        // return axiosWraper.getData(`/MongoDBTable/getAll/epidemic_s_city`);
        return axiosWraper.getData(`/MongoDBTable/getAll/epidemic_t_city`);
    };
    //获取县级疫情数据-county-echarts
    getCountyInfo() {
        return axiosWraper.getData(`/MongoDBTable/getAll/epidemic_t_county`);
    }
    //获取区级疫情数据-community-ehcarts
    getCommunityInfo() {
        return axiosWraper.getData(`/MongoDBTable/getAll/epidemic_t_community`);
    }
    /**
     * 获取人员数据
     * */
    getPersonCaseInfo() {
        return axiosWraper.getData(`/MongoDBTable/getAll/epidemic_t_travel`);
    }

    // 根据表名称 获取防疫数据信息
    getEpidemicData(tableName, saver, saverName) {
        var promise =  axiosWraper.getData(`/MongoDBTable/getAll/${tableName}`);
        if (saver) {
            promise.then(function (data) {
                saver[saverName] = data;
            })
        } 
        return promise; 
    }
    // 根据表名称 获取防疫数据信息、迁徙数据
    getMigrationData(saver, saverName) {
        var promise = axiosWraper.getData(`/MongoDBTable/getAll/epidemic_d_migration`);
        if (saver) {
            promise.then(function (data) {
                saver[saverName] = data;
            })
        } 
        return promise;  
    }

    /**
     * 提取服务器数据
     * @param {*} data 
     */
    extractServerData(data, title) {
        let cumComfireArr = [] //累计确诊病例
        let existComArr = [] //现有确诊
        let existSuspectArr = [] //现有疑似
        let existServeArr = [] //现有重症
        let cumServerArr = [] //累计重症
        let cumDeathArr = [] //累计死亡
        let cumRecoveredArr = [] //累计治愈
        let cumImportedArr = [] // 累计境外输入
        let dateArr = [] //日期
        for (let i = 0; i < data.length; i++) {
            cumComfireArr.push(data[i].cumulative_confirmed); //累计确诊病例 cumComfireArr
            existComArr.push(data[i].existing_confirmed); //现有确诊
            existSuspectArr.push(data[i].existing_suspect); //现有疑似
            cumServerArr.push(data[i].cumulative_servere); //累计重症
            existServeArr.push(data[i].existing_severe); //现有重症
            cumDeathArr.push(data[i].cumulative_death); //累计死亡
            cumRecoveredArr.push(data[i].cumulative_recovered); //累计治愈
            cumImportedArr.push(data[i].cumulative_imported); //累计境外输入
            dateArr.push(data[i].date); //日期
        }
        let parent = {
            cumComfireArr: cumComfireArr,
            existComArr: existComArr,
            existSuspectArr: existSuspectArr, //现有疑似
            existServeArr: existServeArr, //现有重症
            cumServerArr: cumServerArr, //累计重症
            cumDeathArr: cumDeathArr, //累计死亡
            cumRecoveredArr: cumRecoveredArr, //累计治愈
            cumImportedArr: cumImportedArr, // 累计境外输入
            dateArr: dateArr, //日期
            detailTitle: title //标题
        }
        return parent
    }
}
let serverData = new ServerData();
export default serverData;