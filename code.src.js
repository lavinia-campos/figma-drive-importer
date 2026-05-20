figma.showUI(__html__, { width: 380, height: 560 });

figma.ui.onmessage = async function(msg) {
  switch (msg.type) {

    case 'load-settings': {
      var data = await figma.clientStorage.getAsync('settings') || {};
      figma.ui.postMessage({ type: 'settings', data: data });
      break;
    }

    case 'merge-settings': {
      var existing = await figma.clientStorage.getAsync('settings') || {};
      var updated = Object.assign({}, existing, msg.data);
      await figma.clientStorage.setAsync('settings', updated);
      break;
    }

    case 'get-token': {
      var stored = await figma.clientStorage.getAsync('settings') || {};
      figma.ui.postMessage({ type: 'current-token', token: stored.token || null });
      break;
    }

    case 'apply-image': {
      var selection = figma.currentPage.selection;
      if (!selection.length) {
        figma.ui.postMessage({ type: 'error', message: 'Select a frame on the canvas first.' });
        return;
      }

      var target = findLayerByName(selection[0], msg.layerName);
      if (!target) {
        figma.ui.postMessage({ type: 'error', message: 'Layer "' + msg.layerName + '" not found in selection.' });
        return;
      }
      if (!('fills' in target)) {
        figma.ui.postMessage({ type: 'error', message: 'Layer "' + msg.layerName + '" doesn\'t support image fills.' });
        return;
      }

      try {
        var image = figma.createImage(new Uint8Array(msg.imageData));
        target.fills = [{ type: 'IMAGE', imageHash: image.hash, scaleMode: 'FILL' }];
        figma.notify('✓ Image applied to "' + msg.layerName + '"');
        figma.ui.postMessage({ type: 'success' });
      } catch (e) {
        figma.ui.postMessage({ type: 'error', message: 'Failed to apply image.' });
      }
      break;
    }
  }
};

function findLayerByName(node, name) {
  if (node.name === name) return node;
  if ('children' in node) {
    for (var i = 0; i < node.children.length; i++) {
      var found = findLayerByName(node.children[i], name);
      if (found) return found;
    }
  }
  return null;
}
