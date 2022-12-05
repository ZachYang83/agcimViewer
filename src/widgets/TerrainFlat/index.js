import Draw from "../../sdk/interactive/draw.js";
import serverData from "./js/serverData.js";

class TerrainFlattening {

    constructor(viewer) {
        this.viewer;
        this.draw;
        this.server;
        this.viewerContainer;
        this.flattenPolygon = [];
    }
    init(viewer) {
        let _this = this;
        this.viewer = viewer;
        this.viewerContainer = this.viewer._element;
        this.draw = new Draw(viewer);
        this.server = serverData;
        this.addPanel();   //添加设置面板
    }
    addPanel() {
        let panel = document.createElement('div');
        panel.className = 'flatten-setting';
        panel.innerHTML = '<div class="title">地形压平<div/>' +
            '<div class="description">左键点击开始，单击右键于当前位置结束，单击鼠标中键于上一个点位置结束<div/>' +
            '<button class="ant-btn ant-btn-block btn-start">选择区域</button>' +
            '<button class="ant-btn ant-btn-block btn-upload">保存结果</button>' +
            '<button class="ant-btn ant-btn-block btn-cancel">取消</button>' +
            '<button class="ant-btn ant-btn-block btn-close">关闭</button>';
        panel.style.width = '400px';
        panel.style.position = "absolute";
        panel.style.left = '200px';
        panel.style.top = '150px';
        panel.style.background = "rgba(0,0,0,0.5)";
        panel.style.fontSize = "14px";
        panel.style.color = "#fff";
        panel.style.textAlign = "center";
        panel.style.padding = "5px 10px";

        let btn = panel.getElementsByClassName('ant-btn');
        for (let i = 0; i < btn.length; i++) {
            btn[i].style.margin = "5px 0px 0px 0px";
        }
        let ttl = panel.getElementsByClassName("title")[0];
        let seleteBtn = panel.getElementsByClassName("btn-start")[0];
        let uploadBtn = panel.getElementsByClassName("btn-upload")[0];
        let cancelBtn = panel.getElementsByClassName("btn-cancel")[0];
        let closeBtn = panel.getElementsByClassName("btn-close")[0];
        this.panelNode = {
            title: ttl,
            seleteBtn: seleteBtn,
            uploadBtn: uploadBtn,
            cancelBtn: cancelBtn,
            closeBtn: closeBtn
        }
        this.nodeClick();
        this.viewerContainer.appendChild(panel);

    }

    nodeClick() {
        let _this = this;
        this.panelNode.closeBtn.onclick = function () {
            _this.remove();
        }
        this.panelNode.seleteBtn.onclick = function () {
            _this.draw.drawPolygon().then(result => {
                var positions = result.positions;
                let s = { "area1": [] };
                for (let i = 0; i < positions.length; i++) {
                    s.area1.push(positions[i]);
                }
                _this.flattenPolygon = s;
            }, error => {
                console.log(error);
            });
        };
        this.panelNode.uploadBtn.onclick = function () {
            let params = {
                name: "flatten" + Math.random() * 1000,
                domain: "GZ",
                usage: "flatten",
                url: "",
                sort: "",
                json: JSON.stringify(_this.flattenPolygon),
                tag: ""
            };
            let promise = _this.server.saveJsonStore(params);
            promise.then(
                function (data) {
                }.bind(_this)
            );
        }
        this.panelNode.cancelBtn.onclick = function () {
            _this.flattenPolygon = [];
            _this.removePolygon();
        }
    }
    removePanel() {
        let cuttingPanel = this.viewerContainer.getElementsByClassName("flatten-setting");
        if (cuttingPanel.length > 0) {
            cuttingPanel[0].remove();
        }
    }
    removePolygon() {
        this.draw._removeEntitiesByName('agPolygon');
    }
    remove() {
        this.removePanel();
        this.removePolygon();
        this.flattenPolygon = [];

    }
}
var flatten = new TerrainFlattening();
export default flatten;