// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class WalletItem extends cc.Component {

    @property(cc.Label)
    yuan1: cc.Label = null;

    @property(cc.Label)
    yuan2: cc.Label = null;

    @property(cc.Label)
    title: cc.Label = null;

    @property(cc.Node)
    selected: cc.Node = null;

    setData(yuan, title: string) {
        this.yuan1.string = yuan + "元";
        this.yuan2.string = yuan + "元";
        this.title.string = title + "";
    }

    showSelected(show: boolean) {
        this.selected.active = show;
    }

    // update (dt) {}
}
