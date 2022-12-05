class picker {
    constructor() {
        this.viewer = null;
        this._selectedEntity = null;
        this._pickerHandler = null;
        this._userHandler = null;
    }

    initialize(viewer, handler) {
        this.viewer = viewer;
        this._userHandler = handler;
        this._selectedEntity = new Cesium.Entity();
        this._pickerHandler = this.onPickItem.bind(this);
        viewer.screenSpaceEventHandler.setInputAction(this._pickerHandler, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
    onPickItem(movement) {
        var pickedFeature = this.viewer.scene.pick(movement.position);
        if (typeof pickedFeature != "undefined") {
            this.showSelectInfo(pickedFeature);
        }
        this._userHandler(movement, pickedFeature)
    }
    showSelectInfo(pickedFeature) {
        this._selectedEntity.description =
            'Loading <div class="cesium-infoBox-loading"></div>';
        this.viewer.selectedEntity = this._selectedEntity;
        this._selectedEntity.description =
            '<table class="cesium-infoBox-defaultTable"><tbody>' +
            "<tr><th>BIN</th><td>" +
            pickedFeature.id._id +
            "</td></tr>";
        ("</tbody></table>");
    }

    dispose() {
        if(!this.viewer)
            return;
        this.viewer.screenSpaceEventHandler.removeInputAction(this._pickerHandler, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
}
export default new picker();