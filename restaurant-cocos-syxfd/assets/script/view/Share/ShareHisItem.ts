import { UIID } from "../../config/UIConfig";
import { uiManager } from "../../ui/UIManager";
import Utils from "../../utils/Utils";

const { ccclass, property } = cc._decorator;
import { Base64 } from "js-base64";

@ccclass
export default class ShareHisItem extends cc.Component {

    @property(cc.Sprite)
    head: cc.Sprite = null;

    @property(cc.Label)
    username: cc.Label = null;

    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Node)
    detail: cc.Node = null;

    @property(cc.Node)
    tip: cc.Node = null;

    private childUserId: number = 0;

    setData(data, isDaijihuo) {
        this.tip.active = false;
        this.detail.active = false;
        // let { headimgurl, nickname, gettimes } = data;
        let { user_id, heading, nickname, give_father_income } = data;
        this.childUserId = user_id;
        if (heading) {
            Utils.loadRemoteImg(heading, this.head);
        }
        //nickname = Base64.decode(nickname) || "";
        this.username.string = nickname;
        //this.time.string = "";
        if (isDaijihuo) {
            this.tip.active = true;
            //this.detail.active = true;
            this.time.node.active = false;
        }
        else {
            const income = this.toFixed2(give_father_income / 100);
            this.time.string = `累计贡献收益：${income} 元`;
            this.time.node.active = true;
            this.detail.active = true;
        }
    }

    showDetailInfo() {
        uiManager.open(UIID.AlertTransferRecords, this.childUserId);
    }

    private toFixed2(num) {
        if (!num) return "0.00";
        return num.toFixed(2);
    }

    // update (dt) {}
}
