/**
 * @param elem: jquery选择器，用来获取要被固定的元素
 * @param opts:
 * - target: jquery选择器，用来获取表示固定范围的元素
 * - type: top|bottom，表示要固定的位置
 * - height: 要固定的元素的高度，由于高度在做页面时就是确定的并且几乎不会被DOM操作改变，直接从外部传入可以除去获取元素高度的操作
 * - wait: 滚动事件回调的节流时间，控制回调至少隔多长时间才执行一次
 * - getStickyWidth：获取要固定元素的宽度，window resize或者DOM操作会导致固定元素的宽度发生变化，需要这个回调来刷新stickyWidth
 */
var Sticky = function (elem, opts) {
    var $elem = $(elem), $target = $(opts.target || $elem.data('target'));
    if (!$elem.length || !$target.length) return;
    var stickyWidth, $win = $(window),
        stickyHeight = opts.height || $elem[0].offsetHeight,
        rules = {
            top: function (rect) {
                return rect.top < 0 && (rect.bottom - stickyHeight) > 0;
            },
            bottom: function (rect) {
                var docClientWidth = document.documentElement.clientHeight;
                return rect.bottom > docClientWidth && (rect.top + stickyHeight) < docClientWidth;
            }
        },
        type = (opts.type in rules) && opts.type || 'top',
        className = 'sticky--in-' + type;

    refreshStickyWidth();

    $win.scroll(throttle(sticky, $.isNumeric(opts.wait) && parseInt(opts.wait) || 100));
    $win.resize(throttle(function () {
        refreshStickyWidth();
        sticky();
    }, 50));

    function refreshStickyWidth() {
        stickyWidth = typeof opts.getStickyWidth === 'function' && opts.getStickyWidth($elem) || $elem[0].offsetWidth;
        $elem.hasClass(className) && $elem.css('width', stickyWidth + 'px');
    }

    //效果实现
    function sticky() {
        if (rules[type]($target[0].getBoundingClientRect())) {
            !$elem.hasClass(className) && $elem.addClass(className).css('width', stickyWidth + 'px');
        } else {
            $elem.hasClass(className) && $elem.removeClass(className).css('width', 'auto');
        }
    }

    //函数节流
    function throttle(func, wait) {
        var timer = null;
        return function () {
            var self = this, args = arguments;
            if (timer) clearTimeout(timer);
            timer = setTimeout(function () {
                return typeof func === 'function' && func.apply(self, args);
            }, wait);
        }
    }
};