<template>
  <div class="tag-box vscroll" :class="{ tactive: isToggleTags }">
    <span @click="onToggleTags">切换
      <a-icon type="caret-down" />
    </span>
    <template v-for="tag in tags">
      <a-tooltip v-if="tag.length > 6" :key="tag" :title="tag">
        <a-tag :key="tag" color="#356897" :closable="true" @close="() => handleClose(tag)" @click="searchTree(tag)">
          {{ `${tag.slice(0, 6)}...` }}
        </a-tag>
      </a-tooltip>
      <a-tag v-else color="#356897" :key="tag" :closable="true" @close="() => handleClose(tag)" @click="searchTree(tag)">
        {{ tag }}
      </a-tag>
    </template>
    <a-input v-if="inputVisible" ref="input" type="text" size="small" :style="{ width: '78px' }" :value="inputValue" @change="handleInputChange" @blur="handleInputConfirm" @keyup.enter="handleInputConfirm" />
    <a-tag v-else style="background: #fff; borderStyle: dashed;" @click="showInput">
      <a-icon type="plus" /> 新标签
    </a-tag>
  </div>
</template>
<script>
import axiosWraper from "@/views/js/net/axiosWraper";
import axios from "@/views/js/net/http";
import qs from "qs";

export default {
  data() {
    return {
      //标签
      tags: ["GZ白模", "测试BIM模型", "客家迁移", "天河区域"],
      inputVisible: false,
      inputValue: "",
      curTagObj: {},
      isToggleTags: true,
    };
  },
  created() {
    this.getTags();
  },
  methods: {
    searchTree(o) {
      this.$emit("searchTree", o);
    },
    async getTags() {
      let res = await axiosWraper.getData(
        `/agsupport-rest/io/jsonstore/getByDomainAndUsage?name=layerTreeTag`
      );
      if (res.success && res.content.total) {
        let arr = res.content.rows;
        this.curTagObj = arr[0];
        this.tags = JSON.parse(arr[0].json);
      } else {
        let param = {
          name: "layerTreeTag",
          domain: "GZ",
          usage: "layerTreeTag",
          url: "",
          sort: "",
          json: JSON.stringify(this.tags),
          tag: "",
        };
        let res1 = await axios.post(
          `/agsupport-rest/io/jsonstore/save`,
          qs.stringify(param)
        );
        if (res1.success) {
          this.getTags();
        }
      }
    },
    handleClose(removedTag) {
      const tags = this.tags.filter((tag) => tag !== removedTag);
      this.tags = tags;
      this.updateTags();
    },
    showInput() {
      this.inputVisible = true;
      this.$nextTick(function () {
        this.$refs.input.focus();
      });
    },
    handleInputChange(e) {
      this.inputValue = e.target.value;
    },
    handleInputConfirm() {
      const inputValue = this.inputValue;
      let tags = this.tags;
      if (inputValue && tags.indexOf(inputValue) === -1) {
        tags = [...tags, inputValue];
      }
      Object.assign(this, {
        tags,
        inputVisible: false,
        inputValue: "",
      });

      this.updateTags();
    },
    async updateTags() {
      let param = {
        id: this.curTagObj.id,
        name: this.curTagObj.name,
        domain: "GZ",
        usage: "layerTreeTag",
        url: "",
        sort: "",
        json: JSON.stringify(this.tags),
        tag: "",
      };
      let res = await axios.post(
        `/agsupport-rest/io/jsonstore/update`,
        qs.stringify(param)
      );
      if (res.success) {
        this.$message.info(res.message);
      }
    },
    //切换
    onToggleTags() {
      this.isToggleTags = !this.isToggleTags;
    },
  },
};
</script>
<style scoped>
.tag-box {
  max-width: 310px;
  margin: 10px 0;
  max-height: 105px;
  overflow: auto;
}
.tag-box.tactive {
  height: 28px;
  overflow: hidden;
}
.tag-box.tactive .anticon {
  transform: rotate(-90deg);
}
.tag-box span {
  margin: 2px;
}
</style>