//值是否为空
export function isNullOrEmpty(data) {
    return data == null || data == undefined || data.length == 0 || data == "";
};

//转化成 yyyy-mm-dd 
export function DateTimeForformat(date) {
    var result = date.getFullYear() + "-" 
    + (date.getMonth()>10?date.getMonth(): "0"+ date.getMonth()) + "-" 
    + (date.getDate()>10?date.getDate(): "0"+ date.getDate()) + " "  
    + (date.getHours()>10?date.getHours(): "0"+ date.getHours())+":" 
    + (date.getMinutes()>10?date.getMinutes(): "0"+ date.getMinutes())+":" 
    + (date.getSeconds()>10?date.getSeconds(): "0"+ date.getSeconds())
   return result;
}
