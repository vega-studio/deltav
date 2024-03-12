import {
  add2,
  AnchorType,
  type Color,
  compare4,
  copy4,
  type InstanceProvider,
  onAnimationLoop,
  onFrame,
  RectangleInstance,
  scale2,
  stopAnimationLoop,
  subtract2,
  type Vec2,
} from "../../../src";

const ANIMATION_DURATION = 300;

export interface IGrid {
  gridW: number;
  gridH: number;
  cellW: number;
  cellH: number;
  gap: number;
  // Indicates when a cell is occupied
  complete: boolean[][];
  // Indicates when a cell has completed everything
  finished: boolean[][];
  TL: Vec2;
  provider: InstanceProvider<RectangleInstance>;
  // Stores the boxes showing completion <taskRow, <cellX, Instance>>
  completionBoxes: Map<number, Map<number, RectangleInstance>>;
  grid: RectangleInstance[][];
}

export class Employee {
  // Employee's current cell status
  cellX: number = -1;
  // Employee's current cell status
  cellY: number = -1;
  // The group color this employee belongs to.
  color: Color = [0, 0, 0, 0];
  // Stores the start index of the column this employee is allowed to work in.
  taskColumn: number = 0;
  // Stores the number of tasks it takes to complete something.
  taskDuration: number = 0;
  // How fast this employee is at completing tasks
  speed: number = Math.random() * 1000 + 1000;

  // Graphic of this employee
  instance: RectangleInstance;

  constructor(color: Color, taskColumn: number, taskDuration: number) {
    this.instance = new RectangleInstance({
      position: [0, 0],
      color: [0, 0, 0, 0],
      size: [100, 100],
      anchor: {
        type: AnchorType.TopLeft,
        padding: 0,
      },
      outline: 0,
      outlineColor: color,
    });

    this.taskColumn = taskColumn;
    this.taskDuration = taskDuration;
  }

  async takeTask(grid: IGrid) {
    // Mark the complete cell to indicate the cell is occupied.
    grid.complete[this.cellX][this.cellY] = true;
    // Move this employee to this cell
    this.instance.position = [
      grid.cellW * this.cellX + grid.gap * this.cellX + grid.TL[0],
      grid.cellH * this.cellY + grid.gap * this.cellY + grid.TL[1],
    ];
    // Fade in employee to this spot
    this.instance.outline = grid.cellW / 2;
    this.instance.size = [grid.cellW, grid.cellH];
  }

  async completeTask(grid: IGrid) {
    // Fade out employee from this spot
    this.instance.outline = 0;

    // Add a checkbox marking this cell done
    const checkSize = scale2(this.instance.size, 0.25);
    const checkbox = grid.provider.add(
      new RectangleInstance({
        position: add2(
          this.instance.position,
          subtract2([grid.cellW / 2, grid.cellH / 2], scale2(checkSize, 0.5))
        ),
        size: checkSize,
        outline: grid.cellW / 4,
        color: copy4(this.instance.outlineColor),
        outlineColor: [0, 0, 0, 0],
      })
    );

    let map = grid.completionBoxes.get(this.cellY);
    if (!map) {
      map = new Map();
      grid.completionBoxes.set(this.cellY, map);
    }
    map.set(this.cellX, checkbox);

    // Fade out the employee from the spot
    await onFrame(() => (checkbox.outline = 0), ANIMATION_DURATION);
    // When the employee is gone we can mark it totally finished
    grid.finished[this.cellX][this.cellY] = true;

    // Check the column's row for completion
    let complete = true;

    for (
      let i = this.taskColumn;
      i < this.taskColumn + this.taskDuration;
      ++i
    ) {
      if (!grid.finished[i][this.cellY]) {
        complete = false;
        break;
      }
    }

    // If complete we change all of the squares in this row for this column
    // white
    if (complete) {
      for (
        let i = this.taskColumn;
        i < this.taskColumn + this.taskDuration;
        ++i
      ) {
        const instance = grid.completionBoxes.get(this.cellY)?.get(i);
        if (instance) {
          instance.outlineColor = [1, 1, 1, 1];
          instance.outline = grid.cellW / 4;
        }
      }

      // Now check the entire row for completion
      complete = true;

      for (let i = 0, iMax = grid.gridW; i < iMax; ++i) {
        if (!grid.finished[i][this.cellY]) {
          complete = false;
          break;
        }
      }

      // If complete we change all of the grid in this row for this column
      // white
      if (complete) {
        for (let i = 0, iMax = grid.gridW; i < iMax; ++i) {
          const instance = grid.grid[i]?.[this.cellY];
          if (instance && !compare4(instance.outlineColor, [1, 1, 1, 1])) {
            instance.outlineColor = [1, 1, 1, 1];
            instance.outline = grid.cellW / 2;
          }
        }
      }
    }
  }

  /** Makes the employee do tasks until there is nothing left to complete */
  async work(grid: IGrid) {
    const loopId = onAnimationLoop(async () => {
      const gridCol = grid.complete[this.cellX];

      // Apply a completion for the current task the Employee is on
      if (this.cellY !== -1) {
        await this.completeTask(grid);
      }

      // Find an available progress item to complete
      const task = new Array(this.taskDuration)
        .fill(0)
        .findIndex(
          (_, x) => grid.complete[this.taskColumn + x][this.cellY] === false
        );

      if (gridCol && task >= 0) {
        // Set our current cell
        this.cellX = task + this.taskColumn;
        // We're starting our new item!
        return await this.takeTask(grid);
      }

      // No progress item for the current row? Next task!
      // If this column is not the first column, we must look at the previous
      // column for a task that has started. Otherwise, we simply randomly
      // pick a non-started task.
      const availableTasks = new Map<number, number>();

      if (this.taskColumn === 0) {
        const taskPicked = new Set<number>();

        for (let x = 0; x < this.taskDuration; ++x) {
          for (let y = 0; y < grid.gridH; ++y) {
            if (taskPicked.has(y)) continue;

            if (grid.complete[x][y] === false) {
              availableTasks.set(y, x);
              taskPicked.add(y);
            }
          }
        }
      } else {
        // First we look at our previous column and search for any task with
        // completed items in any row
        const hasCompleted = new Set<number>();
        const taskPicked = new Set<number>();

        for (
          let x = this.taskColumn - this.taskDuration;
          x < this.taskColumn;
          ++x
        ) {
          for (let y = 0; y < grid.gridH; ++y) {
            if (grid.complete[x][y]) {
              hasCompleted.add(y);
            }
          }
        }

        // Now we look for next available tasks in the current column filtering
        // out any that do not have a previous column completed.
        for (
          let x = this.taskColumn;
          x < this.taskColumn + this.taskDuration;
          ++x
        ) {
          for (let y = 0; y < grid.gridH; ++y) {
            if (taskPicked.has(y)) continue;
            if (!hasCompleted.has(y)) continue;

            if (grid.complete[x][y] === false) {
              availableTasks.set(y, x);
              taskPicked.add(y);
            }
          }
        }
      }

      // Pick a random task from our availability list
      if (availableTasks.size > 0) {
        const list = Array.from(availableTasks.entries());
        const [taskY, taskX] = list[Math.floor(Math.random() * list.length)];
        this.cellX = taskX;
        this.cellY = taskY;
        return await this.takeTask(grid);
      }

      // No task? Stop work! We do a full column check to see if there truly is
      // nothing left. Only if all cells are complete do we shut down. We MAY
      // have cells incomplete but are waiting on a previous column to start up
      // so we can move to it.
      if (availableTasks.size === 0) {
        let hasWork = false;

        for (
          let i = this.taskColumn;
          i < this.taskColumn + this.taskDuration;
          ++i
        ) {
          for (let k = 0; k < grid.gridH; ++k) {
            if (grid.complete[i][k] === false) {
              hasWork = true;
              break;
            }
          }

          if (hasWork) break;
        }

        if (!hasWork) stopAnimationLoop(loopId);
      }
    }, this.speed);

    // Return a disposer
    return () => stopAnimationLoop(loopId);
  }
}
