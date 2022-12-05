import coordinate from "@/sdk/maths/coordinate";
export default class Roaming {
    /**
     *创建漫游实例。
    * @param {*} viewer 需要传入
    * @param {*} options.entityType 创建实体类型 需要传入 //model/other
    * @param {*} options.modelUrl 创建实体类型为model时需要传入，模型的uri
    * @param {*} options.time 漫游时间  需要传入
    * @param {*} options.speed 漫游速度  可传入，不传默认为120
    * @param {*} options.start 开始节点 不需要传入
    * @param {*} options.stop  结束节点 不需要传入
    * @param {*} options.Lines  点集合 需要传入 
    * @param {*} options.disArr  点距离集合 需要传入
    * @param {*} options.isPathShow 路径是否显示 需要传入
    * @param {*} options.entityModel 创建实体对象 不是必须的，实体类型为other时可传入，
    * @memberof Roaming
    */
    constructor (viewer, options) {
      this.viewer = viewer;
      this.entity = undefined;
      this.url = options.modelUrl;
      this.time = options.time;
      this.start = undefined;
      this.stop = undefined;
      this.Lines = options.Lines;
      this.disArr = options.disArr;
      this.speed = options.speed || 50;
      this.flyheight = options.flyheight || 0;
      this.isPathShow = options.isPathShow;
      this.entityType = options.entityType;
      this.entityModel = options.entityModel;
      this.property = this.ComputeRoamingLineProperty(options.Lines, this.time, options.start);
      this.initRoaming(options.entityType);
      
    }
    /**
       *
       *
       * @param {*} Lines 点集合
       * @param {*} time 漫游时间
       * @param {*} start 开始时间节点
       * @returns
       * @memberof Roaming
       */
    ComputeRoamingLineProperty (Lines, time) {
        let property = new Cesium.SampledPositionProperty();
        let lineLength = Lines.length;
        let tempTime1 = time - time % lineLength;
        let increment = tempTime1 / lineLength;
        let tempTime = time;
        let start = Cesium.JulianDate.now();
        this.start = start;
        let stop = Cesium.JulianDate.addSeconds(start, tempTime, new Cesium.JulianDate());
        this.stop = stop;
        this.viewer.clock.startTime = start.clone();
        this.viewer.clock.stopTime = stop.clone();
        this.viewer.clock.currentTime = start.clone();
        this.viewer.clock.clockRange = Cesium.ClockRange.UNBOUNDED ;// Loop at the end
        this.viewer.clock.multiplier = 1;
        // this.viewer.clock.shouldAnimate = true;
        // this.viewer.timeline.zoomTo(start, stop);
        let preTime = 0;
        
        for (let i = 0; i < lineLength; i++) {
            let time =0
            if(i==0){
                time = Cesium.JulianDate.addSeconds(start, 0, new Cesium.JulianDate());
            }else{
                preTime += Math.floor(this.disArr[i-1]/(this.speed));
                if(i==lineLength-1){
                    preTime ==tempTime;
                }
                time = Cesium.JulianDate.addSeconds(start, preTime, new Cesium.JulianDate());
            }
            let position = Lines[i];
            if(this.flyheight && this.flyheight!=0){
                var cartographic = coordinate.cartesian3ToCartographic(Lines[i],"Radians");
                cartographic.height += this.flyheight;
                position = coordinate.cartographicToCartesian3(cartographic);
            }
            property.addSample(time, position);
        }
        
      return property
    }
    
    initRoaming(entityType){
        this.EndRoaming ();
        if(entityType=='empty'){
            this.InitEmptyRoaming(this.property, this.start, this.stop);
          }else {
            this.InitModelRoaming(this.property, this.start, this.stop, this.isPathShow);
          }
    }
    /**
       * @param {*} position computeRoamingLineProperty计算的属性
       * @param {*} start 开始时间节点
       * @param {*} stop 结束时间节点
       * @param {*} isPathShow path路径是否显示
       * @memberof Roaming
       */
    InitModelRoaming (position, start, stop, isPathShow) {
        this.entity = this.viewer.entities.add({
            availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
                start: start,
                stop: stop
            })]),
            // 位置
            position: position,
            // 计算朝向
            orientation: new Cesium.VelocityOrientationProperty(position),
            // 加载模型
            model: {
                // 模型路径
                // uri: './model3d/CesiumMan/Cesium_Man.glb',
                // uri: './model3d/CesiumAir/Cesium_Air.glb',
                uri: this.url,
                // 模型最小刻度
                // minimumPixelSize: 64,
                // maximumSize: 128,
                // // 设置模型最大放大大小
                // maximumScale: 200,
                // 模型是否可见
                show: true,
                // 模型轮廓颜色
                silhouetteColor: Cesium.Color.WHITE,
                // 模型颜色  ，这里可以设置颜色的变化
                // color: color,
                // 仅用于调试，显示模型绘制时的线框
                debugWireframe: false,
                // 仅用于调试。显示模型绘制时的边界球。
                debugShowBoundingVolume: false,
                scale: 1,
                runAnimations: true // 是否运行模型中的动画效果
            },
            path: {
                resolution: 1,
                material: new Cesium.PolylineGlowMaterialProperty({
                    glowPower: 0.1,
                    color: Cesium.Color.YELLOW
                }),
                width: 10,
                show: isPathShow
            }
        })
        // this.entity.position.setInterpolationOptions({// 点插值
        //     interpolationDegree: 5,
        //     interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
        // })
        // this.viewer.trackedEntity = this.entity
    }
    InitEmptyRoaming (position, start, stop) {
        var entitiesOption = {
            name : 'Blue box',
            availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
                start: start,
                stop: stop
            })]),
            position: position,
            box : {
                dimensions : new Cesium.Cartesian3(4.0, 3.0, 5.0),
                material : Cesium.Color.BLUE
            },
            path:this.Lines,
            show:false,
            viewFrom: new Cesium.Cartesian3(-200.0, 0.0, 200.0),
            orientation : new Cesium.VelocityOrientationProperty(position)
        }
        this.entity = this.viewer.entities.add(entitiesOption);
        // this.viewer.trackedEntity = this.entity;
        
    }

    /**
     *漫游的暂停和继续
     * @param {*} state bool类型 false为暂停，ture为继续
     * @memberof Roaming
     */
    PauseOrContinue (state) {
       this.viewer.clock.shouldAnimate = state
    }
    /**
     *改变飞行的速度
     * @param {*} value  整数类型
     * @memberof Roaming
     */
    ChangeRoamingSpeed (value) {
        var speed = value/this.speed ;
       this.viewer.clock.multiplier = speed
    }
    /**
     *改变实体对象
     * @param {*} value  实体对象模型
     * @memberof Roaming
     */
    ChangeEntityBox (value,type,typeValue) {
        this.entity.box =value;
        if(type){
            this.entity.type = typeValue;
        }
    }
    /**
     *改变模型
     *
     * @param {*} url  模型url
     * @memberof Roaming
     */
    ChangeEntityModel (entityType,url) {
        this.url =url;
        this.initRoaming(entityType);
        // this.entity.model.uri =url;
    }
    /**
     *改变显示路线
     *
     * @param {*} isPathShow  模型url
     * @memberof Roaming
     */
    ChangeEntityPathShow (isPathShow) {
        if(this.entityType!='empty') {
            this.entity.path.show._value =isPathShow;
        }
        
    }
    /**
     *
     *取消漫游
     * @memberof Roaming
     */
    EndRoaming () {
      if (this.entity) {
         this.viewer.entities.remove(this.entity)
      }
    }
}