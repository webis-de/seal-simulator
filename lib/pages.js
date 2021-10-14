const getScrollHeight = async function(page) {
  return page.evaluate(() => document.body.scrollHeight);
}
module.exports.getScrollHeight = getScrollHeight;

const getScrollYPosition = async function(page) {
  return page.evaluate(() => window.pageYOffset + window.innerHeight);
}
module.exports.getScrollYPosition = getScrollYPosition;

const isScrolledToBottom = async function(page) {
  return page.evaluate(() => (window.pageYOffset + window.innerHeight) >= document.body.scrollHeight);
}
module.exports.isScrolledToBottom = isScrolledToBottom;

const getDomSnapshot = async function(page) {
  return page.content();
}
module.exports.getDomSnapshot = getDomSnapshot;

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
module.exports.getNodesSnapshot = getNodesSnapshot;

