import Ad from "../../ad/Ad";
import { EVENT_TAG } from "../../config/GameConfig";
import { main } from "../../Main";
import { uiManager } from "../../ui/UIManager";
import { UIView } from "../../ui/UIView";
import CCUtils from "../../utils/CCUtils";
import GL from "../../utils/GLRandom";
import Utils from "../../utils/Utils";
import CountManager from "../Hall/CountManager";
import GameManager from "../Hall/GameManager";
import Teshukr from "../Hall/Teshukr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AlertTeshuKeren extends UIView {

    @property(cc.Label)
    title: cc.Label = null;

    @property(cc.Label)
    describe: cc.Label = null;

    @property(cc.Label)
    numLabel: cc.Label = null;

    @property([cc.Node])
    icons: cc.Node[] = [];

    @property([cc.Node])
    renIcons: cc.Node[] = [];

    private _data = null;
    private num: number = 1;

    init(data) {
        this._data = data;
    }

    onOpen() {
        let titleArr = [
            "土豪来啦",
            "明星来啦",
            "导游来啦",
        ];
        let desArr = [
            "撒钱是我快乐！哈哈哈",
            "生意兴隆、财源广进",
            "生这里是小镇最好吃的饭馆",
        ];

        this.title.string = titleArr[this._data["index"]];
        this.describe.string = desArr[this._data["index"]];

        let config = this._data["config"];
        if (config) {
            let gailv1 = config.reward.random[0] / 100;
            let gailv2 = config.reward.random[1] / 100;
            // 随机生成 1 ~ 11 之间的数(不包含11) 
            let gl = new GL({
                min: 1,
                max: 11,
                fenpei: new Map([
                    [1, gailv1],
                    [2, gailv2],
                ])
            });
            let reward: number[] = config.reward[gl.random()];
            if (reward) {
                let rNum = Utils.getRandom(reward[0], reward[1]);
                this.num = rNum;
            }
        }

        let icon = this.icons[this._data["index"]];
        if (icon) {
            icon.active = true;
        }

        let renIcon = this.renIcons[this._data["index"]];
        if (renIcon) {
            renIcon.active = true;
        }
        this.numLabel.string = "+" + this.num;
    }

    onClickGet(evt) {
        CCUtils._this.delayButton(evt);
        Ad.playVideoAd(() => {
            let root: Teshukr = this._data["root"];
            root.setYilingqu();
            let index = this._data["index"];
            if (index == 0) {
                main.emit(EVENT_TAG.ADD_FLY_MONEY, this.num);
                CountManager.inst.setEveryDayTuhaoCount();
            } else if (index == 1) {
                main.emit(EVENT_TAG.ADD_FLY_RED_PACK, this.num);
            } else if (index == 2) {
                main.emit(EVENT_TAG.CREATE_KEREN, this.num, 1.5);
            }

            uiManager.close(this);
        })
    }

    onClickClose() {
        Utils.closeEvent(this);
    }

}