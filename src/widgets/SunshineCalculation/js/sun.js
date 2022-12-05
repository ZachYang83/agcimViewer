/*
 * @Author: your name
 * @Date: 2021-01-13 14:57:54
 * @LastEditTime: 2021-01-21 11:27:29
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \agcimViewer\src\widgets\SunshineCalculation\js\sun.js
 */
import { initPoaLayer } from "./config.js";

class Sun {
  constructor() { }

  cos(b) {
    return Math.cos((b / 180) * Math.PI);
  }

  sin(b) {
    return Math.sin((b / 180) * Math.PI);
  }

  //太阳赤纬
  sunDirectLatitude(b) {
    var sunLatitude =
      (0.006918 -
        0.399912 * this.cos(b) +
        0.070257 * this.sin(b) -
        0.006758 * this.cos(2 * b) +
        0.000907 * this.sin(2 * b) -
        0.002697 * this.cos(3 * b) +
        0.00148 * this.sin(3 * b)) *
      (180 / Math.PI);
    return sunLatitude;
  }

  sunElevation(longitude, latitude, sunLatitude, dayOfYear, currentTime) {
    var t = this.GetNoramlizedRealSunTime(longitude, dayOfYear, currentTime);
    var m_sinHS =
      this.sin(latitude) * this.sin(sunLatitude) +
      this.cos(latitude) * this.cos(sunLatitude) * this.cos(t);
    var m_HS = (Math.asin(m_sinHS) * 180) / Math.PI;
    return m_HS;
  }

  sunAzimuth(longitude, latitude, sunLatitude, dayOfYear, currentTime) {
    var t = this.GetNoramlizedRealSunTime(longitude, dayOfYear, currentTime);
    var m_HS = this.sunElevation(
      longitude,
      latitude,
      sunLatitude,
      dayOfYear,
      currentTime
    );
    var cosAs =
      (this.sin(m_HS) * this.sin(latitude) - this.sin(sunLatitude)) /
      (this.cos(m_HS) * this.cos(latitude));
    var m_AS;
    if (t < 0) {
      m_AS = 180 - (Math.acos(cosAs) * 180) / Math.PI;
    } else {
      m_AS = 180 + (Math.acos(cosAs) * 180) / Math.PI;
    }
    return m_AS;
  }

  GetNoramlizedRealSunTime(longitude, dayOfYear, currentTime) {
    var ct = 12 * 60 * 60;
    ct += (120 - longitude) * 4 * 60;
    ct += this.RealTimeDiff(dayOfYear);
    var hours = currentTime.getHours();
    var minutes = currentTime.getMinutes();
    var seconds = currentTime.getSeconds();
    var t = (hours * 3600 + minutes * 60 + seconds - ct) / 240.0; //deg
    return t;
  }

  RealTimeDiff(dayOfYear) {
    var t = initPoaLayer.realTimeDiff.content;
    var day = t[dayOfYear - 1];
    var tt = day.split("日")[1].trim();
    var ttt = tt.split("分");
    var m = parseInt(ttt[0]);
    var s = parseInt(ttt[1].substring(0, ttt[1].length - 1));
    if (m < 0) {
      return -(Math.abs(m) * 60 + s);
    } else {
      return Math.abs(m) * 60 + s;
    }
  }
}

export default new Sun();
