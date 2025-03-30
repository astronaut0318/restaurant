import { api } from "../../api/api";
import { Global } from "../../config/Global";
import { UIID } from "../../config/UIConfig";
import { uiManager } from "../../ui/UIManager";
import { UIView } from "../../ui/UIView";
import Http from "../../utils/Http";
import Request2 from "../../utils/Request";
import Utils from "../../utils/Utils";

export interface AlertData {
    title: string,
    content: string,
    cb?: () => void,
    that?: any
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class AlertShareFill extends UIView {

    @property(cc.EditBox)
    editBox: cc.EditBox = null;

    onOpen() {

    }

    onClickOk() {
        let sid = this.editBox.string;
        _LOG(sid);
        if (!sid) return;

        let sharedUserid = parseInt(sid) - 1000000;
        let data = {
            id: Global.userid,
            code: sharedUserid,
            fromId: sid,
        }
        Request2.getApp().open('user/bind', data, res => {
            _LOG("绑定邀请人", res)
            if (res.code == 0) {
                uiManager.close(this);
                uiManager.showWindow(UIID.Toast, {
                    title: '绑定成功'
                })
            } else if (res.code == 3) {
                uiManager.close(this);
                uiManager.showWindow(UIID.Toast, {
                    title: '你已经绑定邀请人'
                })
            } else if (res.code == 2) {
                uiManager.close(this);
                uiManager.showWindow(UIID.Toast, {
                    title: '不能绑定你自己'
                })
            } else if (res.code == 1) {
                uiManager.close(this);
                uiManager.showWindow(UIID.Toast, {
                    title: '邀请码错误'
                })
            }
        })
        return;

        let params = {
            userid: Global.userid,
            code: sid
        }
        Http.request_post("invitation", params, res => {
            uiManager.close(this);
            uiManager.showWindow(UIID.Toast, {
                title: res.msg
            })
        }, err => {

        })
    }

    onClickClose() {
        Utils.closeEvent(this);
    }

}