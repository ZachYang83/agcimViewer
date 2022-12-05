import serverData from "./js/serverData.js";
class StartUp {
    constructor() {

    }

    start(viewer) {
        this._viewer = viewer;
        window.FlatArray = [];
        this.flatten();
        window.isFlat = false;
        this._viewer.scene.globe.depthTestAgainstTerrain = false;
    }

    async flatten() {
        let data = await serverData.getJsonStore("name=flatten");
        let rows = data.content.rows;
        for (let i = 0; i < rows.length; i++) {
            rows[i].json = JSON.parse(rows[i].json);
            let areas = jsonToArray(rows[i].json);
            for (let j = 0; j < areas.length; j++) {
                let point = areas[j];
                window.FlatArray.push(point);
            }
        }
        function jsonToArray(json) {
            let points = []
            for (var key in json)
                points.push(json[key]);
            return points;
        }
    }


}

export default  new StartUp()