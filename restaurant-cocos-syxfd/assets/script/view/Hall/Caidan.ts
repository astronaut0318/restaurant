import Utils from "../../utils/Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Caidan extends cc.Component {

    @property(cc.Sprite)
    sprite: cc.Sprite = null;

    @property(cc.Label)
    label: cc.Label = null;

    start() {

    }

    setData(id, income) {
        Utils.loadLocalSprite("texture/foods/shuwu" + id, this.sprite);
        this.label.string = income + "";
    }

    // update (dt) {}
}
