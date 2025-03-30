// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class CCUtils extends cc.Component {

    public static _this: CCUtils;
    onLoad() {
        CCUtils._this = this;
    }

    start() {

    }

    delayButton(evt) {
        if (!evt) return;
        if (!evt.target) return;
        let node: cc.Node = evt.target;
        if (!cc.isValid(node)) return;
        let button = node.getComponent(cc.Button);
        button.enabled = false;
        this.scheduleOnce(() => {
            if (cc.isValid(button)) {
                button.enabled = true;
            }
        }, 0.5)
    }

    // update (dt) {}
}
