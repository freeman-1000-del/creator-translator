(function () {
  async function logVisit(eventName, detail) {
    try {
      await fetch('/api/log-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          source: 'homepage',
          page_name: 'index',
          event_name: eventName,
          detail: detail || '',
          user_agent: navigator.userAgent
        })
      });
    } catch (e) {}
  }

  document.addEventListener('DOMContentLoaded', function () {
    logVisit('page_view', 'index');

    document.getElementById('loginModalBtn')?.addEventListener('click', function () {
      logVisit('login_click', 'topbar');
    });

    document.getElementById('signupModalBtn')?.addEventListener('click', function () {
      logVisit('signup_click', 'topbar_disabled');
    });

    document.getElementById('btnPlanCenter')?.addEventListener('click', function () {
      logVisit('plan_page_click', 'center');
    });

    document.getElementById('btnTrialCenter')?.addEventListener('click', function () {
      logVisit('free_trial_click', 'center');
    });

    document.getElementById('btnSubscriberCenter')?.addEventListener('click', function () {
      logVisit('subscriber_order_click', 'center');
    });
  });
})();