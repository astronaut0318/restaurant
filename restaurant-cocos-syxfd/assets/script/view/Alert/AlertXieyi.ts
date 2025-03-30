import { Global } from "../../config/Global";
import { UIID } from "../../config/UIConfig";
import { uiManager } from "../../ui/UIManager";
import { UIView } from "../../ui/UIView";
import GameStorage from "../../utils/GameStorage";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AlertXieyi extends UIView {
    private s1: cc.Node = null;

    init(s1) {
        this.s1 = s1;
    }

    onOpen() {

    }

    onClickUserAgreement() {
        uiManager.open(UIID.UserWebView, {
            url: Global.agreement,
            title: "用户协议"
        });
    }

    onClickUserPrivacy() {
        uiManager.open(UIID.UserWebView, {
            url: Global.policy,
            title: "隐私协议"
        });
    }

    onClickAgree() {
        Global.selectXioeyi = true;
        if (this.s1) {
            this.s1.active = true;
        }
        uiManager.close(this);
    }

    onCloseCancel() {
        uiManager.close(this);
    }

    onDestroy() {
        if (cc.sys.os === cc.sys.OS_ANDROID) {
        //    jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "CheckPermission", "()V");
        }
    }


}