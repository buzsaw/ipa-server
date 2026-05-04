(function (window) {
  function request(url, method, body, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open(method || 'GET', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) {
        return;
      }
      if (xhr.status < 200 || xhr.status >= 300) {
        callback(new Error('http ' + xhr.status));
        return;
      }
      try {
        callback(null, JSON.parse(xhr.responseText));
      } catch (e) {
        callback(e);
      }
    };
    xhr.send(body || null);
  }

  function formatDate(value) {
    if (!value) {
      return '';
    }
    var d = new Date(value);
    if (isNaN(d.getTime())) {
      return value;
    }
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  function queryParam(name) {
    var search = window.location.search || '';
    var pairs = search.replace(/^\?/, '').split('&');
    var i;
    for (i = 0; i < pairs.length; i++) {
      var p = pairs[i].split('=');
      if (p[0] === name) {
        return decodeURIComponent(p[1] || '');
      }
    }
    return '';
  }

  function iosInstallLink(plist) {
    return 'itms-services://?action=download-manifest&url=' + plist;
  }

  function renderList(container, data) {
    var rows = data && data.list ? data.list : [];
    var html = '';
    var i;
    for (i = 0; i < rows.length; i++) {
      var row = rows[i];
      html += '' +
        '<a class="row" href="/legacy/app/index.html?id=' + row.id + '">' +
          '<div class="name">' + (row.name || '') + '</div>' +
          '<div class="meta">' + (row.version || '') + ' (Build ' + (row.build || '') + ')</div>' +
          '<div class="meta">' + formatDate(row.date) + '</div>' +
        '</a>';
    }
    container.innerHTML = html || '<div class="tip">No apps</div>';
  }

  function renderInfo(container, row) {
    if (!row) {
      container.innerHTML = '<div class="tip">No data</div>';
      return;
    }
    var installHref = row.type === 0 ? iosInstallLink(row.plist) : row.pkg;
    var html = '' +
      '<div class="info">' +
        '<img class="icon" src="' + (row.webIcon || '/img/default.png') + '" alt="icon">' +
        '<h2>' + (row.name || '') + '</h2>' +
        '<div>Version: ' + (row.version || '') + ' (Build ' + (row.build || '') + ')</div>' +
        '<div>Updated: ' + formatDate(row.date) + '</div>' +
        '<a class="btn" href="' + installHref + '">Download and Install</a>' +
      '</div>';
    container.innerHTML = html;
  }

  function loadLegacyList() {
    var list = document.getElementById('legacy-list');
    if (!list) {
      return;
    }
    request('/api/list', 'GET', null, function (err, data) {
      if (err) {
        list.innerHTML = '<div class="tip">Load failed</div>';
        return;
      }
      renderList(list, data || {});
    });
  }

  function loadLegacyInfo() {
    var box = document.getElementById('legacy-info');
    if (!box) {
      return;
    }
    var id = queryParam('id');
    if (!id) {
      box.innerHTML = '<div class="tip">Missing id</div>';
      return;
    }
    request('/api/info/' + encodeURIComponent(id), 'GET', null, function (err, row) {
      if (err) {
        box.innerHTML = '<div class="tip">Load failed</div>';
        return;
      }
      renderInfo(box, row || {});
    });
  }

  window.LegacyIPA = {
    loadLegacyList: loadLegacyList,
    loadLegacyInfo: loadLegacyInfo
  };
})(window);
