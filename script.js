// Global variables
let currentMood = 3;
const moodEmojis = ["😢", "😕", "😐", "😊", "😄"];
let gratitudeEntries = JSON.parse(localStorage.getItem("gratitudeEntries")) || [];
let moodHistory = JSON.parse(localStorage.getItem("moodHistory")) || [];

// Initialize app
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
});

function initializeApp() {
  loadTheme();
  loadGratitudeHistory();
  getNewQuote();
  updateStats();
  setupMoodSlider();
}

// Theme Management
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";

  document.documentElement.setAttribute("data-theme", newTheme);
  document.getElementById("theme-icon").textContent =
    newTheme === "dark" ? " change the theme ☀️" : " change the theme 🌙";

  document.cookie = `theme=${newTheme}; path=/; max-age=31536000`;
  showFeedback(`Switched to ${newTheme} mode`);
}

function loadTheme() {
  const savedTheme = getCookie("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  document.getElementById("theme-icon").textContent =
    savedTheme === "dark" ? "☀️" : "🌙";
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

// Mood Tracking
function setupMoodSlider() {
  const slider = document.getElementById("moodSlider");
  const display = document.getElementById("moodDisplay");

  slider.addEventListener("input", function () {
    currentMood = parseInt(this.value);
    display.textContent = moodEmojis[currentMood - 1];
    display.classList.add("pulse");
    setTimeout(() => display.classList.remove("pulse"), 500);
  });
}

function getMoodText(mood) {
  const moodTexts = ["terrible", "bad", "okay", "good", "amazing"];
  return moodTexts[mood - 1];
}

function saveMood() {
  const entry = {
    mood: currentMood,
    date: new Date().toISOString(),
  };
  moodHistory.unshift(entry);
  localStorage.setItem("moodHistory", JSON.stringify(moodHistory));
  document.getElementById("moodFeedback").textContent = `Mood saved: ${getMoodText(currentMood)} ${moodEmojis[currentMood - 1]}`;
  updateStats();
  showFeedback("Mood saved! ✨");
}

// Gratitude Journal
function saveGratitude() {
  const gratitudeText = document.getElementById("gratitudeText").value.trim();
  if (!gratitudeText) {
    showFeedback("Please write something you're grateful for!", "warning");
    return;
  }

  const newEntry = {
    id: Date.now(),
    text: gratitudeText,
    date: new Date().toISOString(),
    displayDate: new Date().toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
  };

  gratitudeEntries.unshift(newEntry);
  localStorage.setItem("gratitudeEntries", JSON.stringify(gratitudeEntries));
  document.getElementById("gratitudeText").value = "";
  loadGratitudeHistory();
  updateStats();
  showFeedback("Gratitude entry saved! 🙏");
}

function loadGratitudeHistory() {
  const container = document.getElementById("gratitudeEntries");
  container.innerHTML = "";
  gratitudeEntries.forEach((entry) => {
    const div = document.createElement("div");
    div.className = "gratitude-entry";
    div.innerHTML = `
      <div class="gratitude-entry-date">${entry.displayDate}</div>
      <div>${entry.text}</div>
    `;
    container.appendChild(div);
  });
}

// Motivational Quotes
function getNewQuote() {
  const quoteText = document.getElementById("quoteText");
  const quoteAuthor = document.getElementById("quoteAuthor");
  const quoteButton = document.getElementById("quoteButtonText");

  quoteButton.textContent = "Loading...";
  fetch("https://api.quotable.io/random")
    .then((response) => response.json())
    .then((data) => {
      quoteText.textContent = `"${data.content}"`;
      quoteAuthor.textContent = `- ${data.author}`;
      quoteButton.textContent = "Get New Quote";
    })
    .catch(() => {
      quoteText.textContent = "Could not load quote. Try again.";
      quoteAuthor.textContent = "";
      quoteButton.textContent = "Try Again";
    });
}

// Statistics
function updateStats() {
  document.getElementById("totalEntries").textContent = gratitudeEntries.length;
  const average = moodHistory.length
    ? (
        moodHistory.reduce((sum, entry) => sum + entry.mood, 0) /
        moodHistory.length
      ).toFixed(1)
    : 0;
  document.getElementById("averageMood").textContent = average;
  document.getElementById("streakDays").textContent = calculateStreak(gratitudeEntries);
}

function calculateStreak(entries) {
  if (entries.length === 0) return 0;
  const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
  let streak = 0;
  let currentDate = new Date();
  for (let entry of sorted) {
    if (new Date(entry.date).toDateString() === currentDate.toDateString()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// Utility Functions
function showFeedback(message, type = "success") {
  const feedback = document.getElementById("feedbackModal");
  const feedbackText = document.getElementById("feedbackText");
  feedbackText.textContent = message;
  feedback.style.background =
    type === "warning" ? "var(--warning-color)" : "var(--success-color)";
  feedback.classList.add("show");
  setTimeout(() => {
    feedback.classList.remove("show");
  }, 2000);
}

// Keyboard Shortcuts & Smooth Scroll

document.addEventListener("keydown", function (e) {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    if (document.activeElement === document.getElementById("gratitudeText")) {
      saveGratitude();
    }
  }
  if (e.key === "Escape") {
    if (document.activeElement === document.getElementById("gratitudeText")) {
      document.getElementById("gratitudeText").value = "";
    }
  }
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});
