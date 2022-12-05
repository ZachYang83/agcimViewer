<template>
  <ag-popup
    v-model="visible"
    :title="title"
    :isMove="isMove"
    @onCancel="onCancel('ruleFormData')"
    class="infoBox_modelup_rg"
  >
    <div>
      <div class="ag-from-tall">
        <a-form-model
          ref="ruleFormData"
          :model="ruleFormData"
          :rules="rules"
          class="login_group"
        >
          <a-form-model-item
            :label-col="formItemLayout.labelCol"
            :wrapper-col="formItemLayout.wrapperCol"
            label="用户名"
            prop="username"
          >
            <a-input v-model="ruleFormData.username" placeholder="请输入用户名">
            </a-input>
          </a-form-model-item>
          <a-form-model-item
            :label-col="formItemLayout.labelCol"
            :wrapper-col="formItemLayout.wrapperCol"
            label="手机号"
            prop="phone"
          >
            <a-input
              v-model="ruleFormData.phone"
              placeholder="请输入手机号"
              autocomplete="new-password"
            >
            </a-input>
          </a-form-model-item>
          <a-form-model-item
            label="用户类型"
            :label-col="formItemLayout.labelCol"
            :wrapper-col="formItemLayout.wrapperCol"
            prop="type"
          >
            <a-select v-model="ruleFormData.type" placeholder="请选择用户类型">
              <a-select-option value="1"> 公众版 </a-select-option>
              <a-select-option value="2"> 政务版 </a-select-option>
            </a-select>
          </a-form-model-item>

          <a-form-model-item
            :label-col="formItemLayout.labelCol"
            :wrapper-col="formItemLayout.wrapperCol"
            label="机构"
            prop="mechanism"
          >
            <a-input v-model="ruleFormData.mechanism" placeholder="请输入机构">
            </a-input>
          </a-form-model-item>

          <a-form-model-item
            :label-col="formItemLayout.labelCol"
            :wrapper-col="formItemLayout.wrapperCol"
            label="密码"
            prop="password"
          >
            <a-input
              v-model="ruleFormData.password"
              placeholder="密码"
              type="password"
              autocomplete="new-password"
            >
            </a-input>
          </a-form-model-item>
          <a-form-model-item
            label="密码强度"
            v-if="ruleFormData.password!= undefined && ruleFormData.password!=null && ruleFormData.password.length >=6"
            :label-col="formItemLayout.labelCol"
            :wrapper-col="formItemLayout.wrapperCol"
            class="ag-passwordStrength"
          >
            <a-row>
              <a-col :span="4">
                <a-progress
                  :showInfo="false"
                  style="width: 96%"
                  :strokeColor="'#ff0000'"
                  :percent="passwordStrength > 0 ? 100 : 0"
                />
              </a-col>
              <a-col :span="4">
                <a-progress
                  :showInfo="false"
                  style="width: 96%"
                  :strokeColor="'#FF7F00'"
                  :percent="passwordStrength > 1 ? 100 : 0"
                />
              </a-col>
              <a-col :span="4">
                <a-progress
                  :showInfo="false"
                  style="width: 96%"
                  :percent="passwordStrength > 2 ? 100 : 0"
                />
              </a-col>
            </a-row>
            <a-row>
              <a-col
                style="font-size: 10px; line-height: 0px"
                :span="4"
                align="center"
              >
                弱
              </a-col>
              <a-col
                style="font-size: 10px; line-height: 0px"
                :span="4"
                align="center"
              >
                中
              </a-col>
              <a-col
                style="font-size: 10px; line-height: 0px"
                :span="4"
                align="center"
              >
                强
              </a-col>
            </a-row>
          </a-form-model-item>

          <a-form-model-item
            :label-col="formItemLayout.labelCol"
            :wrapper-col="formItemLayout.wrapperCol"
            label="确认密码"
            prop="checkPass"
          >
            <a-input
              v-model="ruleFormData.checkPass"
              placeholder="确认密码"
              type="password"
            >
            </a-input>
          </a-form-model-item>

          <div class="registered-btn-group">
            <a-button
              type="primary"
              html-type="submit"
              class="zc_bt_"
              @click="handleSubmit('ruleFormData')"
            >
              注册
            </a-button>
            <a-button @click="onCancel('ruleFormData')"> 取消 </a-button>
          </div>
        </a-form-model>
      </div>
    </div>
  </ag-popup>
</template>

<script>
import AgPopup from "@/views/components/AgPopup.vue";
import axios from "@/views/js/net/http";
import { toRegistered } from "@/views/js/net/http";
import user from "@/views/js/store/user";
import axiosWraper from "@/views/js/net/axiosWraper";
import userServer from "@/views/js/net/userServer";
import md5 from "js-md5";

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 8 },
};
let formName = "ruleFormData";
export default {
  data() {
    let mobilephoneValidate = function (rule, value, callback) {
      let testMobilephone = (str) => {
        const regex = /^1[3456789]\d{9}$/;
        if (!regex.test(str)) {
          return false;
        } else {
          return true;
        }
      };
      if (!testMobilephone(value)) {
        callback(new Error("请输入正确手机格式"));
      }
      callback();
    };
    let validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入密码"));
      } else if (value.length < 6) {
        callback(new Error("密码必须大于6位"));
      } else {
        var arr = [],
          array = [1, 2, 3, 4];
        if (/\d/.test(value)) {
          //如果用户输入的密码 包含了数字
          arr.push(1);
        }
        if (/[a-z]/.test(value)) {
          //如果用户输入的密码 包含了小写的a到z
          arr.push(2);
        }
        if (/[A-Z]/.test(value)) {
          //如果用户输入的密码 包含了大写的A到Z
          arr.push(3);
        }
        if (/\W/.test(value)) {
          //如果是非数字 字母 下划线
          arr.push(4);
        }
        this.passwordStrength = arr.length;
        callback();
      }
    };
    let validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.ruleFormData.password) {
        callback(new Error("两次密码不一样"));
      } else {
        callback();
      }
    };

    return {
      title: "注册信息",
      isMove: false,
      formItemLayout,
      ruleFormData: {
        password: "",
        phone: "",
        type: "1",
        username: "",
        checkPass: "",
        mechanism: "",
      },
      passwordStrength: 0,
      rules: {
        phone: [
          { required: true, validator: mobilephoneValidate, trigger: "change" },
        ],
        password: [
          { required: true, validator: validatePass, trigger: "change" },
        ],
        checkPass: [
          { required: true, validator: validatePass2, trigger: "change" },
        ],
        username: [
          { required: true, message: "请输入用户名", trigger: "change" },
        ],
        mechanism: [
          { required: true, message: "请输入机构", trigger: "change" },
        ],
        type: [{ required: true, message: "请输入机构", trigger: "change" }],
      },
    };
  },
  props: ["visible"],
  components: { "ag-popup": AgPopup },
  mounted() {
    let _this = this;
    setTimeout(() => {
      _this.onCancel(formName);
    }, 1000);
  },

  beforeCreate() {
    this.form = this.$form.createForm(this, { name: "normal_login" });
  },
  methods: {
    handleSubmit(formName) {
      let _this = this;
      this.$refs.ruleFormData.validate((valid) => {
        if (valid) {
          _this.toRegistered(_this.ruleFormData);
        } else {
          return false;
        }
      });
    },
    checkPassWord(value) {
      // 0： 表示第一个级别 1：表示第二个级别 2：表示第三个级别
      // 3： 表示第四个级别 4：表示第五个级别
      var arr = [],
        array = [1, 2, 3, 4];
      if (value.length < 6) {
        //最初级别
        return 0;
      }
      if (/\d/.test(value)) {
        //如果用户输入的密码 包含了数字
        arr.push(1);
      }
      if (/[a-z]/.test(value)) {
        //如果用户输入的密码 包含了小写的a到z
        arr.push(2);
      }
      if (/[A-Z]/.test(value)) {
        //如果用户输入的密码 包含了大写的A到Z
        arr.push(3);
      }
      if (/\W/.test(value)) {
        //如果是非数字 字母 下划线
        arr.push(4);
      }
      for (var i = 0; i < array.length; i++) {
        if (arr.indexOf(array[i]) == -1) {
          return array[i];
        }
      }
    },
    onCancel(formName = "ruleFormData") {
      this.$refs[formName].resetFields();
      this.$emit("hideModel", false);
    },
    async toRegistered(param) {
      let _this = this;
      //  let url="http://192.168.3.204:8290/agcloud/agsupport/om/users/saveOpuOmUser?pId=210&type=o";

      let url = "/agcloud/agsupport/om/users/saveOpuOmUser?pId=210&type=o";
      let p = {
        isActive: 1,
        isPwdEncrypted: 0,
        loginName: param.username,
        userName: param.username,
        userSex: 0,
        loginPwd: md5(param.password),
        userMobile: param.phone,
        paramType:2 
      };

      // let results = await axios.post(encodeURI(url),p);

      let results = await toRegistered(p);
      if (results.success) {
        _this.$message.success("注册成功");
        userServer.addUser({
          userId: results.content.userId,
          userType: param.type,
          organization: param.mechanism,
        });
        _this.onCancel("ruleFormData");
      } else {
        _this.$message.error("注册失败");
      }
    },
  },
};
</script>
<style>
.infoBox_modelup_rg {
  top: 184px !important;
  width: 500px;

  background: #fff !important;
  left: 50%;
  margin-left: -250px;
}

.infoBox_modelup_rg .ant-form-item {
  margin-bottom: 8px;
}
.infoBox_modelup_rg > .head {
  background: #252bde !important;
}
.infoBox_modelup_rg .registered-btn-group {
  text-align: center;
}
.infoBox_modelup_rg .zc_bt_ {
  margin-right: 20px;
}
.infoBox_modelup_rg .ant-col-4 {
  display: block;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  width: 27%;
}

.infoBox_modelup_rg .ant-col-8 {
  display: block;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  width: 60%;
}
.infoBox_modelup_rg .login_group {
  margin-top: 30px;
}
.ag-passwordStrength .ant-form-item-control {
  line-height: 40px;
  bottom: 10px;
}
.ag-passwordStrength {
  margin-bottom: 0;
}
</style>
