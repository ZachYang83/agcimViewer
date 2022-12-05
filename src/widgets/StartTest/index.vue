<template>
  <div class="box">
    <div>StartTest</div>
    {{name}}
  </div>
</template>

<script>
import widgetAssetsTable from "@/views/js/net/widgetAssetsTable";
export default {
  data() {
    return {
      name: "",
    };
  },
  created() {
    this.add();
    this.add1();
    this.update();
    this.delete();
    this.download();
    this.preview();
    this.get();
    this.find();
  },
  methods: {
    async add() {
      let p = {
        tableName: "string_test",
        name: "shan",
        title: "测试字符串",
        time: "2020-12-4",
      };
      var fd = new FormData();
      for (let key in p) {
        fd.append(key, p[key]);
      }
      let res = await widgetAssetsTable.add(fd);
    },
    async add1() {
      const createMaterialImage = function () {
        var c = document.createElement("canvas");
        c.width = 512;
        c.height = 32;
        var ctx = c.getContext("2d");
        var my_gradient = ctx.createLinearGradient(0, 0, c.width, 0);
        my_gradient.addColorStop(0, "rgba(255,0,0, 1)");
        my_gradient.addColorStop(1, "rgba(255,0,0, 0)");
        ctx.fillStyle = my_gradient;
        ctx.fillRect(0, 0, c.width, c.height);
        return c.toDataURL("image/png");
      };

      // base64转blob
      const base64ToBlob = function (base64Data) {
        let arr = base64Data.split(","),
          fileType = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[1]),
          l = bstr.length,
          u8Arr = new Uint8Array(l);

        while (l--) {
          u8Arr[l] = bstr.charCodeAt(l);
        }
        return new Blob([u8Arr], {
          type: fileType,
        });
      };
      // blob转file
      const blobToFile = function (newBlob, fileName) {
        newBlob.lastModifiedDate = new Date();
        newBlob.name = fileName;
        return newBlob;
      };

      const blob = base64ToBlob(createMaterialImage());
      const file = blobToFile(blob, "123");

      let p = {
        tableName: "file_test",
        name: "shan",
        text: "测试文件的",
      };
      var fd = new FormData();
      for (let key in p) {
        fd.append(key, p[key]);
      }
      fd.append("img", file);
      let res = await widgetAssetsTable.add(fd);
    },
    async get() {
      let p = {
        tableName: "file_test",
        name: "shan",
      };
      let res = await widgetAssetsTable.get(p);
    },
    async find() {
      let p = {
        tableName: "string_test",
        // name: "shan",
      };
      let res = await widgetAssetsTable.find(p);
    },
    async update() {
      const createMaterialImage = function () {
        var c = document.createElement("canvas");
        c.width = 512;
        c.height = 40;
        var ctx = c.getContext("2d");
        var my_gradient = ctx.createLinearGradient(0, 0, c.width, 0);
        my_gradient.addColorStop(0, "rgba(11,189,165, 1)");
        my_gradient.addColorStop(1, "rgba(11,189,165, 0)");
        ctx.fillStyle = my_gradient;
        ctx.fillRect(0, 0, c.width, c.height);
        return c.toDataURL("image/png");
      };

      // base64转blob
      const base64ToBlob = function (base64Data) {
        let arr = base64Data.split(","),
          fileType = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[1]),
          l = bstr.length,
          u8Arr = new Uint8Array(l);
        while (l--) {
          u8Arr[l] = bstr.charCodeAt(l);
        }
        return new Blob([u8Arr], {
          type: fileType,
        });
      };
      // blob转file
      const blobToFile = function (newBlob, fileName) {
        newBlob.lastModifiedDate = new Date();
        newBlob.name = fileName;
        return newBlob;
      };

      const blob = base64ToBlob(createMaterialImage());
      const file = blobToFile(blob, "1234");

      let p = {
        id: "4sybbh7yps0000",
        tableName: "file_test",
        name: "agcim_admin1",
        text: "111",

        // id: 'bpxnmf21l9c0000',
        // tableName: "string_test",
        // name: "agccccc",
        // title: "测试字符串xxxx",
        // time: "2020-12-7",
      };
      var fd = new FormData();
      for (let key in p) {
        fd.append(key, p[key]);
      }
      fd.append("img", file);
      let res = await widgetAssetsTable.update(fd);
    },
    async delete() {
      let p = {
        ids: "2g4e68x0w8pw000",
        tableName: "string_test",
      };
      let res = await widgetAssetsTable.delete(p);
    },
    async download() {
      let p = {
        id: "4sybbh7yps0000",
        tableName: "file_test",
        fieldName: "img",
        fileName: "test.png",
      };

      let res = await widgetAssetsTable.download(p);
    },
    async preview() {
      let p = {
        id: "4sybbh7yps0000",
        tableName: "file_test",
        fieldName: "img",
        fileName: "test.png",
      };
      let res = await widgetAssetsTable.preview(p);
    },
  },
};
</script>
<style scoped>
.box {
  display: none;
  position: fixed;
  top: 100px;
  left: 200px;
  background: red;
  padding: 20px;
}
</style>