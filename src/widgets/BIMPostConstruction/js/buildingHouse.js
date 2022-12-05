import tableServer from "./tableServer";
import StyleCondition from "@/sdk/renderer/styleCondition";
export default async function init(tileset) {

    var tableName = tileset.tableName;
    //房子结构
    let BldgLevel = await getHouseLevel({
        tableName,
        groupKey: "level",
        countKey: "level"
    })
    BldgLevel.pop();
    BldgLevel.push("RF");
    //根据 墙壁 梁柱 地板 家具 管线划分构件大类
    let wallOption = ["墙"];
    let columnOption = ["结构柱", "结构框架"];
    let floorOption = ["楼板"];
    let floorDecoration = [
        { key: floorOption, label: "铺设楼板" },//地板
        { key: columnOption, label: "浇筑梁柱" },//地板
        { key: wallOption, label: "砌墙" },//地板
    ]
    if (!tileset) return;
    let buildingHouseStep = [];
    let indexStep = -1;
    let styleCondition = new StyleCondition(tileset);

    //完成房屋设计
    function finishDesign() {
        styleCondition.resetVisible(true);
    }
    function houseInit() {
        styleCondition.resetVisible(false);

        function initDecoration(param, description) {
            function fn() {
              

                let condition = `\${level} === '${param.level}' && \${catagory} ==='${param.catagory[0]}'`;
                styleCondition.addShowCondition(condition);
            }
            return { active: fn, label: description}
        }

 //通过参数获取构件列表
 async function getMaterials(param) {
    // console.log(param);
    param = Object.assign({}, param, {
        tableName,
        // entitytable:tableName,
        // paramType:1,
       page:0,  
        rows: 100000,
        filterType:"filterType"
    })

    console.log(param,'param1');
    //参数逗号分隔
    // console.log(param.catagory );
    // console.log(param.level );
    
    if (param.catagory && Array.isArray(param.catagory)) {
        param.catagory = param.catagory.join(",");
    }
    if (param.level && Array.isArray(param.level)) {
        param.level = param.level.join(",");
    }
    let re = await tableServer.findDentityy(param);
    console.log(re);
    
        return re.content;

        
}//添加

        //设置每一层楼
        let setFloor = (index) => {
            return floorDecoration.map(item => {
                return initDecoration({
                    level: index,
                    catagory: item.key
                }, index + ":" + item.label)
            })
        }
        let floorsArr = BldgLevel.map(item => setFloor(item));
        return [
            floorsArr
        ].flat(Infinity)
    }
    //开始装配
    function start() {
        let houseArr = houseInit()//针对房屋拆解
        // console.log(houseArr);
        
        houseArr.map(item => {
            buildingHouseStep.push({ type: "house", active: item.active, label: item.label });
        })
    }
    //向后搭建
    function next() {
        if (indexStep < buildingHouseStep.length - 1) {
            indexStep += 1;
            run(indexStep);
            return { label: buildingHouseStep[indexStep].label, status: indexStep }
        } else {
            finishDesign();
            return { label: "安装门窗", status: buildingHouseStep.length + 1 }
        }
    }
   
    //执行操作
    function run(index) {
        var fnOb = buildingHouseStep[index];
        if (!fnOb) return;
        fnOb.active();
    }

    //重建
    function reset() {
        styleCondition.resetVisible(true);
        indexStep = -1;
    }

    //获取房子结构
    async function getHouseLevel(param) {
        let data = await tableServer.statisticsDentitya(param);
        let result = data.content;
        let filterData = result.map(item => {
            return item.name
        });
        return filterData.filter(item => item !== " ").filter(item => item !== "RF").sort(houseLevelSort);
        
    }


    function houseLevelSort(a, b) {
        a = parseInt(a);
        b = parseInt(b);
        return a - b;
    }
    function getCount() {
        return buildingHouseStep.length;
    }
    //建房子大业从这开始
    start();
    return {
        houseInit,
        start,
        next,
        reset,
        getCount
    }
}