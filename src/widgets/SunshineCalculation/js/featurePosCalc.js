import revitHelper from "@/sdk/bim/revitHelper";
class FeaturePosCalc{
    computePositions(selectedFeatures){
        var ids=[];
        var modelMatrix=null;
        for(var i=0;i<selectedFeatures.length;i++){
            ids.push(selectedFeatures[i].id);
            modelMatrix=selectedFeatures[i].modelMatrix;
        }
        var positionPromise = revitHelper.getComponentPosition(
            ids,
            modelMatrix,
            "agcim3dentity_a"
          );
          return positionPromise;
    }
    computePosition(){
        var positionPromises = featurePosCal.computePositions(selectedFeatures);
        positionPromises.then((datas) => {
          for (var i = 0; i < datas.length; i++) {
            _this.computeFeatureItemValue(datas[i], selectedFeatures[i], _this);
          }
          resultHelper.sortResult(statisticalTable, selectedFeatures);
          featureRender.setWindowColorByValue(statisticalTable, selectedFeatures);
        });
    }
}
export default new FeaturePosCalc();