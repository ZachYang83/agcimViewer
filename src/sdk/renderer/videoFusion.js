/**
 * class ViewShed 视频投影
 */
class VideoFusion {
    /** 
     *  初始化视频投影
     */
    initialize() {
        var videoShed3dShader = `
        uniform float mixNum;
        uniform sampler2D colorTexture;
        uniform sampler2D stcshadow; 
        uniform sampler2D videoTexture;
        uniform sampler2D depthTexture;
        uniform mat4 _shadowMap_matrix; 
        uniform vec4 shadowMap_lightPositionEC; 
        uniform vec4 shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness;
        uniform vec4 shadowMap_texelSizeDepthBiasAndNormalShadingSmooth; 
        varying vec2 v_textureCoordinates;
        vec4 toEye(in vec2 uv, in float depth){    
            vec2 xy = vec2((uv.x * 2.0 - 1.0),(uv.y * 2.0 - 1.0));    
            vec4 posInCamera =czm_inverseProjection * vec4(xy, depth, 1.0);    
            posInCamera =posInCamera / posInCamera.w;   
            return posInCamera;
        }
        float getDepth(in vec4 depth){
                float z_window = czm_unpackDepth(depth);
                z_window = czm_reverseLogDepth(z_window);
                float n_range = czm_depthRange.near;
                float f_range = czm_depthRange.far;
                return (2.0 * z_window - n_range - f_range) / (f_range - n_range);
            }
            float _czm_sampleShadowMap(sampler2D shadowMap, vec2 uv){
                return texture2D(shadowMap, uv).r;
            }
            float _czm_shadowDepthCompare(sampler2D shadowMap, vec2 uv, float depth){    
                return step(depth, _czm_sampleShadowMap(shadowMap, uv));
            }
            float _czm_shadowVisibility(sampler2D shadowMap, czm_shadowParameters shadowParameters){
                float depthBias = shadowParameters.depthBias;    
                float depth = shadowParameters.depth;    
                float nDotL = shadowParameters.nDotL;    
                float normalShadingSmooth = shadowParameters.normalShadingSmooth;    
                float darkness = shadowParameters.darkness;    
                vec2 uv = shadowParameters.texCoords;    
                depth -= depthBias;    
                vec2 texelStepSize = shadowParameters.texelStepSize;    
                float radius = 1.0;   
                float dx0 = -texelStepSize.x * radius;
                float dy0 = -texelStepSize.y * radius;
                float dx1 = texelStepSize.x * radius;    
                float dy1 = texelStepSize.y * radius;   
                float visibility =(    
                    _czm_shadowDepthCompare(shadowMap, uv, depth)    
                    + _czm_shadowDepthCompare(shadowMap, uv + vec2(dx0, dy0), depth) 
                    + _czm_shadowDepthCompare(shadowMap, uv + vec2(0.0, dy0), depth) 
                    + _czm_shadowDepthCompare(shadowMap, uv + vec2(dx1, dy0), depth) 
                    + _czm_shadowDepthCompare(shadowMap, uv + vec2(dx0, 0.0), depth) 
                    + _czm_shadowDepthCompare(shadowMap, uv + vec2(dx1, 0.0), depth) 
                    + _czm_shadowDepthCompare(shadowMap, uv + vec2(dx0, dy1), depth) 
                    + _czm_shadowDepthCompare(shadowMap, uv + vec2(0.0, dy1), depth) 
                    + _czm_shadowDepthCompare(shadowMap, uv + vec2(dx1, dy1), depth)   
                ) * (1.0 / 9.0);
                return visibility;
            }
            vec3 pointProjectOnPlane(in vec3 planeNormal, in vec3 planeOrigin, in vec3 point){
                vec3 v01 = point -planeOrigin;
                float d = dot(planeNormal, v01) ;
                return (point - planeNormal * d);
            }
            float ptm(vec3 pt){
                return sqrt(pt.x*pt.x + pt.y*pt.y + pt.z*pt.z);
            }
            void main() { 
                const float PI = 3.141592653589793;    
                vec4 color = texture2D(colorTexture, v_textureCoordinates);
                vec4 currD = texture2D(depthTexture, v_textureCoordinates);   
                if(currD.r>=1.0){        
                    gl_FragColor = color;       
                    return;    
                }
                float depth = getDepth(currD);
                vec4 positionEC = toEye(v_textureCoordinates, depth);
                vec3 normalEC = vec3(1.0);
                czm_shadowParameters shadowParameters;
                shadowParameters.texelStepSize = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.xy;
                shadowParameters.depthBias = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.z;
                shadowParameters.normalShadingSmooth = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.w;
                shadowParameters.darkness = shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.w;
                shadowParameters.depthBias *= max(depth * 0.01, 1.0);
                vec3 directionEC = normalize(positionEC.xyz - shadowMap_lightPositionEC.xyz);
                float nDotL = clamp(dot(normalEC, -directionEC), 0.0, 1.0);
                vec4 shadowPosition = _shadowMap_matrix * positionEC;
                shadowPosition /= shadowPosition.w; 
                if (any(lessThan(shadowPosition.xyz, vec3(0.0))) || any(greaterThan(shadowPosition.xyz, vec3(1.0))))  { 
                    gl_FragColor = color;
                    return;
                }
                shadowParameters.texCoords = shadowPosition.xy;
                shadowParameters.depth = shadowPosition.z;
                shadowParameters.nDotL = nDotL;
                float visibility = _czm_shadowVisibility(stcshadow, shadowParameters);
                vec4 videoColor = texture2D(videoTexture,shadowPosition.xy);
                if(visibility==1.0){
                    gl_FragColor = mix(color,vec4(videoColor.xyz,1.0),mixNum*videoColor.a);
                }else{
                    gl_FragColor=color;
                }
            } `;
        var Cesium = null
        /** 初始化视频投影
         * @param {object} cesium cesium
         * @param {object} viewer viewer
         * @param {object} param camera参数 
         * @param {number} param.type  1,融合颜色，2，融合图片， 3，融合视频
         * @param {string} param.url  视频融合url/图片url
         * @param {Cartesian3} param.position  position 起点，世界坐标 x/y/z
         * @param {Cartesian3} param.endPosition endPosition 终点，世界坐标 x/y/z
         * @param {number} param.fov camera的fov
         * @param {number} param.far camera的far
         * @param {number} param.near camera的near
         * @param {number} param.aspectRatio camera的aspectRatio
         * @param {object} param.orientation camera的方向
         * @param {number} param.orientation.heading camera的方向:heading
         * @param {number} param.orientation.pitch camera的方向:pitch
         * @param {number} param.orientation.roll camera的方向:roll
         */
        var videoShed3d = function (cesium, viewer, param) {
            Cesium = cesium
            this.param = param;
            var option = this._initCameraParam();
            this.optionType = {
                Color: 1,
                Image: 2,
                Video: 3
            }
            this.near = option.near ? option.near : 0.1;
            if (option || (option = {}), this.viewer = viewer, this._cameraPosition = option.cameraPosition, this._cameraEndPosition = option.cameraEndPosition, this._position = option.position,
                this.type = option.type, this._alpha = option.alpha || 1, this.url = option.url, this.color = option.color,
                this._debugFrustum = Cesium.defaultValue(option.debugFrustum, !0), this._aspectRatio = option.aspectRatio || this._getWinWidHei(),
                this._camerafov = option.fov || Cesium.Math.toDegrees(this.viewer.scene.camera.frustum.fov), this.texture = option.texture || new Cesium.Texture({
                    context: this.viewer.scene.context,
                    source: {
                        width: 1,
                        height: 1,
                        arrayBufferView: new Uint8Array([255, 255, 255, 255])
                    },
                    flipY: !1
                }), this._videoPlay = Cesium.defaultValue(option.videoPlay, !0), this.defaultShow = Cesium.defaultValue(option.show, !0), !this.cameraPosition || !this.position) return void console.log('初始化失败：请确认相机位置与视点位置正确!');
            switch (this.type) {
                default:
                case this.optionType.Video:
                    this.activeVideo(this.url);
                    break;
                case this.optionType.Image:
                    this.activePicture(this.url);
                    this.deActiveVideo();
                    break;
                case this.optionType.Color:
                    this.activeColor(this.color),
                        this.deActiveVideo();
            }
            this._createShadowMap(),
                this._getOrientation(),
                this._addCameraFrustum()
                this._addPostProcess()
            this.viewer.scene.primitives.add(this)
        }
        Object.defineProperties(videoShed3d.prototype, {
            alpha: {
                get: function () {
                    return this._alpha
                },
                set: function (e) {
                    return this._alpha = e
                }
            },
            aspectRatio: {
                get: function () {
                    return this._aspectRatio
                },
                set: function (e) {
                    this._aspectRatio = e,
                        this._changeVideoWidHei()
                }
            },
            debugFrustum: {
                get: function () {
                    return this._debugFrustum
                },
                set: function (e) {
                    this._debugFrustum = e,
                        this.cameraFrustum.show = e
                }
            },
            fov: {
                get: function () {
                    return this._camerafov
                },
                set: function (e) {
                    this._camerafov = e,
                        this._changeCameraFov()
                }
            },
            cameraPosition: {
                get: function () {
                    return this._cameraPosition
                },
                set: function (e) {
                    e && (this._cameraPosition = e, this._changeCameraPos())
                }
            },
            cameraEndPosition: {
                get: function () {
                    return this._cameraEndPosition
                },
                set: function (e) {
                    e && (this._cameraEndPosition = e, this._changeCameraPos())
                }
            },
            position: {
                get: function () {
                    return this._position
                },
                set: function (e) {
                    e && (this._position = e, this._changeViewPos())
                }
            },
            videoPlay: {
                get: function () {
                    return this._videoPlay
                },
                set: function (e) {
                    this._videoPlay = Boolean(e),
                        this._videoEle && (this.videoPlay ? this._videoEle.paly() : this._videoEle.pause())
                }
            },
            params: {
                get: function () {
                    var t = {}
                    return t.type = this.type,
                        this.type == this.optionType.Color ? t.color = this.color : t.url = this.url,
                        t.position = this.position,
                        t.cameraPosition = this.cameraPosition,
                        t.fov = this.fov,
                        t.aspectRatio = this.aspectRatio,
                        t.alpha = this.alpha,
                        t.debugFrustum = this.debugFrustum,
                        t
                }
            },
            show: {
                get: function () {
                    return this.defaultShow
                },
                set: function (e) {
                    this.defaultShow = Boolean(e),
                        this._switchShow()
                }
            }
        })
        /** 初始化
       * @private
       **/
        videoShed3d.prototype._initCameraParam = function () {
            var cartesianToDeggre = function (position, viewer) {
                const ellipsoid = viewer.scene.globe.ellipsoid
                const cartographic = ellipsoid.cartesianToCartographic(position)
                var lat = Cesium.Math.toDegrees(cartographic.latitude);
                var lng = Cesium.Math.toDegrees(cartographic.longitude);
                var alt = cartographic.height;
                return {
                    latitude: lat,
                    longitude: lng,
                    altitude: alt
                };
            }
            var viewPoint = cartesianToDeggre(this.param.position, CIM.viewer)
            var position = Cesium.Cartesian3.fromDegrees(viewPoint.longitude, viewPoint.latitude, viewPoint.altitude);
            var cameraPosition = Cesium.Cartesian3.fromDegrees(this.param.position.x * 1, this.param.position.y * 1, this.param.position.z * 1);
            var cameraEndPosition = Cesium.Cartesian3.fromDegrees(this.param.endPosition.x * 1, this.param.endPosition.y * 1, this.param.endPosition.z * 1);
            return {
                type: 3,
                url: this.param.url,
                cameraPosition: cameraPosition,
                cameraEndPosition: cameraEndPosition,
                position: position,
                alpha: this.param.alpha,
                near: this.param.near,
                fov: this.param.fov,
                debugFrustum: this.param.debugFrustum
            }
        }
        /**获取三维地图容器像素大小
         *  @private
         */
        videoShed3d.prototype._clearShadowMap = function () {
            this.viewer.scene.postProcessStages.remove(this.postProcess)
            this.viewer.scene.primitives.remove(this.cameraFrustum),
                this._createShadowMap(this.cameraPosition, this.position)
        }
        /**获取当前cesium画布大小算出默认 aspectRatio
         *   @private
        */
        videoShed3d.prototype._getWinWidHei = function () {
            var viewer = this.viewer.scene;
            return viewer.canvas.clientWidth / viewer.canvas.clientHeight;
        }
        /**修改FOV
         *  @private
        */
        videoShed3d.prototype._changeCameraFov = function () {
            this.viewer.scene.postProcessStages.remove(this.postProcess)
            this.viewer.scene.primitives.remove(this.cameraFrustum),
                this._createShadowMap(this.cameraPosition, this.position),
                this._getOrientation(),
                this._addPostProcess()
        }
        /**修改FOV
         *  @private
        */
        videoShed3d.prototype._changeVideoWidHei = function () {
            this.viewer.scene.postProcessStages.remove(this.postProcess),
                this.viewer.scene.primitives.remove(this.cameraFrustum)
            this._createShadowMap(this.cameraPosition, this.position),
                this._getOrientation(),
                this._addPostProcess()
        }
        /** 
         *  @private
        */
        videoShed3d.prototype._changeCameraPos = function () {
            this.viewer.scene.postProcessStages.remove(this.postProcess),
                this.viewer.scene.primitives.remove(this.cameraFrustum),
                this.viewShadowMap.destroy(),
                this.cameraFrustum.destroy(),
                this._createShadowMap(this.cameraPosition, this.position),
                this._getOrientation(),
                this._addPostProcess()
        }
        /** 
         *  @private
        */
        videoShed3d.prototype._changeViewPos = function () {
            this.viewer.scene.postProcessStages.remove(this.postProcess),
                this.viewer.scene.primitives.remove(this.cameraFrustum),
                this.viewShadowMap.destroy(),
                this.cameraFrustum.destroy(),
                this._createShadowMap(this.cameraPosition, this.position),
                this._getOrientation(),
                this._addPostProcess()
        }
        /** 
         *  @private
        */
        videoShed3d.prototype._switchShow = function () {
            this.show ? !this.postProcess && this._addPostProcess() : (this.viewer.scene.postProcessStages.remove(this.postProcess), delete this.postProcess, this.postProcess = null),
                this.cameraFrustum.show = this.show
        }
        /** 创建视频Element
         * @param {String} url 视频地址
         * @private
         **/
        videoShed3d.prototype._createVideoEle = function (url) {
            this.videoId = "visualDomId";
            var t = document.createElement("SOURCE");
            t.type = "video/mp4",
                t.src = url;
            var i = document.createElement("SOURCE");
            i.type = "video/quicktime",
                i.src = url;
            var a = document.createElement("VIDEO");
            return a.setAttribute("autoplay", !0),
                a.setAttribute("loop", !0),
                a.setAttribute("crossorigin", !0),
                a.appendChild(t),
                a.appendChild(i),
                //document.body.appendChild(a),
                this._videoEle = a,
                a
        }
        /** 视频投射
         * @param {String} url 视频地址
         * @private
         */
        videoShed3d.prototype.activeVideo = function (url) {
            var video = this._createVideoEle(url),
                that = this;
            if (video) {
                this.type = that.optionType.Video;
                var viewer = this.viewer;
                this.activeVideoListener || (this.activeVideoListener = function () {
                    that.videoTexture && that.videoTexture.destroy(),
                        that.videoTexture = new Cesium.Texture({
                            context: viewer.scene.context,
                            source: video,
                            width: 1,
                            height: 1,
                            pixelFormat: Cesium.PixelFormat.RGBA,
                            pixelDatatype: Cesium.PixelDatatype.UNSIGNED_BYTE
                        })
                }),
                    viewer.clock.onTick.addEventListener(this.activeVideoListener)
            }
        }
        /** 添加video监听事件
         *  @private
        */
        videoShed3d.prototype.deActiveVideo = function () {
            if (this.activeVideoListener) {
                this.viewer.clock.onTick.removeEventListener(this.activeVideoListener),
                    delete this.activeVideoListener
            }
        }
        /** 图片投放
         * @param {String} url 图片地址
         * @private
         **/
        videoShed3d.prototype.activePicture = function (url) {
            this.videoTexture = this.texture;
            var that = this,
                img = new Image;
            img.onload = function () {
                that.type = that.optionType.Image,
                    that.videoTexture = new Cesium.Texture({
                        context: that.viewer.scene.context,
                        source: img
                    })
            },
                img.onerror = function () {
                    console.log('图片加载失败:' + url)
                },
                img.src = url
        }
        videoShed3d.prototype.locate = function () {
            var cameraPosition = Cesium.clone(this.cameraPosition),
                position = Cesium.clone(this.position);
            this.viewer.Camera.position = cameraPosition
            // this.viewer.Camera.orientation = t
            this.viewer.Camera.setView({
                orientation: this.param.orientation
            });
            // this.viewer.camera.orientation
            // this.viewer.camera.direction = Cesium.Cartesian3.subtract(position, cameraPosition, new Cesium.Cartesian3(0, 0, 0)),
            // this.viewer.camera.up = Cesium.Cartesian3.normalize(cameraPosition, new Cesium.Cartesian3(0, 0, 0))
        }
        videoShed3d.prototype.update = function (e) {
            this.viewShadowMap && this.viewer.scene.frameState.shadowMaps.push(this.viewShadowMap) // *重点* 多投影
        }
        /** 删除融合
        **/
        videoShed3d.prototype.destroy = function () {
            this.viewer.scene.postProcessStages.remove(this.postProcess),
                this.viewer.scene.primitives.remove(this.cameraFrustum),
                //this._videoEle && this._videoEle.parentNode.removeChild(this._videoEle),
                this.activeVideoListener && this.viewer.clock.onTick.removeEventListener(this.activeVideoListener),
                this.activeVideoListener && delete this.activeVideoListener,
                delete this.postProcess,
                delete this.viewShadowMap,
                delete this.color,
                delete this.viewDis,
                delete this.cameraPosition,
                delete this.position,
                delete this.alpha,
                delete this._camerafov,
                delete this._cameraPosition,
                delete this._cameraEndPosition,
                delete this.videoTexture,
                delete this.cameraFrustum,
                delete this._videoEle,
                delete this._debugFrustum,
                delete this._position,
                delete this._aspectRatio,
                delete this.url,
                delete this.orientation,
                delete this.texture,
                delete this.videoId,
                delete this.type,
                this.viewer.scene.primitives.remove(this),
                delete this.viewer
        }
        /** 创建shadowmap
         * @private
         **/
        videoShed3d.prototype._createShadowMap = function () {
            var e = this.cameraPosition,
                end = this.cameraEndPosition,
                t = this.position,
                i = this.viewer.scene,
                a = new Cesium.Camera(i);
            a.position = e,
                a.setView({
                    orientation: this.param.orientation
                });
            if (e.x == end.x && e.y == end.y) {
                a.direction = Cesium.Cartesian3.subtract(t, e, new Cesium.Cartesian3(0, 0, 0)) //计算两个笛卡尔的组分差异。
            }
            else {
                a.direction = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(end, e, new Cesium.Cartesian3()), new Cesium.Cartesian3());
            }
            // a.up = Cesium.Cartesian3.normalize(e, new Cesium.Cartesian3(0, 0, 0)); // 归一化
            var n = Cesium.Cartesian3.distance(t, e);
            this.viewDis = n,
                a.frustum = new Cesium.PerspectiveFrustum({
                    fov: this.fov,
                    aspectRatio: this.aspectRatio,
                    near: this.near,
                    far: n
                });
            this.viewShadowMap = new Cesium.ShadowMap({
                lightCamera: a,
                enable: !1,
                isPointLight: !1,
                isSpotLight: !0,
                cascadesEnabled: !1,
                context: i.context,
                pointLightRadius: n
            })
        }
        /** 获取shadowmap位置
       * @private
       **/
        videoShed3d.prototype._getOrientation = function () {
            var e = this.cameraPosition,
                t = this.position,
                i = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(t, e, new Cesium.Cartesian3), new Cesium.Cartesian3),
                a = Cesium.Cartesian3.normalize(e, new Cesium.Cartesian3),
                n = new Cesium.Camera(this.viewer.scene);
            n.setView({
                direction: i,
                orientation: this.param.orientation
            });
            n.position = e,
                i = n.directionWC,
                a = n.upWC;
            var r = n.rightWC,
                o = new Cesium.Cartesian3,
                l = new Cesium.Matrix3,
                u = new Cesium.Quaternion;
            r = Cesium.Cartesian3.negate(r, o);
            var d = l;
            Cesium.Matrix3.setColumn(d, 0, r, d),
                Cesium.Matrix3.setColumn(d, 1, a, d),
                Cesium.Matrix3.setColumn(d, 2, i, d);
            var c = Cesium.Quaternion.fromRotationMatrix(d, u);
            return this.orientation = c, c
        }

        videoShed3d.prototype.creacteGeometry = function (width, height) {
            var hwidth = width / 2.0;
            var hheigt = height / 2.0;
            var positions = new Float64Array([hwidth, 0.0, hheigt, -hwidth, 0.0, hheigt, -hwidth, 0.0, -hheigt, hwidth, 0.0, -hheigt]);
            var sts = new Float32Array([1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0]);
            var indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
            var ge = this._createGeometry(positions, sts, indices);
            return ge;
        },
            videoShed3d.prototype._createGeometry = function (positions, sts, indices) {
                /* var Cesium = this.Cesium;*/
                return new Cesium.Geometry({
                    attributes: {
                        position: new Cesium.GeometryAttribute({
                            componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                            componentsPerAttribute: 3,
                            values: positions
                        }),
                        normal: new Cesium.GeometryAttribute({
                            componentDatatype: Cesium.ComponentDatatype.FLOAT,
                            componentsPerAttribute: 3,
                            values: new Float32Array([255.0, 0.0, 0.0, 255.0, 0.0, 0.0, 255.0, 0.0, 0.0, 255.0, 0.0, 0.0])
                            // values: new Float32Array([0.0, 0.0, 0.0,0.0, 0.0, 0.0,0.0, 0.0, 0.0,0.0, 0.0, 0.0])
                        }),
                        st: new Cesium.GeometryAttribute({
                            componentDatatype: Cesium.ComponentDatatype.FLOAT,
                            componentsPerAttribute: 2,
                            values: sts
                        })
                    },
                    indices: indices,
                    primitiveType: Cesium.PrimitiveType.TRIANGLES,
                    vertexFormat: new Cesium.VertexFormat({
                        position: true,
                        color: true
                    }),
                    boundingSphere: Cesium.BoundingSphere.fromVertices(positions)
                });
            },
            //创建视锥
            videoShed3d.prototype._addCameraFrustum = function () {
                var e = this;
                this.cameraFrustum = new Cesium.Primitive({
                    geometryInstances: new Cesium.GeometryInstance({
                        geometry: new Cesium.FrustumOutlineGeometry({
                            origin: e.cameraPosition,
                            orientation: e.orientation,
                            frustum: this.viewShadowMap._lightCamera.frustum,
                            _drawNearPlane: !0
                        }),
                        attributes: {
                            color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0, 0.5, 0.5))
                        }
                    }),
                    appearance: new Cesium.PerInstanceColorAppearance({
                        translucent: !1,
                        flat: !0
                    }),
                    asynchronous: !1,
                    show: this.debugFrustum && this.show
                })
                   // CIM.viewer.scene.primitives.add(this.cameraFrustum)
            }
        /** 添加投影自定义着色器
       * @private
       **/
        videoShed3d.prototype._addPostProcess = function () {
            var e = this,
                t = videoShed3dShader,
                i = e.viewShadowMap._isPointLight ? e.viewShadowMap._pointBias : e.viewShadowMap._primitiveBias;
            console.log(e.viewShadowMap)
            console.log(i)
            this.postProcess = new Cesium.PostProcessStage({
                fragmentShader: t,
                uniforms: {
                    mixNum: function () {
                        return 1
                    },
                    stcshadow: function () {
                        return e.viewShadowMap._shadowMapTexture
                    },
                    videoTexture: function () {
                        return e.videoTexture
                    },
                    _shadowMap_matrix: function () {
                        return e.viewShadowMap._shadowMapMatrix
                    },
                    shadowMap_lightPositionEC: function () {
                        return e.viewShadowMap._lightPositionEC
                    },
                    shadowMap_texelSizeDepthBiasAndNormalShadingSmooth: function () {
                        var t = new Cesium.Cartesian2;
                        return t.x = 1 / e.viewShadowMap._textureSize.x,
                            t.y = 1 / e.viewShadowMap._textureSize.y,
                            Cesium.Cartesian4.fromElements(t.x, t.y, i.depthBias, i.normalShadingSmooth, this.combinedUniforms1)
                    },
                    shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness: function () {
                        return Cesium.Cartesian4.fromElements(i.normalOffsetScale, e.viewShadowMap._distance, e.viewShadowMap.maximumDistance, e.viewShadowMap._darkness, this.combinedUniforms2)
                    }

                }
            }),
                this.viewer.scene.postProcessStages.add(this.postProcess);

        }

        return videoShed3d;
    }

}



export default VideoFusion;