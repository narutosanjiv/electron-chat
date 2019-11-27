exports.addItemToArray = (arr, item) => {
    console.log('arr', arr)
    console.log('item', item)
    if(typeof arr != "object") return null

    let idx;
    if((idex = arr.indexOf(item)) != -1) return null
    arr.push(item)
    return arr
}

exports.removeArrItems = arr => {
    let what, a=arguments, L = a.length, ax;

    while(L > 1 && arr.length){
        what = a[--L]
        while((ax=arr.indexOf(what)) !== -1){
            arr.splice(ax, 1)
        }
    }

    return arr
}