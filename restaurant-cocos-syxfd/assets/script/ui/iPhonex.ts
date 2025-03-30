const { ccclass, property } = cc._decorator;

@ccclass
export default class iPhonex extends cc.Component {

    // onLoad () {}

    start() {
        this.init()
    }

    init() {
        let size = cc.view.getFrameSize();
        let com = this.node.getComponent(cc.Widget);
        let isIphoneX = (size.width == 2436 && size.height == 1125) ||
            (size.width == 1125 && size.height == 2436) ||
            (size.width == 1624 && size.height == 750) ||
            (size.width == 750 && size.height == 1624) ||
            (size.width == 812 && size.height == 375) ||
            (size.width == 375 && size.height == 812)
        if (isIphoneX) {
            com.top = com.top + 70;

        } else {

        }
    }

    // update (dt) {}
}
