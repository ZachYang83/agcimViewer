 const videoRecognite = function (send_cfg,vm) {
    if ('MediaSource' in window && "WebSocket" in window) {
       var ws = new WebSocket("ws://192.168.3.204:8675");

       ws.onopen = function () {
         ws.send(JSON.stringify(send_cfg))  
       };

       const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
          const byteCharacters = atob(b64Data);
          const byteArrays = [];

          for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
             const slice = byteCharacters.slice(offset, offset + sliceSize);

             const byteNumbers = new Array(slice.length);
             for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
             }

             const byteArray = new Uint8Array(byteNumbers);
             byteArrays.push(byteArray);
          }

          const blob = new Blob(byteArrays, {
             type: contentType
          });
          return blob;
       }

       ws.onmessage = function (evt) {
          var jObject = JSON.parse(evt.data);
          var objectURL = URL.createObjectURL(b64toBlob(jObject.image));
          var img = document.getElementById("target");
          if(!img){
             ws.close();
             vm.$message.info('请打开出入口管理模块');
          }else{
            img.src = objectURL; 
          }
          vm.addChart(jObject);
       };

       ws.onclose = function () { 
          
       };

       return ws;
    }
 }

 export default videoRecognite;