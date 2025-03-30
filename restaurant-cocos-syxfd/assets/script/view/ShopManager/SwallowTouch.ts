const { ccclass, property } = cc._decorator;

@ccclass
export default class SwallowTouch extends cc.Component {

    onEnable() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouch, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouch, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouch, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouch, this);
    }

    onDisable(){
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouch, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouch, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouch, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouch, this);
    }

    onTouch(event) {
        event._propagationStopped = false;
        this.node["_touchListener"].swallowTouches = false;
    }

    // update (dt) {}
}
