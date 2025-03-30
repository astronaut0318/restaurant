import Utils from "./Utils";
import { Global } from "../config/Global";


/**
 * request⼯具类
 */
const md5 = require('md5');
const { ccclass, property } = cc._decorator;
@ccclass
export default class Request2 extends cc.Component {
    /**
    * 如果在window['apiDoMain']设置了域名
    * 则覆盖掉private domain
    */
    constructor() {
        super();
        if (window['apiDoMain'] != '' && window['apiDoMain'] != null) {
            console.warn('重写了域名');
            this.domain = window['apiDoMain'];
        }
    }
    static getApp() {
        !this.request ? this.request = new Request2() : 1;
        return this.request;
    }
    static request: Request2 = null;
    /**
    * 域名
    */
    //private domain: string = 'http://api.restaurant.jiaguotec.com/restaurant/api/';//测试域名
     private domain: string = Global.serverHost + '/api/'; //测试域名
    /**
    * 超时时间
    */
    private timeout: number = 10000;
    /**
    * 开启超时重试
    */
    private retry: boolean = true;
    /**
    * 超时重试次数上限
    */
    private retryTime: number = 2;
    /**
    * 访问类型
    */
    private type: string = 'POST';
    /**
    * 访问接⼝
    * @param route 访问路径
    * @param data 发送的数据
    * @param call 回调
    */
    open(route: string, data: any = null, call: Function = () => { },
        retry: number = 0) {
        let xhr = new XMLHttpRequest();
        xhr.timeout = this.timeout;
        xhr.onload = () => {
            // console.log("发起登录请求xhr______:" + JSON.stringify(xhr));
            if (xhr.readyState == 4 && xhr.status == 200) {
                let res = JSON.parse(xhr.responseText);
                if(res.code == 0){
                    call(res);
                }else if(res.code == 401){
                    //login
                    console.error("go to login");
                }else {
                    Utils.showToast(res.msg);
                }
            }
        };
        xhr.ontimeout = () => {
            console.error('Request=>open=>xhr.ontimeout:访问请求超时：' + route);
            if (this.retry) {
                if (retry >= this.retryTime) {
                    console.error('Request=>open=>xhr.ontimeout:达到设置的重试上限后连接仍未成功：' + route);
                } else {
                    console.error('Request=>open=>xhr.ontimeout:开始第' +
                        (retry + 1) + '次重试');
                    this.open(route, data, call, retry + 1);
                }
            }
        }
        xhr.onerror = (err: any) => {
            console.error('Request=>open=>xhr.onerror:xhr错误', err);
        };
        let str = null;
        if (data) str = JSON.stringify(data);
        let timeStamp = this.getTimeStamp();
        let sign = this.getSign(str, timeStamp);
        xhr.open(this.type, this.domain + route + '?sign=' + sign +
            '&timeStamp=' + timeStamp, true);
        xhr.setRequestHeader("content-type", "application/json")
        xhr.setRequestHeader("token", cc.sys.localStorage.getItem("token"))
        xhr.send(str);
    }

    get(route: string, call: Function = () => { },
        retry: number = 0) {
        let xhr = new XMLHttpRequest();
        xhr.timeout = this.timeout;
        xhr.onload = () => {
            // console.log("发起登录请求xhr______:" + JSON.stringify(xhr));
            if (xhr.readyState == 4 && xhr.status == 200) {
                let res = JSON.parse(xhr.responseText);
                if(res.code == 0){
                    call(res);
                }else if(res.code == 401){
                    //login
                    console.error("go to login");
                }else {
                    Utils.showToast(res.msg);
                }
            }
        };
        xhr.ontimeout = () => {
            console.error('Request=>open=>xhr.ontimeout:访问请求超时：' + route);
            if (this.retry) {
                if (retry >= this.retryTime) {
                    console.error('Request=>open=>xhr.ontimeout:达到设置的重试上限后连接仍未成功：' + route);
                } else {
                    console.error('Request=>open=>xhr.ontimeout:开始第' +
                        (retry + 1) + '次重试');
                    this.get(route, call, retry + 1);
                }
            }
        }
        xhr.onerror = (err: any) => {
            console.error('Request=>open=>xhr.onerror:xhr错误', err);
        };
        //let str = null;
        //let timeStamp = this.getTimeStamp();
        //let sign = this.getSign(str, timeStamp);
        //xhr.open('GET', this.domain + route + '?sign=' + sign + '&timeStamp=' + timeStamp, true);
        xhr.open('GET', this.domain + route, true);
        xhr.setRequestHeader("content-type", "application/json")
        xhr.setRequestHeader("token", cc.sys.localStorage.getItem("token"))
        xhr.send();
    }

    getTimeStamp(): number {
        let timeStamp = Date.parse(new Date() + '') / 1000;
        return timeStamp;
    }
    /**
    * 签名加密
    * @param data 加密的数据
    * @returns 返回md5加密
    */
    getSign(data: string, timeStamp: number): string {
        let sign = md5(data + timeStamp);
        return sign;
    }
    getCookie(name) {
        let cookie = document.cookie;
        let cookieArr = cookie.split('; ');
        let arr = new Array();
        cookieArr.forEach((res: string) => {
            let test = res.split('=');
            arr[test[0]] = test[1];
        });
        if (arr[name]) {
            return (arr[name]);
        }
        else {
            return null;
        }
    }
}
