//值是否为空
export function isNullOrEmpty(data) {
    return data == null || data == undefined || data.length == 0 || data == "";
};

//生成GUID
export function newGuid() {
    var guid = "";
    for (var i = 1; i <= 32; i++) {
        var n = Math.floor(Math.random() * 16.0).toString(16);
        guid += n;
        if ((i == 8) || (i == 12) || (i == 16) || (i == 20))
            guid += "-";
    }
    return guid;
}

//创建视频dom
export function newVideoDemo(_id, _url, _type) {
    let vDom = document.createElement('video')
    vDom.setAttribute("autoplay", true),
    vDom.setAttribute("loop", true),
    vDom.setAttribute("crossorigin", true),
    vDom.id = _id
    vDom.autoplay = true
    vDom.loop = true
    vDom.crossOrigin = true
    vDom.controls = true
    vDom.style.height = 1200
    vDom.style.width = 900
    let vSource = document.createElement('source')
    vSource.src = _url
    vSource.type = _type
    vSource.crossOrigin =  "anonymous"
    vDom.appendChild(vSource)
    return vDom
}

