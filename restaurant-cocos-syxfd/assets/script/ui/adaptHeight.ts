const { ccclass, property } = cc._decorator;

@ccclass
export default class adaptHeight extends cc.Component {

    onLoad() {
        let rootHeight = cc.winSize.height
        let designHeight = 1920
        let ratio = rootHeight / designHeight
        _LOG("高度比例：", ratio)
    }
    start() {


    }

}
