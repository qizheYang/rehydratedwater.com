'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"flutter_bootstrap.js": "903a05513fc34f05be8b2762b1c9318e",
"version.json": "6ec75e978664cda4d740d90a92753ce0",
"index.html": "e1ece7661a7cdbf28a4a9d31b9066615",
"/": "e1ece7661a7cdbf28a4a9d31b9066615",
"main.dart.js": "f9fb2a4158f2fb943606ed7bdf612bf1",
"flutter.js": "24bc71911b75b5f8135c949e27a2984e",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"manifest.json": "71ce463af730482936eb82516453120b",
"assets/NOTICES": "1923587668f7aa1d5a659f78cbbc30b1",
"assets/FontManifest.json": "7b2a36307916a9721811788013e65289",
"assets/AssetManifest.bin.json": "7b97d3da853f08800430b60defe5ab5a",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"assets/shaders/stretch_effect.frag": "40d68efbbf360632f614c731219e95f0",
"assets/AssetManifest.bin": "e4b254c43d0d7d724df988c13de0baeb",
"assets/fonts/MaterialIcons-Regular.otf": "49a678c610b171e8215ab7e6591c1cc5",
"assets/assets/cards/10C.svg": "669c20fcb83ddabc3bda3e8162af6569",
"assets/assets/cards/KC.svg": "ff456a8035cfd447c7e461623c53789b",
"assets/assets/cards/2H.svg": "1b2188a05b3339ac8f1c043c803d5d9a",
"assets/assets/cards/JD.svg": "c38f31dcf6ccf50fffd429a3baa53c30",
"assets/assets/cards/JS.svg": "a1f0114e1433a3a96ffa10c622d1b2a5",
"assets/assets/cards/KD.svg": "658998b13b66f8ea8c419eb4a2720ebd",
"assets/assets/cards/KS.svg": "fe66fe030637c0b3bbef055a2494c064",
"assets/assets/cards/3H.svg": "dfb7b9c5da090e753693a0648e230423",
"assets/assets/cards/10S.svg": "3963b09b32d71eaf3904864d36a7e9f6",
"assets/assets/cards/10D.svg": "dbb3850c770e43af9bc90d0cce873dbb",
"assets/assets/cards/JC.svg": "56c4541c77e2d646ff22ceaf382a6e3e",
"assets/assets/cards/QH.svg": "c439a88183651c5b9a63d9807dd7ca7d",
"assets/assets/cards/7S.svg": "00b5eed0e617c1754f2a002d8d000504",
"assets/assets/cards/4H.svg": "6369d1c9530222380e3755d3dff0cd92",
"assets/assets/cards/AC.svg": "9ee19a01f3b58dbf7d41bdc0eedf853b",
"assets/assets/cards/7D.svg": "d00ed5bcb5b70ef0aee9566bedea6077",
"assets/assets/cards/6C.svg": "3708c7e5593573328d639c71e58d7090",
"assets/assets/cards/8H.svg": "f63258336d8695aaade082ed26d0b17c",
"assets/assets/cards/9H.svg": "71f253368c37179079e9ebfa66604bb3",
"assets/assets/cards/AD.svg": "dd4d7167babf09261b89c5b882dce59f",
"assets/assets/cards/7C.svg": "768d16acc808234b01ab27b85e8129c2",
"assets/assets/cards/AS.svg": "b9f81c2d91ad1ec3e349b5cc012ea516",
"assets/assets/cards/5H.svg": "3a5059d0b4687cf3b0442ace92e47e88",
"assets/assets/cards/6S.svg": "dd29ca5aa8ac92ff0c506fc350b52f57",
"assets/assets/cards/6D.svg": "a8aabd2da27a433782343dbbe7f4e0f4",
"assets/assets/cards/8C.svg": "55a0952df2d2ac118fe526cc4cd234e4",
"assets/assets/cards/5D.svg": "eda011102b5e3ed00502425e250a6e14",
"assets/assets/cards/6H.svg": "13bea5a1b85d4f6fcff7f22da3fe9c7f",
"assets/assets/cards/5S.svg": "8f300fb5cd9845334b705d3dbdb9e86a",
"assets/assets/cards/9D.svg": "a578d7b2d3c0912a5296ec854fdec2b1",
"assets/assets/cards/9S.svg": "46304258451a3d2c69fdfaa1ac51d00e",
"assets/assets/cards/4C.svg": "037d8c2373b81694a9519c060d0951a3",
"assets/assets/cards/AH.svg": "474283132c4129834526713217a2f99c",
"assets/assets/cards/back.svg": "0646c53a6e45ca8b7ce4cfbdd3f027ae",
"assets/assets/cards/5C.svg": "12408f645f540e569f639eec07b24140",
"assets/assets/cards/8D.svg": "5f81e3253ead056953d4eb2006a1543f",
"assets/assets/cards/8S.svg": "4ff481d5b35c16c2777c8338cbbe4757",
"assets/assets/cards/4D.svg": "72d20001e3f712d041f5c98c0e36d73d",
"assets/assets/cards/4S.svg": "e1ae315267bebee9e8b70bb2e1ec27d8",
"assets/assets/cards/7H.svg": "51aa35bf8fa6e3aa60e8215d642e4f83",
"assets/assets/cards/9C.svg": "cf6317bc33f1c6db87c7f41b05e0276a",
"assets/assets/cards/2C.svg": "94b4a5b0b35e4db0d7587815dcdcdb91",
"assets/assets/cards/Joker1.svg": "7ce690e9a5d9fd4b323dcf7d6b988d3c",
"assets/assets/cards/QD.svg": "cdc326c08c278e49d397fa439845ac96",
"assets/assets/cards/QS.svg": "58d77ea50fe2f88b1fbef0c67bd533ed",
"assets/assets/cards/KH.svg": "09112d05f5b3dfbaffae8d0775e5a012",
"assets/assets/cards/3D.svg": "b9d5e12f600e3e441e26a2f460ace236",
"assets/assets/cards/3S.svg": "471f3e5977ae8e34350702a5354b4dd3",
"assets/assets/cards/Joker2.svg": "1ba0f353a1a7c70c82de47cd244654ad",
"assets/assets/cards/10H.svg": "c63394108a986db8e02c9d2226007af8",
"assets/assets/cards/QC.svg": "43122a93411b55fddce09a2562828e2c",
"assets/assets/cards/2D.svg": "eaef1133f7cafc9f07a5dd8002d58f67",
"assets/assets/cards/2S.svg": "b821dcd9a79616c0f95f935af2d623eb",
"assets/assets/cards/JH.svg": "02d4f21be9842c36046fc2a4028582b6",
"assets/assets/cards/3C.svg": "4281c3d1982ca4e277ae289a56f7fda1",
"canvaskit/skwasm.js": "8060d46e9a4901ca9991edd3a26be4f0",
"canvaskit/skwasm_heavy.js": "740d43a6b8240ef9e23eed8c48840da4",
"canvaskit/skwasm.js.symbols": "3a4aadf4e8141f284bd524976b1d6bdc",
"canvaskit/canvaskit.js.symbols": "a3c9f77715b642d0437d9c275caba91e",
"canvaskit/skwasm_heavy.js.symbols": "0755b4fb399918388d71b59ad390b055",
"canvaskit/skwasm.wasm": "7e5f3afdd3b0747a1fd4517cea239898",
"canvaskit/chromium/canvaskit.js.symbols": "e2d09f0e434bc118bf67dae526737d07",
"canvaskit/chromium/canvaskit.js": "a80c765aaa8af8645c9fb1aae53f9abf",
"canvaskit/chromium/canvaskit.wasm": "a726e3f75a84fcdf495a15817c63a35d",
"canvaskit/canvaskit.js": "8331fe38e66b3a898c4f37648aaf7ee2",
"canvaskit/canvaskit.wasm": "9b6a7830bf26959b200594729d73538e",
"canvaskit/skwasm_heavy.wasm": "b0be7910760d205ea4e011458df6ee01"};
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
