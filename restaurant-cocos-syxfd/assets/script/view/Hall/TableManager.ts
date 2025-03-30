import { EVENT_TAG, STORAGE_KEY } from "../../config/GameConfig";
import { Global } from "../../config/Global";
import { main } from "../../Main";
import GameStorage from "../../utils/GameStorage";
import Utils from "../../utils/Utils";
import GameManager from "./GameManager";
import Table from "./Table";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TableManager extends cc.Component {

    @property([cc.Node])
    public tables: cc.Node[] = [];

    @property([cc.Node])
    public tablePoints1: cc.Node[] = [];

    @property([cc.Node])
    public tablePoints2: cc.Node[] = [];

    @property([cc.Node])
    public tablePoints3: cc.Node[] = [];

    @property([cc.Node])
    public tablePoints4: cc.Node[] = [];

    @property([cc.Node])
    public tablePoints5: cc.Node[] = [];

    @property([cc.Node])
    public tablePoints6: cc.Node[] = [];

    private tablesPoints: cc.Node[][] = [];

    private _tables: cc.Node[] = [];

    private gameManager: GameManager = null;
    private gx: number = null;

    start() {
        this.tablesPoints = [this.tablePoints1, this.tablePoints2, this.tablePoints3, this.tablePoints4, this.tablePoints5, this.tablePoints6];

        this.gameManager = this.node.parent.getComponent(GameManager);
        this.gx = this.gameManager.gx;
        this.initTableData();

        // this.updateTable()
        // main.on(EVENT_TAG.UPDATE_TABLE, this.updateTable, this);
        main.on(EVENT_TAG.CLEAR_TABLE, this.clearTable, this);

        // this.filterTables();
    }

    onDestroy() {
        // main.off(EVENT_TAG.UPDATE_TABLE, this.updateTable, this);
        main.off(EVENT_TAG.CLEAR_TABLE, this.clearTable, this);
    }

    public getTablePoint(tbIndex: number, dir: string) {
        let v2 = cc.v2();
        let tablePoints = this.tablesPoints[tbIndex];
        if (tablePoints) {
            let _dir = 0;
            if (dir == "right") {
                _dir = 1;
            }
            let point = tablePoints[_dir];
            point.getComponent(cc.Widget).updateAlignment();
            v2.x = Math.ceil(point.x / this.gx);
            v2.y = Math.floor(point.y / this.gx);
        }
        return v2;
    }

    private filterTables() {
        let tablesCount = this._tables.length;
        this._tables = [];
        for (let i = 0; i < this.tables.length; i++) {
            const table = this.tables[i];
            if (table.active) {
                this._tables.push(table)
            }
        }
        if (this._tables.length > tablesCount) {
            this.updateWalkToVacancy();
        }
    }

    private initTableData() {
        for (let i = 0; i < this.tables.length; i++) {
            const table = this.tables[i];

            let script: Table = table.getComponent(Table);

            let points = this.tablesPoints[i];
            let lPoints = points[0];
            let rPoint = points[1];

            lPoints.getComponent(cc.Widget).updateAlignment();
            rPoint.getComponent(cc.Widget).updateAlignment();

            let lPos = [Math.ceil(lPoints.x / this.gx), Math.floor(lPoints.y / this.gx)];
            let rPos = [Math.ceil(rPoint.x / this.gx), Math.floor(rPoint.y / this.gx)];
            script.setLeftPos(lPos[0], lPos[1]);
            script.setRLeftPos(lPoints.x, lPoints.y);
            script.setRightPos(rPos[0], rPos[1]);
            script.setRRightPos(rPoint.x, rPoint.y);

            script.setTableIndex(i);
        }
    }

    public get seatToTalNum(): number {
        return this._tables.length * 2;
    }

    public setVacancy(tableIndex: number, dir: string, isVacancy: boolean) {
        const table = this.tables[tableIndex];
        if (table) {
            let script: Table = table.getComponent(Table);
            script.setVacancy(dir, isVacancy);
        }
    }

    public setFood(tableIndex: number, dir: string, id: number) {
        const table = this.tables[tableIndex];
        if (table) {
            let script: Table = table.getComponent(Table);
            script.setFood(dir, id);
        }
    }

    private clearTable(tableIndex: any) {
        tableIndex = parseInt(tableIndex);
        const table = this.tables[tableIndex];
        if (table) {
            let script: Table = table.getComponent(Table);
            script.clearTable();
        }
    }

    public findVacancy() {
        let vacancy = {};
        for (let i = 0; i < this._tables.length; i++) {
            const table = this._tables[i];
            let script: Table = table.getComponent(Table);
            if (script.haveVacancy()) {
                vacancy = script.getVacancy();
                break;
            } else {
                vacancy = false;
            }
        }
        if (this._tables.length == 0) {
            vacancy = false;
        }
        return vacancy;
    }

    private updateWalkToVacancy() {
        main.emit(EVENT_TAG.UPDATE_WALK_TO_VACANCY);
        this.scheduleOnce(() => {
            main.emit(EVENT_TAG.UPDATE_WALK_TO_VACANCY);
        }, 0.5)
    }

    public updateTable() {
        for (let i = 1; i < 7; i++) {
            let tableData = Global.useTables[i];
            if (tableData) {
                let _i = i - 1;
                this.tables[_i].active = true;
                let tableTexId = tableData.id % 10;
                if(tableTexId === 0) {
                    tableTexId = 10;
                }
                Utils.loadLocalSprite(`texture/table/main_table_${tableTexId}`, this.tables[_i].getComponent(cc.Sprite));
            }
        }

        this.filterTables();
    }

    // update (dt) {}
}
