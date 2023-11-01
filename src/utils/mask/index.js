export function maskOn(time) {
  window.maskCurTime = 5000;

  if (time) {
    window.maskCurTime = time;
  }

  if (!window.maskDiv && !document.getElementById('mask')) {
    window.maskDiv = document.createElement('div');
    window.maskDiv.id = 'mask';
    window.maskDiv['z-index'] = 2147483647;

    window.maskDiv.innerHTML =
      '<div id="loading-logo" class="loading-container"><div class="loading"></div><div id="loading-text">loading</div></div>';
    document.body.appendChild(window.maskDiv);
  } else if (!document.getElementById('mask')) {
    document.body.appendChild(window.maskDiv);
  }

  if (
    document.querySelector('#mask') &&
    document.querySelector('#mask').style.display === 'block'
  ) {
    window.maskEndTime = 0;
    return;
  }

  let maskWidth = window.innerWidth;
  let maskHeight = window.innerHeight; //브라우저 사이즈를 구한다.
  let logoW = maskWidth / 2;
  if (logoW < 0) {
    logoW *= -1;
  }

  document.querySelector('#mask').style.width = maskWidth;
  document.querySelector('#mask').style.height = maskHeight;

  document.querySelector('#loading-logo').style.marginTop =
    (maskHeight * 40) / 100; // 팝업창의 속성지정

  document.querySelector('#mask').style.display = 'block';
  window.maskEndTime = 0;

  if (window.maskTimer) {
    clearInterval(window.maskTimer);
  }

  window.maskTimer = setInterval(() => {
    if (window.maskEndTime > window.maskCurTime / 1000) {
      maskOff();
    }
    window.maskEndTime++;
  }, 1000);
}

export function maskOff() {
  clearInterval(window.maskTimer);
  if (document.querySelector('#mask')) {
    document.querySelector('#mask').style.display = 'none';
  }
}
