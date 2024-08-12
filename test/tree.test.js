import assertSnapshot from "snapshot-assertion";
import { strictEqual, deepEqual } from "node:assert";
import assert from "node:assert/strict";
import test from "node:test";

import { Tree, Node } from "../src/tree.js";

const makeTree = () => {
  /*
    This function creates the following tree
    |- /a.js (tagged)
        |- /b.js
            |- /b/a.js (tagged)
                |- /b/a/a.js
                |- /b/a/b.js
            |- /b/b.js
            |- /b/c.js
        |- /c.js
            |- /c/a.js
            |- /c/b.js
                |- /e/oddball.js
        |- /d.js
            |- /d/a.js
            |- /c/b.js
                |- /e/oddball.js
    */

  const tree = new Tree();

  tree.set("/a.js");

  tree.set("/b.js", "/a.js");
  tree.set("/c.js", "/a.js");
  tree.set("/d.js", "/a.js");

  // b
  tree.set("/b/a.js", "/b.js");
  tree.set("/b/b.js", "/b.js");
  tree.set("/b/c.js", "/b.js");

  tree.set("/b/a/a.js", "/b/a.js");
  tree.set("/b/a/b.js", "/b/a.js");

  // c
  tree.set("/c/a.js", "/c.js");
  tree.set("/c/b.js", "/c.js");

  // d
  tree.set("/d/a.js", "/d.js");

  // odd ball
  tree.set("/c/b.js", "/d.js");
  tree.set("/e/oddball.js", "/c/b.js");

  // Set content
  tree.setContent("/a.js", 'const a = "a";');

  tree.setContent("/b.js", 'const b = "b";');
  tree.setContent("/c.js", 'const c = "c";');
  tree.setContent("/d.js", 'const d = "d";');

  tree.setContent("/b/a.js", 'const ba = "ba";');
  tree.setContent("/b/b.js", 'const bb = "bb";');
  tree.setContent("/b/c.js", 'const bc = "bc";');

  tree.setContent("/b/a/a.js", 'const baa = "baa";');
  tree.setContent("/b/a/b.js", 'const bab = "bab";');

  tree.setContent("/c/a.js", 'const ca = "ca";');
  tree.setContent("/c/b.js", 'const cb = "cb";');

  tree.setContent("/d/a.js", 'const da = "da";');

  tree.setContent("/e/oddball.js", 'const oddball = "oddball";');

  // Tag paths
  tree.tag("/a.js", "tagged-a");
  tree.tag("/b/a.js", "tagged-b");

  return tree;
};

test("Node() - No constructor arguments", () => {
  const node = new Node();
  strictEqual(node.getContent(), "");
  strictEqual(node.getPath(), "");
  strictEqual(node.getTag(), "");
  strictEqual(node.getChildren().length, 0);
});

test("Node() - With constructor arguments", () => {
  const node = new Node({
    content: "foo",
    path: "/a.js",
    tag: "bar",
  });
  strictEqual(node.getContent(), "foo");
  strictEqual(node.getPath(), "/a.js");
  strictEqual(node.getTag(), "bar");
  strictEqual(node.getChildren().length, 0);
});

test("Node() - Set values through methods", () => {
  const node = new Node({
    path: "/a.js",
  });

  node.setContent("foo");
  node.setTag("bar");

  strictEqual(node.getContent(), "foo");
  strictEqual(node.getPath(), "/a.js");
  strictEqual(node.getTag(), "bar");
  strictEqual(node.getChildren().length, 0);
});

test("Node() - Children", () => {
  const node = new Node({
    path: "/a.js",
  });

  node.setChild(new Node({ path: "/b.js" }));
  node.setChild(new Node({ path: "/c.js" }));

  strictEqual(node.getPath(), "/a.js");
  strictEqual(node.getChildren().length, 2);
  strictEqual(node.getChildren()[0].getPath(), "/b.js");
  strictEqual(node.getChildren()[1].getPath(), "/c.js");
});

test("Tree() - Set root node", () => {
  const tree = new Tree();

  tree.set("/root.js");
  strictEqual(tree._rootNode.getPath(), "/root.js");
});

test("Tree() - Set root node twice", () => {
  const tree = new Tree();

  tree.set("/root.js");
  strictEqual(tree._rootNode.getPath(), "/root.js");

  assert.throws(() => {
    tree.set("/rooted.js");
  }, /Parent argument must be provided/);
});

test("Tree() - Set root with child node", () => {
  const tree = new Tree();

  tree.set("/root.js");
  tree.set("/child.js", "/root.js");

  strictEqual(tree._rootNode.getPath(), "/root.js");
  strictEqual(tree._rootNode.getChildren()[0].getPath(), "/child.js");
});

test("Tree() - Get node by path", () => {
  const tree = new Tree();

  tree.set("/root.js");
  tree.set("/child.js", "/root.js");

  strictEqual(tree.getByPath("/child.js").getPath(), "/child.js");
});

test("Tree() - Set content by path", () => {
  const tree = new Tree();

  tree.set("/root.js");
  tree.set("/child.js", "/root.js");

  tree.setContent("/child.js", "some content");

  strictEqual(tree.getByPath("/child.js").getContent(), "some content");
});

test("Tree() - Set content by path - Node does not exist", () => {
  const tree = new Tree();

  tree.set("/root.js");
  tree.set("/child.js", "/root.js");

  assert.throws(() => {
    tree.setContent("/notexist.js", "some content");
  }, /Not able to set content. No existing node on path./);
});

test("Tree() - Tag node", () => {
  const tree = new Tree();

  tree.set("/root.js");
  tree.tag("/root.js", "tag");

  strictEqual(tree.getByTag("tag").getPath(), "/root.js");
});

test("Tree() - Tag node", () => {
  const tree = new Tree();

  tree.set("/root.js");
  tree.set("/child.js", "/root.js");

  tree.tag("/root.js", "tag-a");
  tree.tag("/child.js", "tag-b");

  deepEqual(tree.getTags(), ["tag-a", "tag-b"]);
});

test("Tree() - Set duplicate tag", () => {
  const tree = new Tree();

  tree.set("/root.js");
  tree.set("/child.js", "/root.js");

  tree.tag("/root.js", "tag");

  assert.throws(() => {
    tree.tag("/child.js", "tag");
  }, /Tag tag already exists/);
});

test("Tree() - Walk the tree - Ignore tags", async () => {
  const tree = makeTree();
  const nodes = await Promise.all(tree.walk(tree._rootNode, true));

  const paths = nodes.map((node) => {
    return node.getPath();
  });

  await assertSnapshot(
    JSON.stringify(paths, null, 2),
    "./snapshots/tree-1.snapshot"
  );
});

test("Tree() - Walk the tree - Respect tags", async () => {
  const tree = makeTree();
  const nodes = await Promise.all(tree.walk(tree._rootNode));

  const paths = nodes.map((node) => {
    return node.getPath();
  });

  await assertSnapshot(
    JSON.stringify(paths, null, 2),
    "./snapshots/tree-2.snapshot"
  );
});

test("Tree() - Walk the tree - Walk from a sub node", async () => {
  const tree = makeTree();

  const root = tree.getByPath("/c.js");
  const nodes = await Promise.all(tree.walk(root));

  const paths = nodes.map((node) => {
    return node.getPath();
  });

  await assertSnapshot(
    JSON.stringify(paths, null, 2),
    "./snapshots/tree-3.snapshot"
  );
});

test("Tree() - Walk the tree - Walk from a sub node - Deeper node has tag", async () => {
  const tree = makeTree();

  const root = tree.getByPath("/b.js");
  const nodes = await Promise.all(tree.walk(root));

  const paths = nodes.map((node) => {
    return node.getPath();
  });

  await assertSnapshot(
    JSON.stringify(paths, null, 2),
    "./snapshots/tree-4.snapshot"
  );
});

test("Tree() - Get code associated with all tags", async () => {
  const tree = makeTree();

  const result = await tree.getContentFromTags();

  strictEqual(result[0].tag, "tagged-a");
  strictEqual(
    result[0].code,
    'const a = "a";const b = "b";const bb = "bb";const bc = "bc";const c = "c";const ca = "ca";const cb = "cb";const oddball = "oddball";const d = "d";const da = "da";const cb = "cb";const oddball = "oddball";'
  );

  strictEqual(result[1].tag, "tagged-b");
  strictEqual(
    result[1].code,
    'const ba = "ba";const baa = "baa";const bab = "bab";'
  );
});
