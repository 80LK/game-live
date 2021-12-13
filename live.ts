abstract class Cell {
	public abstract calculate(neighbours: Cell[]): Cell;
}

function count<T>(arr: T[], predicate: (value: T, index: number, array: T[]) => boolean = () => true): number {
	return arr.reduce<number>((r, el, index, arr) => {
		if (predicate(el, index, arr))
			r++;
		return r;
	}, 0);
}

class LiveCell extends Cell {
	calculate(cells: Cell[]): Cell {
		const lives = count(cells, cell => cell instanceof LiveCell);
		if (lives < 2 || lives > 3)
			return new DieCell();

		return this;
	}

	public toString(): string {
		return "1";
	}
}

class DieCell extends Cell {
	calculate(cells: Cell[]): Cell {
		const lives = count(cells, cell => cell instanceof LiveCell);
		if (lives == 3)
			return new LiveCell();

		return this;
	}

	public toString(): string {
		return "0";
	}
}

type Grid = (number | boolean | Cell)[][];
abstract class Game {
	constructor(width: number, height: number, grid: Grid);
	constructor(grid: Grid);
	constructor(width: Grid | number, height: number = 0, grid: Grid = []) {
		if (typeof width != "number") {
			grid = width;
			width = grid[0].length;
			height = grid.length;
		}

		this.width = width;
		this.height = height;
		this._grid = [];
		for (let y = 0; y < this.height; y++) {
			const row: Cell[] = [];

			for (let x = 0; x < this.width; x++) {
				if (grid[y]) {
					const cell = grid[y][x];
					row.push(cell ? ((cell instanceof Cell) ? cell : new LiveCell()) : new DieCell());
				} else {
					row.push(new DieCell());
				}
			}
			this._grid.push(row);
		}
	}

	protected readonly width: number;
	protected readonly height: number;
	private _grid: Cell[][];
	protected get grid(): Readonly<Cell[][]> {
		return this._grid.map(row => row.map(cell => cell));
	}
	private interval: number | null = null;

	private _ticks: number = 0;
	protected get ticks() {
		return this._ticks;
	}

	protected get(x: number, y: number) {
		if (x < 0) x = this.width + x;
		else if (x >= this.width) x = x - this.width;
		if (y < 0) y = this.height + y;
		else if (y >= this.height) y = y - this.height;

		return this._grid[y][x];
	}

	protected calculate() {
		this._grid = this._grid.map((row, y) => row.map((cell, x) => {
			const cells: Cell[] = [];
			for (let _x = -1; _x <= 1; _x++)
				for (let _y = -1; _y <= 1; _y++)
					if (_x != 0 || _y != 0)
						cells.push(this.get(x + _x, y + _y));

			return cell.calculate(cells);
		}));
	}

	private tick() {
		this._ticks++;
		this.calculate();
		this.render();
	}

	protected abstract render(): void;

	public start(timeout: number = 1000) {
		this.render();
		this.interval = setInterval(this.tick.bind(this), timeout);
	}
	public stop() {
		if (this.interval)
			clearInterval(this.interval);
	}

}

class ConsoleGame extends Game {
	public render() {
		console.clear();
		console.log("Tick:", this.ticks);
		for (let y = 0; y < this.height; y++) {
			let row = "";
			for (let x = 0; x < this.width; x++) {
				row += this.grid[y][x] + " ";
			}
			console.log(row);
		}
	}
}

class HTMLGame extends Game {
	private _els: HTMLElement[][] = [];
	private $root: HTMLElement;
	constructor(idEl: string = "root", width: number, height: number, grid: Grid) {
		super(width, height, grid);

		const root = document.querySelector<HTMLElement>("#" + idEl);
		if (!root) throw new ReferenceError();
		this.$root = root;

		const rows: HTMLElement[] = [];
		for (let row = 0; row < height; row++) {
			this._els.push([]);
			const elRow = document.createElement("div");
			elRow.classList.add("row")
			rows.push(elRow);
			for (let col = 0; col < width; col++) {
				const cell = document.createElement("span");
				cell.classList.add("cell");
				elRow.appendChild(cell);
				this._els[row].push(cell);
			}
		}

		rows.forEach(row => this.$root.appendChild(row))
	}

	render() {
		this.grid.forEach((row, y) => row.forEach((cell, x) => {
			const $el = this._els[y][x];
			const classList = $el.classList;
			if (cell instanceof LiveCell) {
				classList.add("live");
				$el.innerText = "L";
			} else {
				classList.remove("live");
				$el.innerText = "D";
			}
		}))

	}

}

var game = new HTMLGame("root", 10, 10, [
	[0, 0, 0, 0, 0],
	[0, 0, 1, 0, 0],
	[0, 0, 0, 1, 0],
	[0, 1, 1, 1, 0],
	[0, 0, 0, 0, 0],
]);
game.start();
