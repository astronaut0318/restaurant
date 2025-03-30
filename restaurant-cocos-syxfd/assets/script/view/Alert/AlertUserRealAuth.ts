import { api } from "../../api/api";
import { Global } from "../../config/Global";
import { UIID } from "../../config/UIConfig";
import { uiManager } from "../../ui/UIManager";
import { UIView } from "../../ui/UIView";
import Http from "../../utils/Http";
import Request2 from "../../utils/Request";
import Utils from "../../utils/Utils";

export interface AccountData {
    accout: string,
    realName: string,
}

const { ccclass, property } = cc._decorator;

const KEY_ALIPAY_ACCOUNT = "KEY_ALIPAY_ACCOUNT";
const KEY_ALIPAY_REALNAME = "KEY_ALIPAY_REALNAME";

@ccclass
export default class AlertUserRealAuthFill extends UIView {

    @property(cc.EditBox)
    editBoxAccount: cc.EditBox = null;

    @property(cc.EditBox)
    editBoxRealName: cc.EditBox = null;

    onSubmitAccount?: (status: number) => void = null;

    init(cb: (status: number) => void) {
        this.onSubmitAccount = cb;
    }

    onOpen() {
        
    }

    onClickOk() {

        let realName = this.editBoxRealName.string;
        _LOG(realName);
        if (realName.trim() == "") {
            Utils.showToast("请输入真实姓名！");
            return;
        }

        let account = this.editBoxAccount.string;
        _LOG(account);
        if (account.trim() == "") {
            Utils.showToast("请输入身份证号！");
            return;
        }     
        
        let data = {
            userIdcard: account,
            userName: realName,
        }

        Request2.getApp().open('user/userAuthentication', data, res => {
            _LOG("userAuthentication:", res);
            console.log("userAuthentication" + JSON.stringify(res));
            if(res.code == 0) {
                Utils.showToast("实名验证信息已提交！");  
                this.onSubmitAccount?.(2);
                this.onClickClose();
                return;
            }
            
            let { data } = res;
            if (data) {
                if(data.code == 10000) {
                    Utils.showToast("实名验证通过！");  
                    this.onSubmitAccount?.(2);
                    this.onClickClose();
                    return;
                }
                else if(data.code == 123) {
                    Utils.showToast("实名验证通过，年龄未满18岁！"); 
                    this.onSubmitAccount?.(1);
                    this.onClickClose();
                    return;
                }
                else {
                    Utils.showToast("实名验证失败！"); 
                    this.onSubmitAccount?.(-1);
                }
            }
        })
    }

    onClickClose() {
        Utils.closeEvent(this);
        //this.node.active = false;
    }

}