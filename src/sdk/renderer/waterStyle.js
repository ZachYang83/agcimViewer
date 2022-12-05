/**
 * class WaterStyle 水域效果类
 */
class WaterStyle {
	constructor() {}
	/**
	 * 设置水样式
	 * @param {object} data 图层数据
	 * @param {object} lyConfig 样式json配置
	 */
	setWatersStyle(data, agFeatureLayer, lyConfig) {
		data.show = false;
		var id = data._name;
		var entities = data.entities.values;
		this.baseWaterColor = eval(lyConfig.baseWaterColor);

		//寻找出顶点最多的面,顶点最多的面需要调整水材质的密度、振幅
		var maxVex = 0;
		var mark = 0;
		for (var i = 0; i < entities.length; i++) {
			if (
				entities[i]._polygon._hierarchy._value.positions.length > maxVex
			) {
				maxVex =
					entities[i]._polygon._hierarchy._value.positions.length;
				mark = i;
			}
		}

		var primitives = this.setDifMaterial(entities, mark);
		primitives.forEach((v) => {
			v.agMetaData = Object;
			v.agMetaData.id = id;
			agFeatureLayer.addPrimitive(v);
		});
	}

	/**
	 * 设置不同的材质，面积大水域与面积小的水域的材质频率不一样
	 * @param {object} entities entities
	 * @param {string} mark 标记
	 */
	setDifMaterial(entities, mark) {
		var primitives = [];
		var instances = [];
		var fs = this.FSFragmentShader();
		var vs = this.FSVertexShader();
		var _height = 0;
		var _extrudedHeight = undefined;
		for (var i = 0; i < entities.length; i++) {
			var hierarchy = entities[i].polygon.hierarchy._value;
			var positions = hierarchy.positions;
			var holes = hierarchy.holes;
			var PolygonHierarchys = [];
			if (holes.length > 0) {
				for (var j = 0; j < holes.length; j++) {
					PolygonHierarchys.push(
						new Cesium.PolygonHierarchy(holes[j].positions)
					);
				}
			}
			if (i === mark) {
				let instances = new Cesium.GeometryInstance({
					geometry: new Cesium.PolygonGeometry({
						polygonHierarchy: new Cesium.PolygonHierarchy(
							positions,
							PolygonHierarchys
						),
						height: _height,
						extrudedHeight: _extrudedHeight, //注释掉此属性可以只显示水面
					}),
				});
				let primitive = new Cesium.GroundPrimitive({
					geometryInstances: instances,
					appearance: new Cesium.EllipsoidSurfaceAppearance({
						material: this.watermaterial(10000.0, 0.01, 3.0, 1),
						fragmentShaderSource: fs, //重写shader，修改水面的透明度
						vertexShaderSource: vs, //重写shader，修改水面的透明度
					}),
				});
				primitives.push(primitive);
			} else {
				instances.push(
					new Cesium.GeometryInstance({
						geometry: new Cesium.PolygonGeometry({
							polygonHierarchy: new Cesium.PolygonHierarchy(
								positions,
								PolygonHierarchys
							),
							height: _height,
							extrudedHeight: _extrudedHeight, //注释掉此属性可以只显示水面
						}),
					})
				);
			}
		}
		var primitive = new Cesium.GroundPrimitive({
			geometryInstances: instances,
			appearance: new Cesium.EllipsoidSurfaceAppearance({
				material: this.watermaterial(100.0, 0.01, 3.0, 1),
				fragmentShaderSource: fs, //重写shader，修改水面的透明度
				vertexShaderSource: vs, //重写shader，修改水面的透明度
			}),
		});
		primitives.push(primitive);
		return primitives;
	}

	/**
	 * 水面材质
	 * @param {number} frequency 频率
	 * @param {number} animationSpeed 动画速度
	 * @param {number} amplitude 振幅
	 * @param {number} specularIntensity 镜面反射强度
	 */
	watermaterial(frequency, animationSpeed, amplitude, specularIntensity) {
		var material = new Cesium.Material({
			fabric: {
				type: 'Water',
				uniforms: {
					baseWaterColor:
						this.baseWaterColor ||
						new Cesium.Color.fromBytes(105, 180, 105, 60),
					normalMap: Cesium.buildModuleUrl(
						'Assets/Textures/waterNormals.jpg'
					),
					frequency: frequency,
					animationSpeed: animationSpeed,
					amplitude: amplitude,
					specularIntensity: specularIntensity,
				},
			},
		});
		return material;
	}

	/**
	 * shader
	 */
	FSVertexShader() {
		return [
			'#include <common>',
			'#include <fog_pars_vertex>',
			'#include <logdepthbuf_pars_vertex>',
			'uniform mat4 textureMatrix;',
			'varying vec4 vCoord;',
			'varying vec2 vUv;',
			'varying vec3 vToEye;',

			'void main() {',
			'    vUv = uv;',
			'    vCoord = textureMatrix * vec4( position, 1.0 );',
			'    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );',
			'    vToEye = cameraPosition - worldPosition.xyz;',
			'    vec4 mvPosition =  viewMatrix * worldPosition;', // used in fog_vertex
			'    gl_Position = projectionMatrix * mvPosition;',
			'    #include <logdepthbuf_vertex>',
			'    #include <fog_vertex>',
			'}',
		].join('\n');
		s;
	}

	FSFragmentShader() {
		return [
			'#include <common>',
			'#include <fog_pars_fragment>',
			'#include <logdepthbuf_pars_fragment>',
			'uniform sampler2D tReflectionMap;',
			'uniform sampler2D tRefractionMap;',
			'uniform sampler2D tNormalMap0;',
			'uniform sampler2D tNormalMap1;',

			'#ifdef USE_FLOWMAP',
			'    uniform sampler2D tFlowMap;',
			'#else',
			'    uniform vec2 flowDirection;',
			'#endif',

			'uniform vec3 color;',
			'uniform float reflectivity;',
			'uniform vec4 config;',

			'varying vec4 vCoord;',
			'varying vec2 vUv;',
			'varying vec3 vToEye;',

			'void main() {',
			'    #include <logdepthbuf_fragment>',
			'    float flowMapOffset0 = config.x;',
			'    float flowMapOffset1 = config.y;',
			'    float halfCycle = config.z;',
			'    float scale = config.w;',

			'    vec3 toEye = normalize( vToEye );',
			// determine flow direction
			'    vec2 flow;',
			'    #ifdef USE_FLOWMAP',
			'        flow = texture2D( tFlowMap, vUv ).rg * 2.0 - 1.0;',
			'    #else',
			'        flow = flowDirection;',
			'    #endif',
			'    flow.x *= - 1.0;',

			// sample normal maps (distort uvs with flowdata)
			'    vec4 normalColor0 = texture2D( tNormalMap0, ( vUv * scale ) + flow * flowMapOffset0 );',
			'    vec4 normalColor1 = texture2D( tNormalMap1, ( vUv * scale ) + flow * flowMapOffset1 );',

			// linear interpolate to get the final normal color
			'    float flowLerp = abs( halfCycle - flowMapOffset0 ) / halfCycle;',
			'    vec4 normalColor = mix( normalColor0, normalColor1, flowLerp );',

			// calculate normal vector
			'    vec3 normal = normalize( vec3( normalColor.r * 2.0 - 1.0, normalColor.b,  normalColor.g * 2.0 - 1.0 ) );',

			// calculate the fresnel term to blend reflection and refraction maps
			'    float theta = max( dot( toEye, normal ), 0.0 );',
			'    float reflectance = reflectivity + ( 1.0 - reflectivity ) * pow( ( 1.0 - theta ), 5.0 );',

			// calculate final uv coords
			'    vec3 coord = vCoord.xyz / vCoord.w;',
			'    vec2 uv = coord.xy + coord.z * normal.xz * 0.05;',

			'    vec4 reflectColor = texture2D( tReflectionMap, vec2( 1.0 - uv.x, uv.y ) );',
			'    vec4 refractColor = texture2D( tRefractionMap, uv );',

			// multiply water color with the mix of both textures
			'    gl_FragColor = vec4( color, 1.0 ) * mix( refractColor, reflectColor, reflectance );',

			'    #include <tonemapping_fragment>',
			'    #include <encodings_fragment>',
			'    #include <fog_fragment>',
			'}',
		].join('\n');
	}
}

export default WaterStyle;
