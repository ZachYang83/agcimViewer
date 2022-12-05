
    /**
     * @exports defined
     *
     * @param {*} value The object.
     * @returns {Boolean} Returns true if the object is defined, returns false otherwise.
     *
     * @example
     * if (Cesium.defined(positions)) {
     *      doSomething();
     * } else {
     *      doSomethingElse();
     * }
     */
    function defined(value,key) {
        let isTure= value !== undefined && value !== null;
        if(!isTure){
            throw  new Error(key + "is undefined")
        }
        return isTure;
    }
export default defined;
