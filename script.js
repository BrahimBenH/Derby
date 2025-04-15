document.addEventListener("DOMContentLoaded", () => {
    // State management
    const state = {
      isDarkMode: true,
      scores: {
        eagles: 0,
        lions: 0,
      },
      powerUps: {
        eaglesGoalSize: "normal", // 'bigger', 'smaller', 'normal'
        lionsGoalSize: "normal", // 'bigger', 'smaller', 'normal'
        eaglesWeather: "normal", // 'storm', 'normal'
        lionsWeather: "normal", // 'storm', 'normal'
        pointMultiplier: false, // true/false for x2
      },
      centerLights: {
        red: false,
        green: false,
        blue: false,
      },
      powerUpMovement: {
        position: 50, // 0-100 representing position on field (0 = eagles side, 100 = lions side)
        type: "none", // 'powerup', 'powerdown', 'none'
        active: false, // whether the power-up/down is currently moving
      },
    }
  
    // DOM Elements
    const themeToggle = document.getElementById("theme-toggle")
    const sunIcon = document.getElementById("sun-icon")
    const moonIcon = document.getElementById("moon-icon")
    const body = document.body
  
    const eaglesGoal = document.querySelector(".eagles-goal")
    const lionsGoal = document.querySelector(".lions-goal")
    const centerLight = document.querySelector(".center-light")
    const lightFixture = document.querySelector(".light-fixture")
    const eaglesWeather = document.querySelector(".eagles-weather")
    const lionsWeather = document.querySelector(".lions-weather")
    const powerSpotlight = document.querySelector(".power-spotlight")
    const pointMultiplier = document.querySelector(".point-multiplier")
  
    const scoreDisplays = {
      eagles: document.querySelectorAll(".eagles-field-score .score-value, .eagles-card .score-value"),
      lions: document.querySelectorAll(".lions-field-score .score-value, .lions-card .score-value"),
    }
  
    const statusBadges = {
      eaglesGoalSize: document.querySelector(".eagles-card .goal-size"),
      lionsGoalSize: document.querySelector(".lions-card .goal-size"),
      eaglesWeather: document.querySelector(".eagles-card .weather"),
      lionsWeather: document.querySelector(".lions-card .weather"),
    }
  
    const lightButtons = document.querySelectorAll(".light-btn")
    const powerTypeButtons = document.querySelectorAll(".power-type-btn")
    const directionButtons = document.querySelectorAll(".direction-btn")
    const powerStatusBadge = document.querySelector(".power-status-badge")
    const powerToggles = document.querySelectorAll(".power-toggle")
  
    // Add these variables to access the mascot elements
    const eaglesHappyMascot = document.querySelector(".eagles-mascot.happy")
    const eaglesSadMascot = document.querySelector(".eagles-mascot.sad")
    const lionsHappyMascot = document.querySelector(".lions-mascot.happy")
    const lionsSadMascot = document.querySelector(".lions-mascot.sad")
  
    // Theme Toggle
    themeToggle.addEventListener("click", toggleTheme)
  
    function toggleTheme() {
      state.isDarkMode = !state.isDarkMode
  
      if (state.isDarkMode) {
        body.classList.remove("light-mode")
        body.classList.add("dark-mode")
        sunIcon.classList.remove("hidden")
        moonIcon.classList.add("hidden")
      } else {
        body.classList.remove("dark-mode")
        body.classList.add("light-mode")
        sunIcon.classList.add("hidden")
        moonIcon.classList.remove("hidden")
      }
    }
  
    // Score Controls
    document.querySelectorAll(".score-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const team = this.dataset.team
        const action = this.classList.contains("increment") ? "increment" : "decrement"
  
        if (action === "increment") {
          incrementScore(team)
        } else {
          decrementScore(team)
        }
      })
    })
  
    // Modify the incrementScore function to show happy mascots when scoring
    function incrementScore(team) {
      state.scores[team] += state.powerUps.pointMultiplier ? 2 : 1
      updateScoreDisplays(team)
      animateScoreChange(team)
  
      // Show happy mascot when scoring
      if (team === "eagles") {
        showMascot(eaglesHappyMascot)
      } else {
        showMascot(lionsHappyMascot)
      }
    }
  
    function decrementScore(team) {
      state.scores[team] = Math.max(0, state.scores[team] - 1)
      updateScoreDisplays(team)
      animateScoreChange(team)
    }
  
    function updateScoreDisplays(team) {
      scoreDisplays[team].forEach((display) => {
        display.textContent = state.scores[team]
      })
    }
  
    function animateScoreChange(team) {
      scoreDisplays[team].forEach((display) => {
        display.classList.add("score-change")
        setTimeout(() => {
          display.classList.remove("score-change")
        }, 500)
      })
    }
  
    // Center Light Controls
    lightButtons.forEach((btn) => {
      btn.addEventListener("click", function () {
        const color = this.dataset.color
        toggleCenterLight(color)
      })
    })
  
    function toggleCenterLight(color) {
      // Reset all lights
      centerLight.classList.remove("red", "green", "blue", "active")
      state.centerLights = { red: false, green: false, blue: false }
  
      lightButtons.forEach((btn) => btn.classList.remove("active"))
  
      if (color === "off") return
  
      // Set the selected light
      centerLight.classList.add(color, "active")
      state.centerLights[color] = true
  
      document.querySelector(`.light-btn[data-color="${color}"]`).classList.add("active")
    }
  
    // Power-up/down Movement Controls
    powerTypeButtons.forEach((btn) => {
      btn.addEventListener("click", function () {
        const type = this.dataset.type
        startPowerUpMovement(type)
      })
    })
  
    directionButtons.forEach((btn) => {
      btn.addEventListener("click", function () {
        const direction = this.dataset.direction
        movePowerUp(direction)
      })
    })
  
    function startPowerUpMovement(type) {
      state.powerUpMovement = {
        position: 50,
        type,
        active: true,
      }
  
      powerTypeButtons.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.type === type)
      })
  
      directionButtons.forEach((btn) => {
        btn.disabled = false
      })
  
      powerSpotlight.classList.remove("hidden", "powerup", "powerdown")
      powerSpotlight.classList.add(type)
      powerSpotlight.style.left = `calc(${state.powerUpMovement.position}% - 30px)`
  
      const spotlightSymbol = powerSpotlight.querySelector(".spotlight-symbol")
      spotlightSymbol.textContent = type === "powerup" ? "+" : "-"
  
      powerStatusBadge.textContent = type === "powerup" ? "Power-up Active" : "Power-down Active"
      powerStatusBadge.classList.remove("powerup", "powerdown")
      powerStatusBadge.classList.add(type)
  
      // Start auto-movement
      startAutoMovement()
    }
  
    function movePowerUp(direction) {
      if (!state.powerUpMovement.active) return
  
      state.powerUpMovement.position += direction === "left" ? -10 : 10
      state.powerUpMovement.position = Math.max(0, Math.min(100, state.powerUpMovement.position))
  
      powerSpotlight.style.left = `calc(${state.powerUpMovement.position}% - 30px)`
  
      // Check if power-up/down reached a team's side
      if (state.powerUpMovement.position <= 0) {
        // Reached Eagles side
        applyPowerToTeam("eagles")
      } else if (state.powerUpMovement.position >= 100) {
        // Reached Lions side
        applyPowerToTeam("lions")
      }
    }
  
    // Modify the applyPowerToTeam function to show mascots
    function applyPowerToTeam(team) {
      if (state.powerUpMovement.type === "powerup") {
        // Apply power-up: make goal bigger
        state.powerUps[`${team}GoalSize`] = "bigger"
  
        // Show happy mascot
        if (team === "eagles") {
          showMascot(eaglesHappyMascot)
        } else {
          showMascot(lionsHappyMascot)
        }
      } else if (state.powerUpMovement.type === "powerdown") {
        // Apply power-down: make goal smaller
        state.powerUps[`${team}GoalSize`] = "smaller"
  
        // Show sad mascot
        if (team === "eagles") {
          showMascot(eaglesSadMascot)
        } else {
          showMascot(lionsSadMascot)
        }
      }
  
      updateGoalSize(team)
      updateStatusBadges()
  
      // Reset power-up movement
      resetPowerUpMovement()
    }
  
    // Add a function to show mascots temporarily
    function showMascot(mascotElement) {
      // Hide all mascots first
      eaglesHappyMascot.classList.add("hidden")
      eaglesSadMascot.classList.add("hidden")
      lionsHappyMascot.classList.add("hidden")
      lionsSadMascot.classList.add("hidden")
  
      // Show the selected mascot
      mascotElement.classList.remove("hidden")
  
      // Hide it after 3 seconds
      setTimeout(() => {
        mascotElement.classList.add("hidden")
      }, 3000)
    }
  
    function resetPowerUpMovement() {
      state.powerUpMovement = {
        position: 50,
        type: "none",
        active: false,
      }
  
      powerSpotlight.classList.add("hidden")
      powerSpotlight.classList.remove("powerup", "powerdown")
  
      powerTypeButtons.forEach((btn) => {
        btn.classList.remove("active")
      })
  
      directionButtons.forEach((btn) => {
        btn.disabled = true
      })
  
      powerStatusBadge.textContent = "No Power Active"
      powerStatusBadge.classList.remove("powerup", "powerdown")
  
      // Clear auto-movement
      if (autoMovementInterval) {
        clearInterval(autoMovementInterval)
        autoMovementInterval = null
      }
    }
  
    let autoMovementInterval = null
  
    function startAutoMovement() {
      if (autoMovementInterval) {
        clearInterval(autoMovementInterval)
      }
  
      autoMovementInterval = setInterval(() => {
        // Slight random movement to make it look more natural
        const randomDirection = Math.random() > 0.5 ? "left" : "right"
        movePowerUp(randomDirection)
      }, 1000)
    }
  
    // Power Controls
    powerToggles.forEach((toggle) => {
      toggle.addEventListener("click", function () {
        const control = this.dataset.control
        togglePower(control, this)
      })
    })
  
    function togglePower(control, element) {
      switch (control) {
        case "eaglesGoalSize":
        case "lionsGoalSize":
          toggleGoalSize(control.replace("GoalSize", ""))
          break
        case "eaglesWeather":
        case "lionsWeather":
          toggleWeather(control.replace("Weather", ""))
          break
        case "pointMultiplier":
          togglePointMultiplier()
          break
      }
  
      updatePowerToggleUI(control, element)
    }
  
    // Also modify the toggleGoalSize function to show mascots when manually toggled
    function toggleGoalSize(team) {
      const currentSize = state.powerUps[`${team}GoalSize`]
      let newSize = "normal"
  
      if (currentSize === "normal") {
        newSize = "bigger"
        // Show happy mascot when manually setting to bigger
        if (team === "eagles") {
          showMascot(eaglesHappyMascot)
        } else {
          showMascot(lionsHappyMascot)
        }
      } else if (currentSize === "bigger") {
        newSize = "smaller"
        // Show sad mascot when manually setting to smaller
        if (team === "eagles") {
          showMascot(eaglesSadMascot)
        } else {
          showMascot(lionsSadMascot)
        }
      } else if (currentSize === "smaller") {
        newSize = "normal"
        // No mascot for normal state
      }
  
      state.powerUps[`${team}GoalSize`] = newSize
      updateGoalSize(team)
      updateStatusBadges()
    }
  
    function updateGoalSize(team) {
      const goal = team === "eagles" ? eaglesGoal : lionsGoal
      const size = state.powerUps[`${team}GoalSize`]
  
      goal.classList.remove("normal", "bigger", "smaller")
      goal.classList.add(size)
    }
  
    // Modify the toggleWeather function to show sad mascots during storms
    function toggleWeather(team) {
      const currentWeather = state.powerUps[`${team}Weather`]
      const newWeather = currentWeather === "normal" ? "storm" : "normal"
  
      state.powerUps[`${team}Weather`] = newWeather
      updateWeather(team)
      updateStatusBadges()
  
      // Show sad mascot when storm is activated
      if (newWeather === "storm") {
        if (team === "eagles") {
          showMascot(eaglesSadMascot)
        } else {
          showMascot(lionsSadMascot)
        }
      }
    }
  
    function updateWeather(team) {
      const weatherEffect = team === "eagles" ? eaglesWeather : lionsWeather
      const isStorm = state.powerUps[`${team}Weather`] === "storm"
  
      if (isStorm) {
        weatherEffect.classList.remove("hidden")
        createWeatherEffects(weatherEffect)
      } else {
        weatherEffect.classList.add("hidden")
        clearWeatherEffects(weatherEffect)
      }
    }
  
    function createWeatherEffects(weatherElement) {
      // Create rain drops
      const rainContainer = weatherElement.querySelector(".rain-container")
      rainContainer.innerHTML = ""
  
      for (let i = 0; i < 20; i++) {
        const rainDrop = document.createElement("div")
        rainDrop.className = "rain-drop"
        rainDrop.style.left = `${Math.random() * 100}%`
        rainDrop.style.top = `-20px`
        rainDrop.style.animationDuration = `${0.6 + Math.random() * 0.3}s`
        rainDrop.style.animationDelay = `${Math.random() * 0.5}s`
        rainContainer.appendChild(rainDrop)
      }
  
      // Create lightning
      const lightningContainer = weatherElement.querySelector(".lightning-container")
      lightningContainer.innerHTML = ""
  
      for (let i = 0; i < 3; i++) {
        const lightning = document.createElement("div")
        lightning.className = "lightning"
        lightning.style.top = "10%"
        lightning.style.left = `${20 + Math.random() * 60}%`
        lightning.style.animationDuration = "0.5s"
        lightning.style.animationDelay = `${2 + Math.random() * 4}s`
  
        lightning.innerHTML = `
            <svg width="30" height="60" viewBox="0 0 30 60" fill="none">
              <path d="M15 0 L18 25 L25 28 L12 60 L10 35 L3 32 L15 0" fill="#f0f9ff" fill-opacity="0.9" />
            </svg>
          `
  
        lightningContainer.appendChild(lightning)
      }
    }
  
    function clearWeatherEffects(weatherElement) {
      const rainContainer = weatherElement.querySelector(".rain-container")
      const lightningContainer = weatherElement.querySelector(".lightning-container")
  
      rainContainer.innerHTML = ""
      lightningContainer.innerHTML = ""
    }
  
    function togglePointMultiplier() {
      state.powerUps.pointMultiplier = !state.powerUps.pointMultiplier
  
      if (state.powerUps.pointMultiplier) {
        pointMultiplier.classList.remove("hidden")
        document.querySelectorAll(".team-score").forEach((el) => {
          el.classList.add("multiplier")
        })
      } else {
        pointMultiplier.classList.add("hidden")
        document.querySelectorAll(".team-score").forEach((el) => {
          el.classList.remove("multiplier")
        })
      }
    }
  
    function updatePowerToggleUI(control, element) {
      const value = state.powerUps[control]
      const toggleLabel = element.querySelector(".toggle-label")
  
      // Remove all color classes
      element.classList.remove("green", "red", "blue", "yellow", "active")
  
      if (control.includes("GoalSize")) {
        toggleLabel.textContent = value.charAt(0).toUpperCase() + value.slice(1)
  
        if (value === "bigger") {
          element.classList.add("green", "active")
        } else if (value === "smaller") {
          element.classList.add("red", "active")
        }
      } else if (control.includes("Weather")) {
        toggleLabel.textContent = value.charAt(0).toUpperCase() + value.slice(1)
  
        if (value === "storm") {
          element.classList.add("blue", "active")
        }
      } else if (control === "pointMultiplier") {
        toggleLabel.textContent = value ? "Active" : "Inactive"
  
        if (value) {
          element.classList.add("yellow", "active")
        }
      }
    }
  
    function updateStatusBadges() {
      // Update goal size badges
      statusBadges.eaglesGoalSize.textContent = state.powerUps.eaglesGoalSize.toUpperCase()
      statusBadges.lionsGoalSize.textContent = state.powerUps.lionsGoalSize.toUpperCase()
  
      // Update weather badges
      statusBadges.eaglesWeather.textContent = state.powerUps.eaglesWeather.toUpperCase()
      statusBadges.lionsWeather.textContent = state.powerUps.lionsWeather.toUpperCase()
  
      // Add/remove active class for animation
      statusBadges.eaglesGoalSize.classList.toggle("active", state.powerUps.eaglesGoalSize !== "normal")
      statusBadges.lionsGoalSize.classList.toggle("active", state.powerUps.lionsGoalSize !== "normal")
      statusBadges.eaglesWeather.classList.toggle("active", state.powerUps.eaglesWeather === "storm")
      statusBadges.lionsWeather.classList.toggle("active", state.powerUps.lionsWeather === "storm")
    }
  
    // Add CSS animations for rain and lightning
    const style = document.createElement("style")
    style.textContent = `
        .rain-drop {
          position: absolute;
          width: 2px;
          height: 2.5rem;
          background-color: rgba(191, 219, 254, 0.5);
          transform: rotate(15deg);
          animation: rain-fall linear infinite;
        }
        
        @keyframes rain-fall {
          0% {
            top: -20px;
            opacity: 0.7;
          }
          100% {
            top: 120%;
            opacity: 0.3;
          }
        }
        
        .lightning {
          position: absolute;
          opacity: 0;
          animation: lightning-flash ease-out infinite;
        }
        
        @keyframes lightning-flash {
          0% {
            opacity: 0;
          }
          25% {
            opacity: 1;
          }
          40% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        
        .score-change {
          animation: score-pop 0.5s ease-out;
        }
        
        @keyframes score-pop {
          0% {
            transform: scale(1.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `
    document.head.appendChild(style)
  
    // Initialize UI
    function initializeUI() {
      // Set initial theme
      if (state.isDarkMode) {
        body.classList.add("dark-mode")
        sunIcon.classList.remove("hidden")
        moonIcon.classList.add("hidden")
      } else {
        body.classList.add("light-mode")
        sunIcon.classList.add("hidden")
        moonIcon.classList.remove("hidden")
      }
  
      // Set initial scores
      updateScoreDisplays("eagles")
      updateScoreDisplays("lions")
  
      // Set initial goal sizes
      updateGoalSize("eagles")
      updateGoalSize("lions")
  
      // Set initial weather effects
      updateWeather("eagles")
      updateWeather("lions")
  
      // Set initial point multiplier
      if (state.powerUps.pointMultiplier) {
        pointMultiplier.classList.remove("hidden")
      } else {
        pointMultiplier.classList.add("hidden")
      }
  
      // Set initial status badges
      updateStatusBadges()
  
      // Set initial power toggles UI
      powerToggles.forEach((toggle) => {
        const control = toggle.dataset.control
        updatePowerToggleUI(control, toggle)
      })
  
      // Disable direction buttons initially
      directionButtons.forEach((btn) => {
        btn.disabled = true
      })
    }
  
    // Start the application
    initializeUI()
  })
  