// Hands-on re-creations for the featured cases. Fictional values only.
(function () {
  function track(name, params) {
    if (window.dataLayer) (function () { window.dataLayer.push(arguments); })('event', name, params || {});
  }
  function h(tag, attrs, html) {
    var el = document.createElement(tag);
    for (var k in attrs || {}) el.setAttribute(k, attrs[k]);
    if (html != null) el.innerHTML = html;
    return el;
  }
  function seg(labels, onPick) {
    var wrap = h('div', { class: 'seg', role: 'group', 'aria-label': '방식 선택' });
    labels.forEach(function (label, i) {
      var b = h('button', { type: 'button', 'aria-pressed': i === 0 ? 'true' : 'false' }, label);
      b.addEventListener('click', function () {
        wrap.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        onPick(i);
      });
      wrap.appendChild(b);
    });
    return wrap;
  }

  // 1) Sales data: check per company vs per error
  function sales(root) {
    var rows = [
      { who: '업체 A', err: 'code', what: '제품코드 P-1042 미등록' },
      { who: '업체 B', err: 'code', what: '제품코드 P-1042 미등록' },
      { who: '업체 C', err: 'code', what: '제품코드 P-1042 미등록' },
      { who: '업체 D', err: 'qty', what: '수량 비어 있음' }
    ];
    var groups = [
      { err: 'code', what: '제품코드 P-1042 미등록', who: '업체 A·B·C', n: 3, act: '등록 제품과 일괄 매칭' },
      { err: 'qty', what: '수량 비어 있음', who: '업체 D', n: 1, act: '자료 재요청' }
    ];
    var mode = 0, checks = 0, left = 4, used = {};
    var bar = h('div', { class: 'demo-bar' });
    var count = h('p', { class: 'count', 'aria-live': 'polite' });
    var list = h('ul', { class: 'd-list' });
    var banner = h('div', { class: 'd-banner' });
    var summary = h('p', { class: 'd-summary', 'aria-live': 'polite' }); summary.hidden = true;
    var reset = h('button', { type: 'button', class: 'd-btn ghost' }, '처음부터');
    function paintCount() { count.innerHTML = '확인한 횟수 <b>' + checks + '</b>회 · 남은 오류 ' + left + '건'; }
    function finish() {
      used[mode] = checks;
      summary.hidden = false;
      summary.innerHTML = mode === 0
        ? '업체별로 확인하면 같은 오류를 <b>4번</b> 열어 봐야 합니다. 오류별 방식도 눌러 보세요.'
        : '오류별로 모으면 <b>2번</b>으로 끝납니다. 같은 오류는 한 번에 매칭하고, 원본이 필요한 건만 재요청합니다.';
      track('demo_complete', { demo: 'sales', mode: mode ? 'by_error' : 'by_company' });
    }
    function render() {
      checks = 0; left = 4; summary.hidden = true; list.innerHTML = '';
      banner.hidden = mode === 0;
      banner.innerHTML = '업로드할 때 미연결 항목 <b>4건</b>을 바로 표시했습니다. 정산에서 빠지기 전에 보완을 요청할 수 있습니다.';
      (mode === 0 ? rows : groups).forEach(function (r) {
        var li = h('li', { class: 'd-row' });
        li.appendChild(h('span', { class: 'who' }, mode === 0 ? r.who : r.who + ' <small style="font-weight:400;color:#666b85">' + r.n + '건</small>'));
        li.appendChild(h('span', { class: 'what' }, r.what));
        var b = h('button', { type: 'button', class: 'd-btn' }, mode === 0 ? '열어서 확인' : r.act);
        b.addEventListener('click', function () {
          checks++; left -= mode === 0 ? 1 : r.n;
          li.classList.add('done'); b.replaceWith(h('span', { class: 'ok' }, mode === 0 ? '처리함' : '한 번에 처리함'));
          paintCount();
          if (left === 0) finish();
        });
        li.appendChild(b);
        list.appendChild(li);
      });
      paintCount();
    }
    bar.appendChild(seg(['업체별로 확인 (기존)', '오류별로 확인 (기획)'], function (i) { mode = i; render(); track('demo_mode', { demo: 'sales', mode: i ? 'by_error' : 'by_company' }); }));
    bar.appendChild(count);
    reset.addEventListener('click', render);
    root.append(bar, banner, list, summary);
    var actions = h('div', { class: 'd-actions' }); actions.appendChild(reset); root.appendChild(actions);
    render();
  }

  // 2) Settlement input: error after saving vs while typing
  function finance(root) {
    var mode = 0;
    var bar = h('div', { class: 'demo-bar' });
    var form = h('div', { class: 'd-form' });
    form.innerHTML =
      '<div class="d-field"><label for="d-prev">전기 이월액(원)</label><input id="d-prev" value="1,200,000" readonly></div>' +
      '<div class="d-field"><label for="d-delta">당기 증감액(원)</label><input id="d-delta" value="300,000" readonly></div>' +
      '<div class="d-field"><label for="d-total">결산 금액(원)</label><input id="d-total" inputmode="numeric" autocomplete="off" placeholder="예: 12A 또는 1,400,000" aria-describedby="d-total-err"><p class="d-err" id="d-total-err" aria-live="polite"></p></div>';
    var actions = h('div', { class: 'd-actions' });
    var save = h('button', { type: 'button', class: 'd-btn' }, '저장');
    var msg = h('p', { class: 'd-msg', 'aria-live': 'polite' });
    actions.append(save, msg);
    var input = form.querySelector('#d-total'), err = form.querySelector('#d-total-err');
    function check(v) {
      var raw = v.replace(/,/g, '').trim();
      if (!raw) return null;
      if (!/^-?\d+$/.test(raw)) return { tag: '형식', text: '숫자로 입력해 주세요.' };
      if (Number(raw) !== 1500000) return { tag: '계산', text: '전기 이월액과 당기 증감액의 합(1,500,000원)과 다릅니다.' };
      return { ok: true };
    }
    function showInline() {
      var r = check(input.value);
      if (r && !r.ok) { input.setAttribute('aria-invalid', 'true'); err.innerHTML = '<span class="tag">[' + r.tag + ']</span>' + r.text; }
      else { input.removeAttribute('aria-invalid'); err.textContent = r && r.ok ? '' : ''; }
    }
    input.addEventListener('input', function () { if (mode === 1) showInline(); else msg.textContent = ''; });
    save.addEventListener('click', function () {
      var r = check(input.value);
      if (mode === 0) {
        if (r && !r.ok) { msg.className = 'd-msg bad'; msg.textContent = '저장한 뒤 계산 단계에서 오류가 확인됐습니다. 어느 칸이 왜 틀렸는지 다시 찾아야 합니다.'; }
        else if (r && r.ok) { msg.className = 'd-msg'; msg.textContent = '저장했습니다.'; }
        else { msg.className = 'd-msg'; msg.textContent = '결산 금액을 입력해 보세요.'; }
      } else {
        showInline();
        if (r && r.ok) { msg.className = 'd-msg'; msg.textContent = '입력하는 동안 오류를 고쳤기 때문에 바로 저장했습니다.'; }
        else if (r) { msg.className = 'd-msg bad'; msg.textContent = '아래 안내를 보고 고친 뒤 저장할 수 있습니다.'; }
        else { msg.className = 'd-msg'; msg.textContent = '결산 금액을 입력해 보세요.'; }
      }
      track('demo_save', { demo: 'finance', mode: mode ? 'inline' : 'after_save' });
    });
    bar.appendChild(seg(['저장 후 확인 (기존)', '입력 중 안내 (개선)'], function (i) {
      mode = i; msg.textContent = ''; input.removeAttribute('aria-invalid'); err.textContent = '';
      if (mode === 1) showInline();
      track('demo_mode', { demo: 'finance', mode: i ? 'inline' : 'after_save' });
    }));
    root.append(bar, form, actions);
  }

  // 3) AI draft spec vs source notes
  function ai(root) {
    var src = [
      ['R1', '신청 건은 담당자가 검토한 뒤 승인한다.'],
      ['R2', '반려할 때는 사유를 입력해야 한다.'],
      ['R3', '승인·반려 이력을 목록에서 확인할 수 있어야 한다.']
    ];
    var spec = [
      ['승인 버튼: 담당자 검토 후 승인', 'R1'],
      ['반려 시 사유 입력 필수', 'R2'],
      ['처리 이력 목록 제공', 'R3'],
      ['조건을 채우면 자동 승인하는 옵션', null]
    ];
    var cols = h('div', { class: 'd-cols' });
    var left = h('div', { class: 'd-col' }, '<h3>회의록·요구 목록 (원문)</h3>');
    var ul1 = h('ul', { class: 'd-list d-src' });
    src.forEach(function (s) { ul1.appendChild(h('li', {}, '<span class="id">' + s[0] + '</span>' + s[1])); });
    left.appendChild(ul1);
    var right = h('div', { class: 'd-col' }, '<h3>AI가 만든 명세 초안</h3>');
    var ul2 = h('ul', { class: 'd-list d-spec' });
    var items = spec.map(function (s) { var li = h('li', {}, '<span>' + s[0] + '</span>'); ul2.appendChild(li); return li; });
    right.appendChild(ul2);
    cols.append(left, right);
    var crit = h('ul', { class: 'criteria', 'aria-label': '5대 검증 기준' });
    ['근거 검증', '중복 제거', '자동/수동 경계', '실제 업무 동선', '데이터 정합'].forEach(function (c) { crit.appendChild(h('li', {}, c)); });
    var actions = h('div', { class: 'd-actions' });
    var compare = h('button', { type: 'button', class: 'd-btn' }, '원문과 대조하기');
    var remove = h('button', { type: 'button', class: 'd-btn ghost', disabled: 'disabled' }, '근거 없는 항목 삭제');
    var msg = h('p', { class: 'd-msg', 'aria-live': 'polite' });
    actions.append(compare, remove, msg);
    compare.addEventListener('click', function () {
      spec.forEach(function (s, i) {
        if (items[i].querySelector('.ref')) return;
        items[i].appendChild(h('span', { class: 'ref' + (s[1] ? '' : ' none') }, s[1] ? '근거 ' + s[1] : '근거 없음'));
      });
      crit.querySelectorAll('li').forEach(function (li) {
        var bad = li.textContent === '근거 검증' || li.textContent === '자동/수동 경계';
        li.className = bad ? 'fail' : 'pass';
      });
      msg.className = 'd-msg bad';
      msg.textContent = "'자동 승인'은 원문에 근거가 없고, 사람이 승인하기로 한 경계를 넘습니다.";
      compare.disabled = true; remove.disabled = false;
      track('demo_compare', { demo: 'ai' });
    });
    remove.addEventListener('click', function () {
      items[3].classList.add('gone');
      msg.className = 'd-msg';
      msg.textContent = '명세에서 삭제했습니다. 이 대조 절차를 검수 스킬 지침에 넣었습니다.';
      remove.disabled = true;
      track('demo_complete', { demo: 'ai' });
    });
    root.append(cols, crit, actions);
  }

  var demos = { sales: sales, finance: finance, ai: ai };
  document.querySelectorAll('[data-demo]').forEach(function (el) {
    var fn = demos[el.getAttribute('data-demo')];
    if (fn) { el.innerHTML = ''; fn(el); }
  });
})();
