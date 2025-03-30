export namespace astar {

    export class Node {
        public x: number; //列
        public y: number; //行
        public f: number; //代价 f = g+h
        public g: number; //起点到当前点代价
        public h: number; //当前点到终点估计代价
        public walkable: boolean = true;
        public parent: Node;
        public costMultiplier: number = 1.0;

        public constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
        }
    }

    export class Grid {
        private _startNode: Node; //起点
        private _endNode: Node; //终点
        private _nodes: Array<any>; //Node数组
        private _numCols: number; //网格行列
        private _numRows: number;

        //函数重载
        //前两行为函数声明（函数签名）
        //第三行是函数实现，参数必须全部为<?>可选类型
        public constructor(grid: Grid)
        public constructor(numCols: number, numRows: number)

        public constructor(grid?, numRows?) {
            if (typeof numRows !== 'undefined') {
                this._numCols = grid;
                this._numRows = numRows;
                this._nodes = [];

                for (let i: number = 0; i < grid; i++) {
                    this._nodes[i] = [];
                    for (let j: number = 0; j < numRows; j++) {
                        this._nodes[i][j] = new Node(i, j);
                    }
                }
                // console.log(this._nodes)
            } else {
                this._numCols = grid.numCols;
                this._numRows = grid.numRows;
                this._nodes = grid.getNodes();
            }
        }

        public validNode(x: number, y: number): boolean {
            if (x < 0 || x >= this.numCols) {
                return false;
            }
            if (y < 0 || y >= this.numRows) {
                return false;
            }
            if (x < 0 || x >= this.numCols) {
                return false;
            }
            if (y < 0 || y >= this.numRows) {
                return false;
            }

            return true;
        }

        public getNodes(): Node[] {
            return this._nodes;
        }

        public getNode(x: number, y: number): Node {
            return this._nodes[x][y];
        }

        public setEndNode(x: number, y: number) {
            this._endNode = this._nodes[x][y];
        }

        public setStartNode(x: number, y: number) {
            this._startNode = this._nodes[x][y];
        }

        public setWalkable(x: number, y: number, value: boolean) {
            this._nodes[x][y].walkable = value;
        }

        public getWalkable(x: number, y: number): boolean {
            return this._nodes[x][y].walkable;
        }

        public get endNode() {
            return this._endNode;
        }

        public get numCols() {
            return this._numCols;
        }

        public get numRows() {
            return this._numRows;
        }

        public get startNode() {
            return this._startNode;
        }
    }

    export class AStar {
        private _open: Array<any>; //待考察表
        private _closed: Array<any>; //已考察表
        private _grid: Grid; //网格
        private _endNode: Node; //终点Node
        private _startNode: Node; //起点Node
        private _path: Array<any>; //保存路径
        private _heuristic: Function; //寻路算法
        private _straightCost: number = 1.0; //上下左右走的代价
        private _diagCost: number = Math.SQRT2; //斜着走的代价 

        private _allowDiag: boolean = true; //是否允许斜着走 

        public constructor() {
            //this._heuristic = this.manhattan;  
            //this._heuristic = this.euclidian;
            this._heuristic = this.diagonal;
        }

        //是否允许斜着走
        public allowDiag(allow: boolean): void {
            this._allowDiag = allow;
        }

        //寻路
        public findPath(grid: Grid): boolean {
            this._grid = grid;
            this._open = [];
            this._closed = [];

            this._startNode = this._grid.startNode;
            this._endNode = this._grid.endNode;

            this._startNode.g = 0;
            this._startNode.h = this._heuristic(this._startNode);
            this._startNode.f = this._startNode.g + this._startNode.h;

            return this.search();
        }

        //查找路径
        public search(): boolean {
            var node: Node = this._startNode;
            while (node != this._endNode) {
                var startX = Math.max(0, node.x - 1);
                var endX = Math.min(this._grid.numCols - 1, node.x + 1);
                var startY = Math.max(0, node.y - 1);
                var endY = Math.min(this._grid.numRows - 1, node.y + 1);

                for (var i = startX; i <= endX; i++) {
                    for (var j = startY; j <= endY; j++) {
                        //不让斜着走
                        if (!this._allowDiag) {
                            if (i != node.x && j != node.y) {
                                continue;
                            }
                        }

                        var test: Node = this._grid.getNode(i, j);
                        if (test == node ||
                            !test.walkable ||
                            !this._grid.getNode(node.x, test.y).walkable ||
                            !this._grid.getNode(test.x, node.y).walkable) {
                            continue;
                        }

                        var cost: number = this._straightCost;
                        if (!((node.x == test.x) || (node.y == test.y))) {
                            cost = this._diagCost;
                        }
                        var g = node.g + cost * test.costMultiplier;
                        var h = this._heuristic(test);
                        var f = g + h;
                        if (this.isOpen(test) || this.isClosed(test)) {
                            if (test.f > f) {
                                test.f = f;
                                test.g = g;
                                test.h = h;
                                test.parent = node;
                            }
                        } else {
                            test.f = f;
                            test.g = g;
                            test.h = h;
                            test.parent = node;
                            this._open.push(test);
                        }
                    }
                }
                for (var o = 0; o < this._open.length; o++) { }
                this._closed.push(node);
                if (this._open.length == 0) {
                    // console.log("AStar >> no path found");
                    return false
                }

                let openLen = this._open.length;
                for (let m = 0; m < openLen; m++) {
                    for (let n = m + 1; n < openLen; n++) {
                        if (this._open[m].f > this._open[n].f) {
                            let temp = this._open[m];
                            this._open[m] = this._open[n];
                            this._open[n] = temp;
                        }
                    }
                }

                node = this._open.shift() as Node;
            }
            this.buildPath();
            return true;
        }

        //获取路径
        private buildPath(): void {
            this._path = new Array();
            var node: Node = this._endNode;
            this._path.push(node);
            while (node != this._startNode) {
                node = node.parent;
                this._path.unshift(node);
            }
        }

        public get path() {
            return this._path;
        }

        //是否待检查
        private isOpen(node: Node): boolean {
            for (var i = 0; i < this._open.length; i++) {
                if (this._open[i] == node) {
                    return true;
                }
            }
            return false;
        }

        //是否已检查
        private isClosed(node: Node): boolean {
            for (var i = 0; i < this._closed.length; i++) {
                if (this._closed[i] == node) {
                    return true;
                }
            }
            return false;
        }

        //曼哈顿算法
        private manhattan(node: Node) {
            return Math.abs(node.x - this._endNode.x) * this._straightCost + Math.abs(node.y + this._endNode.y) * this._straightCost;
        }

        private euclidian(node: Node) {
            var dx = node.x - this._endNode.x;
            var dy = node.y - this._endNode.y;
            return Math.sqrt(dx * dx + dy * dy) * this._straightCost;
        }

        private diagonal(node: Node) {
            var dx = Math.abs(node.x - this._endNode.x);
            var dy = Math.abs(node.y - this._endNode.y);
            var diag = Math.min(dx, dy);
            var straight = dx + dy;
            return this._diagCost * diag + this._straightCost * (straight - 2 * diag);
        }

        public get visited() {
            return this._closed.concat(this._open);
        }
    }
}