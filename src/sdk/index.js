var VERSION = '1.0.5';
import * as animation from './animation';
import * as bim from './bim';
import * as camera from './camera';
import * as geometry from './geometry';
import * as interactive from './interactive';
import * as layer from './layer';
import * as maths from './maths';
import * as renderer from './renderer';
import * as scene from './scene';
import * as spatialAnalysis from './spatialAnalysis';
import * as ui from './ui';
import * as utils from './utils';
import * as excesium from './excesium';

//控制台版本信息
console.log("%c             \n%cSDK版本：" + VERSION + "\ncesium版本：" + Cesium.VERSION + "\nagCloud版本：\n版权声明：Copyright©2020 All Rights Reserved 版权所有 奥格AgCIM基础研发部",
    "font-size: 3em;background:url('http://www.augurit.com/r/cms/www/red/images/weblogo.png') no-repeat;background-size: 90%;",
    "color:#1d6402;font-size:12px"
)

export {
    VERSION,
    animation,
    bim,
    camera,
    geometry,
    interactive,
    layer,
    maths,
    renderer,
    scene,
    spatialAnalysis,
    ui,
    utils,
    excesium
}