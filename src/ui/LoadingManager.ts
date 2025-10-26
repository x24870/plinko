export interface LoadingManager {
  loadingScreen: HTMLElement;
  loadingText: HTMLElement;
  loadingProgress: HTMLElement;
  currentProgress: number;
}

export function createLoadingManager(): LoadingManager {
  const loadingScreen = document.getElementById("loading-screen");
  const loadingText = document.querySelector(".loading-text") as HTMLElement;
  const loadingProgress = document.getElementById("loading-progress");

  if (!loadingScreen || !loadingText || !loadingProgress) {
    console.warn("Loading screen elements not found");
    return {
      loadingScreen: document.createElement("div"),
      loadingText: document.createElement("p"),
      loadingProgress: document.createElement("div"),
      currentProgress: 0,
    };
  }

  return {
    loadingScreen,
    loadingText,
    loadingProgress,
    currentProgress: 0,
  };
}

export function updateLoadingProgress(
  manager: LoadingManager,
  progress: number,
  message?: string
): void {
  manager.currentProgress = Math.min(100, Math.max(0, progress));
  manager.loadingProgress.style.width = `${manager.currentProgress}%`;

  if (message) {
    manager.loadingText.textContent = message;
  }
}

export function hideLoadingScreen(manager: LoadingManager): void {
  // Complete progress
  updateLoadingProgress(manager, 100, "Ready!");

  // Wait a bit then fade out
  setTimeout(() => {
    manager.loadingScreen.classList.add("loaded");
    console.log("Loading screen hidden");

    // Remove from DOM after transition
    setTimeout(() => {
      manager.loadingScreen.style.display = "none";
    }, 500);
  }, 300);
}

export function showLoadingScreen(manager: LoadingManager): void {
  manager.loadingScreen.classList.remove("loaded");
  updateLoadingProgress(manager, 0, "Loading game...");
}

// Auto-update progress based on tasks
export function createProgressTracker(manager: LoadingManager) {
  const tasks = {
    scene: false,
    physics: false,
    entities: false,
    systems: false,
    ui: false,
  };

  let isComplete = false;

  const updateProgress = () => {
    const completed = Object.values(tasks).filter(Boolean).length;
    const total = Object.keys(tasks).length;
    const progress = (completed / total) * 100;
    updateLoadingProgress(manager, progress);
  };

  // Emergency timeout: force hide after 15 seconds
  const emergencyTimeout = setTimeout(() => {
    if (!isComplete) {
      console.warn("Loading timeout - forcing hide loading screen");
      hideLoadingScreen(manager);
    }
  }, 15000);

  return {
    markSceneReady: () => {
      console.log("✓ Scene ready");
      tasks.scene = true;
      updateLoadingProgress(manager, 20, "Scene created...");
      updateProgress();
    },
    markPhysicsReady: () => {
      console.log("✓ Physics ready");
      tasks.physics = true;
      updateLoadingProgress(manager, 40, "Physics initialized...");
      updateProgress();
    },
    markEntitiesReady: () => {
      console.log("✓ Entities ready");
      tasks.entities = true;
      updateLoadingProgress(manager, 60, "Game entities ready...");
      updateProgress();
    },
    markSystemsReady: () => {
      console.log("✓ Systems ready");
      tasks.systems = true;
      updateLoadingProgress(manager, 80, "Systems ready...");
      updateProgress();
    },
    markUIReady: () => {
      console.log("✓ UI ready - hiding loading screen");
      tasks.ui = true;
      isComplete = true;
      clearTimeout(emergencyTimeout);
      updateLoadingProgress(manager, 100, "Ready!");
      updateProgress();
      setTimeout(() => hideLoadingScreen(manager), 300);
    },
  };
}
