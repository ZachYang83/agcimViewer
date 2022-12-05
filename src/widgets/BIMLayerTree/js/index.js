import serverData4BIM from "@/views/js/net/serverData4BIM";
import agRevitHelper from "@/sdk/bim/revitHelper";
import polyline from "@/sdk/geometry/polyline";
import agMath from "@/sdk/maths/math";
import config from "./config";

let allPolyLine = [];

function orientate(id, tileset, type = "element", ischeck) {
  serverData4BIM.getProperty(config.tableName, id).then((res) => {
    if (!res.success) return;
    var data = res.content;
    agRevitHelper.flyTo(data[0], tileset, type, CIM.viewer);
    if (ischeck) checkRoomData(data, tileset);
  });
}

function checkRoomData(datas, tileset) {
  var modelMatrix = tileset.root.computedTransform;
  if (allPolyLine != null) {
    for (let i = 0; i < allPolyLine.length; i++) {
      CIM.viewer.entities.remove(allPolyLine[i]);
    }
  }

  var info = eval("(" + datas[0].boundingbox + ")");
  var edges = info.EdgeArray;
  allPolyLine = [];

  let data = restructPosition(edges);
  for (let i = 0; i < data.length; i++) {
    var position1 = agRevitHelper.getWorldPosition(
      data[i].XYZ1,
      modelMatrix,
      0.3048
    );

    var position2 = agRevitHelper.getWorldPosition(
      data[i].XYZ2,
      modelMatrix,
      0.3048
    );

    var poly = polyline.create([position1, position2], {
      material: Cesium.Color.RED,
      width: 2,
    });
    CIM.viewer.entities.add(poly);

    poly.position = new Cesium.Cartesian3(
      (position1.x + position2.x) / 2,
      (position1.y + position2.y) / 2,
      (position1.z + position2.z) / 2
    );
    var distance = agMath.getDistance(position1, position2);
    var text = data[i].name + ":" + (distance * 1000).toFixed(0) + "mm";
    poly.label = {
      text: text,
      font: "normal 16px MicroSoft YaHei",
      fillColor: Cesium.Color.GOLD,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      outlineWidth: 2,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      showBackground: true,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    };

    allPolyLine.push(poly);
  }
}

function restructPosition(data) {
  let positionArr = [];
  var minheight = 0;
  var maxheight = 0;
  var minX = 9999999;
  var maxX = 0;
  var minY = 9999999;
  var maxY = 0;
  for (let i = 0; i < data.length; i++) {
    if (data[i].XYZ1.Z != data[i].XYZ2.Z) {
      maxX = data[i].XYZ1.X > maxX ? data[i].XYZ1.X : maxX;
      minX = data[i].XYZ1.X < minX ? data[i].XYZ1.X : minX;
      maxY = data[i].XYZ1.Y > maxY ? data[i].XYZ1.Y : maxY;
      minY = data[i].XYZ1.Y < minY ? data[i].XYZ1.Y : minY;
      minheight =
        data[i].XYZ1.Z < data[i].XYZ2.Z ? data[i].XYZ1.Z : data[i].XYZ2.Z;
      maxheight =
        data[i].XYZ1.Z > data[i].XYZ2.Z ? data[i].XYZ1.Z : data[i].XYZ2.Z;
    }
  }
  positionArr.push({
    name: "L1",
    XYZ1: { X: minX, Y: minY, Z: minheight },
    XYZ2: { X: minX, Y: maxY, Z: minheight },
  });
  positionArr.push({
    name: "L2",
    XYZ1: { X: minX, Y: maxY, Z: minheight },
    XYZ2: { X: maxX, Y: maxY, Z: minheight },
  });
  positionArr.push({
    name: "L3",
    XYZ1: { X: maxX, Y: minY, Z: minheight },
    XYZ2: { X: maxX, Y: maxY, Z: minheight },
  });
  positionArr.push({
    name: "L4",
    XYZ1: { X: minX, Y: minY, Z: minheight },
    XYZ2: { X: maxX, Y: minY, Z: minheight },
  });

  positionArr.push({
    name: "H1",
    XYZ1: { X: minX, Y: minY, Z: minheight },
    XYZ2: { X: minX, Y: minY, Z: maxheight },
  });
  positionArr.push({
    name: "H2",
    XYZ1: { X: minX, Y: maxY, Z: minheight },
    XYZ2: { X: minX, Y: maxY, Z: maxheight },
  });
  positionArr.push({
    name: "H3",
    XYZ1: { X: maxX, Y: maxY, Z: minheight },
    XYZ2: { X: maxX, Y: maxY, Z: maxheight },
  });
  positionArr.push({
    name: "H4",
    XYZ1: { X: maxX, Y: minY, Z: minheight },
    XYZ2: { X: maxX, Y: minY, Z: maxheight },
  });

  var topCenter = { X: (minX + maxX) / 2, Y: (minY + maxY) / 2, Z: maxheight };
  var bottomCenter = {
    X: (minX + maxX) / 2,
    Y: (minY + maxY) / 2,
    Z: minheight,
  };
  positionArr.push({ name: "H5", XYZ1: bottomCenter, XYZ2: topCenter });
  return positionArr;
}

function getCondition(node) {
  var category = node.dataRef.category;
  var nodeValue = node.dataRef.name;
  var condition = null;
  var levelValue = null;

  if (category == "Level") {
    levelValue = nodeValue;
    condition = `\${level} === '${levelValue}' && \${profession} ==='${config.selectValue}'`;
  } else if (category == "Category") {
    levelValue = node.$parent.dataRef.value;
    condition = `\${level} === '${levelValue}' && \${catagory} === '${nodeValue}'`;
  } else if (category == "FamilyName") {
    levelValue = node.$parent.$parent.dataRef.value;
    var catagoryValue = node.$parent.dataRef.name;

    condition = `\${level} === '${levelValue}' && \${catagory} === '${catagoryValue}' && \${familyname} === '${nodeValue}'`;
  } else if (category == "FamilyType") {
    levelValue = node.$parent.$parent.$parent.dataRef.value;
    var catagoryValue = node.$parent.$parent.dataRef.value;
    var familyNameValue = node.$parent.dataRef.name;
    condition = `\${level} === '${levelValue}' && \${catagory} === '${catagoryValue}' && \${familyname} === '${familyNameValue}' && \${familytype} === '${nodeValue}' `;
  } else if (category == "Room") {
    levelValue = node.$parent.dataRef.value;
    condition = `\${level} === '${levelValue}'`;
  }

  return { level: levelValue, cond: condition };
}

//获取控制模型显隐的条件
function getStyleCondition(val, treeData) {
  var dbIDs = [];
  var levelID = " ";
  var cataID = " ";
  var familyID = " ";
  for (var i = 0; i < val.length; i++) {
    var treeIndex = val[i].split("-");
    var levelValue = treeData[0].children[treeIndex[2]].value;

    if (val[i].length >= 5 && val[i].length < 7) {
      levelID = val[i];
      dbIDs.push([
        `\${level} === '${levelValue}' && \${profession} ==='${config.selectValue}'`,
        true,
      ]);
    } else if (
      val[i].length >= 7 &&
      val[i].length < 9 &&
      val[i].indexOf(levelID) != 0
    ) {
      cataID = val[i];
      var category =
        treeData[0].children[treeIndex[2]].children[treeIndex[3]].name;

      dbIDs.push([
        `\${level} === '${levelValue}' && \${catagory} === '${category}'`,
        true,
      ]);
    } else if (
      val[i].length >= 9 &&
      val[i].length < 11 &&
      val[i].indexOf(cataID) != 0 &&
      val[i].indexOf(levelID) != 0
    ) {
      familyID = val[i];
      var catagoryValue =
        treeData[0].children[treeIndex[2]].children[treeIndex[3]].name;

      var familyNameValue =
        treeData[0].children[treeIndex[2]].children[treeIndex[3]].children[
          treeIndex[4]
        ].name;

      var condition = `\${level} === '${levelValue}' && \${catagory} === '${catagoryValue}' && \${familyname} === '${familyNameValue}' `;
      dbIDs.push([condition, true]);
    } else if (
      val[i].length >= 11 &&
      val[i].indexOf(familyID) != 0 &&
      val[i].indexOf(levelID) != 0 &&
      val[i].indexOf(cataID) != 0
    ) {
      var catagoryValue =
        treeData[0].children[treeIndex[2]].children[treeIndex[3]].name;

      var familyNameValue =
        treeData[0].children[treeIndex[2]].children[treeIndex[3]].children[
          treeIndex[4]
        ].name;

      var typeValue =
        treeData[0].children[treeIndex[2]].children[treeIndex[3]].children[
          treeIndex[4]
        ].children[treeIndex[5]].name;

      var condition = `\${level} === '${levelValue}' && \${catagory} === '${catagoryValue}' && \${familyname} === '${familyNameValue}' && \${familytype} === '${typeValue}' `;
      dbIDs.push([condition, true]);
    }
  }

  dbIDs.push([true, false]);
  return dbIDs;
}

export { orientate, checkRoomData, getCondition, getStyleCondition };
