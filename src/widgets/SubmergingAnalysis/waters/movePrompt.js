class MovePrompt {
	constructor(id) {
		this.objId = Number((new Date()).getTime() + "" + Number(Math.random() * 1000).toFixed(0));
		var divE = document.createElement('div');
		var divId = document.createAttribute("id"); 
		divId.value = 'prompt'; 
		divE.setAttributeNode(divId); 
		var pE = document.createElement('p');
		var sE = document.createElement('span');
		var pClass = document.createAttribute('class');
		pClass.value = 'textClass';
		pE.setAttributeNode(pClass)
		var pText = document.createTextNode("单击增加点，右击删除点,双击结束");
		/*将文本添加p标签中*/
		pE.appendChild(pText);
		/*将p标签添加到div中*/
		divE.appendChild(sE);
		divE.appendChild(pE);
		divE.style.background = "rgba(0,0,0,0.5)";
		divE.style.position = "fixed";
		divE.style.top = "50%";
		divE.style.left = "50%";
		divE.style.fontSize = "12px";
		divE.style.padding = "2px 5px";
		divE.style.maxWidth = "150px";
		divE.style.color = "#fff";
		divE.style.borderRadius = "3px";
		divE.style.display = "none";

		sE.style.width = "0";
		sE.style.height = "0";
		sE.style.border = "7px solid transparent";
		sE.style.borderRightColor = "rgba(0,0,0,0.5)";
		sE.style.position = "absolute";
		sE.style.left = "-14px";
		sE.style.top = "calc(50% - 7px)";
		document.body.appendChild(divE);
		var left = this.getLeft(document.getElementById(id));
		this.divE = divE;
		this.sE = sE;
		this.pE = pE;
		this.cesiumLeft = left;
	}

	updatePrompt(position,text) {
		var cesiumLeft = this.cesiumLeft || 0;
		if(this.divE){
			this.divE.style.display = "block";
			this.divE.style.left = position.x + 30  + cesiumLeft + "px";
			this.divE.style.top = position.y  - 15 +  "px";
			this.pE.innerHTML = text;
		}
		
	}
	getLeft(e){
		var offset=e.offsetLeft;
		if(e.offsetParent!=null) offset+= this.getLeft(e.offsetParent);
		return offset;
	}
	destroy() {
		if(this.divE){
			var prompt=document.getElementById("prompt");
			prompt.remove();
			// this.divE.remove();
			this.divE = undefined;
		}
	}

}

export default MovePrompt;
