/**
 * class Chart 待完善，暂时只有有疫情防控里面使用了。
 */
class Chart {
  createChart(titles, rows) {

  }
  /**
   * 封装echarts ,后台传入titile, legend,gird, xdata,series,
   * @param {*} a title
   * @param {*} b legned
   * @param {*} c grid
   * @param {*} x xdata
   * @param {*} y series
   */
  buildChartOption(a, b, c, x, y) {
    var option = {
      title: {
        text: a,
        textStyle: {
          color: "#b6dbe9"
        },
      },
      tooltip: {},
      legend: {
        data: b,
        x: "right", //可设定图例在左、右、居中
        // y: "center", //可设定图例在上、下、居中
        padding: [25, 45, 0, 0], //标题向右移动50px ,上右下左
        textStyle: { color: "#b6dbe9"
        },
      },
      xAxis: {
        data: x,     
        axisLabel:{
          color:"#FFE32C",  //修改x轴的label字体颜色
          interval:0,  
          rotate:15,
          fontSize:"14px"
      },    
         axisLine: {                   //修改x轴的线
          show: true,
          //------ 箭头 -----
          symbol: ["none", "arrow"],
          symbolSize: [8, 8],
          symbolOffset: [0, 7],
          //----- 线 -----
          lineStyle: {
            color: "#FFE32C",
            width: 1,
            type: "solid"
          }
        },
      },
      grid: c,
      yAxis: {
         axisLabel: {
          color:"#FFE32C"              //修改y轴的label字体颜色
        },
         axisLine: {                    //修改y轴的线
          show: true,
          //------ 箭头 -----
          symbol: ["none", "arrow"],
          symbolSize: [8, 8],
          symbolOffset: [0, 7],
          //----- 线 -----
          lineStyle: {
            color: "#FFE32C",
            width: 1,
            type: "solid"
          }
        },
      },
      series: y
    };
    return option;
  }
};

export default  Chart;