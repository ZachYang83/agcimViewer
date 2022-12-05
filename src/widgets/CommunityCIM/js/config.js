export const menuArr = [{
        id: "exitin",
        name: "出入口智能管理",
        children: [{
                key: "VideoRecognition",
                name: "视频识别",
                isInit: true,
            },
            // {
            //   key: "VideoProjection",
            //   name: "视频投影",
            // },
        ],
    },
    {
        id: "buildAna",
        name: "建筑分析",
        children: [
            {
              key: "HouseTypePanorama",
              name: "户型查看",
            },
            {
                key: "BuildingEnergyMonito",
                name: "用电统计",
            },
            {
                key: "AerationSystems",
                name: "通风模拟",
            },
            // {
            //   key: "FireRAnalysis",
            //   name: "设备管控",
            // },
            {
                key: "ResidentInfo",
                name: "人房信息",
            },
        ],
    },
    // {
    //   id: "BIMDesign",
    //   name: "BIM设计",
    //   key: "BIMDesign",
    //   children: [],
    // },
];