import { Box, Cylinder, Ellipsoid } from "@/sdk/geometry/index.js"

class CreateGeometry {
    //球
    addCircular(position, options) {
        let radii = options.radii;
        return new Ellipsoid({
            position,
            name: "render_3d_Cylinder",
            ellipsoid: {
                radii: new Cesium.Cartesian3(radii, radii, radii),
                material: options.material,
            },
        })
    }
    //圆柱
    addCylinder(position, options) {
        return new Cylinder({
            position,
            name: "render_3d_Cylinder",
            cylinder: {
                length: options.height,
                topRadius: options.radii,
                bottomRadius: options.radii,
                material: options.material,
            },
        })
    }
    //立方体
    addCube(position, options) {
        return new Box({
            position,
            name: "render_3d_Cube",
            box: {
                dimensions: new Cesium.Cartesian3(options.length, options.width, options.height),
                material: options.material,
            },
        })
    }
    //锥体
    addCone(position, options) {
        return new Cylinder({
            position,
            name: "render_3d_Cone",
            cylinder: {
                length: options.height,
                topRadius: 0.0,
                bottomRadius: options.radii,
                material: options.material,
            },
        })
    }
    //倒锥体
    addInvertedCone(position, options) {
        return new Cylinder({
            position,
            name: "render_3d_InvertedCone",
            cylinder: {
                length: options.height,
                topRadius: options.radii,
                bottomRadius: 0.0,
                material: options.material,
            },
        })
    }
    //钻石
    addDiamonds(position, options) {
        var color = options.material
        var instance = new Cesium.GeometryInstance({
            geometry: new Cesium.EllipsoidGeometry({
                radii: new Cesium.Cartesian3(1.0, 1.0, 1.0),
                vertexFormat: Cesium.VertexFormat.POSITION_AND_NORMAL
            }),
            modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(position),
            attributes: {
                color: new Cesium.ColorGeometryInstanceAttribute(color.red, color.green, color.blue, color.alpha)
            }
        });
        let primitive = new Cesium.Primitive({
            geometryInstances: instance,
            appearance: new Cesium.PerInstanceColorAppearance()
        })
        CIM.viewer.scene.primitives.add(primitive);

    }
    //四面体
    addMultilateral(position, options) {
        let entity = new Ellipsoid({
            position,
            name: "render_3d_Multilateral",
            orientation: Cesium.Transforms.headingPitchRollQuaternion(
                position,
                new Cesium.HeadingPitchRoll(Cesium.Math.PI / 1.5, 0, 0.0)
            ),
            ellipsoid: {
                radii: new Cesium.Cartesian3(options.length, options.width, options.height),
                innerRadii: new Cesium.Cartesian3(options.length / 2, options.width / 2, options.height / 2),
                minimumClock: Cesium.Math.toRadians(-15.0),
                maximumClock: Cesium.Math.toRadians(15.0),
                minimumCone: Cesium.Math.toRadians(75.0),
                maximumCone: Cesium.Math.toRadians(105.0),
                material: options.material.withAlpha(1),
                outline: false,
            },
        })
        return entity
    }
    //添加模型
    addModel(position, options) {
        let orientation = null
        let heading = Cesium.Math.toRadians(0);
        let pitch = Cesium.Math.toRadians(0);
        let roll = Cesium.Math.toRadians(0);
        let hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
        let model = {
            minimumPixelSize: 0,
            maximumScale: 48,
            color: Cesium.Color.WHITE,
        }
        return {
            position,
            name: "render_3d_Model",
            orientation: orientation,
            model: { ...model, ...options }
        };
    }
}
export default new CreateGeometry()