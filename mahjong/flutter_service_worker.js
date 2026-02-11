'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"flutter.js": "24bc71911b75b5f8135c949e27a2984e",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"manifest.json": "3db5ebb0e1697ea3689bc799cfa2b762",
"index.html": "943f12795df180c5fcac62d558d358c0",
"/": "943f12795df180c5fcac62d558d358c0",
"assets/shaders/stretch_effect.frag": "40d68efbbf360632f614c731219e95f0",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"assets/AssetManifest.bin.json": "735f3f4a61f75b7fa1117cdd665d9be7",
"assets/assets/tiles/8p.png": "9359855f440caeb59d160a0d5e1cfbe7",
"assets/assets/tiles/flower_xia.png": "9a699efdfc61772736b156085f41d182",
"assets/assets/tiles/1p.png": "aa00d0d6ccd6e0eb1437e1b4426fc38c",
"assets/assets/tiles/4p.png": "70ef37376808ecab7762c42e1dba79e1",
"assets/assets/tiles/6z.png": "d473147ab90c3989de37aa6d615c911b",
"assets/assets/tiles/back.png": "9dfbec26ec27e5379007bd0816effb85",
"assets/assets/tiles/flower_ju.png": "66d4e47c7399a6c8aaee0f6134e45fac",
"assets/assets/tiles/2p.png": "0b1dece9b3579cf6827e152ceb155c21",
"assets/assets/tiles/flower_mei.png": "8657223168ae80010c49a62c4676e68c",
"assets/assets/tiles/flower_dong.png": "f1d2e8207920ac4a7fdcdffca42e4674",
"assets/assets/tiles/5z.png": "15a13a62586690acc4122612e2af8898",
"assets/assets/tiles/3m.png": "2757000891839a9ab575605edd9379c6",
"assets/assets/tiles/flower_chun.png": "9a287dc8b620a973fc87cb415e72aff6",
"assets/assets/tiles/1z.png": "7cca1be01f90cdec22a0184862f9c442",
"assets/assets/tiles/4z.png": "19ea9395a7dbed3a28988f8ecc0cbeca",
"assets/assets/tiles/3s.png": "2850a4e2fac434a230e9b4172c226e5d",
"assets/assets/tiles/5s.png": "3f56773a44dcb9cf49d30c3495d70bc0",
"assets/assets/tiles/6m.png": "05793208ffcf8a9eed51ae7cf41d40c3",
"assets/assets/tiles/9p.png": "929d0627093df6f263916f72106663b7",
"assets/assets/tiles/flower_qiu.png": "cf2c25bd0ffdffae9d2d057671ebe20d",
"assets/assets/tiles/7m.png": "353565872d39995ec2bd341464ae17cc",
"assets/assets/tiles/6p.png": "14b979c82dd344bd6e539cac84dc0b7c",
"assets/assets/tiles/1s.png": "15d1c6dd5406936775c35e76d63e0844",
"assets/assets/tiles/4s.png": "c3f5fa93dfd393b82d703e255e817590",
"assets/assets/tiles/4m.png": "3490197ddddd8919e40e03e97082a4eb",
"assets/assets/tiles/2s.png": "230478a34f9419abb53c2ed46b7fe52f",
"assets/assets/tiles/3p.png": "763bde599d8ba4f332305799325a7bb0",
"assets/assets/tiles/5p.png": "517b5d32fcab95778d41ed22c5e6ef92",
"assets/assets/tiles/5m.png": "53c8d6d7b52c5c738b5c2b2f6c61888a",
"assets/assets/tiles/1m.png": "bb7099717f3368184bd6216f829f1594",
"assets/assets/tiles/0m.png": "b4537ea3a8c4fc9a5ffbcb7d76850003",
"assets/assets/tiles/9s.png": "7e8c0a4cb6724004fb3a3b796fcaadf7",
"assets/assets/tiles/flower_lan.png": "e27b3a0a9125f1e455c13bc3f7f87af1",
"assets/assets/tiles/7z.png": "bb53500290a7d7509c5601160c9d774a",
"assets/assets/tiles/0s.png": "58ab5cbe4df62c5ae49226f1374bb189",
"assets/assets/tiles/9m.png": "7e24c3adcfbbfebc249858a0a4d48719",
"assets/assets/tiles/8s.png": "9d6bcbf7c7d96a6614283471adf06a9f",
"assets/assets/tiles/7s.png": "41e00ac97a4324351c734991238b355a",
"assets/assets/tiles/2m.png": "62e3364e8ae09354da3f4383169d184b",
"assets/assets/tiles/3z.png": "fb95ccb3cfaa2d03949ac38cf3755431",
"assets/assets/tiles/6s.png": "182202fd648dc0df7b5dc55f84ab798d",
"assets/assets/tiles/7p.png": "2dc3dca11ef15a5a116196b7df1543e5",
"assets/assets/tiles/2z.png": "4e28aa0235ca9a14c782ae02190f7239",
"assets/assets/tiles/flower_zhu.png": "81d6073fcf48d5d85b4391b517786b51",
"assets/assets/tiles/0p.png": "6a4fb45db8a68a9e1f7c899d450b7acd",
"assets/assets/tiles/8m.png": "565976ed82df36cfcd04beb4aa31d4de",
"assets/fonts/MaterialIcons-Regular.otf": "c2d117357f450166cd8cacae05e502e0",
"assets/NOTICES": "bd6fa75f19c8f86f49dd2eee0a372bb2",
"assets/FontManifest.json": "7b2a36307916a9721811788013e65289",
"assets/AssetManifest.bin": "22fb84edca355363f19e3bf602d90fb0",
"canvaskit/chromium/canvaskit.wasm": "a726e3f75a84fcdf495a15817c63a35d",
"canvaskit/chromium/canvaskit.js": "a80c765aaa8af8645c9fb1aae53f9abf",
"canvaskit/chromium/canvaskit.js.symbols": "e2d09f0e434bc118bf67dae526737d07",
"canvaskit/skwasm_heavy.wasm": "b0be7910760d205ea4e011458df6ee01",
"canvaskit/skwasm_heavy.js.symbols": "0755b4fb399918388d71b59ad390b055",
"canvaskit/skwasm.js": "8060d46e9a4901ca9991edd3a26be4f0",
"canvaskit/canvaskit.wasm": "9b6a7830bf26959b200594729d73538e",
"canvaskit/skwasm_heavy.js": "740d43a6b8240ef9e23eed8c48840da4",
"canvaskit/canvaskit.js": "8331fe38e66b3a898c4f37648aaf7ee2",
"canvaskit/skwasm.wasm": "7e5f3afdd3b0747a1fd4517cea239898",
"canvaskit/canvaskit.js.symbols": "a3c9f77715b642d0437d9c275caba91e",
"canvaskit/skwasm.js.symbols": "3a4aadf4e8141f284bd524976b1d6bdc",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"flutter_bootstrap.js": "f6c0dd90ca9c1941ebffef42fb371081",
"version.json": "13ca956510b2745c4b287b94a03e4970",
"main.dart.js": "2925f0a9a0c82a600101dd79faa8c5a3"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
