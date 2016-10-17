define(function () {
    var getRandNum = function (min, max) {
        return (Math.random() * (max - min + 1) + min);
    };

    return {
        getRandNum: getRandNum
    }
});
