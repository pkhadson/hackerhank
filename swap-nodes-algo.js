"use strict";

const fs = require("fs");

process.stdin.resume();
process.stdin.setEncoding("utf-8");

let inputString = "";
let currentLine = 0;

process.stdin.on("data", function (inputStdin) {
  inputString += inputStdin;
});

process.stdin.on("end", function () {
  inputString = inputString.split("\n");

  main();
});

function readLine() {
  return inputString[currentLine++];
}

/*
 * Complete the 'swapNodes' function below.
 *
 * The function is expected to return a 2D_INTEGER_ARRAY.
 * The function accepts following parameters:
 *  1. 2D_INTEGER_ARRAY indexes
 *  2. INTEGER_ARRAY queries
 */

class Tree {
  indexes;
  queries;
  pendings = [["left"], ["right"]];
  tree = { data: 1, left: null, right: null, level: 0 };
  treeCount = 0;

  constructor(indexes, queries) {
    this.treeCount = indexes.flat().filter((a) => a > 0).length + 1;
    this.indexes = indexes;
    this.queries = queries;
    this.parseRaw();
  }

  getPending() {
    return this.pendings.shift();
  }

  parseRaw() {
    for (let i = 0; i < this.indexes.length; i++) {
      const val = this.indexes[i];
      this.addValue(val[0], this.getPending());
      this.addValue(val[1], this.getPending());
    }
  }

  addValue(data, path) {
    if (data < 1) return;

    eval(
      `this.tree${path
        .map((a) => `['${a}']`)
        .join("")}={data: ${data}, left: null, right: null, level: ${
        path.length
      }}`
    );
    this.pendings.push([...path, "left"]);
    this.pendings.push([...path, "right"]);
  }

  swap(level) {
    const possiblesLength = Math.pow(2, level - 1);
    let possibles = level === 1 ? [] : [["left"], ["right"]];
    for (let i = 0; i <= level - 1; i++) {
      if (possibles.length >= possiblesLength) continue;
      const newPossibles = [];
      for (let ii = 0; ii < possibles.length; ii++) {
        const item = possibles[ii];
        newPossibles.push([...item, "left"]);
        newPossibles.push([...item, "right"]);
      }
      possibles = newPossibles;
    }

    for (let i = 0; i < (possibles.length || 1); i++) {
      const item = possibles[i];
      const val = this.getNode(item);
      if (!val || val.data <= 0) continue;
      const newRight = val.left;
      const newLeft = val.right;
      this.setNodeSide(item, "left", newLeft);
      this.setNodeSide(item, "right", newRight);
    }

    if (level === 2) this.swap(4);
  }

  getNode(path, refTree) {
    const tree = refTree || this.tree;
    if (!path) return tree;
    try {
      return eval(`tree${path.map((a) => `['${a}']`).join("")}`);
    } catch {
      return null;
    }
  }

  setNodeSide(path, side, val) {
    if (!path) return (this.tree[side] = val);
    return eval(`this.tree${path.map((a) => `['${a}']`).join("")}.${side}=val`);
  }

  parseResult() {
    const result = [];
    const tree = JSON.parse(JSON.stringify(this.tree));
    let currentPath = [];
    tree;

    const $ = this;

    function read() {
      const val = $.getNode(currentPath, tree);
      if (!val) return;

      const toParent = (opts = { save: true }) => {
        if (opts?.save) {
          result.push(val.data);
          eval(`tree${currentPath.map((a) => `['${a}']`).join("")}.read=true`);
        }
        currentPath.pop();

        return read();
      };
      if (val.read && currentPath.length) return toParent({ save: false });

      if (val.left && !val.left.read) {
        currentPath.push("left");
        return read(val.left);
      } else if (val.right && !val.right.read) {
        result.push(val.data);
        eval(`tree${currentPath.map((a) => `['${a}']`).join("")}.read=true`);
        currentPath.push("right");
        return read(val.right);
      } else {
        if (val.read && currentPath.length === 0) return;
        toParent();
      }
    }

    read();

    return result;
  }
}

function swapNodes(indexes, queries) {
  const result = [];
  const tree = new Tree(indexes);

  for (let i = 0; i < queries.length; i++) {
    tree.swap(queries[i]);
    result.push(tree.parseResult());
  }

  return result;
}

function main() {
  const ws = fs.createWriteStream(process.env.OUTPUT_PATH);

  const n = parseInt(readLine().trim(), 10);

  let indexes = Array(n);

  for (let i = 0; i < n; i++) {
    indexes[i] = readLine()
      .replace(/\s+$/g, "")
      .split(" ")
      .map((indexesTemp) => parseInt(indexesTemp, 10));
  }

  const queriesCount = parseInt(readLine().trim(), 10);

  let queries = [];

  for (let i = 0; i < queriesCount; i++) {
    const queriesItem = parseInt(readLine().trim(), 10);
    queries.push(queriesItem);
  }

  const result = swapNodes(indexes, queries);

  ws.write(result.map((x) => x.join(" ")).join("\n") + "\n");

  ws.end();
}
