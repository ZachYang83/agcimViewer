class NameOverly {
    constructor() {
        this.nameOverlay = null;
        this.silhouetteBlue = null;
        this.silhouetteGreen = null;
        this.viewer = null;
        this._screenHandler=null;
        this._lastSelected=null;
    }
    initialize(viewer) {
        this.viewer = viewer;
        // If silhouettes are supported, silhouette features in blue on mouse over and silhouette green on mouse click.
        // If silhouettes are not supported, change the feature color to yellow on mouse over and green on mouse click.
        if (!Cesium.PostProcessStageLibrary.isSilhouetteSupported(viewer.scene))
            return;

        this.initializeDom(viewer);
        this.initializeVisual(viewer);

        // Silhouette a feature blue on hover.
        this._screenHandler=this.showInfo.bind(this);
        viewer.screenSpaceEventHandler.setInputAction(this._screenHandler,Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
    showInfo(movement) {
        // If a feature was previously highlighted, undo the highlight
        this.silhouetteBlue.selected = [];
        // Pick a new feature
        var pickedFeature = this.viewer.scene.pick(movement.endPosition);
        if (!Cesium.defined(pickedFeature)) {
            this.hide();
            return;
        }
        if(!pickedFeature.id){
            this.hide();
            return;
        }
        this.showAt(movement.endPosition.x, this.viewer.canvas.clientHeight - movement.endPosition.y, pickedFeature.id._id)

        // Highlight the feature if it's not already selected.
        if (pickedFeature !== this._lastSelected) {
            this._lastSelected=pickedFeature;
            this.silhouetteBlue.selected = [pickedFeature];
        }
    }
    hide() {
        this.nameOverlay.style.display = "none";
    }
    showAt(x, y, text) {
        // A feature was picked, so show it's overlay content
        this.nameOverlay.style.display = "block";
        this.nameOverlay.style.bottom = y + "px";
        this.nameOverlay.style.left = x + "px";
        this.nameOverlay.textContent = text;
    }
    initializeDom(viewer) {
        // HTML overlay for showing feature name on mouseover
        var nameOverlay = document.createElement("div");
        viewer.container.appendChild(nameOverlay);
        nameOverlay.className = "backdrop";
        nameOverlay.style.display = "none";
        nameOverlay.style.position = "absolute";
        nameOverlay.style.bottom = "0";
        nameOverlay.style.left = "0";
        nameOverlay.style["pointer-events"] = "none";
        nameOverlay.style.padding = "4px";
        nameOverlay.style.backgroundColor = "yellowgreen";
        this.nameOverlay = nameOverlay;
    }
    initializeVisual(viewer) {
        // Silhouettes are supported
        var silhouetteBlue = Cesium.PostProcessStageLibrary.createEdgeDetectionStage();
        silhouetteBlue.uniforms.color = Cesium.Color.BLUE;
        silhouetteBlue.uniforms.length = 0.01;
        silhouetteBlue.selected = [];
        var silhouetteGreen = Cesium.PostProcessStageLibrary.createEdgeDetectionStage();
        silhouetteGreen.uniforms.color = Cesium.Color.LIME;
        silhouetteGreen.uniforms.length = 0.01;
        silhouetteGreen.selected = [];
        var silhouetteStage= Cesium.PostProcessStageLibrary.createSilhouetteStage([
            silhouetteBlue,
            silhouetteGreen
        ]);
        silhouetteStage.usage='nameOverly'
        viewer.scene.postProcessStages.add(silhouetteStage);
        this.silhouetteBlue = silhouetteBlue;
        this.silhouetteGreen = silhouetteGreen;
    }
    dispose(){ 
        if(this._screenHandler){
            this.viewer.screenSpaceEventHandler.removeInputAction(this._screenHandler,Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        } 
        // this.viewer.container.removeChild(this.nameOverlay);
    }
}
export default new NameOverly();