import Utils from "../../utils/Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Keren extends cc.Component {

    @property(cc.Sprite)
    sprite: cc.Sprite = null;

    // onLoad () {}

    start() {

    }

    setData(data) {
        // _LOG("菜数据：", data);
        let { id } = data;
        Utils.loadLocalSprite("texture/foods/shuwu" + id, this.sprite);
    }

    // update (dt) {}
}
