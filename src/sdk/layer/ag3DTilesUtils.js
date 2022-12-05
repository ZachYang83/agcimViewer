import axiosWraper from "@/views/js/net/axiosWraper";

/**
 * class Ag3DTilesUtils 还没用上
 */
class Ag3DTilesUtils {
    /**
     * 获取BIM树数据
     * @param {sting} url BIM数据的url
     */
    getBIMTreeDataUrl(url) {
        var t = url.lastIndexOf('/');
        return url.substr(0, t) + "/info/index.json";
    }
    /**
     * 获取BIM树数据
     * @param {sting} url BIM数据的url
     */
    getBIMTreeData(url) {
        var realUrl = this.getBIMTreeDataUrl(url);
        return axiosWraper.getData(realUrl);
    }


}
export default Ag3DTilesUtils;