class legendData {
    constructor() {
        this.lengendInfo = [
            {
                level: "≥10000",
                color: "#660208",
                minValue: 10000,
                maxValue: 1000000,
                colorRed: 102 / 255,
                colorGreen: 2 / 255,
                colorBlue: 8 / 255,
                colorAlpha: 1
            },
            {
                level: "1000-9999",
                color: "#8C0D0D",
                minValue: 1000,
                maxValue: 9999,
                colorRed: 140 / 255,
                colorGreen: 13 / 255,
                colorBlue: 13 / 255,
                colorAlpha: 1
            },
            {
                level: "100-999",
                color: "#CC2929",
                minValue: 100,
                maxValue: 999,
                colorRed: 204 / 255,
                colorGreen: 41 / 255,
                colorBlue: 41 / 255,
                colorAlpha: 1
            },
            {
                level: "10-99",
                color: "#FF7B69",
                minValue: 10,
                maxValue: 99,
                colorRed: 255 / 255,
                colorGreen: 123 / 255,
                colorBlue: 105 / 255,
                colorAlpha: 1
            },
            {
                level: "1-9",
                color: "#FFAA85",
                minValue: 1,
                maxValue: 9,
                colorRed: 255 / 255,
                colorGreen: 170 / 255,
                colorBlue: 133 / 255,
                colorAlpha: 1
            },
            {
                level: "0",
                color: "#FFFFFF",
                minValue: 0,
                maxValue: 0,
                colorRed: 255 / 255,
                colorGreen: 255 / 255,
                colorBlue: 255 / 255,
                colorAlpha: 1
            }
        ];
    }
    // 图例加载
    loadLengend() {
        // var viewerContainer = this.viewer._element;
        var lengendCon = document.getElementsByClassName("epidemic-lengend")[0];
        var lengend = document.createElement("div");
        lengend.className = "cesium-viewer-lengend";
        for (let i = 0; i < this.lengendInfo.length; i++) {
            lengend.innerHTML +=
                '<i class="color" style="background:' +
                this.lengendInfo[i].color +
                '"></i>' +
                this.lengendInfo[i].level +
                "<br>";
        }
        lengendCon.appendChild(lengend);
    }
    /**
     * 获得图例颜色
     * @param {*} d 
     */
    getRGBColor(d) {
        for (let i = 0; i < this.lengendInfo.length; i++) {
            if (d >= this.lengendInfo[i].minValue) {
                return new Cesium.Color(
                    this.lengendInfo[i].colorRed,
                    this.lengendInfo[i].colorGreen,
                    this.lengendInfo[i].colorBlue
                );
            }
        }
    }
}
export default new legendData();