const fs = require("fs-extra");
const path = require('path');
const playwright = require('playwright');

////////////////////////////////////////////////////////////////////////////////
// CONSTANTS
////////////////////////////////////////////////////////////////////////////////

/**
 * Current version of SEAL.
 */
const VERSION = '0.1.0';
exports.VERSION = VERSION

/**
 * Default name for the main script configuration file in the input directory.
 */
const DEFAULT_SCRIPT_CONFIGURATION_FILE = "run.json";
exports.DEFAULT_SCRIPT_CONFIGURATION_FILE = DEFAULT_SCRIPT_CONFIGURATION_FILE;

/**
 * Name of the default browser context.
 */
const DEFAULT_BROWSER_CONTEXT = "default";
exports.DEFAULT_BROWSER_CONTEXT = DEFAULT_BROWSER_CONTEXT;

////////////////////////////////////////////////////////////////////////////////
// STATIC FUNCTIONS
////////////////////////////////////////////////////////////////////////////////

const log = function(name, attributes = {}) {
  const record = Object.assign({timestamp: true, event: true}, attributes);
  record.timestamp = new Date().toISOString();
  record.event = name;
  console.log(JSON.stringify(record));
}
exports.log = log;

const getScrollHeight = async function(page) {
  return page.evaluate(() => document.body.scrollHeight);
}
exports.getScrollHeight = getScrollHeight;

const getScrollYPosition = async function(page) {
  return page.evaluate(() => window.pageYOffset + window.innerHeight);
}
exports.getScrollYPosition = getScrollYPosition;

const isScrolledToBottom = async function(page) {
  return page.evaluate(() => (window.pageYOffset + window.innerHeight) >= document.body.scrollHeight);
}
exports.isScrolledToBottom = isScrolledToBottom;

const getDomSnapshot = async function(page) {
  return page.content();
}
exports.getDomSnapshot = getDomSnapshot;

const getNodesSnapshot = async function(page, includeCss = true) {
  const nodesSnapshot = await page.evaluate((includeCss) => {
    const nodes = [];

    const getNodeCss = (element) => {
      const styles = window.getComputedStyle(element);
      const cssArray = Array.from(styles).map(name => [name, styles.getPropertyValue(name)]);
      const css = {};
      cssArray.forEach((data) => { css[data[0]] = data[1] });
      return css;
    };

    const isVisible = (element) => {
      // https://stackoverflow.com/a/33456469
      return !!( element.offsetWidth || element.offsetHeight || element.getClientRects().length );
    }

    const traverse = (node, parentPath, nodeName, nodeNameNumber) => {
      const nodePath = parentPath + "/" + nodeName + "[" + nodeNameNumber + "]";
      const nodeId = node.id ? node.id : undefined;
      let nodeVisible, nodeClasses, nodeText, nodeBox, nodeCss;
      if (node.nodeType === Node.ELEMENT_NODE) {
        nodeClasses = Array.from(node.classList);
        nodeText = node.innerText;
        if (nodeText) { nodeText = nodeText.trim().replace(/\n/g, "\\n"); }
        if (nodeText === "") {nodeText = undefined; }
        nodeVisible = isVisible(node);
        nodeBox = node.getBoundingClientRect();
        if (includeCss) { nodeCss = getNodeCss(node); }
      } else {
        nodeText = node.textContent.trim().replace(/\n/g, "\\n");
        if (nodeText === "") { return }
        nodeVisible = isVisible(node.parentElement);
        const nodeRange = document.createRange();
        nodeRange.selectNode(node);
        nodeBox = nodeRange.getBoundingClientRect();
      }
      const xmin = nodeBox.left;
      const ymin = nodeBox.top;
      const xmax = xmin + nodeBox.width;
      const ymax = ymin + nodeBox.height;
      nodes.push(JSON.stringify({
        xPath: nodePath,
        visible: nodeVisible,
        id: nodeId,
        classes: nodeClasses,
        position: [xmin, ymin, xmax, ymax],
        text: nodeText,
        css: nodeCss
      }));

      if (node.nodeType === Node.ELEMENT_NODE) {
        const counts = {};
        const children = node.childNodes;
        
        for (let c = 0; c < children.length; ++c) {
          const child = children[c];
          if (child.nodeType === Node.ELEMENT_NODE || child.nodeType === Node.TEXT_NODE) {
            const childName = child.nodeType === Node.TEXT_NODE ? "text()" : child.tagName;

            if (typeof counts[childName] === "undefined") {
              counts[childName] = 1;
            } else {
              counts[childName] += 1;
            }
            traverse(child, nodePath, childName, counts[childName]);
          }
        }
      }
    };

    traverse(document.getElementsByTagName("body")[0], "/HTML[1]", "BODY", 1)
    return nodes.join("\n");
  }, includeCss);
  return nodesSnapshot;
}
exports.getNodesSnapshot = getNodesSnapshot;

