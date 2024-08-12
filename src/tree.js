/**
 * @constructor
 */
export class Node {
  constructor({ content = "", path = "", tag = "" } = {}) {
    this._content = content;
    this._children = [];
    this._path = path;
    this._tag = tag;
  }

  setContent(content) {
    this._content = content;
  }

  getContent() {
    return this._content;
  }

  getPath() {
    return this._path;
  }

  setTag(tag) {
    this._tag = tag;
  }

  getTag() {
    return this._tag;
  }

  setChild(node) {
    this._children.push(node);
  }

  getChildren() {
    return this._children;
  }

  toJSON() {
    return {
      tag: this._tag,
      path: this._path,
      children: this._children,
    };
  }
}

/**
 * @constructor
 */
export class Tree {
  constructor() {
    /** @private */
    this._rootNode;

    /** @private */
    this._registry = new Map();

    /** @private */
    this._tags = new Map();
  }

  /**
   * @param {string} path
   * @returns {boolean}
   */
  has(path) {
    return this._registry.has(path);
  }

  /**
   * @param {string} path
   * @param {string} [parent]
   * @returns {Node}
   */
  set(path, parent) {
    // Is there already a node on this path?
    // If so get it, it might be added to a different parent.
    let node;
    if (this._registry.has(path)) {
      node = this._registry.get(path);
    } else {
      node = new Node({ path });
    }

    // No rootNode set, assume a new tree and set one.
    if (!this._rootNode) {
      this._rootNode = node;
    } else {
      if (parent === undefined) {
        throw new Error(
          `Parent argument must be provided when not a root node. This node ${path} has a root node ${this._rootNode.getPath()}.`
        );
      }
    }

    if (this._registry.has(parent)) {
      const parentNode = this._registry.get(parent);
      parentNode.setChild(node);
    }

    this._registry.set(path, node);

    return node;
  }

  tag(path, tag) {
    if (this._tags.has(tag)) {
      throw new Error(`Tag ${tag} already exists`);
    }

    const node = this._registry.get(path);
    if (!node) {
      throw new Error(`No node at path ${path}`);
    }

    node.setTag(tag);
    this._tags.set(tag, node);
  }

  setContent(path, content) {
    const node = this.getByPath(path);
    if (node) {
      node.setContent(content);
    } else {
      throw new Error(
        `Not able to set content. No existing node on path ${path}.`
      );
    }
  }

  getByPath(path) {
    return this._registry.get(path);
  }

  getByTag(tag) {
    return this._tags.get(tag);
  }

  getTags() {
    return Array.from(this._tags.keys());
  }

  async getContentFromTags() {
    const nodes = this._tags.entries();
    const result = [];

    for await (const node of nodes) {
      const nodes = await Promise.all(this.walk(node[1]));
      const code = nodes
        .map((n) => {
          return n.getContent();
        })
        .join("");
      result.push({
        tag: node[0],
        css: "",
        code,
      });
    }

    return result;
  }

  *walk(root, ignoreTags = false) {
    function* walker(node) {
      if (node === root) {
        yield node;
      }

      const children = node.getChildren();
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const tag = child.getTag();
        if (tag === "" || ignoreTags) {
          yield child;
          yield* walker(child);
        }
      }
    }

    yield* walker(root);
  }

  clear() {
    this._rootNode = undefined;
    this._registry.clear();
    this._tags.clear();
  }

  toJSON() {
    return {
      root: this._rootNode,
    };
  }
}
