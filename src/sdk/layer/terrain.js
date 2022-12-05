/**
 *  Class  Terrain cesium 地形相关
 */
class Terrain {
	#viewer;
	constructor(viewer) {
		this.#viewer = viewer;
		this.cesiumTerrainProvider = Cesium.createWorldTerrain();
		this.ellipsoidTerrainProvider = new Cesium.EllipsoidTerrainProvider({});
	}
	/**
	 * 地形
	 * @param {Object} viewer viewer
	 * @param {Object} options 参数
     * options = {
     *  url: options.url, 地形url
        requestWaterMask: options.requestWaterMask,
        requestVertexNormals: options.requestVertexNormals,
        requestMetadata: options.requestMetadata,
        ellipsoid: options.ellipsoid,
        credit: options.credit
     * 
	 */
	add(options) {
		let tpd = new Cesium.CesiumTerrainProvider({
			url: options.url,
			requestWaterMask: options.requestWaterMask,
			requestVertexNormals: options.requestVertexNormals,
			requestMetadata: options.requestMetadata,
			ellipsoid: options.ellipsoid,
			credit: options.credit,
		});
		this.#viewer.terrainProvider = tpd;
		return tpd;
	}
	/**
	 * 移除
	 */
	remove() {
		this.#viewer.terrainProvider = this.ellipsoidTerrainProvider;
	}
	/**
	 * 卸载
	 */
	dispose() {
		let _this = this;
		this.remove();
		return new Promise(function(resolve, reject) {
			resolve(_this);
		});
	}
}
export default Terrain;
