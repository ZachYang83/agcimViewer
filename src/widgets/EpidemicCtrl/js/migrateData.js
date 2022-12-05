import serverData from "./serverData";
import agMigrateLayer from "@/sdk/layer/migrateLayer.js";

class MigrateData {
    constructor() {
        this.migrateData = null;
        this.isMigrate=false;
        serverData.getMigrationData(this, "migrateData");
    }
    // 筛选迁出、迁入城市为选定城市的数据
    filterDataByCity(inOrOut, cityName) {
        let data = [];
        let migrateData = this.migrateData;
        for (let i = 0; i < migrateData.length; i++) {
            if (migrateData[i][inOrOut] == cityName) {
                data.push(migrateData[i]);
            }
        }
        return data;
    }
    /**
     *  按最大值排序
     */
    sort() {
        let data = this.migrateData;
        let max;
        for (let i = 0; i < data.length; i++) {
            for (let j = i; j < data.length; j++) {
                if (data[i].new_migrated < data[j].new_migrated) {
                    max = data[j];
                    data[j] = data[i];
                    data[i] = max;
                }
            }
        }
        this.migrateData = data;
    }
    /**
     * 渲染迁徙数据到表格数据
     *  */ 
    showTable(data) {
        let table = "";

        if (data && data.length > 0) {
            let len = data.length > 10 ? 10 : data.length;
            for (let i = 0; i < len; i++) {
                table +=
                    "<tr><td>" +
                    (i + 1) +
                    "</td>" +
                    "<td>" +
                    data[i].move_out_city_name +
                    "-" +
                    data[i].move_in_city_name +
                    "</td>" +
                    "<td>" +
                    data[i].new_migrated +
                    "</td></tr>";
            }
        } else {
            table += "<tr><td></td><td>暂无数据</td><td></td></tr>";
        }
        document
            .getElementsByClassName("migrate-table")[0]
            .getElementsByTagName("tbody")[0].innerHTML = table;
    }
    /**
     * 根据数据加载，数据为服务器获取的数据中筛选
     */
    loadData(viewer, data) {
        for (var i = 0; i < data.length; i++) {
            var s1 = data[i].move_out_city_location.split(',');
            var s2 = data[i].move_in_city_location.split(',');
            var ss1 = [Number(s1[0]), Number(s1[1])];
            var ss2 = [Number(s2[0]), Number(s2[1])];
            agMigrateLayer.addRow(viewer, ss1, ss2);
        }
    }
    /**
     * 设置对象可见性
     * @param {*} visible 
     */
    setVisible(visible){
        agMigrateLayer.setVisible(visible);
    }
    /**
     * 移除所有内容
     * @param {*} viewer 
     */
    removeAll(viewer){
        agMigrateLayer.removeAll(viewer);
    }
    /**
     * 重置渲染添加，添加迁徙图
     * @param {*} viewer 
     * @param {*} moveInOrMoveOut 
     * @param {*} moveInFieldName 
     * @param {*} moveInCityName 
     */
    resetMigrate(viewer,moveInOrMoveOut,moveInFieldName,moveInCityName) {
        this.removeAll(viewer);
        var curMigrateData = this.filterDataByCity(
          moveInFieldName,
          moveInCityName
        );
        this.showTable(curMigrateData);
        if (!curMigrateData || curMigrateData.length == 0) return;
  
        this.isMigrate = true;
        if (moveInOrMoveOut == "moveIn") {
          this.loadData(viewer, curMigrateData);
          return;
        }
        // 迁出
        for (let i = 0; i < curMigrateData.length; i++) {
            this.loadData(viewer, [curMigrateData[i]]);
        }
      }
}
export default new MigrateData();