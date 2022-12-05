/**
 * Cesium 1.50（2018/10/01)版本打开3dtiles可能会出现加载不上导致渲染停止的错误。
 *  
 * 1.66 更新示例模型到glTF2.0。
 * 1.69 新增对在glTF中立体几何的高清edges的支持。
 * 1.72 通过新增TEXCOORD_1支持glTF多重渲染。
 * https://www.cnblogs.com/cesium1/p/10062861.html
 */
var fixGltf = function (gltf) {
    if (!gltf.extensionsUsed) {
        return;
    }
    var v = gltf.extensionsUsed.indexOf('KHR_technique_webgl');
    if (v >= 0) {
        var t = gltf.extensionsRequired.indexOf('KHR_technique_webgl');
        gltf.extensionsRequired.splice(t, 1, 'KHR_techniques_webgl');
        gltf.extensionsUsed.splice(v, 1, 'KHR_techniques_webgl');
        gltf.extensions = gltf.extensions || {};
        gltf.extensions['KHR_techniques_webgl'] = {};
        gltf.extensions['KHR_techniques_webgl'].programs = gltf.programs;
        gltf.extensions['KHR_techniques_webgl'].shaders = gltf.shaders;
        gltf.extensions['KHR_techniques_webgl'].techniques = gltf.techniques;
        var techniques = gltf.extensions['KHR_techniques_webgl'].techniques;

        gltf.materials.forEach(function (mat, index) {
            gltf.materials[index].extensions || (gltf.materials[index].extensions = {
                KHR_technique_webgl: {}
            }); // vtxf 181025
            gltf.materials[index].extensions['KHR_technique_webgl'].values = gltf.materials[index].values;
            gltf.materials[index].extensions['KHR_techniques_webgl'] = gltf.materials[index].extensions['KHR_technique_webgl'];

            var vtxfMaterialExtension = gltf.materials[index].extensions['KHR_techniques_webgl'];
            vtxfMaterialExtension.technique || (vtxfMaterialExtension.technique = gltf.materials[index].technique); // vtxf 181025


            for (var value in vtxfMaterialExtension.values) {
                var us = techniques[vtxfMaterialExtension.technique].uniforms;
                for (var key in us) {
                    if (us[key] === value) {
                        vtxfMaterialExtension.values[key] = vtxfMaterialExtension.values[value];
                        delete vtxfMaterialExtension.values[value];
                        break;
                    }
                }
            };
        });

        techniques.forEach(function (t) {
            for (var attribute in t.attributes) {
                var name = t.attributes[attribute];
                t.attributes[attribute] = t.parameters[name];
            };

            for (var uniform in t.uniforms) {
                var name = t.uniforms[uniform];
                t.uniforms[uniform] = t.parameters[name];
            };
        });

    }
}

const fixGltfFun = Object.defineProperties(Cesium.Model.prototype, {
    _cachedGltf: {
        set: function (value) {
            this._vtxf_cachedGltf = value;
            if (this._vtxf_cachedGltf && this._vtxf_cachedGltf._gltf) {
                fixGltf(this._vtxf_cachedGltf._gltf);
            }
        },
        get: function () {
            return this._vtxf_cachedGltf;
        }
    }
});