<template>
  <div style="height:100%">
    <div class="homepage">
      <div class="hometitle">奥格城市信息模型平台AGCIM</div>

      <a-form-model
        ref="ruleForm"
        :model="ruleForm"
        :rules="rules"
        v-bind="layout"
        class="login_group"
      >
        <a-form-model-item has-feedback label="用户名" prop="username">
          <a-input v-model="ruleForm.username" autocomplete="off" class="input-item" />
        </a-form-model-item>

        <a-form-model-item has-feedback label="密码" prop="password">
          <a-input
            v-model="ruleForm.password"
            type="password"
            autocomplete="off"
            class="input-item"
          />
        </a-form-model-item>

        <div>
          <a class="forget-password">忘记密码</a>
        </div>

        <div class="radio_group_t" v-if="false">
          <a-radio-group v-model="ruleForm.type">
            <a-radio value="1">公众版</a-radio>
            <a-radio value="2">政务版</a-radio>
          </a-radio-group>
        </div>

        <div class="btn-group">
          <a-button type="primary" @click="submitForm('ruleForm')">登录</a-button>
          <a-button style="margin-left: 10px" @click="registereFn('ruleForm')">注册新用户</a-button>
        </div>
      </a-form-model>

      <div class="copyright">
        <label>
          Copyright©2020 All Rights Reserved 版权所有
          奥格科技股份有限公司
        </label>
      </div>
    </div>
    <Registered :visible="showRegistere" @hideModel="hideModel" />
  </div>
</template>
<script>
import Registered from "../Registered/index.vue";
import { toLogin } from "@/views/js/net/http";
import md5 from "js-md5";

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
      } else if (value.length < 3) {
        callback(new Error("密码必须大于3位"));
      } else {
        callback();
      }
    };
    let validateUserName = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入用户名"));
      } else {
        callback();
      }
    };
    return {
      showRegistere: false,
      ruleForm: {
        password: "",
        phone: "",
        type: "1",
        username: "",
      },
      rules: {
        phone: [{ validator: mobilephoneValidate, trigger: "change" }],
        password: [{ validator: validatePass, trigger: "change" }],
        username: [{ validator: validateUserName, trigger: "change" }],
      },
      layout: {
        labelCol: { span: 4 },
        wrapperCol: { span: 14 },
      },
    };
  },
  components: {
    Registered,
  },
  methods: {
    jumpToMap() {
      if (this.user == "admin" && this.password == "123") {
        this.$router.push("/");
      } else {
        alert("账号密码错误，请重新输入...");
      }
    },
    submitForm() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          try {
            this.login(this.ruleForm);
          } catch (err) {
            this.$message.error("登录失败");
          }
        } else {
          return false;
        }
      });
    },

    registereFn() {
      this.showRegistere = true;
    },
    hideModel() {
      this.showRegistere = false;
    },
    async login(param) {
      try {
        let results = await toLogin({
          username: param.username,
          password: md5(param.password),
        });
        if (results.success) {
          //已经登录
          this.$store.commit("handleLogin", true);
          this.$store.commit(
            "handleUserId",
            results.content.opusLoginUser.user.userId
          );
          this.$store.commit(
            "handleUserName",
            results.content.opusLoginUser.user.userName
          );
           this.$router.push("/");
        } else {
          this.$message.error("登录失败");
        }
      } catch (err) {
        this.$message.error("登录失败" + err.data.message);
      }
    },
  },
};
</script>
<style scoped>
.homepage {
  height: 100%;
  background: url("../../assets/img/homepage.jpg");
  background-size: cover;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.hometitle {
  font-size: 3.5rem;
  font-family: PingFang SC;
  font-weight: 800;
  color: rgba(255, 255, 255, 1);
  position: fixed;
  top: 100px;
}
.loginbutton {
  background: rgba(11, 175, 164, 1);
}
.menutitle {
  height: 100%;
  margin-left: 5vw;
  display: flex;
  justify-content: center;
  align-items: center;
}
.menutitle span {
  font-size: 2rem;
  font-family: Microsoft YaHei;
  font-weight: 400;
  color: rgba(78, 78, 78, 1);
}
.menutitle span p {
  width: 11vw;
  letter-spacing: 0.5vw;
}

.infoinput {
  width: 20vw;
  display: flex;
  justify-content: center;
  align-content: center;
}
.infoinput .name,
.infoinput .password {
  width: 14vw;
}
.loginbutton {
  width: 10vw;
  background: rgba(255, 248, 220, 0);
  display: flex;
  justify-content: center;
  align-content: center;
  margin: 5px;
}
.loginbutton button {
  width: 120px;
  background: rgba(11, 175, 164, 1);
  border-radius: 4px;
  border: none;
}
.loginbutton button:hover {
  border: none;
}
.copyright {
  position: fixed;
  bottom: 30px;
}
.copyright label {
  font-size: 16px;
  font-family: Microsoft YaHei;
  font-weight: 400;
  color: rgba(255, 255, 255, 1);
  line-height: 36px;
}
.login_group {
  min-width: 340px;
  padding: 20px;
  padding-top: 50px;
  padding-right: 25px;
  border-radius: 5px;
  margin-top: 130px;
  background: rgba(255, 255, 255, 0.8);
  text-align: center;
}
.forget-password {
  float: right;
  font-size: 14px;
  color: #514848;
  margin-top: -20px;
  margin-right: 10px;
  text-decoration: underline;
}
.forget-password:hover {
  color: blue;
}
.input-item {
  min-width: 260px;
}
.ant-form-item .ant-col-14 {
  min-width: 260px;
}
.btn-group {
  text-align: center;
  display: block;
  width: 100%;
  padding-left: 27px;
  margin-top: 50px;
}
.btn-group .ant-col {
  weight: 100% !important;
}
.radio_group_t {
  text-align: center;
  margin-bottom: 30px;
}
</style>