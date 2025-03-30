import CItemItem from "./CItemItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CaipuItem extends cc.Component {
    @property([cc.Node])
    items: cc.Node[] = [];


    start() {
    }

    public setData(data, idx: number) {
        if (data.length > this.items.length) return;
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            let item = this.items[i];
            item.active = true;
            let script = item.getComponent(CItemItem);
            script.setData(element);
        }
    }

    // update (dt) {}
}
