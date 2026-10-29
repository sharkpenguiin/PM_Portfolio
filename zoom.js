// Drafts only: open the full prototype capture in a dialog and return focus to the link on close.
// Without JS (or without <dialog>), the link still opens the image file.
document.addEventListener('DOMContentLoaded', () => {
  if (typeof HTMLDialogElement !== 'function') return;
  const dialog = document.createElement('dialog');
  dialog.className = 'zoom';
  dialog.setAttribute('aria-label', '프로토타입 전체 화면');
  dialog.innerHTML = '<div class="zoom-bar"><button type="button">닫기</button></div><div class="zoom-pan" tabindex="0" role="region" aria-label="전체 화면 이미지, 옆으로 밀어 보기"><img alt=""></div>';
  document.body.appendChild(dialog);
  const img = dialog.querySelector('img');
  let opener = null;
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { if (opener) opener.focus(); });
  document.querySelectorAll('[data-zoom]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      opener = link;
      img.src = link.href;
      img.alt = link.dataset.alt || '매출자료 통합 검증 화면 전체. 건수는 시연용 예시.';
      dialog.showModal();
    });
  });
});
