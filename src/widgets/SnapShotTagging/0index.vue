<template>
  <div>
    <div class="label-action">
        <a-input class="searchInput" v-model="searchContent" @keyup.enter.native="refresh()" placeholder="请输入标签名" allowClear></a-input>
        <a-button type="primary" @click="refresh">
            查询
        </a-button>
        <a-button type="primary" @click="addOrEditLabel()">
            <a-icon type="plus" />
        </a-button>
        <a-spin tip="Loading..." :spinning="spinning" />
    </div>
    <!-- <ul class="label-list vscroll">
        <li v-for="(item,i) in labelList" :key="i" @dblclick="toLabelVisualAngle(item)">
            <img :src="'data:image/png;base64,'+item.thumb" v-if="item.thumb" />
            <div v-else class="noImg" @click="getScreenshot(item)">
                <a-icon type="plus" />
                <div>
                  <a>点击截图</a>
                </div>
            </div>
            <div class="labelContent">
                <p>{{item.name}}</p>
                <p>{{item.content}}</p>
            </div>
			<div class="labelInfo">
				<p>{{item.user_name}}</p>
				<p>{{item.modify_time?item.modify_time:item.create_time}}</p>
			</div>
            <div class="list-action">
                <span class="ibox">
                    <a-icon type="edit" class="icon" @click="addOrEditLabel(item)" />
                </span>
                <span class="ibox">
                    <a-icon type="share-alt" class="icon" @click="shareModal(item)" />
                </span>
                <span class="ibox">
                    <a-popconfirm title="是否确认要删除这个标签？" @confirm="deleteCertain(item)" okText="确认" cancelText="取消">
                        <a-icon type="delete" class="icon" />
                    </a-popconfirm>
                </span>
            </div>
        </li>
    </ul> -->
    <ul class="label-list vscroll">
        <li v-for="(item,i) in labelList" :key="i" @dblclick="toLabelVisualAngle(item)">
            
            <div class="labelContent">
                <p>{{item.name}}</p>
                <p>{{item.content}}</p>
            </div>
			<!-- <div class="labelInfo">
				<p>{{item.user_name}}</p>
				<p>{{item.modify_time?item.modify_time:item.create_time}}</p>
			</div> -->
            <div class="list-action">
                <!-- <span class="ibox"> -->
                    <a-icon type="edit" class="icon" @click="addOrEditLabel(item)" />
                <!-- </span> -->
                <!-- <span class="ibox">
                    <a-icon type="share-alt" class="icon" @click="shareModal(item)" />
                </span> -->
                <!-- <span class="ibox"> -->
                    <a-icon @click="deleteCertain" type="delete" class="icon" />
                    <!-- <a-popconfirm title="是否确认要删除这个标签？" @confirm="deleteCertain(item)" okText="确认" cancelText="取消">
                        <a-icon type="delete" class="icon" />
                    </a-popconfirm> -->
                <!-- </span> -->
            </div>
        </li>
    </ul>
   <preview ref="preview"></preview>
   <add-label ref="addLabel" @refreshData="getData"></add-label>
   <label-detail ref="labelDetail"></label-detail>
  </div>
</template>

<script>
import agCamera from "@/sdk/camera/camera";
import widgetAssetsTable from "@/views/js/net/widgetAssetsTable";
import AgPopup from "@/views/components/AgPopup.vue";
import Preview from "./preview.vue";
import AddLabel from "./addLabel.vue";
import LabelDetail from "./labelDetail"
import {Avatar} from "ant-design-vue";
import CreateLabel from './js/createLabel';
import PickerHelper from "@/sdk/interactive/pickerHelper";
let viewer = CIM.viewer
export default {
    name:"SnapShotTagging",
    components: {
        "ag-popup": AgPopup,
        "preview" : Preview,
        "add-label" : AddLabel,
		"a-avatar": Avatar,
		LabelDetail,
    },
    data(){
        return{
            listType: "thumbnail", //当前排列方式缩略图
            labelList:[],
            spinning:true,
            searchContent: '',
        }
    },
    created() {
		this.getData();
		this.bindEvent()
    },
    methods:{
        async getData() {
            this.spinning = true;
            let params = {
                tableName: "model_tag"
            }
            let res = await widgetAssetsTable.get(params);
            if(!this.searchContent){
                this.labelList = res.content;
            }else{
                this.labelList = res.content.filter(item=>{
                    return item.name.indexOf(this.searchContent) > -1
                })
            }
            this.spinning = false;
        },
        getScreenshot(labelItem){
            this.snapshotObj = new agcim.utils.Snapshot()
            this.snapshotObj.initialize((img, type)=>{
                let image = this.base64ToBlob(img, type)
                labelItem.thumb = image;
                this.updateLabel(labelItem)
            })
        },
        async updateLabel(labelItem){
			let date = new Date()
			labelItem.modify_time = date.getFullYear() + '-' + date.getMonth() + 1 + '-' + date.getDate()
            var fd = new FormData()
            for (let key in labelItem) {
                fd.append(key, labelItem[key])
			}
            fd.append("tableName", "model_tag")
			let res = await widgetAssetsTable.update(fd)
            if(res.success){
				this.$message.success("操作成功")
				this.getData()
            }else{
                this.$message.error("操作失败")
            }
		},
		base64ToBlob(urlData, type) {
            let arr = urlData.split(',');
            let mime = arr[0].match(/:(.*?);/)[1] || type;
            // 去掉url的头，并转化为byte
            let bytes = window.atob(arr[1]);
            // 处理异常,将ascii码小于0的转换为大于0
            let ab = new ArrayBuffer(bytes.length);
            // 生成视图（直接针对内存）：8位无符号整数，长度1个字节
            let ia = new Uint8Array(ab);
            for (let i = 0; i < bytes.length; i++) {
                ia[i] = bytes.charCodeAt(i);
            }
            return new Blob([ab], {
                type: mime
            });
		},
        preview(id) {
            let p = {
                id: id,
                tableName: "snapshot_tag",
                fieldName: "img",
                fileName: id+".png",
            };
            let res =  widgetAssetsTable.preview(p);
            return res;
        }, 
        async deleteCertain(item){
            let p = {
                tableName: "model_tag",
                ids: item.id,
            };
            let res = await widgetAssetsTable.delete(p);
            if(res.success){
                viewer.entities.remove({id: `label-${item.id}`})  
                this.$message.success("删除成功")
            }else{
                this.$message.error(`删除失败${res.message}`)
            }
            this.getData();
		},
		toLabelVisualAngle(_labelInfo){
			/* 显示图层 */
			let labelInfo = JSON.parse(JSON.stringify(_labelInfo))
			let layerId = labelInfo.layer_id
			let layers = CIM.layerTree._aglayers
			let exist = false
			layers.map(item=>{
				if(layerId === item.id){
					exist = true
				}
			})
			if(!exist){
				let items = [layerId]
				CIM.layerTree.addMany(items, CIM.viewer)
			}
			
			/* 相机位置 */
			let cameraInfo = JSON.parse(labelInfo.camera_info)
			agCamera.setCamera(viewer, {
              position: cameraInfo.position,
              heading: cameraInfo.heading,
              roll: cameraInfo.roll,
              pitch: cameraInfo.pitch,
			});
			
			/* 显示标注 */
			labelInfo.position = JSON.parse(labelInfo.position)
            labelInfo.style = JSON.parse(labelInfo.style)
            if( !viewer.entities.getById(`label-${_labelInfo.id}`)){
                CreateLabel.initialize(viewer, labelInfo);   
            }
		},
		bindEvent(){
			let pickerHelper= new PickerHelper(viewer);
			pickerHelper.on("RIGHT_CLICK", (movement)=>{
				let entity = viewer.scene.pick(movement.position).id
				if( entity && entity.constructor.name === "Entity" ){
                    let labelInfo = entity.otherInfo
                    this.$nextTick(()=>{
                        this.$refs.labelDetail.open(labelInfo)
                    })
				}
			})
		},
        handleTypeClick(e) {
            this.listType = e;
        },
        previewModal(item){
            var previewModel = document.getElementsByClassName("previewModel")[0];
            var img = new Image();
            img.src = item.url;
            img.onload = () =>{
                previewModel.style.width = img.width + 20 + 'px';
                previewModel.style.height = img.height + 52 + 'px';
            }
            this.$refs.preview.open(item);
        },
        addOrEditLabel(_item){
            this.$refs.addLabel.open(_item);
        },
        refresh(){
            this.getData();
        },
        shareModal(item){
        },
       
        timestampToTime(timestamp) {
            var  date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
            var Y = date.getFullYear() + '-';
            var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
            var D = date.getDate() + ' ';
            var h = date.getHours() + ':';
            var m = date.getMinutes() + ':';
            var s = date.getSeconds();
            return Y+M+D+h+m+s;
       }
    },

}
</script>

<style scoped src="./css/index.css"></style>

<style scoped>
p{
  padding: 5px;
}
::v-deep .render {
  padding: 0 5px;
}
::v-deep .ant-input,::v-deep .ant-input-number {
  margin: 5px 0;
  width: 80%;
  text-align: center;
}
::v-deep .ant-input-affix-wrapper .ant-input{
  width: 100%;
}
::v-deep .ant-btn {
  margin: 5px 0;
}
::v-deep .ant-tabs-nav .ant-tabs-tab {
  margin: 0 4px;
}
</style>