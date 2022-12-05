<template></template>
<script>
// import cameraScnapshot from "./index";
// export default {
//   mounted() {
//       cameraScnapshot.initialize(this);
//   },
//   destroyed() {
//     cameraScnapshot.off();
//     this.$emit("close", { code: "Snapshot" });
//   },
// };
export default {
  data() {
    return {
      snapshotObj: null
    }
  },
  mounted() {
    this.snapshotObj = new agcim.utils.Snapshot()
    this.snapshotObj.initialize((img, type)=>{
      let name = Math.random() + '.' + type;
      agcim.ui.domNode.downloadByA(img, name);
      this.$emit("close", { code: "Snapshot" })
    }, ()=>{
      this.$emit("close", { code: "Snapshot" })
    })
  },
  destroyed() {
    this.snapshotObj.dispose();
  }
}
</script>
 