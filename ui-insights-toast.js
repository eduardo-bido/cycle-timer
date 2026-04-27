// ui-insights-toast.js
window.InsightsToast = (function() {
  var container = null;
  var displayDuration = 6000; // 6 seconds

  function initContainer() {
    if (!container) {
      container = document.createElement('div');
      container.id = 'insights-toast-container';
      container.className = 'insights-toast-container';
      // Append right into the app to potentially stay over the main app UI
      document.body.appendChild(container);
    }
  }

  /**
   * Mostra a notificação
   * @param {string} type - 'critical', 'warning', 'info', 'success'
   * @param {string} title 
   * @param {string} message 
   */
  function show(type, title, message) {
    initContainer();

    var toast = document.createElement('div');
    toast.className = 'insight-toast insight-toast--' + type;

    var iconElement = document.createElement('div');
    iconElement.className = 'insight-toast-icon';
    
    var iconImg = document.createElement('img');
    var iconPath = 'assets/info.png';
    if (type === 'critical') iconPath = 'assets/critical.png';
    else if (type === 'warning') iconPath = 'assets/warning.png';
    else if (type === 'success') iconPath = 'assets/success.png';
    
    iconImg.src = iconPath;
    iconImg.alt = type;
    iconElement.appendChild(iconImg);

    var contentElement = document.createElement('div');
    contentElement.className = 'insight-toast-content';

    var titleElement = document.createElement('div');
    titleElement.className = 'insight-toast-title';
    titleElement.textContent = title;

    var messageElement = document.createElement('div');
    messageElement.className = 'insight-toast-message';
    messageElement.textContent = message;

    var closeElement = document.createElement('button');
    closeElement.className = 'insight-toast-close';
    closeElement.innerHTML = '&times;';
    closeElement.onclick = function() {
      removeToast(toast);
    };

    contentElement.appendChild(titleElement);
    contentElement.appendChild(messageElement);

    toast.appendChild(iconElement);
    toast.appendChild(contentElement);
    toast.appendChild(closeElement);

    container.prepend(toast);

    // Trigger reflow to start animation
    void toast.offsetWidth;
    toast.classList.add('insight-toast--enter');

    // Auto close
    setTimeout(function() {
      removeToast(toast);
    }, displayDuration);
  }

  function removeToast(toast) {
    if (toast && toast.parentNode) {
      toast.classList.remove('insight-toast--enter');
      toast.classList.add('insight-toast--exit');
      
      // Esperar a animação terminar antes de remover do DOM
      setTimeout(function() {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 400);
    }
  }

  return {
    show: show
  };
})();
