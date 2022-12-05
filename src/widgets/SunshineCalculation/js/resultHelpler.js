import XLSX from "xlsx";
/**
 * 为结果计算转换、输出做准备
 */
class ResultHelper {
    sortResult(statisticalTable, selectedFeatures) {
        var rs = [];
        for (var i = 0; i < selectedFeatures.length; i++) {
            for (var j = 0; j < statisticalTable.length; j++) {
                if (statisticalTable[j].窗户编号 == selectedFeatures[i].id) {
                    rs.push(statisticalTable[j]);
                    break;
                }
            }
        }
        if (rs.length == 0) {
            return statisticalTable;
        }
        statisticalTable.splice(0, statisticalTable.length);
        for (var i = 0; i < rs.length; i++) {
            statisticalTable.push(rs[i]);
        }
    }
    /**
     * 输出到excel
     * @param {json arr} statisticalTable 
     * @param {string} type:windows/ 
     */
    exportToXls(statisticalTable,type) {
        let _this = this;
        switch (type) {
            case "windows":
                const ws = XLSX.utils.json_to_sheet(statisticalTable, {
                    header: ["窗户编号", "日照时段", "累计有效日照时长"],
                });
                var tmpWB = {
                    SheetNames: ["sheet"], //保存的表标题
                    Sheets: {
                        sheet: Object.assign(
                            {},
                            ws, //内容
                            {}
                        ),
                    },
                };
                let tmpDown = new Blob(
                    [
                        _this.s2ab(
                            XLSX.write(
                                tmpWB,
                                {
                                    bookType: "xlsx",
                                    bookSST: false,
                                    type: "binary",
                                } // 这里的数据是用来定义导出的格式类型
                            )
                        ),
                    ],
                    {
                        type: "",
                    }
                );

                const outFile = document.createElement("a");
                var fileName = "窗户日照计算报告";
                var href = URL.createObjectURL(tmpDown); // 创建对象
                outFile.download = fileName + ".xlsx"; // 下载名称
                outFile.style.display = "none";
                outFile.href = href; // 绑定a标签
                document.body.appendChild(outFile);
                outFile.click(); // 模拟点击实现下载
                document.body.removeChild(outFile);
                break;
        }
    }
    s2ab(s) {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i !== s.length; ++i) {
            view[i] = s.charCodeAt(i) & 0xff;
        }
        return buf;
    }
}
export default new ResultHelper();