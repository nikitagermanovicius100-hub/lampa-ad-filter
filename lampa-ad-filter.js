(function () {
    var Lampa = window.Lampa;
    if (!Lampa || !Lampa.Manifest || !Lampa.Player || window.lampaAdFilterLoaded) return;

    var playerEvents = Lampa.Player.listener;
    var xhr = window.XMLHttpRequest && window.XMLHttpRequest.prototype;
    if (!playerEvents || typeof playerEvents.follow !== 'function' ||
        !xhr || typeof xhr.open !== 'function' || typeof window.URL !== 'function') return;

    var openRequest = xhr.open;
    var emptyAdList = 'data:application/json,%7B%22ad%22%3A%5B%5D%7D';
    var adPaths = ['/api/ad/get/preroll', '/api/ad/get/banner'];

    function isCubAdRequest(url) {
        if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) return false;

        var target;
        try {
            target = new window.URL(url);
        } catch (error) {
            return false;
        }

        if (adPaths.indexOf(target.pathname) === -1) return false;

        var mirrors = Lampa.Manifest.cub_mirrors;
        return Array.isArray(mirrors) && mirrors.indexOf(target.host) !== -1;
    }

    xhr.open = function (method, url) {
        if (method === 'GET' && isCubAdRequest(url)) {
            // Пустой список в формате, который ожидает рекламный модуль Lampa.
            var args = Array.prototype.slice.call(arguments);
            args[1] = emptyAdList;
            return openRequest.apply(this, args);
        }

        return openRequest.apply(this, arguments);
    };

    playerEvents.follow('create', function (event) {
        if (!event || !event.data) return;

        delete event.data.vast_url;
        delete event.data.vast_banner;
    });

    window.lampaAdFilterLoaded = true;
    console.log('[Lampa Ad Filter] Активирован');
})();

