import serverData from "./serverData";
import AgChart from "@/sdk/ui/chart.js"
var echarts = require("echarts"); //引入echarts
var agChart = new AgChart();
class ChartData {
    /**
     * 封装全国/省/市/县/小区的dataList
     */
    getDistrictData(parent) {
        var districtDataList = [
            {
                dataX: parent.dateArr,
                title: parent.detailTitle + "累计确诊",
                legend: ["累计确诊"],
                series: [
                    {
                        name: "累计确诊",
                        type: "line",
                        data: parent.cumComfireArr
                    }
                ],
                grid: {
                    width: "80%",
                    height: "50%",
                    right: "5%"
                }
            },
            {
                dataX: parent.dateArr,
                title: parent.detailTitle + "现有确诊",
                legend: ["现有确诊"],
                series: [
                    {
                        name: "现有确诊",
                        type: "line",
                        data: parent.existComArr
                    }
                ],
                grid: {
                    width: "80%",
                    height: "50%",
                    right: "5%"
                }
            },
            {
                dataX: parent.dateArr,
                title: parent.detailTitle + "现有疑似",
                legend: ["现有疑似"],
                series: [
                    {
                        name: "现有疑似",
                        type: "line",
                        data: parent.existSuspectArr

                    }
                ],
                grid: {
                    width: "80%",
                    height: "50%",
                    right: "5%"
                }
            },
            {
                dataX: parent.dateArr,
                title: parent.detailTitle + "累计重症",
                legend: ["累计重症"],
                series: [
                    {
                        name: "累计重症",
                        type: "line",
                        data: parent.cumServerArr
                    }
                ],
                grid: {
                    width: "80%",
                    height: "50%",
                    right: "5%"
                }
            },
            {
                dataX: parent.dateArr,
                title: parent.detailTitle + "现有重症",
                legend: ["现有重症"],
                series: [
                    {
                        name: "现有重症",
                        type: "line",
                        data: parent.existServeArr
                    }
                ],
                grid: {
                    width: "80%",
                    height: "50%",
                    right: "5%"
                }
            },
            {
                dataX: parent.dateArr,
                title: parent.detailTitle + "累计死亡",
                legend: ["累计死亡"],
                series: [
                    {
                        name: "累计死亡",
                        type: "line",
                        data: parent.cumDeathArr
                    }
                ],
                grid: {
                    width: "80%",
                    height: "50%",
                    right: "5%"
                }
            },
            {
                dataX: parent.dateArr,
                title: parent.detailTitle + "累计治愈",
                legend: ["累计治愈"],
                series: [
                    {
                        name: "累计治愈",
                        type: "line",
                        data: parent.cumRecoveredArr
                    }
                ],
                grid: {
                    width: "80%",
                    height: "50%",
                    right: "5%"
                }
            },
            {
                dataX: parent.dateArr,
                title: parent.detailTitle + "累计境外输入",
                legend: ["累计境外输入"],
                series: [
                    {
                        name: "累计境外输入",
                        type: "line",
                        data: parent.cumImportedArr
                    }
                ],
                grid: {
                    width: "80%",
                    height: "50%",
                    right: "5%"
                }
            }
        ];
        return districtDataList;
    }
    /**
     * 封装echarts的渲染
     * @param {*} dataList 
     */
    renderAllEcharts(dataList) {
        var a = document.getElementById("first");
        var b = document.getElementById("second");
        var c = document.getElementById("third");
        var d = document.getElementById("fourth");
        var e = document.getElementById("fifth");
        var f = document.getElementById("sixth");
        var g = document.getElementById("seventh");
        var h = document.getElementById("eighth");
        let chartsArr = [a, b, c, d, e, f, g, h];
        for (let i = 0; i < chartsArr.length; i++) {
            var a = chartsArr.indexOf(chartsArr[i]);
            var myChart = echarts.init(chartsArr[i]);
            if (dataList.length >= 0 && chartsArr.length >= dataList.length) {
                var optionObj = agChart.buildChartOption(
                    dataList[a].title,
                    dataList[a].legend,
                    dataList[a].grid,
                    dataList[a].dataX,
                    dataList[a].series
                );
            }
            myChart.setOption(optionObj);
        }
    }

    /**
     * axios获取echarts-country 重新构造数据格式
     */
    // getCountryMsg(parent) {
    //     serverData.getCountryInfo().then(response => {
    //         var data = response;
    //         serverData.extractServerData(data,parent);
    //         let country = this.getDistrictData(parent);
    //         this.renderAllEcharts(country);
    //     });
    // };
    getCountryMsg(detailTitle) {
        serverData.getCountryInfo().then(response => {
            var data = response;
            parent = serverData.extractServerData(data,detailTitle);
            let country = this.getDistrictData(parent);
            this.renderAllEcharts(country);
        });
    };
    /**
     * axios获取echarts-province 重新构造数据格式
     */
    getProvinceMsg(detailTitle) {
        serverData.getProvinceInfoEhcarts().then(response => {
            var data = response;
            parent = serverData.extractServerData(data,detailTitle);
            let province = this.getDistrictData(parent);
            // let province = this.getDistrictData(data);
            this.renderAllEcharts(province);
        });
    };
    //axios获取echarts-City 重新构造数据格式
    getCityMsg(detailTitle) {
        serverData.getCityInfo().then(response => {
            var data = response;
            parent = serverData.extractServerData(data, detailTitle);
            let city = this.getDistrictData(parent);
            this.renderAllEcharts(city);
        });
    };
    //axios获取echarts-County重新构造数据格式
    getCountyMsg(detailTitle) {
        serverData.getCountyInfo().then(response => {
            var data = response;
            parent = serverData.extractServerData(data,detailTitle);
            let county = this.getDistrictData(parent);
            this.renderAllEcharts(county);
        });
    };
    //axios获取echarts-community重新构造数据格式
    getCommunityMsg(detailTitle) {
        serverData.getCountyInfo().then(response => {
            var data = response;
            parent = serverData.extractServerData(data, detailTitle);
            let community = this.getDistrictData(parent);
            this.renderAllEcharts(community);
        });
    };
}
export default new ChartData();