const { ccclass, property } = cc._decorator;

@ccclass
export default class ShareHisBtn extends cc.Component {

    @property(cc.Node)
    bar: cc.Node = null;

    // onLoad () {}

    public setBar(show: boolean) {
        this.bar.active = show;
    }

    // update (dt) {}
}
