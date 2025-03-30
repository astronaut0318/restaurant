import { UIID } from "../config/UIConfig";
import { uiManager } from "../ui/UIManager";
import Utils from "./Utils";
const md5 = require('md5');

export default class Http {

    public static request_post(interface2, data, call, err) {
        let key = 'jiTNnzdZZf37wwsZ';
        let time = Date.parse(new Date() + "") / 1000;
        let sign = md5(key + time);
        // let url = 'http://172.16.6.130/' + interface2;
        let url = 'https://饭店4演示.jiaguotec.com/' + interface2;
        let req = new XMLHttpRequest();
        let str = JSON.stringify(data);
        let parameter = '?sign=' + sign + '&timestamp=' + time;
        for (let key in data) {
            parameter += '&' + key + '=' + data[key];
        }
        req.onreadystatechange = () => {
            if (req.readyState === 4 && req.status === 200) {
                let data = JSON.parse(req.responseText);
                call(data);
            } else {
                err && err(req);
            }
        };
        req.onerror = () => {
            console.log("发起登录请求：错误----" + JSON.stringify(req));
        }
        req.open("POST", url + parameter);
        req.send(null);
    }







    // 发送http请求 参数json
    public static request(type: string, url: string, params: any, callback: (response) => void,) {
        let xhr: XMLHttpRequest = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
                let respone = xhr.responseText;
                let rsp = JSON.parse(respone);
                _LOG(url, rsp);
                if (rsp.code !== 200) {
                    uiManager.open(UIID.Toast, {
                        title: rsp.message
                    })
                    return;
                }
                callback(rsp);
            }
        };

        xhr.open(type, url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.timeout = 8000; // 8 seconds for timeout
        xhr.send(JSON.stringify(params));
    }


    public static get(url: string, params: any, callback: (response) => void) {
        Http.request("GET", url, params, callback);
    }

    public static post(url: string, params: any, callback: (response) => void) {
        Http.request("POST", url, params, callback);
    }
}