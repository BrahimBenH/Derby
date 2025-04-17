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
      eaglesPointMultiplier: false, // true/false for x2
      lionsPointMultiplier: false, // true/false for x2
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
  const eaglesMultiplier = document.querySelector(".eagles-multiplier-indicator")
  const lionsMultiplier = document.querySelector(".lions-multiplier-indicator")

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
    // Apply team-specific multiplier
    state.scores[team] += state.powerUps[`${team}PointMultiplier`] ? 2 : 1
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

      // Update toggle controls based on the light color
      updateToggleControlsAvailability()
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

  // Function to update toggle controls availability based on light color
  function updateToggleControlsAvailability() {
    const isRedOn = state.centerLights.red
    const isGreenOn = state.centerLights.green
    const isBlueOn = state.centerLights.blue

    // Update visual state for all toggles
    powerToggles.forEach((toggle) => {
      const control = toggle.dataset.control

      if (control.includes("PointMultiplier")) {
        // Point multiplier toggle - only active when blue light is on
        toggle.classList.toggle("disabled", !isBlueOn)
      } else if (control.includes("GoalSize")) {
        // Goal size toggles - only active when red or green light is on
        toggle.classList.toggle("disabled", !isRedOn && !isGreenOn)
      } else if (control.includes("Weather")) {
        // Weather toggles - only active when red or green light is on
        toggle.classList.toggle("disabled", !isRedOn && !isGreenOn)
      }
    })
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

    // Turn off the center light after applying power
    toggleCenterLight("off")
    updateToggleControlsAvailability()

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
      const team = control.includes("eagles") ? "eagles" : "lions"
      const type = control.replace(`${team}`, "").toLowerCase()

      // Check if we're turning off an active effect (always allowed)
      const isActive = state.powerUps[control] !== "normal" && state.powerUps[control] !== false

      // If not active and trying to turn on, check light conditions
      if (!isActive) {
        if (type.includes("pointmultiplier")) {
          // Point multiplier can only be toggled when blue light is on
          if (!state.centerLights.blue) {
            showNotification("Point multiplier can only be toggled when blue light is on")
            return
          }
        } else if (type.includes("goalsize")) {
          // Goal size can only be toggled when red or green light is on
          if (!state.centerLights.red && !state.centerLights.green) {
            showNotification("Goal size can only be toggled when red or green light is on")
            return
          }
        } else if (type.includes("weather")) {
          // Weather can only be toggled when red or green light is on
          if (!state.centerLights.red && !state.centerLights.green) {
            showNotification("Weather can only be toggled when red or green light is on")
            return
          }
        }
      }

      togglePower(control, this)
    })
  })

  // Add notification function
  function showNotification(message) {
    // Check if notification already exists
    let notification = document.querySelector(".toggle-notification")

    if (!notification) {
      notification = document.createElement("div")
      notification.className = "toggle-notification"
      document.body.appendChild(notification)
    }

    notification.textContent = message
    notification.classList.add("show")

    setTimeout(() => {
      notification.classList.remove("show")
    }, 3000)
  }

  // Update the togglePower function to allow turning off effects anytime
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
      case "eaglesPointMultiplier":
      case "lionsPointMultiplier":
        togglePointMultiplier(control.replace("PointMultiplier", ""))
        break
    }

    updatePowerToggleUI(control, element)
  }

  // Also modify the toggleGoalSize function to show mascots when manually toggled
  function toggleGoalSize(team) {
    const currentSize = state.powerUps[`${team}GoalSize`]
    let newSize = "normal"

    // If already has an effect, toggle it off
    if (currentSize !== "normal") {
      newSize = "normal"
    }
    // Otherwise, apply effect based on active light color
    else if (state.centerLights.red) {
      newSize = "smaller" // Red light makes goal smaller

      // Show sad mascot when making goal smaller
      if (team === "eagles") {
        showMascot(eaglesSadMascot)
      } else {
        showMascot(lionsSadMascot)
      }
    } else if (state.centerLights.green) {
      newSize = "bigger" // Green light makes goal bigger

      // Show happy mascot when making goal bigger
      if (team === "eagles") {
        showMascot(eaglesHappyMascot)
      } else {
        showMascot(lionsHappyMascot)
      }
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

  // Modify the toggleWeather function to apply storm based on light color
  function toggleWeather(team) {
    const currentWeather = state.powerUps[`${team}Weather`]
    let newWeather = "normal"
    let targetTeam = team // Default to same team

    // If already has an effect, toggle it off
    if (currentWeather === "storm") {
      newWeather = "normal"
      updateWeatherEffect(team, "normal")
    }
    // Otherwise, apply effect based on active light color
    else if (state.centerLights.red || state.centerLights.green) {
      newWeather = "storm"

      // Determine which team gets the storm based on light color
      if (state.centerLights.green) {
        // Green light: Apply storm to opposite team
        targetTeam = team === "eagles" ? "lions" : "eagles"

        // Show sad mascot for the team getting the storm
        if (targetTeam === "eagles") {
          showMascot(eaglesSadMascot)
        } else {
          showMascot(lionsSadMascot)
        }
      } else {
        // Red light: Apply storm to same team
        // Show sad mascot for the team getting the storm
        if (team === "eagles") {
          showMascot(eaglesSadMascot)
        } else {
          showMascot(lionsSadMascot)
        }
      }

      // Apply the storm effect to the target team
      updateWeatherEffect(targetTeam, "storm")
    }

    // Update the state for the team that was toggled
    state.powerUps[`${team}Weather`] = newWeather
    updateStatusBadges()
  }

  // New function to update weather effect for a specific team
  function updateWeatherEffect(team, weatherState) {
    const weatherEffect = team === "eagles" ? eaglesWeather : lionsWeather
    const isStorm = weatherState === "storm"

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

  // Replace the togglePointMultiplier function with a team-specific version
  function togglePointMultiplier(team) {
    // If already active, toggle it off
    if (state.powerUps[`${team}PointMultiplier`]) {
      state.powerUps[`${team}PointMultiplier`] = false
    }
    // Otherwise, only toggle on if blue light is on
    else if (state.centerLights.blue) {
      state.powerUps[`${team}PointMultiplier`] = true
    }

    updatePointMultiplierDisplay()
  }

  // Add a new function to update point multiplier display
  function updatePointMultiplierDisplay() {
    // Update Eagles multiplier
    if (state.powerUps.eaglesPointMultiplier) {
      document.querySelector(".eagles-field-score").classList.add("multiplier")
      eaglesMultiplier.classList.remove("hidden")
    } else {
      document.querySelector(".eagles-field-score").classList.remove("multiplier")
      eaglesMultiplier.classList.add("hidden")
    }

    // Update Lions multiplier
    if (state.powerUps.lionsPointMultiplier) {
      document.querySelector(".lions-field-score").classList.add("multiplier")
      lionsMultiplier.classList.remove("hidden")
    } else {
      document.querySelector(".lions-field-score").classList.remove("multiplier")
      lionsMultiplier.classList.add("hidden")
    }
  }

  function updatePowerToggleUI(control, element) {
    let value
    const toggleLabel = element.querySelector(".toggle-label")

    // Remove all color classes
    element.classList.remove("green", "red", "blue", "yellow", "active")

    if (control.includes("GoalSize")) {
      value = state.powerUps[control]
      toggleLabel.textContent = value.charAt(0).toUpperCase() + value.slice(1)

      if (value === "bigger") {
        element.classList.add("green", "active")
      } else if (value === "smaller") {
        element.classList.add("red", "active")
      }
    } else if (control.includes("Weather")) {
      value = state.powerUps[control]
      toggleLabel.textContent = value.charAt(0).toUpperCase() + value.slice(1)

      if (value === "storm") {
        // Apply color based on which light is active
        if (state.centerLights.green) {
          element.classList.add("green", "active")
        } else if (state.centerLights.red) {
          element.classList.add("red", "active")
        } else {
          element.classList.add("blue", "active")
        }
      }
    } else if (control.includes("PointMultiplier")) {
      value = state.powerUps[control]
      toggleLabel.textContent = value ? "Active" : "Inactive"

      if (value) {
        element.classList.add("blue", "active")
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
    
    .power-toggle.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .toggle-notification {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .toggle-notification.show {
      opacity: 1;
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
    updateWeatherEffect("eagles", "normal")
    updateWeatherEffect("lions", "normal")

    // Set initial point multipliers
    updatePointMultiplierDisplay()

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

    // Set initial toggle controls availability
    updateToggleControlsAvailability()
  }

  // Start the application
  initializeUI()
})
