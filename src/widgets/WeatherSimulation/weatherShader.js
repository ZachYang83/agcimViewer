/***
* 粒子效果：雨、雪、雾
*/
class WeatherShader {
  constructor() {
    this.stages = [];
  }
  /**
   * @description: 
   * @param {*} viewer 视图对象
   * @param {*} name 天气名称
   * @param {*} type 天气类型
   * @return {*}
   */
  addPostProcessStage(viewer, name, type) {
    let stage = this.getStage(viewer, name);
    let fs = null;
    if (!stage) {
      switch (type) {
        case "snow":
          fs = this.fs_snow();
          break;
        case "rain":
          fs = this.fs_rain();
          break;
        case "fog":
          fs = this.fs_fog();
          //对应于某个具体的后期处理效果
          stage = new Cesium.PostProcessStage({
            name: name,
            fragmentShader: fs,
            uniforms: {
              fogByDistance: new Cesium.Cartesian4(10.0, 0.0, 3000, 1.0),
              fogColor: Cesium.Color.BEIGE || new Cesium.Color(1.0, 1.0, 1.0, 1.0),
            },
          });
          //添加天气着色器特效
          viewer.scene.postProcessStages.add(stage);
          return
          break;
      }
    }
    //对应于某个具体的后期处理效果
    stage = new Cesium.PostProcessStage({
      name: name,
      fragmentShader: fs
    });
    //添加天气着色器特效
    viewer.scene.postProcessStages.add(stage);
  }

  removePostProcessStage(viewer, name) {
    let stage = this.getStage(viewer, name);
    if (stage) {
      viewer.scene.postProcessStages.remove(stage);
      this.stages._stages.pop();
    }
  }

  getStage(viewer, name) {
    let stage = null;
    this.stages = viewer.scene.postProcessStages;
    for (let i = 0; i < this.stages._stages.length; i++) {
      let tmp = this.stages.get(i);
      if (tmp.name == name) {
        stage = tmp;
        break;
      }
    }
    return stage;
  }
  //雪的着色器代码
  fs_snow() {
    return 'uniform sampler2D colorTexture;\n'
      + 'varying vec2 v_textureCoordinates;\n'
      + 'float snow(vec2 uv,float scale)\n'
      + '{\n'
      + '    float time = czm_frameNumber / 60.0;\n'
      + '    float w=smoothstep(1.,0.,-uv.y*(scale/10.));if(w<.1)return 0.;\n'
      + '    uv+=time/scale;uv.y+=time*2./scale;uv.x+=sin(uv.y+time*.5)/scale;\n'
      + '    uv*=scale;vec2 s=floor(uv),f=fract(uv),p;float k=3.,d;\n'
      + '    p=.5+.35*sin(11.*fract(sin((s+p+scale)*mat2(7,3,6,5))*5.))-f;d=length(p);k=min(d,k);\n'
      + '    k=smoothstep(0.,k,sin(f.x+f.y)*0.01);\n'
      + '    return k*w;\n'
      + '}\n'
      + 'void main(void){\n'
      + '     vec2 resolution = czm_viewport.zw;\n'
      + '     vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n'
      + '     vec3 finalColor=vec3(0);\n'
      + '     float c = 0.0;\n'
      + '     c+=snow(uv,30.)*.0;\n'
      + '     c+=snow(uv,20.)*.0;\n'
      + '     c+=snow(uv,15.)*.0;\n'
      + '     c+=snow(uv,10.);\n'
      + '     c+=snow(uv,8.);\n'
      + '     c+=snow(uv,6.);\n'
      + '     c+=snow(uv,5.);\n'
      + '     finalColor=(vec3(c));\n'
      + '     gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(finalColor,1), 0.5);\n'
      + '}';
  }
  //雨的着色器代码
  fs_rain() {
    return 'uniform sampler2D colorTexture;\n'
      + 'varying vec2 v_textureCoordinates;\n'
      + '	float hash(float x){\n'
      + '	     return fract(sin(x*133.3)*13.13);\n'
      + '	 }\n'
      + '	void main(void){\n'
      + '	     float time = czm_frameNumber / 60.0;\n'
      + '	     vec2 resolution = czm_viewport.zw; \n'
      + '	     vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n'
      + '	     vec3 c=vec3(.6,.7,.8); \n'
      + '	     float a=-.4;\n'
      + '	     float si=sin(a),co=cos(a);\n'
      + '	     uv*=mat2(co,-si,si,co);\n'
      + '	     uv*=length(uv+vec2(0,4.9))*.3+1.;\n'
      + '	     float v=1.-sin(hash(floor(uv.x*100.))*2.);\n'
      + '	     float b=clamp(abs(sin(20.*time*v+uv.y*(5./(2.+v))))-.95,0.,1.)*20.;\n'
      + '	     c*=v*b; \n'
      + '	     gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c,1), 0.5); \n'
      + '	}';
  }
  //雾的着色器代码
  fs_fog() {
    //   return 'uniform sampler2D colorTexture;\n'
    //     + '  uniform sampler2D depthTexture;\n'
    //     + '  varying vec2 v_textureCoordinates;\n'
    //     + '  void main(void)\n'
    //     + '  {\n'
    //     + '      vec4 origcolor=texture2D(colorTexture, v_textureCoordinates);\n'
    //     + '      vec4 fogcolor=vec4(0.8,0.8,0.8,0.5);\n'
    //     + '      float depth = czm_readDepth(depthTexture, v_textureCoordinates);\n'
    //     + '      vec4 depthcolor=texture2D(depthTexture, v_textureCoordinates);\n'
    //     + '      float f=(depthcolor.r-0.22)/0.2;\n'
    //     + '      if(f<0.0) f=0.0;\n'
    //     + '      else if(f>1.0) f=1.0;\n'
    //     + '      gl_FragColor = mix(origcolor,fogcolor,f);\n'
    //     + '   }';
    return "float getDistance(sampler2D depthTexture, vec2 texCoords) \n" +
      "{ \n" +
      "    float depth = czm_unpackDepth(texture2D(depthTexture, texCoords)); \n" +
      "    if (depth == 0.0) { \n" +
      "        return czm_infinity; \n" +
      "    } \n" +
      "    vec4 eyeCoordinate = czm_windowToEyeCoordinates(gl_FragCoord.xy, depth); \n" +
      "    return -eyeCoordinate.z / eyeCoordinate.w; \n" +
      "} \n" +
      "//计算雾化距离（当它远离眼睛位置时，系数变小）\n" +
      "float interpolateByDistance(vec4 nearFarScalar, float distance) \n" +
      "{ \n" +
      "    float startDistance = nearFarScalar.x;//雾化的起点距离 \n" +
      "    float startValue = nearFarScalar.y; \n" +
      "    float endDistance = nearFarScalar.z; \n" +
      "    float endValue = nearFarScalar.w; \n" +
      "    float t = clamp((distance - startDistance) / (endDistance - startDistance), 0.0, 1.0); \n" +
      "    return mix(startValue,endValue,t ); \n" +
      "} \n" +
      "vec4 alphaBlend(vec4 sourceColor, vec4 destinationColor) \n" +
      "{ \n" +
      "    return sourceColor * vec4(sourceColor.aaa, 1.0) + destinationColor * (1.0 - sourceColor.a); \n" +
      "} \n" +
      "uniform sampler2D colorTexture; \n" +
      "uniform sampler2D depthTexture; \n" +
      "uniform vec4 fogByDistance; \n" +
      "uniform vec4 fogColor; //雾的颜色\n" +
      "varying vec2 v_textureCoordinates; \n" +
      "void main(void) \n" +
      "{ \n" +
      "    float distance = getDistance(depthTexture, v_textureCoordinates); \n" +
      "    vec4 sceneColor = texture2D(colorTexture, v_textureCoordinates); \n" +
      "    float blendAmount = interpolateByDistance(fogByDistance, distance); \n" +
      "    vec4 finalFogColor = vec4(fogColor.rgb, fogColor.a * blendAmount); \n" +
      "    gl_FragColor = alphaBlend(finalFogColor, sceneColor); \n" +
      "} \n";
  }
}
export default new WeatherShader();