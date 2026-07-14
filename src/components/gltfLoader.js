import { Asset } from 'expo-asset';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Shared GLB loader for Metro asset modules.
// react-three-fiber's useLoader can't take a Metro module id on native
// (three's FileLoader expects a URL string), so we resolve the asset with
// expo-asset, fetch the raw bytes and hand GLTFLoader.parse() an ArrayBuffer.
// Results are cached per module id — every consumer shares one parse.
const cache = new Map();

export function loadGLTF(moduleId) {
  if (!cache.has(moduleId)) {
    const promise = (async () => {
      const asset = Asset.fromModule(moduleId);
      await asset.downloadAsync();
      const uri = asset.localUri || asset.uri;

      let buffer;
      try {
        // http:// in dev; file:// works with fetch on iOS.
        const res = await fetch(uri);
        buffer = await res.arrayBuffer();
      } catch (e) {
        // Android release builds can't fetch file:// — read bytes instead.
        const { File } = require('expo-file-system');
        buffer = new File(uri).bytes().buffer;
      }

      return new Promise((resolve, reject) =>
        new GLTFLoader().parse(buffer, '', resolve, reject)
      );
    })().catch(err => {
      cache.delete(moduleId);   // allow a retry on next call
      throw err;
    });
    cache.set(moduleId, promise);
  }
  return cache.get(moduleId);
}
