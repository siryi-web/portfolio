let apiHandle = null;
let isInitialized = false;

function findAPI(win) {
  let findAttempts = 0;
  while ((win.API == null) && (win.parent != null) && (win.parent != win)) {
    findAttempts++;
    if (findAttempts > 10) return null;
    win = win.parent;
  }
  return win.API;
}

function getAPI() {
  if (apiHandle == null) {
    apiHandle = findAPI(window);
    if ((apiHandle == null) && (window.opener != null)) {
      apiHandle = findAPI(window.opener);
    }
  }
  return apiHandle;
}

function initScorm() {
  const api = getAPI();
  if (api && !isInitialized) {
    const result = api.LMSInitialize("");
    if (result === "true" || result === true) {
      isInitialized = true;
      api.LMSSetValue("cmi.core.lesson_status", "incomplete");
      api.LMSCommit("");
      console.log("SCORM 1.2 Initialized Successfully.");
    }
  } else if (!api) {
    console.info("SCORM API not found. Running in standalone mode.");
  }
}

function recordPortfolioCompletion(score = 100) {
  const api = getAPI();
  if (api) {
    if (!isInitialized) {
      initScorm();
    }
    api.LMSSetValue("cmi.core.score.raw", String(score));
    api.LMSSetValue("cmi.core.lesson_status", "completed");
    api.LMSCommit("");
    api.LMSFinish("");
    isInitialized = false;
  }
}

function submitScoreAndComplete(score, passingScore = 80) {
  const api = getAPI();
  const passed = score >= passingScore;
  if (api) {
    if (!isInitialized) {
      initScorm();
    }
    api.LMSSetValue("cmi.core.score.raw", score.toString());
    api.LMSSetValue("cmi.core.lesson_status", passed ? "passed" : "failed");
    api.LMSCommit("");
    api.LMSFinish("");
    isInitialized = false;
  }
}

window.addEventListener("load", () => {
  initScorm();
});
