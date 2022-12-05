const WorldRadius = 6378137;

class PlantPointAxis{
    
    constructor(m_axisPos,m_pointV){
        this.m_axisPos = m_axisPos;
        this.m_pointV = m_pointV;
    }

    getWorldPos(lat, lon, height){
        var worldR = WorldRadius + height;
        var latRadius = worldR * this.cos(lat);
        var pz = worldR * this.sin(lat);
        var px = latRadius * this.cos(lon);
        var py = latRadius * this.sin(lon);
        var p1 = new Vector3(px,py,pz);
        return p1;
    }

    buildAxis(vector){
        var v1 = vector;
        var v3 = new Vector3(0,0,1);
        var v2 = v3.cross(v1);
        v3 = v1.cross(v2);

        var v = new MatrixV();
        v.V1 = v1.normalize();
        v.V2 = v2.normalize();
        v.V3 = v3.normalize();

        this.m_pointV = v;
    }

    setWorldPos(lat, lon,height)
    {
        this.m_axisPos = this.getWorldPos(lat, lon, height);
        this.buildAxis(this.m_axisPos);
    }

    toLatLon(p2L)
    {
        var worldR = p2L.length();

        var lat2 = Math.asin(p2L.Z / worldR) * 180 / Math.PI;
        var latRadius = Math.sqrt(p2L.X * p2L.X + p2L.Y * p2L.Y);
        var lon2 = Math.acos(p2L.X / latRadius) * 180 / Math.PI;
        var z2 = p2L.length() - WorldRadius;

        return new Vector3(lat2, lon2, z2);
    }

    rotate(yawDeg, pitchDeg, length)
    {
        var costh = this.cos(yawDeg);
        var sinth = this.sin(yawDeg);
        var pv1_1 = this.m_pointV.V3.multiply(costh);
        var pv1_2 = this.m_pointV.V2.multiply(sinth);
        var pv1 = pv1_1.add(pv1_2);

        var costh2 = this.cos(pitchDeg);
        var sinth2 = this.sin(pitchDeg);

        var pv2_1 = this.m_pointV.V1.multiply(costh2);
        var pv2_2 = pv1.multiply(sinth2);
        var pv2 = pv2_1.add(pv2_2);

        return pv2.multiply(length).add(this.m_axisPos);
    } 

    cos(b)
    {
        return Math.cos(b / 180 * Math.PI);
    }

    sin( b)
    {
        return Math.sin(b / 180 * Math.PI);
    }

}

class Vector3{

    constructor(v1,v2,v3){
        this.X = v1;
        this.Y = v2;
        this.Z = v3;
    }

    add(p1)
    {
        return new Vector3(this.X + p1.X, this.Y + p1.Y, this.Z + p1.Z);
    }

    multiply(costh)
    {
        return new Vector3(this.X * costh, this.Y * costh, this.Z * costh);
    }

    cross(vector){
        var x = this.Y * vector.Z - this.Z * vector.Y;
        var y = this.Z * vector.X - this.X * vector.Z;
        var z = this.X * vector.Y - this.Y * vector.X;
        return new Vector3(x, y, z);
    }

    normalize(){
        var len = this.length();
        return new Vector3(this.X / len, this.Y / len, this.Z / len);
    }

    length()
    {
        return Math.sqrt(this.X * this.X + this.Y * this.Y + this.Z * this.Z);
    }
}

class MatrixV{
    constructor(){
        this.V1;
        this.V2;
        this.V3;
    }
}

export default PlantPointAxis;