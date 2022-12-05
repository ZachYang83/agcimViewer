class Bubble{
    constructor(){
        this.viewer=null;
        this.detailBubbleItem=null;
    }
    initialize(viewer) {
        this.viewer=viewer;

        var viewerContainer = this.viewer._element;
        let detailBubbleItem = document.createElement("div");
        detailBubbleItem.setAttribute("id", "detailBubble");
        detailBubbleItem.innerHTML =
            '<div class="regionInfo">' +
            '<div>地区：<label class="regionName">湖北</label></div>' +
            '<div>确诊：<label class="regionNum">0</label></div>' +
            "</div>" +
            '<div class="regionDetaiBtn">详情></div>';
        this.detailBubbleItem = detailBubbleItem;
        viewerContainer.appendChild(detailBubbleItem);
        this.detailBubbleItem.style.display = "none";
    }
    hide(){
        this.detailBubbleItem.style.display = "none";
    }
    showAt(x,y){
        this.detailBubbleItem.style.display = "block";
        this.detailBubbleItem.style.bottom =y + "px";
        this.detailBubbleItem.style.left = x + "px";
    }
    isVisible(){
        return this.detailBubbleItem.style.displa=='block'
    }

    setRegionNum(str){
        this.detailBubbleItem.getElementsByClassName( "regionNum")[0].innerHTML =str;
    }
    setRegionName(str){
        this.detailBubbleItem.getElementsByClassName("regionName")[0].innerHTML = str;
    }

    bindDetailHandler(handler){
        this.detailBubbleItem.getElementsByClassName("regionDetaiBtn")[0].onclick =handler
    }
}
export default new Bubble();