import Ad from "../../ad/Ad";
import Audioplayer from "../../audio/Audioplayer";
import { EVENT_TAG, LOCAL_CONFIG, LOCAL_CONFIG_KEY, STORAGE_KEY } from "../../config/GameConfig";
import { UIID } from "../../config/UIConfig";
import { main } from "../../Main";
import { uiManager } from "../../ui/UIManager";
import GameStorage from "../../utils/GameStorage";
import Utils from "../../utils/Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Table extends cc.Component {
    @property(cc.Node)
    foodLeft: cc.Node = null;

    @property(cc.Node)
    foodRight: cc.Node = null;

    @property(cc.Node)
    shengFan: cc.Node = null;

    public findLeftPos: cc.Vec2 = cc.v2();

    public findRightPos: cc.Vec2 = cc.v2();

    public findRLeftPos: cc.Vec2 = cc.v2();

    public findRRightPos: cc.Vec2 = cc.v2();

    public seat: number[] = [0, 0];

    private tableIndex = -1;

    private fuwuCount = 0;
    private fuwuMaxCount = 10;

    start() {
        // this.fuwuCount = 10
        // this.shengFan.active = true;
    }

    public haveVacancy(): boolean {
        // let produce_trash_count = Utils.getLocalConfigValue(LOCAL_CONFIG.GamePlayConfig, LOCAL_CONFIG_KEY.produce_trash_count);
        if (this.fuwuCount >= this.fuwuMaxCount) {
            return false;
        }
        return this.seat.some(val => val == 0);
    }

    /**
     * 
     * @returns "left" "right"
     */
    public getVacancy() {
        let obj = { dir: "", findPos: cc.v2(), findRPos: cc.v2(), tableIndex: this.tableIndex };
        if (this.seat[0] == 0) {
            obj = { dir: "left", findPos: this.findLeftPos, findRPos: this.findRLeftPos, tableIndex: this.tableIndex };
        } else {
            obj = { dir: "right", findPos: this.findRightPos, findRPos: this.findRRightPos, tableIndex: this.tableIndex };
        }
        return obj
    }

    /**
     * 
     * @param dir （left,right）
     * @param isVacancy (true false)
     */
    public setVacancy(dir: string, isVacancy: boolean) {
        //只有客人吃完才会调用
        if (isVacancy) {
            this.fuwuCount += 1;
            let fuwuCounts = GameStorage.getJson(STORAGE_KEY.FUWU_COUNT);
            fuwuCounts[this.tableIndex] = this.fuwuCount;
            GameStorage.setJson(STORAGE_KEY.FUWU_COUNT, fuwuCounts);
            main.emit(EVENT_TAG.UPDATE_WALK_TO_VACANCY);
        }
        switch (dir) {
            case "left":
                this.seat[0] = isVacancy ? 0 : 1;
                break;
            case "right":
                this.seat[1] = isVacancy ? 0 : 1;
                break;
        }

        if (this.fuwuCount >= this.fuwuMaxCount && this.seat[0] == 0 && this.seat[1] == 0) {
            this.shengFan.active = true;
        }
    }

    public clearTable() {
        Ad.playVideoAd(() => {
            Audioplayer.play_sound("clear_table_success");
            this.shengFan.active = false;
            this.fuwuCount = 0;
            let fuwuCounts = GameStorage.getJson(STORAGE_KEY.FUWU_COUNT);
            fuwuCounts[this.tableIndex] = this.fuwuCount;
            GameStorage.setJson(STORAGE_KEY.FUWU_COUNT, fuwuCounts);
            main.emit(EVENT_TAG.UPDATE_WALK_TO_VACANCY);
            this.scheduleOnce(() => {
                main.emit(EVENT_TAG.UPDATE_WALK_TO_VACANCY);
            }, 0.5)
        })
    }

    /**
     * 
     * @param dir （left,right）
     * @param isVacancy (true false)
     */
    public setFood(dir: string, superiorId: number) {
        switch (dir) {
            case "left":
                if (superiorId == 0) {
                    this.foodLeft.active = false;
                    return;
                }
                this.foodLeft.active = true;
                Utils.loadLocalSprite("texture/foods/shuwu" + superiorId, this.foodLeft.getComponent(cc.Sprite));
                break;
            case "right":
                if (superiorId == 0) {
                    this.foodRight.active = false;
                    return;
                }
                this.foodRight.active = true;
                Utils.loadLocalSprite("texture/foods/shuwu" + superiorId, this.foodRight.getComponent(cc.Sprite));
                break;
        }
    }

    public setLeftPos(x: number, y: number) {
        this.findLeftPos.x = x;
        this.findLeftPos.y = y;
    }

    public setRLeftPos(x: number, y: number) {
        this.findRLeftPos.x = x;
        this.findRLeftPos.y = y;
    }

    public setRightPos(x: number, y: number) {
        this.findRightPos.x = x;
        this.findRightPos.y = y;
    }

    public setRRightPos(x: number, y: number) {
        this.findRRightPos.x = x;
        this.findRRightPos.y = y;
    }

    public setTableIndex(index: number) {
        this.tableIndex = index;
        let fuwuCounts = GameStorage.getJson(STORAGE_KEY.FUWU_COUNT);
        if (!fuwuCounts) {
            this.fuwuCount = 0;
            fuwuCounts = {};
            fuwuCounts[index] = this.fuwuCount;
            GameStorage.setJson(STORAGE_KEY.FUWU_COUNT, fuwuCounts);
        }else if (!fuwuCounts[index]) {
            this.fuwuCount = 0;
            fuwuCounts[index] = this.fuwuCount;
            GameStorage.setJson(STORAGE_KEY.FUWU_COUNT, fuwuCounts);
        } else {
            this.fuwuCount = fuwuCounts[index];
            if (this.fuwuCount >= this.fuwuMaxCount) {
                this.shengFan.active = true;
            }
            else {
                this.shengFan.active = false;
            }
        }
    }

    public onClickClearTable() {
        uiManager.showWindow(UIID.AlertClearTable, {
            tableIndex: this.tableIndex,
            tableSprite: this.node.getComponent(cc.Sprite)
        });
    }

    // update (dt) {}
}
