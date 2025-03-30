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

// 验证手机号的正则表达式
const phoneRegex = /^1[3456789]\d{9}$/;

// 验证邮箱地址的正则表达式
const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/;

// 验证函数
function validateAlipayAccount(account: string): boolean {
  if (phoneRegex.test(account)) {
    return true;
  } else if (emailRegex.test(account)) {
    return true;
  } else {
    return false;
  }
}

@ccclass
export default class AlertAlipayAccountFill extends UIView {

    @property(cc.EditBox)
    editBoxAccount: cc.EditBox = null;

    @property(cc.EditBox)
    editBoxRealName: cc.EditBox = null;

    onSubmitAccount?: (accountData: AccountData) => void = null;

    init(cb: (accountData: AccountData) => void) {
        let account = cc.sys.localStorage.getItem(KEY_ALIPAY_ACCOUNT);
        if (account != null && account != "") {
            this.editBoxAccount.string = account;
        }
        let realName = cc.sys.localStorage.getItem(KEY_ALIPAY_REALNAME);
        if (realName != null && realName != "") {
            this.editBoxRealName.string = realName;
        }

        //this.onSubmitAccount = cb;
    }

    onOpen() {
        
    }

    onClickOk() {
        let account = this.editBoxAccount.string;
        _LOG(account);
        const _account = account.trim();
        if (_account == "") {
            Utils.showToast("请输入支付宝账号！");
            return;
        }
        if (!validateAlipayAccount(_account)) {
            Utils.showToast("支付宝账号格式错误！");
            return;
        }

        let realName = this.editBoxRealName.string;
        _LOG(realName);
        if (realName.trim() == "") {
            Utils.showToast("请输入支付宝账号实名认证的真实姓名！");
            return;
        }

        let accountStored = cc.sys.localStorage.getItem(KEY_ALIPAY_ACCOUNT);
        if (accountStored === "null" || accountStored != account) {
            cc.sys.localStorage.setItem(KEY_ALIPAY_ACCOUNT, account);
        }
        let realNameStored = cc.sys.localStorage.getItem(KEY_ALIPAY_REALNAME);
        if (realNameStored === "null" || realNameStored != realName) {
            cc.sys.localStorage.setItem(KEY_ALIPAY_REALNAME, realName);
        }
        
        let data = {
            accout: account,
            realName: realName,
        }
        
        this.onClickClose();
        this.onSubmitAccount?.(data);
 
        return;
    }

    onClickClose() {
        Utils.closeEvent(this);
    }

}