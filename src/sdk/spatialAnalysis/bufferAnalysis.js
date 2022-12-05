import agMath from "@/sdk/maths/math";
import coordinate from "@/sdk/maths/coordinate";
import cartesian3Helper from "@/sdk/spatialAnalysis/cartesian3Helper";
import spatialAnalysis2Helper from "@/sdk/spatialAnalysis/spatialAnalysis2Helper";
import {
    LEFTBUFFER,
    RIGHTBUFFER,
    DOUBLEBUFFER
} from "@/sdk/spatialAnalysis/bufferType";
import * as martinez from "martinez-polygon-clipping";
/*
 * @author: caizj（蔡周峻）
 * @description: 二维缓冲分析
 */
class BufferAnalysis {
    constructor(viewer) {
        this.viewer = viewer;
        this.finenessCircle = 360;
    }

    /**
     * 点缓冲
     * @function pointBuffer
     * @param {Cartesian3} point 笛卡尔点
     * @return {Cartesian3[]} 缓冲的圆坐标数组
     */
    pointBuffer(point, radius) {
        var _this = this;
        var mercatorPoint = coordinate.cartesianToMercator(_this.viewer, point);
        var mercatorPoints = [];
        for (let i = 0; i <= _this.finenessCircle; i++) {
            var offsetX = Math.cos(i * Math.PI / 180) * radius;
            var offsetY = Math.sin(i * Math.PI / 180) * radius;
            mercatorPoints.push(new Cesium.Cartesian3(mercatorPoint.x + offsetX, mercatorPoint.y + offsetY, mercatorPoint.z));
        }

        let bufferPoints = mercatorPoints.map((e) => {
            var bufferPoint = coordinate.mercatorToCartesian(_this.viewer, e);
            return bufferPoint;
        })
        return bufferPoints;
    }
    /**
     * 线缓冲
     * @function multiLineBuffer
     * @param {Cartesian3[]} pathPoints 笛卡尔点数组
     * @param {Number} bufferDistance 缓冲半径
     * @param {} bufferType 缓冲类型
     * @return {Cartesian3[[]]} 缓冲多边形二维笛卡尔数组
     */
    multiLineBuffer(pathPoints, bufferDistance, bufferType) {
        var _this = this;
        let linePoints = pathPoints.map((e) => {
            var linePoint = coordinate.cartesianToMercator(_this.viewer, e);
            return new Cesium.Cartesian3(linePoint.x, linePoint.y, 0);
        })
        let lines = this._buildLines(linePoints, false);
        let lineBufferPolygon;
        for (let index = 0; index < lines.length; index++) {
            let bufferPolygon = this._lineBuffer(lines[index], bufferDistance, bufferType);
            if (!lineBufferPolygon) {
                lineBufferPolygon = bufferPolygon;
            } else {
                let offset = lineBufferPolygon[0][0].length+bufferPolygon[0][0].length-1;
                lineBufferPolygon = martinez.union(lineBufferPolygon, bufferPolygon);
                offset = offset - lineBufferPolygon[0][0].length;
                if ((offset < 1||lineBufferPolygon.length>1)&&bufferType!=DOUBLEBUFFER) {
                    let angle = agMath.computeAngle(lines[index-1][0],lines[index][0],lines[index][1])
                    let filledCircle = _this._buildExteriorAngleFilledCircle(lines[index][0],bufferDistance,lineBufferPolygon,angle);
                    if(filledCircle!=null){
                        try {
                            //lineBufferPolygon = filledCircle;
                            //lineBufferPolygon.push(filledCircle[0]);
                            lineBufferPolygon = martinez.union(lineBufferPolygon,filledCircle);
                        } catch (error) {
                            lineBufferPolygon.push(filledCircle[0]);
                        }
                    }
                }
            }
        }

        if(bufferType!=DOUBLEBUFFER){
            let replacePoint = [];
            let repairLineBufferPolygon =  _this._multiLineBufferRepair(lineBufferPolygon[0][0],lines,replacePoint,2);
            if(replacePoint.length>0){
                lineBufferPolygon =  _this._sharpCornerToArc(repairLineBufferPolygon,lines,bufferDistance,bufferType,replacePoint);
                lineBufferPolygon = [[lineBufferPolygon]];
            }
        }
       
        let bufferPoints = [];
        for (let index = 0; index < lineBufferPolygon.length; index++) {
            const polygon = lineBufferPolygon[index];
            let rings=[];
            for (let k = 0; k < polygon.length; k++) {
                const ring = polygon[k];
                let cartesianPoints = ring.map((e) => {
                    let mercator = new Cesium.Cartesian3(e[0], e[1], 0);
                    let bufferPoint = coordinate.mercatorToCartesian(_this.viewer, mercator);
                    return bufferPoint;
                })
                rings.push(cartesianPoints);
            }
            bufferPoints.push(rings);
        }
        return bufferPoints;
    }
  
    /**
     * 多边形缓冲
     * @function polygonBuffer
     * @param {Cartesian3[]} pathPoints 笛卡尔点数组
     * @param {Number} bufferDistance 缓冲半径
     * @param {} bufferType 缓冲类型
     * @return {Cartesian3[[]]} 缓冲多边形二维笛卡尔数组
     */
    polygonBuffer(pathPoints, bufferDistance, bufferType) {
        var _this = this;
        let linePoints = pathPoints.map((e) => {
            var linePoint = coordinate.cartesianToMercator(_this.viewer, e);
            return new Cesium.Cartesian3(linePoint.x, linePoint.y, 0);
        })
        let lines = this._buildLines(linePoints, true);
        let lineBufferPolygon;
        for (let index = 0; index < lines.length; index++) {
            let bufferPolygon = this._lineBuffer(lines[index], bufferDistance, bufferType);
            //lineBufferPolygon.push(bufferPolygon[0]);
            if (!lineBufferPolygon) {
                lineBufferPolygon = bufferPolygon;
            } else {
                let offset = lineBufferPolygon[0][0].length+bufferPolygon[0][0].length-1;
                lineBufferPolygon = martinez.union(lineBufferPolygon, bufferPolygon);
                offset = offset - lineBufferPolygon[0][0].length;
                if ((offset < 1||lineBufferPolygon.length>1)&&bufferType!=DOUBLEBUFFER) {
                    let angle = agMath.computeAngle(lines[index-1][0],lines[index][0],lines[index][1])
                    let filledCircle = _this._buildExteriorAngleFilledCircle(lines[index][0],bufferDistance,lineBufferPolygon,angle);
                    if(filledCircle!=null){
                        lineBufferPolygon = martinez.union(lineBufferPolygon,filledCircle);
                    }
                }
            } 
        }

        lineBufferPolygon = this._connectHeadTail(lines,lineBufferPolygon,bufferDistance);
        
        try {
            if(bufferType!=DOUBLEBUFFER){
                let replacePoint = [];
                let repairLineBufferPolygon =  _this._multiLineBufferRepair(lineBufferPolygon[0][0],lines,replacePoint,4);
                if(replacePoint.length>0){
                    _this._polygonSharpCornerToArc(lineBufferPolygon[0][0],lines,bufferDistance,bufferType,replacePoint);
                   
                }
            }
        } catch (error) {
            
        }
       
      
        let bufferPoints = [];
        for (let index = 0; index < lineBufferPolygon.length; index++) {
            const polygon = lineBufferPolygon[index];
            let rings=[];
            for (let k = 0; k < polygon.length; k++) {
                const ring = polygon[k];
                let cartesianPoints = ring.map((e) => {
                    let mercator = new Cesium.Cartesian3(e[0], e[1], 0);
                    let bufferPoint = coordinate.mercatorToCartesian(_this.viewer, mercator);
                    return bufferPoint;
                })
                rings.push(cartesianPoints);
            }
            bufferPoints.push(rings);
        }
        return bufferPoints;
    }

     /**
     * 面缓冲
     * @function polygonBuffer
     * @param {Cartesian3[]} pathPoints 笛卡尔点数组
     * @param {Number} bufferDistance 缓冲半径
     * @param {} bufferType 缓冲类型
     * @return {Cartesian3[[]]} 缓冲多边形二维笛卡尔数组
     */
    planeBuffer(pathPoints, bufferDistance){
        let anticlockwise = agMath.judgeDirection(pathPoints);
        let bufferPoints;
        if(anticlockwise){
            bufferPoints = this.polygonBuffer(pathPoints,bufferDistance,RIGHTBUFFER);
        }
        else{
            bufferPoints = this.polygonBuffer(pathPoints,bufferDistance,LEFTBUFFER);
        }
        return bufferPoints;
    }

    //线缓冲
    _lineBuffer(linePoints, bufferDistance, bufferType) {
        var lineExtendPoints = this._lineExtend(linePoints, bufferDistance, bufferType);
        if (bufferType != DOUBLEBUFFER) {
            let lineGeo = spatialAnalysis2Helper.cartesian3PointsToGeometry(lineExtendPoints.points);
            return [lineGeo.geometry.coordinates];
        }

        let curveBufferRadius = bufferDistance;
        if (bufferType != DOUBLEBUFFER) {
            curveBufferRadius = bufferDistance / 2;
        }
        var curve0 = spatialAnalysis2Helper.pointToCircle(lineExtendPoints.strat, curveBufferRadius);
        var curve1 = spatialAnalysis2Helper.pointToCircle(lineExtendPoints.end, curveBufferRadius);
        let union = spatialAnalysis2Helper.polygonsUnion([lineExtendPoints.points,curve0,curve1]);
        return union;
    }
   
    //线沿指定方向拓展
    _lineExtend(pathPoints, extendWidth, bufferType) {
        var rectanglePoints = [];
        var upNormal = new Cesium.Cartesian3(0, 0, 1);
        var pathPointsCount = pathPoints.length;
        var offset = cartesian3Helper.subtract(pathPoints[1], pathPoints[0]);
        var p1p0 = cartesian3Helper.normalize(cartesian3Helper.cross(offset, upNormal));
        var p0 = cartesian3Helper.add(cartesian3Helper.multiplyByScalar(p1p0, extendWidth), pathPoints[0]);
        var p1 = cartesian3Helper.add(cartesian3Helper.multiplyByScalar(p1p0, -1 * extendWidth), pathPoints[0]);
        let stratPoint, endPoint;
        if (bufferType === RIGHTBUFFER) {
            rectanglePoints.push(p0);
            stratPoint = cartesian3Helper.add(cartesian3Helper.multiplyByScalar(p1p0, extendWidth / 2), pathPoints[0]);
        } else if (bufferType === LEFTBUFFER) {
            rectanglePoints.push(p1);
            stratPoint = cartesian3Helper.add(cartesian3Helper.multiplyByScalar(p1p0, -1 * extendWidth / 2), pathPoints[0]);
        } else {
            rectanglePoints.push(p0);
            rectanglePoints.push(p1);
        }

        var dirz = cartesian3Helper.subtract(pathPoints[1], pathPoints[0]); //p1-p0
        var t1 = cartesian3Helper.cross(p1p0, dirz).y;
        for (var i = 1; i < pathPointsCount; i++) {
            p1p0 = cartesian3Helper.normalize(cartesian3Helper.subtract(pathPoints[i], pathPoints[i - 1]));
            dirz = new Cesium.Cartesian3(p1p0.x, p1p0.y, p1p0.z);
            var lineDir = cartesian3Helper.cross(p1p0, upNormal);
            var dir2 = lineDir;
            var costh = Cesium.Cartesian3.dot(lineDir, dir2);
            var leng = Math.abs(extendWidth / costh);
            var p3 = cartesian3Helper.add(cartesian3Helper.multiplyByScalar(dir2, leng), pathPoints[i]);
            var p4 = cartesian3Helper.add(cartesian3Helper.multiplyByScalar(dir2, -1 * leng), pathPoints[i]);
            var t2 = cartesian3Helper.cross(dir2, dirz).y;
            if ((t1 < 0 && t2 > 0) || (t1 > 0 && t2 < 0)) {
                var tm = p3;
                p3 = p4;
                p4 = tm;
            }
            if (bufferType === RIGHTBUFFER) {
                endPoint = cartesian3Helper.add(cartesian3Helper.multiplyByScalar(dir2, leng / 2), pathPoints[i]);
                rectanglePoints.push(p3);
            } else if (bufferType === LEFTBUFFER) {
                endPoint = cartesian3Helper.add(cartesian3Helper.multiplyByScalar(dir2, -1 * leng / 2), pathPoints[i]);
                rectanglePoints.push(p4);
            } else {
                rectanglePoints.push(p3);
                rectanglePoints.push(p4);
            }
        }

        let rectangle;

        if (bufferType != DOUBLEBUFFER) {
            rectanglePoints.push(pathPoints[0]);
            rectanglePoints.push(pathPoints[1]);
            rectangle = {
                "points": rectanglePoints,
                "strat": stratPoint,
                "end": endPoint
            };
        } else {
            rectangle = {
                "points": rectanglePoints,
                "strat": pathPoints[0],
                "end": pathPoints[1]
            };
        }
        rectangle.points = spatialAnalysis2Helper.sortPoint(rectanglePoints);
        rectangle.points.push(rectangle.points[0]);
        return rectangle;
    }
    
    //根据点创建线段
    _buildLines(points, closed) {
        var lines = [];
        for (let index = 0; index < points.length - 1; index++) {
            let line = [];
            line.push(points[index]);
            line.push(points[index + 1]);
            lines.push(line);
        }
        if (closed) {
            let line = [];
            line.push(points[points.length - 1]);
            line.push(points[0]);
            lines.push(line);
        }
        return lines;
    }

    //构建多边形外角的圆胡
    _buildExteriorAngleFilledCircle(centrePoint, radius, polygons,angle) {
        let circle = spatialAnalysis2Helper.pointToCircle(centrePoint, radius);
        let inPolygon = false;
        let splittedPoint = []; 
        for (let index = 0; index < circle.length; index++) {
            let current = spatialAnalysis2Helper.isInPolygons(circle[index],polygons);
            if(current!=inPolygon||splittedPoint.length===0){
                inPolygon = current;
                splittedPoint.push({"type":current,"points":[]});
                if(index>0){
                    splittedPoint[splittedPoint.length-1].points.push(circle[index-1]);
                }
                if(splittedPoint.length>1){
                    splittedPoint[splittedPoint.length-2].points.push(circle[index]);
                }
                
            }
            splittedPoint[splittedPoint.length-1].points.push(circle[index]);
        }
        if(splittedPoint.length<=2){
            return null;
        }

        var concatArray =  splittedPoint[0].points.concat(splittedPoint[splittedPoint.length-1].points);
        splittedPoint[0].points = concatArray;
        splittedPoint.pop();
        for (let j = splittedPoint.length-1; j >=0; j--) {
            if(splittedPoint[j].type){
                splittedPoint.splice(j,1)
            }
            else{
                splittedPoint[j].points.push(centrePoint);
                splittedPoint[j].points = spatialAnalysis2Helper.sortPoint(splittedPoint[j].points);
                splittedPoint[j].points.push(splittedPoint[j].points[0]);
                //splittedPoint[j].points.splice(0,0,centrePoint);
               
            }
        }
        splittedPoint.sort(function(a,b){
            return a.points.length-b.points.length;
        });
        if(splittedPoint.length<2){
            return null;
        }

        let geo
        if(angle>=90){
            geo = spatialAnalysis2Helper.cartesian3PointsToGeometry(splittedPoint[0].points);
        }
        else{
            geo = spatialAnalysis2Helper.cartesian3PointsToGeometry(splittedPoint[1].points);
        }
        return [geo.geometry.coordinates];
    }

    //计算拓展线的相交点
    _computeExtendLineCrossPoint(line1,line2,extendWidth,includeExtend,extendDirection){
        let movedLine1 = spatialAnalysis2Helper.lineMoveInPerpendicularDirection(line1,extendWidth,extendDirection);
        let movedLine2 = spatialAnalysis2Helper.lineMoveInPerpendicularDirection(line2,extendWidth,extendDirection);
        let intersPoint = agMath.computeIntersectPoint(movedLine1,movedLine2,includeExtend);
        return intersPoint;
    }

    //寻找多边形的点
    _findPointFormPlygon(point,plygon){
        var index = -1;
        for (let i = 0; i < plygon.length; i++) {
            let element = plygon[i];
            if(element[0]==point.x&&element[1]==point.y){
                index = i;
                break;
            }
        }
        return index;
    }

    //多边形修复
    _multiLineBufferRepair(plygon,lines,replacePoint,reMovePointNum){
        plygon.pop();
        var removePoints = [];
        for (let index = 0; index < lines.length; index++) {
            let line = lines[index];
            let startIndex = this._findPointFormPlygon(line[0],plygon);
            let endIndex = this._findPointFormPlygon(line[1],plygon);
            let offset = plygon.length-1-Math.max(startIndex,endIndex)+Math.min(startIndex,endIndex);
            if(Math.abs(startIndex-endIndex)==1||offset==0||
            (Math.abs(startIndex-endIndex)-1>reMovePointNum&&offset>reMovePointNum)){
                continue;
            }
            if(replacePoint.indexOf(line[1])==-1){
                replacePoint.push(line[1]);
            }
           
            if(startIndex+reMovePointNum+1==endIndex||startIndex+reMovePointNum-2+1==endIndex){
                for (let j = 1; j <= Math.abs(startIndex-endIndex)-1; j++) {
                    removePoints.push(startIndex+j);
                }
            }
            else if(startIndex-(reMovePointNum+1)==endIndex||startIndex-(reMovePointNum-2+1)==endIndex){
                for (let j = 1; j <= Math.abs(startIndex-endIndex)-1; j++) {
                    removePoints.push(startIndex-j);
                }
            }
            else {
                let max = Math.max(startIndex,endIndex);
                let min = Math.min(startIndex,endIndex);
                for (let j = 1; j <= reMovePointNum; j++) {
                    let index1 = max+j;
                    if(index1>plygon.length-1){
                        index1 = 0;
                    }
                    if(index1+1==min){
                        break;
                    }
                    removePoints.push(index1);
                }
            }
        }
        for (let k = plygon.length-1; k >=0; k--) {
            if(removePoints.indexOf(k)!=-1){
                plygon.splice(k,1);
            }
        }
        plygon.push(plygon[0]);
        return plygon;
    }

    //使用线分割圆弧
    _splitCricleWithLine(circle,line1,line2){
        let result= [];
        let inster0 = spatialAnalysis2Helper.circleLineIntersectPoint(circle,line1);
        let inster1 = spatialAnalysis2Helper.circleLineIntersectPoint(circle,line2);
        if(inster0.length==0||inster1.length==0){
            return result;
        }

        let startIndex =  inster0[0].index;
        let endIndex =  inster1[0].index;
        let min = Math.min(startIndex,endIndex);
        let max = Math.max(startIndex,endIndex);
        if(max-min<180){
            result = circle.splice(min,(max-min)+1);
        }
        else{
            let currentIndex = max;
            while(currentIndex!=min){
                result.push(circle[currentIndex]);
                currentIndex++;
                if(currentIndex>circle.length-1){
                    currentIndex = 0;
                }
            }
        }
        result = spatialAnalysis2Helper.cartesian3PointsToGeometry(result).geometry.coordinates[0];
        return result;
    }

    //多边形角度转圆弧
    _polygonSharpCornerToArc(plygon,lines,bufferDistance,bufferType,replacePoint){
        for (let index = 0; index < lines.length; index++) {
            let nextIndex = index+1;
            if(nextIndex>lines.length-1){
                nextIndex = 0;
            }
            let lineArray = [];
            lineArray.push(lines[index]);
            lineArray.push(lines[nextIndex]);
            this._sharpCornerToArc(plygon,lineArray,bufferDistance,bufferType,replacePoint)
        }
        return plygon;
    }

    //平角转圆弧
    _sharpCornerToArc(plygon,lines,bufferDistance,bufferType,replacePoint){
        for (let index = 0; index < lines.length-1; index++) {
            let line = lines[index];
            let replacePoint0 = replacePoint.indexOf(line[0]);
            let replacePoint1 = replacePoint.indexOf(line[1]);
            let stratIndex = this._findPointFormPlygon(line[0],plygon);
            let endIndex = this._findPointFormPlygon(line[1],plygon);
            if(!(replacePoint0!=-1||replacePoint1!=-1)){
                continue;
            }
            let circlePoint = this._computeExtendLineCrossPoint(lines[index],lines[index+1],bufferDistance,true,bufferType);
            let arc = spatialAnalysis2Helper.pointToCircle(circlePoint,bufferDistance);
            arc = this._splitCricleWithLine(arc,lines[index],lines[index+1]);
            
            if(endIndex==0){
                plygon.pop();
            }
            for (let k = 0; k < arc.length; k++) {
                const element = arc[k];
                if(k==0){
                    plygon.splice(endIndex+k,1,element)
                }
                else{
                    plygon.splice(endIndex+k,0,element)
                }
            }
            if(endIndex==0){
                plygon.push(plygon[0]);
            }
            index++;
        }
        return plygon;
    }

    //连接多边形首尾
    _connectHeadTail(lines,plygon,distance){
        let circleCenter = lines[0][0];
        let circle = spatialAnalysis2Helper.pointToCircle(circleCenter,distance);
        let angle = agMath.computeAngle(lines[lines.length-1][0],lines[lines.length-1][1],lines[0][1])
        let filledCircle = this._buildExteriorAngleFilledCircle(circleCenter,distance,plygon,angle);
        if(filledCircle!=null){
            plygon = martinez.union(plygon,filledCircle);
        }
        return plygon;
    }
  
    //销毁
    dispose() {

    }
}

export default BufferAnalysis;