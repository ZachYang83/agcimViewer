
import agRenderer from "@/sdk/renderer/renderer";
export default {
  props: ["idName", "currentCommunity","currentCommunityLG"],
  data() {
    return {
      opacity: 0.5,
      ventimg: require("../img/ventals.png"),
      bdlist: [
        {
          bdid: "1",
          bdnum: "A1",
          imglink: require("../img/A1.png")
        }
      ]
    };
  },
  mounted() {

  },
  destroyed() {
    agRenderer.setOpacity(this.currentCommunityLG, 0);
    agRenderer.setOpacity(this.currentCommunityLG, 0);
  },
  methods: {
    sendMsgToIndex() {
      this.$emit("backToIndex", "isVentilation");
    },
    sendBdMsgToIndex() {
      this.$emit("backToIndex", "isBuilding");
    },
    changeDirection(dict) {
      agRenderer.setMaterialFromImage(this.currentCommunity, require("../img/" + dict));
    },
    changeOpacity() {
      agRenderer.setOpacity(this.currentCommunity, this.opacity);
    }
  }
};