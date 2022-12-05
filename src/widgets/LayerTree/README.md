## 名称
图层树

## 英文名
LayerTree

## 缩略图
![](./logo.png)

## 版本
前端：v1.0.2

后台：v1.0.0  

## 描述
分类展示各种数据的图层列表，比如wfs图层，3dtiles图层，wmts图层等等

## 数据规范要求
config.js里面可以自由配置图层树过滤条件


## 后台接口
图层树：

/agsupport-rest/agsupport/projectManager/get?name=${key}

/agsupport-rest/agsupport/project/getProjectInfo/${this.$store.state.user.userId}

/agsupport-rest/agsupport/project/getProjectLayerTree

标签：

/agsupport-rest/io/jsonstore/getByDomainAndUsage?name=layerTreeTag

/agsupport-rest/io/jsonstore/save

/agsupport-rest/io/jsonstore/update


## 扩展
修订：shan 2020/11/02
