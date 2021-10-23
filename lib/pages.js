const fs = require("fs-extra");

////////////////////////////////////////////////////////////////////////////////
// SCROLLING
////////////////////////////////////////////////////////////////////////////////

const getScrollHeight = async function (page) {
    return page.evaluate(() => document.body.scrollHeight);
}
module.exports.getScrollHeight = getScrollHeight;

const getScrollYPosition = async function (page) {
    return page.evaluate(() => window.pageYOffset + window.innerHeight);
}
module.exports.getScrollYPosition = getScrollYPosition;

const isScrolledToBottom = async function (page) {
    return page.evaluate(() => (window.pageYOffset + window.innerHeight) >= document.body.scrollHeight);
}
module.exports.isScrolledToBottom = isScrolledToBottom;

////////////////////////////////////////////////////////////////////////////////
// VIEWPORT
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// SNAPSHOTS
////////////////////////////////////////////////////////////////////////////////

const getDomSnapshot = async function (page, options = {}) {
    if (options === false) {
        return Promise.resolve(null);
    } // do not execute
    return page.content();
}
module.exports.getDomSnapshot = getDomSnapshot;

const writeDomSnapshot = async function (page, path, options = {}) {
    if (options === false) {
        return Promise.resolve(null);
    } // do not execute
    return getDomSnapshot(page).then(dom => fs.writeFile(path, dom));
}
module.exports.writeDomSnapshot = writeDomSnapshot;

const getNodesSnapshot = async function (page, options = {}) {
    if (options === false) {
        return Promise.resolve(null);
    } // do not execute
    const opts = Object.assign({
        css: true,
        invisible: true
    }, options);
    const nodesSnapshot = await page.evaluate((opts) => {
        const nodes = [];

        const getNodeCss = (element) => {
            const styles = window.getComputedStyle(element);
            const cssArray = Array.from(styles).map(name => [name, styles.getPropertyValue(name)]);
            const css = {};
            cssArray.forEach((data) => {
                css[data[0]] = data[1]
            });
            return css;
        };

        const isVisible = (element) => {
            // https://stackoverflow.com/a/33456469
            return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
        }

        const traverse = (node, parentPath, nodeName, nodeNameNumber) => {
            const nodePath = parentPath + "/" + nodeName + "[" + nodeNameNumber + "]";
            const nodeId = node.id ? node.id : undefined;
            let nodeVisible, nodeClasses, nodeText, nodeBox, nodeCss;
            if (node.nodeType === Node.ELEMENT_NODE) {
                nodeVisible = isVisible(node);
                if (!nodeVisible && !opts.visible) {
                    return;
                }
                nodeClasses = Array.from(node.classList);
                nodeText = node.innerText;
                if (nodeText) {
                    nodeText = nodeText.trim().replace(/\n/g, "\\n");
                }
                if (nodeText === "") {
                    nodeText = undefined;
                }
                nodeBox = node.getBoundingClientRect();
                if (opts.css) {
                    nodeCss = getNodeCss(node);
                }
            } else {
                nodeVisible = isVisible(node.parentElement);
                if (!nodeVisible && !opts.visible) {
                    return;
                }
                nodeText = node.textContent.trim().replace(/\n/g, "\\n");
                if (nodeText === "") {
                    return
                }
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
                    if (child.nodeType === Node.ELEMENT_NODE
                        || child.nodeType === Node.TEXT_NODE) {
                        const childName = child.nodeType === Node.TEXT_NODE
                            ? "text()"
                            : child.tagName;

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
    }, opts);
    return nodesSnapshot;
}
module.exports.getNodesSnapshot = getNodesSnapshot;

const writeNodesSnapshot = async function (page, path, options = {}) {
    if (options === false) {
        return Promise.resolve(null);
    } // do not execute
    return getNodesSnapshot(page, options)
        .then(nodes => fs.writeFile(path, nodes));
}
module.exports.writeNodesSnapshot = writeNodesSnapshot;


