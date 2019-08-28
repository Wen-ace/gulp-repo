; (function () {

    function queryParamsFromUrl(name) {
        let href = window.location.href;
        let reg = new RegExp("[?&]" + name + "=(([^&])*)", "ig");
        let result = reg.exec(href);
        return result ? (result[1]) : null;
    };
    let $alert = $('.alert');
    // 保存跟新 参数 到浏览器当前会话中。
    let commom_data = { ckAppId: null, subCkAppId: null, channelId: null, userId: null, roleId: null, serverId: null, fromArea: null, originalServerId: null };
    let isAutoLogin = true;
    for (let key in commom_data) {
        if ('sessionStorage' in window) {
            try {
                commom_data[key] = queryParamsFromUrl(key) || window.sessionStorage.getItem(key);
                commom_data[key] && window.sessionStorage.setItem(key, commom_data[key] || null);
            } catch (error) {
                // myAlert('')
                console.log(error);
            }
            if (!commom_data[key] && (key !== 'fromArea' && key !== 'originalServerId')) {
                isAutoLogin = false;
            };
        } else {
            commom_data[key] = queryParamsFromUrl(key);
            if (!commom_data[key] && commom_data[key] !== 0) {
                isAutoLogin = false;
            }
        }
    }
    if (commom_data.fromArea == null && commom_data.originalServerId == null) {
        isAutoLogin = false;
    }

    /**
   * 
   * @param {string} url 
   * @param {object} option 
   * @param {function} callback 响应回调
   */
    function myAjax(url, option, callback) {
        let formData = new FormData();
        let mergeData = { ...commom_data, ...COMMOM_OPTION, ...option };  // 注意 assign方法的 polyfill
        if (!!option) {
            for (let item in mergeData) {
                if (!!mergeData[item]) {
                    formData.append(item, mergeData[item]);
                }
            }
        };

        $.ajax({
            url: url_prefix + url,
            type: 'POST',
            data: formData,
            processData: false,              // 不需要处理数据
            contentType: false,              // 不需要设置请求头类型
            success(res) {
                if (res.code == 0) {
                    callback(res.data, res.message);
                } else {
                    let message = '';
                    switch (res.code) {
                        case 40001:
                            message = '缺失参数';
                            break;
                        default:
                            message = res.message;
                            break;
                    };
                    // 重置
                    // cacheObj.isLuckend = true;
                    // cacheObj.isSign = true;
                    myAlert(message + "(" + res.code + ")");
                }
            },
            error(err) {
                // 重置
                // cacheObj.isLuckend = true;
                // cacheObj.isSign = true;
                myAlert(err.statusText, 2);
            }
        })
    };

    /**
    * 自定义提示
    * @param {[string, DOMString]} msg 提示信息
    * @param {number} time ms
    */
    function myAlert(msg, time) {
        clearTimeout(window.__myAlert__timerId__);
        $alert.fadeIn(200);
        $alert.html(msg);
        if (time === undefined) {
            time = 2;
        }
        if (time > 0) {
            window.__myAlert__timerId__ = setTimeout(() => {
                $alert.fadeOut(200);
            }, time * 1000);
        } else {
            $alert.click(function () {
                $alert.fadeOut(200);
            })
        }
    }
})()