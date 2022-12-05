import axiosWraper from "@/views/js/net/axiosWraper"
import axios from '@/views/js/net/http';  
import qs from 'qs'; // 根据需求是否导入qs模块

class ServerData {
    //获取json管理数据
    getJsonStore(params) {
        return axiosWraper.getData(`/agsupport-rest/io/jsonstore/getByDomainAndUsage?${params}`);
    };
    // 新增json管理数据
    saveJsonStore(params) {
        let promise = axios.post(`/agsupport-rest/io/jsonstore/save`, qs.stringify(params));
        return promise;
    };
    //更新json管理数据
    updateJsonStore(params) {
        let promise = axios.post(`/agsupport-rest/io/jsonstore/update`, qs.stringify(params));
        return promise;
    };
    //删除json管理数据
    deleteJsonStore(params) {
        let promise = axios.delete(`/agsupport-rest/io/jsonstore/deleteById?${params}`);
        return promise;
    };
}
let serverData = new ServerData();
export default serverData;