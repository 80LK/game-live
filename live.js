"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Cell = /** @class */ (function () {
    function Cell() {
    }
    return Cell;
}());
function count(arr, predicate) {
    if (predicate === void 0) { predicate = function () { return true; }; }
    return arr.reduce(function (r, el, index, arr) {
        if (predicate(el, index, arr))
            r++;
        return r;
    }, 0);
}
var LiveCell = /** @class */ (function (_super) {
    __extends(LiveCell, _super);
    function LiveCell() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LiveCell.prototype.calculate = function (cells) {
        var lives = count(cells, function (cell) { return cell instanceof LiveCell; });
        if (lives < 2 || lives > 3)
            return new DieCell();
        return this;
    };
    LiveCell.prototype.toString = function () {
        return "1";
    };
    return LiveCell;
}(Cell));
var DieCell = /** @class */ (function (_super) {
    __extends(DieCell, _super);
    function DieCell() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DieCell.prototype.calculate = function (cells) {
        var lives = count(cells, function (cell) { return cell instanceof LiveCell; });
        if (lives == 3)
            return new LiveCell();
        return this;
    };
    DieCell.prototype.toString = function () {
        return "0";
    };
    return DieCell;
}(Cell));
var Game = /** @class */ (function () {
    function Game(width, height, grid) {
        if (height === void 0) { height = 0; }
        if (grid === void 0) { grid = []; }
        this.interval = null;
        this._ticks = 0;
        if (typeof width != "number") {
            grid = width;
            width = grid[0].length;
            height = grid.length;
        }
        this.width = width;
        this.height = height;
        this._grid = [];
        for (var y = 0; y < this.height; y++) {
            var row = [];
            for (var x = 0; x < this.width; x++) {
                if (grid[y]) {
                    var cell = grid[y][x];
                    row.push(cell ? ((cell instanceof Cell) ? cell : new LiveCell()) : new DieCell());
                }
                else {
                    row.push(new DieCell());
                }
            }
            this._grid.push(row);
        }
    }
    Object.defineProperty(Game.prototype, "grid", {
        get: function () {
            return this._grid.map(function (row) { return row.map(function (cell) { return cell; }); });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "ticks", {
        get: function () {
            return this._ticks;
        },
        enumerable: false,
        configurable: true
    });
    Game.prototype.get = function (x, y) {
        if (x < 0)
            x = this.width + x;
        else if (x >= this.width)
            x = x - this.width;
        if (y < 0)
            y = this.height + y;
        else if (y >= this.height)
            y = y - this.height;
        return this._grid[y][x];
    };
    Game.prototype.calculate = function () {
        var _this = this;
        this._grid = this._grid.map(function (row, y) { return row.map(function (cell, x) {
            var cells = [];
            for (var _x = -1; _x <= 1; _x++)
                for (var _y = -1; _y <= 1; _y++)
                    if (_x != 0 || _y != 0)
                        cells.push(_this.get(x + _x, y + _y));
            return cell.calculate(cells);
        }); });
    };
    Game.prototype.tick = function () {
        this._ticks++;
        this.calculate();
        this.render();
    };
    Game.prototype.start = function (timeout) {
        if (timeout === void 0) { timeout = 1000; }
        this.render();
        this.interval = setInterval(this.tick.bind(this), timeout);
    };
    Game.prototype.stop = function () {
        if (this.interval)
            clearInterval(this.interval);
    };
    return Game;
}());
var ConsoleGame = /** @class */ (function (_super) {
    __extends(ConsoleGame, _super);
    function ConsoleGame() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ConsoleGame.prototype.render = function () {
        console.clear();
        console.log("Tick:", this.ticks);
        for (var y = 0; y < this.height; y++) {
            var row = "";
            for (var x = 0; x < this.width; x++) {
                row += this.grid[y][x] + " ";
            }
            console.log(row);
        }
    };
    return ConsoleGame;
}(Game));
var HTMLGame = /** @class */ (function (_super) {
    __extends(HTMLGame, _super);
    function HTMLGame(idEl, width, height, grid) {
        if (idEl === void 0) { idEl = "root"; }
        var _this = _super.call(this, width, height, grid) || this;
        _this._els = [];
        var root = document.querySelector("#" + idEl);
        if (!root)
            throw new ReferenceError();
        _this.$root = root;
        var rows = [];
        for (var row = 0; row < height; row++) {
            _this._els.push([]);
            var elRow = document.createElement("div");
            elRow.classList.add("row");
            rows.push(elRow);
            for (var col = 0; col < width; col++) {
                var cell = document.createElement("span");
                cell.classList.add("cell");
                elRow.appendChild(cell);
                _this._els[row].push(cell);
            }
        }
        rows.forEach(function (row) { return _this.$root.appendChild(row); });
        return _this;
    }
    HTMLGame.prototype.render = function () {
        var _this = this;
        this.grid.forEach(function (row, y) { return row.forEach(function (cell, x) {
            var $el = _this._els[y][x];
            var classList = $el.classList;
            if (cell instanceof LiveCell) {
                classList.add("live");
                $el.innerText = "L";
            }
            else {
                classList.remove("live");
                $el.innerText = "D";
            }
        }); });
    };
    return HTMLGame;
}(Game));
var game = new HTMLGame("root", 10, 10, [
    [0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0],
]);
game.start();
