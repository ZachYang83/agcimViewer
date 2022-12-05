var postStage;

class ViewShed {
    constructor() {
        this.viewer = null;
        this.shadowMap = null;
    }
    initialize(observationPoint, targetPoint, horizontalViewAngle, verticalViewAngle, viewer) {
        var secondSubtractFirst = Cesium.Cartesian3.subtract(targetPoint, observationPoint, new Cesium.Cartesian3());
        this.direction = Cesium.Cartesian3.normalize(secondSubtractFirst, new Cesium.Cartesian3());
        this.up = Cesium.Cartesian3.normalize(observationPoint, new Cesium.Cartesian3());
        this.visualRange = Cesium.Cartesian3.magnitude(secondSubtractFirst);
        this.horizontalViewAngle = horizontalViewAngle || 90;
        this.verticalViewAngle = verticalViewAngle || 90;
        this.viewPosition = observationPoint;

        this.viewer = viewer;
    }
    getVisualRange() {
        return this.visualRange;
    }
    setHorizontalViewAngle(viewAngle) {
        this.horizontalViewAngle = viewAngle;
        this.updateViewShed();
    }
    setVerticalViewAngle(viewAngle) {
        this.verticalViewAngle = viewAngle;
        this.updateViewShed();
    }
    updateViewShed() {
        this.clear();
        this.createPostStage();
    }
    createPostStage() {
        const fs = `
        #define USE_CUBE_MAP_SHADOW true
        uniform sampler2D colorTexture;
        uniform sampler2D depthTexture;
        varying vec2 v_textureCoordinates;
        uniform mat4 camera_projection_matrix;
        uniform mat4 camera_view_matrix;
        uniform float far;
        uniform samplerCube shadowMap_textureCube;
        uniform mat4 shadowMap_matrix;
        uniform vec4 shadowMap_lightPositionEC;
        uniform vec4 shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness;
        uniform vec4 shadowMap_texelSizeDepthBiasAndNormalShadingSmooth;

        struct zx_shadowParameters
        {
            vec3 texCoords;
            float depthBias;
            float depth;
            float nDotL;
            vec2 texelStepSize;
            float normalShadingSmooth;
            float darkness;
        };

        float czm_shadowVisibility(samplerCube shadowMap, zx_shadowParameters shadowParameters)
        {
            float depthBias = shadowParameters.depthBias;
            float depth = shadowParameters.depth;
            float nDotL = shadowParameters.nDotL;
            float normalShadingSmooth = shadowParameters.normalShadingSmooth;
            float darkness = shadowParameters.darkness;
            vec3 uvw = shadowParameters.texCoords;
            depth -= depthBias;
            float visibility = czm_shadowDepthCompare(shadowMap, uvw, depth);
            return czm_private_shadowVisibility(visibility, nDotL, normalShadingSmooth, darkness);
        }

        vec4 getPositionEC(){
            return czm_windowToEyeCoordinates(gl_FragCoord);
        }

        vec3 getNormalEC(){
            return vec3(1.);
        }

        vec4 toEye(in vec2 uv,in float depth){
            vec2 xy=vec2((uv.x*2.-1.),(uv.y*2.-1.));
            vec4 posInCamera=czm_inverseProjection*vec4(xy,depth,1.);
            posInCamera=posInCamera/posInCamera.w;
            return posInCamera;
        }

        vec3 pointProjectOnPlane(in vec3 planeNormal,in vec3 planeOrigin,in vec3 point){
            vec3 v01=point-planeOrigin;
            float d=dot(planeNormal,v01);
            return(point-planeNormal*d);
        }

        float getDepth(in vec4 depth){
            float z_window=czm_unpackDepth(depth);
            z_window=czm_reverseLogDepth(z_window);
            float n_range=czm_depthRange.near;
            float f_range=czm_depthRange.far;
            return(2.*z_window-n_range-f_range)/(f_range-n_range);
        }

        float shadow( in vec4 positionEC ){
            vec3 normalEC=getNormalEC();
            zx_shadowParameters shadowParameters;
            shadowParameters.texelStepSize=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.xy;
            shadowParameters.depthBias=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.z;
            shadowParameters.normalShadingSmooth=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.w;
            shadowParameters.darkness=shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.w;
            vec3 directionEC=positionEC.xyz-shadowMap_lightPositionEC.xyz;
            float distance=length(directionEC);
            directionEC=normalize(directionEC);
            float radius=shadowMap_lightPositionEC.w;
            if(distance>radius)
            {
                return 2.0;
            }
            vec3 directionWC=czm_inverseViewRotation*directionEC;
            shadowParameters.depth=distance/radius-0.0003;
            shadowParameters.nDotL=clamp(dot(normalEC,-directionEC),0.,1.);
            shadowParameters.texCoords=directionWC;
            float visibility=czm_shadowVisibility(shadowMap_textureCube,shadowParameters);
            return visibility;
        }

        bool visible(in vec4 result)
        {
            result.x/=result.w;
            result.y/=result.w;
            result.z/=result.w;
            return result.x>=-1.&&result.x<=1.
            &&result.y>=-1.&&result.y<=1.
            &&result.z>=-1.&&result.z<=1.;
        }

        void main(){
            // 得到釉色 = 结构二维(彩色纹理,纹理坐标)
            gl_FragColor=texture2D(colorTexture,v_textureCoordinates);
            // 深度 = (釉色 = 结构二维(深度纹理,纹理坐标))
            float depth=getDepth(texture2D(depthTexture,v_textureCoordinates));
            // 视角 = (纹理坐标,深度)
            vec4 viewPos=toEye(v_textureCoordinates,depth);
            //世界坐标
            vec4 wordPos=czm_inverseView*viewPos;
            // 虚拟相机中坐标
            vec4 vcPos=camera_view_matrix*wordPos;
            float near=.001*far;
            float dis=length(vcPos.xyz);
            if(dis>near&&dis<far){
                //透视投影
                vec4 posInEye=camera_projection_matrix*vcPos;
                // 可视区颜色
                vec4 v_color=vec4(0.,1.,0.,.5);
                vec4 inv_color=vec4(1.,0.,0.,.5);
                if(visible(posInEye)){
                    float vis=shadow(viewPos);
                    if(vis>0.3){
                        gl_FragColor=mix(gl_FragColor,v_color,.5);
                    } else{
                        gl_FragColor=mix(gl_FragColor,inv_color,.5);
                    }
                }
            }
        }`;

        var vm = this;
        this.lightCamera = new Cesium.Camera(vm.viewer.scene);
        this.lightCamera.frustum.near = 0.005 * this.visualRange;
        this.lightCamera.frustum.far = this.visualRange;
        const hr = Cesium.Math.toRadians(this.horizontalViewAngle);
        const vr = Cesium.Math.toRadians(this.verticalViewAngle);
        const aspectRatio =
            (this.visualRange * Math.tan(hr / 2) * 2) /
            (this.visualRange * Math.tan(vr / 2) * 2);
        this.lightCamera.frustum.aspectRatio = aspectRatio;
        if (hr > vr) {
            this.lightCamera.frustum.fov = hr;
        } else {
            this.lightCamera.frustum.fov = vr;
        }
        this.lightCamera.setView({
            destination: this.viewPosition,
            orientation: {
                direction: this.direction,
                up: this.up
            }
        });

        this.enabled = true;
        this.size = 2048;
        this.cascadesEnabled = false;
        this.softShadows = false;
        this.normalOffset = true;
        this.isPointLight = true;

        vm.shadowMap = new Cesium.ShadowMap({
            context: vm.viewer.scene.context,
            lightCamera: this.lightCamera,
            enabled: this.enabled,
            isPointLight: this.isPointLight,
            pointLightRadius: this.visualRange,
            cascadesEnabled: this.cascadesEnabled,
            //numberOfCascades : 1,
            size: this.size,
            softShadows: this.softShadows,
            normalOffset: this.normalOffset,

            fromLightSource: false    //关闭光源光影显示（打开会出现以选中点为中心的所有阴影
        });
        vm.shadowMap.debugShow = false;
        vm.viewer.scene.shadowMap = vm.shadowMap;

        postStage = new Cesium.PostProcessStage({
            fragmentShader: fs,
            uniforms: {
                camera_projection_matrix: this.lightCamera.frustum.projectionMatrix,
                camera_view_matrix: this.lightCamera.viewMatrix,
                far: this.visualRange,
                shadowMap_textureCube: (function () {
                    vm.shadowMap.update(vm.viewer.scene._frameState);
                    return vm.shadowMap._shadowMapTexture;
                })(),
                shadowMap_matrix: (function () {
                    vm.shadowMap.update(vm.viewer.scene._frameState);
                    return vm.shadowMap._shadowMapMatrix;
                })(),
                shadowMap_lightPositionEC: (function () {
                    vm.shadowMap.update(vm.viewer.scene._frameState);
                    return vm.shadowMap._lightPositionEC;
                })(),
                shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness: (function () {
                    vm.shadowMap.update(vm.viewer.scene._frameState);
                    const bias = vm.shadowMap._pointBias;
                    return Cesium.Cartesian4.fromElements(
                        bias.normalOffsetScale,
                        vm.shadowMap._distance,
                        vm.shadowMap.maximumDistance,
                        0.0,
                        new Cesium.Cartesian4()
                    );
                })(),
                shadowMap_texelSizeDepthBiasAndNormalShadingSmooth: (function () {
                    vm.shadowMap.update(vm.viewer.scene._frameState);
                    const bias = vm.shadowMap._pointBias;
                    const scratchTexelStepSize = new Cesium.Cartesian2();
                    const texelStepSize = scratchTexelStepSize;
                    texelStepSize.x = 1.0 / vm.shadowMap._textureSize.x;
                    texelStepSize.y = 1.0 / vm.shadowMap._textureSize.y;
                    return Cesium.Cartesian4.fromElements(
                        texelStepSize.x,
                        texelStepSize.y,
                        bias.depthBias,
                        bias.normalShadingSmooth,
                        new Cesium.Cartesian4()
                    );
                })()
            }
        });
        postStage = vm.viewer.scene.postProcessStages.add(postStage);
    }
    clear() {
        if (postStage) {
            this.shadowMap.debugShow = false;
            this.viewer.scene.postProcessStages.remove(postStage);
        }
    }

}

export default ViewShed;