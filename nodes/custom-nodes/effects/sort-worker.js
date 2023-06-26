onmessage = function(e) {
    const pixelsum = e.data[1];
    const result = getDefaultIndexArray(pixelsum);
    const compare = getCompareFunction(e.data[2]);
    if(e.data[0]) {
        //Sort with a mask
        if(e.data[2]) {
            //vertical
            for (var j = 0; j < pixelsum[0].length; j++) {
                for (var i = 0; i < pixelsum.length; i++) {
                    //"remember" current element and compare with next
                    for (var k = i; k < pixelsum.length && pixelsum[k][j] != 0; k++) {
                        if (compare(pixelsum[i][j], pixelsum[k][j])) {
                            //swap elements
                            const temp = pixelsum[i][j];
                            pixelsum[i][j] = pixelsum[k][j];
                            pixelsum[k][j] = temp;
                            //swap indexes
                            const temp2 = result[i][j];
                            result[i][j] = result[k][j];
                            result[k][j] = temp2;
                        }
                    }
                }
            }
        } else {
            //horizontal
            for (var i = 0; i < pixelsum.length; i++) {
                for (var j = 0; j < pixelsum[i].length; j++) {
                    //"remember" current element and compare with next
                    for (var k = j; k < pixelsum[i].length && pixelsum[i][k] != 0; k++) {
                        if (compare(pixelsum[i][j], pixelsum[i][k])) {
                            //swap elements
                            const temp = pixelsum[i][j];
                            pixelsum[i][j] = pixelsum[i][k];
                            pixelsum[i][k] = temp;
                            //swap indexes
                            const temp2 = result[i][j];
                            result[i][j] = result[i][k];
                            result[i][k] = temp2;
                        }
                    }
                }
            }
        }
    } else {
        //Sort without a mask
        if(e.data[2]) {
            //vertical
            for (var j = 0; j < pixelsum[0].length; j++) {
                for (var i = 0; i < pixelsum.length; i++) {
                    //"remember" current element and compare with next
                    for (var k = i; k < pixelsum.length; k++) {
                        if (compare(pixelsum[i][j], pixelsum[k][j])) {
                            //swap elements
                            const temp = pixelsum[i][j];
                            pixelsum[i][j] = pixelsum[k][j];
                            pixelsum[k][j] = temp;
                            //swap indexes
                            const temp2 = result[i][j];
                            result[i][j] = result[k][j];
                            result[k][j] = temp2;
                        }
                    }
                }
            }
        } else {
            //horizontal
            for (var i = 0; i < pixelsum.length; i++) {
                for (var j = 0; j < pixelsum[i].length; j++) {
                    //"remember" current element and compare with next
                    for (var k = j; k < pixelsum[i].length; k++) {
                        if (compare(pixelsum[i][j], pixelsum[i][k])) {
                            //swap elements
                            const temp = pixelsum[i][j];
                            pixelsum[i][j] = pixelsum[i][k];
                            pixelsum[i][k] = temp;
                            //swap indexes
                            const temp2 = result[i][j];
                            result[i][j] = result[i][k];
                            result[i][k] = temp2;
                        }
                    }
                }
            }
        }
    }
    postMessage([result]);
}

function getDefaultIndexArray(base) {
    const result = [];
    for (var i = 0; i < base.length; i++) {
        result[i] = [];
        for (var j = 0; j < base[i].length; j++) {
            result[i][j] = [i, j];
        }
    }
    return result;
}

function getCompareFunction(check) {
    if(check) {
        return function(val1, val2) {
            return val1 > val2;
        };
    } else {
        return function(val1, val2) {
            return val1 < val2;
        };
    }
}