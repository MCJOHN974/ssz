import {expect} from "chai";

import {Tree, zeroNode, LeafNode, subtreeFillToContents, iterateAtDepth} from "../../src";

describe("fixed-depth tree iteration", () => {
  it("should properly navigate the zero tree", () => {
    const depth = 4;
    const zero = zeroNode(0).root;
    const tree = new Tree(zeroNode(4));
    for (const n of tree.iterateNodesAtDepth(depth, 0, 4)) {
      expect(n.root).to.be.deep.equal(zero);
    }
    const one = zeroNode(1).root;
    for (const n of tree.iterateNodesAtDepth(depth - 1, 0, 4)) {
      expect(n.root).to.be.deep.equal(one);
    }
  });

  it("should properly navigate a custom tree", () => {
    const depth = 4;
    const length = 1 << depth;
    const leaves = Array.from({length: length}, (_, i) => new LeafNode(Buffer.alloc(32, i)));
    const tree = new Tree(subtreeFillToContents(leaves, depth));
    // i = startIx
    // j = count
    // k = currentIx
    for (let i = 0; i < length; i++) {
      for (let j = length - i - 1; j > 1; j--) {
        let k = i;
        for (const n of tree.iterateNodesAtDepth(depth, i, j)) {
          expect(n.root).to.be.deep.equal(leaves[k].root);
          k++;
        }
        expect(k - i, `startIx=${i} count=${j} currIx=${k}`).to.be.eql(j);
      }
    }
  });
});

describe("subtree mutation", () => {
  it("changing a subtree should change the parent root", () => {
    const depth = 2;
    const tree = new Tree(zeroNode(depth));
    // Get the subtree with "X"s
    //       0
    //      /  \
    //    0      X
    //   / \    / \
    //  0   0  X   X
    const subtree = tree.getSubtree(BigInt(3));

    const rootBefore = tree.root;
    subtree.setRoot(BigInt(3), Buffer.alloc(32, 1));
    const rootAfter = tree.root;

    expect(toHex(rootBefore)).to.not.equal(rootAfter);
  });
});

describe("Tree.setNode", () => {
  it("Should compute root correctly after setting a leaf", () => {
    const depth = 4;
    const tree = new Tree(zeroNode(depth));
    tree.setNode(BigInt(18), new LeafNode(Buffer.alloc(32, 2)));
    expect(toHex(tree.root)).to.equal("3cfd85690fdd88abcf22ca7acf45bb47835326ff3166d3c953d5a23263fea2b2");
  });

  it("Should compute root correctly after setting 3 leafs", () => {
    const depth = 5;
    const tree = new Tree(zeroNode(depth));
    tree.setNode(BigInt(18), new LeafNode(Buffer.alloc(32, 2)));
    tree.setNode(BigInt(46), new LeafNode(Buffer.alloc(32, 2)));
    tree.setNode(BigInt(60), new LeafNode(Buffer.alloc(32, 2)));
    expect(toHex(tree.root)).to.equal("02607e58782c912e2f96f4ff9daf494d0d115e7c37e8c2b7ddce17213591151b");
  });

  it("Should throw for gindex 0", () => {
    const tree = new Tree(zeroNode(2));
    expect(() => tree.setNode(BigInt(0), zeroNode(1))).to.throw("Invalid gindex < 1");
  });

  it("Should expand a subtree", () => {
    const depth = 2;
    const tree = new Tree(zeroNode(depth));
    tree.setNode(BigInt(15), zeroNode(0), true);
    expect(tree.getRoot(BigInt(14))).to.deep.equal(zeroNode(0));
  });
});

function toHex(bytes: Buffer | Uint8Array): string {
  return Buffer.from(bytes).toString("hex");
}
