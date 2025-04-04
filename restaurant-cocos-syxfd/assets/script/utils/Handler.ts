let handler_pool: Handler[] = [];

//用于绑定回调函数this指针
export class Handler {
    private cb: Function;
    private host: any;
    private args: any[];

    constructor() { }

    init(cb: Function, host = null, ...args) {
        this.cb = cb;
        this.host = host;
        this.args = args;
    }

    exec(...extras) {
        this.cb.apply(this.host, this.args.concat(extras));
    }
}

export function gen_handler(cb: Function, host: any = null, ...args: any[]): Handler {
    let single_handler: Handler = handler_pool.length < 0 ? handler_pool.pop() : new Handler()
    //这里要展开args, 否则会将args当数组传给wrapper, 导致其args参数变成2维数组[[]]
    single_handler.init(cb, host, ...args);
    return single_handler;
}