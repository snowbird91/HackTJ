document.addEventListener('DOMContentLoaded', function() {

const OPENAI_API_KEY = "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";

function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with ID "${id}" not found in the DOM`);
        return null;
    }
    return element;
}

const taskInput = getElement('task-input');
const addTaskBtn = getElement('add-task');
const aiSuggestBtn = getElement('ai-suggest');
const customAiSuggestBtn = getElement('custom-ai-suggest');
const aiPromptInput = getElement('ai-prompt');
const tasksList = getElement('tasks-list');
const filterBtns = document.querySelectorAll('.filter-btn');
const categoryFilterBtns = document.querySelectorAll('.category-filter-btn');
const userLevelEl = getElement('user-level');
const currentXpEl = getElement('current-xp');
const xpNeededEl = getElement('xp-needed');
const xpProgressBar = getElement('xp-progress');
const streakDaysEl = getElement('streak-days');
const rewardModal = getElement('reward-modal');
const aiLoadingModal = getElement('ai-loading-modal');
const newLevelEl = getElement('new-level');
const newAchievementEl = getElement('new-achievement');
const closeModalBtn = document.querySelector('.close-btn');
const achievementsContainer = getElement('achievements-container');
const taskCategorySelect = getElement('task-category');
const priorityBtns = document.querySelectorAll('.priority-btn');
const startTimerBtn = getElement('start-timer');
const pauseTimerBtn = getElement('pause-timer');
const resetTimerBtn = getElement('reset-timer');
const minutesDisplay = getElement('minutes');
const secondsDisplay = getElement('seconds');
const modeBtns = document.querySelectorAll('.mode-btn');
const statsCompletedEl = getElement('stats-completed');
const statsAchievementsEl = getElement('stats-achievements');
const statsFocusTimeEl = getElement('stats-focus-time');
const statsHighestStreakEl = getElement('stats-highest-streak');

const resetAccountBtn = getElement('reset-account-btn');
const resetConfirmModal = getElement('reset-confirm-modal');
const confirmResetBtn = getElement('confirm-reset-btn');
const cancelResetBtn = getElement('cancel-reset-btn');
const closeResetModalBtn = getElement('close-reset-modal');

const customTimeBtn = getElement('custom-time-btn');
const customTimeContainer = getElement('custom-time-container');
const customTimeInput = getElement('custom-time-minutes');
const setCustomTimeBtn = getElement('set-custom-time');

const notificationContainer = getElement('notification-container');

const editTaskModal = document.getElementById('edit-task-modal') ? 
    getElement('edit-task-modal') : createEditTaskModal();
const editTaskInput = getElement('edit-task-input');
const saveEditTaskBtn = getElement('save-edit-task');
const cancelEditTaskBtn = getElement('cancel-edit-task');
let currentEditingTaskId = null;

const darkModeToggle = document.createElement('button');
darkModeToggle.id = 'dark-mode-toggle';
darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
darkModeToggle.title = 'Toggle Dark Mode';
document.body.appendChild(darkModeToggle);

let tasks = [];
let currentFilter = 'all';
let currentCategoryFilter = 'all';
let selectedPriority = 'medium';
let userStats = {
    level: 1,
    xp: 0,
    completedTasks: 0,
    streakDays: 0,
    highestStreak: 0,
    focusMinutes: 0,
    lastActive: new Date().toISOString().split('T')[0]
};
let achievements = initializeAchievements();

let timerInterval = null;
let timerRunning = false;
let timerTime = 25 * 60;
let timerInitialTime = timerTime;
let currentTimerMode = 'focus';


try {
    initializeApp();
} catch (error) {
    console.error("Error initializing app:", error);
}

function safeAddEventListener(element, event, handler) {
    if (element) {
        element.addEventListener(event, handler);
    }
}

safeAddEventListener(addTaskBtn, 'click', addTask);
safeAddEventListener(aiSuggestBtn, 'click', getAISuggestion);
safeAddEventListener(customAiSuggestBtn, 'click', getCustomAISuggestion);
safeAddEventListener(taskInput, 'keypress', e => {
    if (e.key === 'Enter') addTask();
});

filterBtns.forEach(btn => {
    safeAddEventListener(btn, 'click', () => {
        currentFilter = btn.dataset.filter;
        const activeBtn = document.querySelector('.filter-btn.active');
        if (activeBtn) activeBtn.classList.remove('active');
        btn.classList.add('active');
        renderTasks();
    });
});

categoryFilterBtns.forEach(btn => {
    safeAddEventListener(btn, 'click', () => {
        currentCategoryFilter = btn.dataset.category;
        const activeBtn = document.querySelector('.category-filter-btn.active');
        if (activeBtn) activeBtn.classList.remove('active');
        btn.classList.add('active');
        renderTasks();
    });
});

priorityBtns.forEach(btn => {
    safeAddEventListener(btn, 'click', () => {
        selectedPriority = btn.dataset.priority;
        const activeBtn = document.querySelector('.priority-btn.active');
        if (activeBtn) activeBtn.classList.remove('active');
        btn.classList.add('active');
    });
});

safeAddEventListener(startTimerBtn, 'click', startTimer);
safeAddEventListener(pauseTimerBtn, 'click', pauseTimer);
safeAddEventListener(resetTimerBtn, 'click', resetTimer);

modeBtns.forEach(btn => {
    safeAddEventListener(btn, 'click', () => {
        const activeBtn = document.querySelector('.mode-btn.active');
        if (activeBtn) activeBtn.classList.remove('active');
        btn.classList.add('active');
        
        const minutes = parseInt(btn.dataset.time) || 25;
        timerTime = minutes * 60;
        updateTimerDisplay();
        
        currentTimerMode = minutes === 25 ? 'focus' : 'break';
    });
});

safeAddEventListener(closeModalBtn, 'click', () => {
    if (rewardModal) rewardModal.style.display = 'none';
});

safeAddEventListener(resetAccountBtn, 'click', () => {
    if (resetConfirmModal) resetConfirmModal.style.display = 'flex';
});

safeAddEventListener(confirmResetBtn, 'click', resetAllUserData);
safeAddEventListener(cancelResetBtn, 'click', () => {
    if (resetConfirmModal) resetConfirmModal.style.display = 'none';
});
safeAddEventListener(closeResetModalBtn, 'click', () => {
    if (resetConfirmModal) resetConfirmModal.style.display = 'none';
});

safeAddEventListener(customTimeBtn, 'click', () => {
    if (customTimeContainer) {
        customTimeContainer.style.display = 'flex';
        
        const activeBtn = document.querySelector('.mode-btn.active');
        if (activeBtn) activeBtn.classList.remove('active');
        customTimeBtn.classList.add('active');
    }
});

safeAddEventListener(setCustomTimeBtn, 'click', () => {
    if (customTimeInput) {
        const minutes = parseInt(customTimeInput.value);
        
        if (isNaN(minutes) || minutes < 1) {
            showNotification("Please enter a valid number of minutes (at least 1)", "error");
            return;
        }
        
        if (minutes > 120) {
            showNotification("Maximum time allowed is 120 minutes", "warning");
            customTimeInput.value = "120";
            return;
        }
        
        timerTime = minutes * 60;
        updateTimerDisplay();
        
        currentTimerMode = minutes >= 15 ? 'focus' : 'break';
        
        if (customTimeContainer) {
            customTimeContainer.style.display = 'none';
        }
        
        showNotification(`Timer set to ${minutes} minutes`, "success");
    }
});

modeBtns.forEach(btn => {
    safeAddEventListener(btn, 'click', () => {
        const activeBtn = document.querySelector('.mode-btn.active');
        if (activeBtn) activeBtn.classList.remove('active');
        btn.classList.add('active');
        
        if (btn.dataset.time !== 'custom') {
            const minutes = parseInt(btn.dataset.time) || 25;
            timerTime = minutes * 60;
            updateTimerDisplay();
            
            currentTimerMode = minutes === 25 ? 'focus' : 'break';
            
            if (customTimeContainer) {
                customTimeContainer.style.display = 'none';
            }
        }
    });
});

function setCookie(name, value, days = 365) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${JSON.stringify(value)};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
            try {
                return JSON.parse(c.substring(nameEQ.length, c.length));
            } catch (e) {
                console.error("Error parsing cookie:", e);
                return null;
            }
        }
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

function initializeApp() {
    loadDataFromCookies();
    loadDarkModeSetting();
    renderTasks();
    updateUserDisplay();
    renderAchievements();
    checkDailyStreak();
    updateTimerDisplay();
    updateStats();
    initEditTaskModal(); 
    addTaskStyles();
}

function initializeAchievements() {
    return [
        { id: 'first_task', title: 'First Steps', icon: 'fa-shoe-prints', description: 'Complete your first task', unlocked: false },
        { id: 'task_master', title: 'Task Master', icon: 'fa-check-double', description: 'Complete 10 tasks', unlocked: false },
        { id: 'productivity_guru', title: 'Productivity Guru', icon: 'fa-bolt', description: 'Complete 50 tasks', unlocked: false },
        { id: 'streak_3', title: 'On Fire', icon: 'fa-fire', description: 'Maintain a 3-day streak', unlocked: false },
        { id: 'streak_7', title: 'Unstoppable', icon: 'fa-fire-flame-curved', description: 'Maintain a 7-day streak', unlocked: false },
        { id: 'level_5', title: 'Rising Star', icon: 'fa-star', description: 'Reach level 5', unlocked: false },
        { id: 'level_10', title: 'Champion', icon: 'fa-trophy', description: 'Reach level 10', unlocked: false },
        { id: 'ai_friend', title: 'AI Companion', icon: 'fa-robot', description: 'Use AI suggestions 5 times', unlocked: false },
        { id: 'focus_master', title: 'Focus Master', icon: 'fa-bullseye', description: 'Complete 5 pomodoro sessions', unlocked: false }
    ];
}

function addTask() {
    if (!taskInput) return;
    const taskText = taskInput.value.trim();
    if (!taskText) return;
    
    const category = taskCategorySelect ? taskCategorySelect.value : 'general';
    const priority = selectedPriority;
    
    const words = taskText.split(' ').length;
    const basePoints = 10;
    const bonusPoints = Math.min(Math.floor(words / 2), 10);
    const priorityMultiplier = priority === 'high' ? 1.5 : (priority === 'medium' ? 1.2 : 1);
    const xpValue = Math.round((basePoints + bonusPoints) * priorityMultiplier);
    
    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false,
        xpValue: xpValue,
        category: category,
        priority: priority,
        createdAt: new Date().toISOString(),
        completedAt: null,
        aiGenerated: false
    };
    
    tasks.unshift(newTask);
    saveTasksToCookie();
    if (taskInput) taskInput.value = '';
    renderTasks();
}

async function getAISuggestion() {
    if (!aiSuggestBtn) return;
    
    showAiLoadingModal();
    aiSuggestBtn.disabled = true;
    
    try {
        const response = await fetchAISuggestion("Give me a productive task suggestion.");
        if (response && response.choices && response.choices.length > 0) {
            const suggestion = response.choices[0].message.content.trim();
            addAiGeneratedTask(suggestion);
        } else {
            fallbackToLocalSuggestion();
        }
    } catch (error) {
        console.error("Error fetching AI suggestion:", error);
        fallbackToLocalSuggestion();
    } finally {
        hideAiLoadingModal();
        if (aiSuggestBtn) aiSuggestBtn.disabled = false;
    }
}

async function getCustomAISuggestion() {
    if (!aiPromptInput || !customAiSuggestBtn) return;
    
    const prompt = aiPromptInput.value.trim();
    if (!prompt) {
        showNotification("Please enter a prompt for AI suggestions", "error");
        return;
    }
    
    showAiLoadingModal();
    customAiSuggestBtn.disabled = true;
    
    try {
        const response = await fetchAISuggestion(`Generate 3 task suggestions for: ${prompt}. Format as a numbered list.`);
        if (response && response.choices && response.choices.length > 0) {
            const suggestions = response.choices[0].message.content.trim();
            const suggestionLines = suggestions.split('\n');
            let addedTasks = 0;
            
            for (const line of suggestionLines) {
                const match = line.match(/^\d+\.\s+(.*)/);
                if (match && match[1]) {
                    addAiGeneratedTask(match[1], getCategoryFromPrompt(prompt));
                    addedTasks++;
                }
            }
            
            if (addedTasks === 0 && suggestions) {
                addAiGeneratedTask(suggestions, getCategoryFromPrompt(prompt));
            }
            
            if (aiPromptInput) aiPromptInput.value = '';
        } else {
            showNotification("Could not generate suggestions. Please try again.", "error");
        }
    } catch (error) {
        console.error("Error fetching custom AI suggestions:", error);
        showNotification("An error occurred. Please try again later.", "error");
    } finally {
        hideAiLoadingModal();
        if (customAiSuggestBtn) customAiSuggestBtn.disabled = false;
    }
}

function getCategoryFromPrompt(prompt) {
    prompt = prompt.toLowerCase();
    if (prompt.includes("work") || prompt.includes("job") || prompt.includes("career")) {
        return "work";
    } else if (prompt.includes("study") || prompt.includes("learn") || prompt.includes("school") || prompt.includes("college")) {
        return "study";
    } else if (prompt.includes("health") || prompt.includes("exercise") || prompt.includes("fitness") || prompt.includes("workout")) {
        return "health";
    } else if (prompt.includes("personal") || prompt.includes("hobby") || prompt.includes("leisure")) {
        return "personal";
    } else {
        return "general";
    }
}

async function fetchAISuggestion(prompt) {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful AI task suggestion tool. Provide concise, actionable task suggestions."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 150
            })
        });
        
        return await response.json();
    } catch (error) {
        console.error("Error calling OpenAI API:", error);
        throw error;
    }
}

function fallbackToLocalSuggestion() {
    const taskSuggestions = [
        "Complete homework for math class",
        "Go for a 30-minute run",
        "Read a chapter of your book",
        "Clean your room",
        "Practice coding for 1 hour",
        "Call a friend you haven't spoken to in a while",
        "Plan your meals for the week",
        "Learn 5 new words in a foreign language",
        "Organize your digital files",
        "Meditate for 10 minutes"
    ];
    const randomIndex = Math.floor(Math.random() * taskSuggestions.length);
    const suggestion = taskSuggestions[randomIndex];
    addAiGeneratedTask(suggestion);
}

function addAiGeneratedTask(suggestion, category = "general") {
    const xpValue = 15;
    
    const newTask = {
        id: Date.now(),
        text: suggestion,
        completed: false,
        xpValue: xpValue,
        category: category,
        priority: "medium",
        createdAt: new Date().toISOString(),
        completedAt: null,
        aiGenerated: true
    };
    
    tasks.unshift(newTask);
    saveTasksToCookie();
    renderTasks();
    
    let aiUsageCount = parseInt(getCookie('aiUsageCount') || '0');
    aiUsageCount++;
    setCookie('aiUsageCount', aiUsageCount);
    
    if (aiUsageCount === 5) {
        unlockAchievement('ai_friend');
    }
}

function showAiLoadingModal() {
    if (aiLoadingModal) aiLoadingModal.style.display = 'flex';
}

function hideAiLoadingModal() {
    if (aiLoadingModal) aiLoadingModal.style.display = 'none';
}

function renderTasks() {
    if (!tasksList) return;
    
    let filteredTasks = tasks;
    
    if (currentFilter === 'active') {
        filteredTasks = filteredTasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = filteredTasks.filter(task => task.completed);
    }
    
    if (currentCategoryFilter !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.category === currentCategoryFilter);
    }
    
    tasksList.innerHTML = '';
    
    if (filteredTasks.length === 0) {
        tasksList.innerHTML = `
            <div class="empty-state">
                <p>No tasks found. ${currentFilter === 'all' ? 'Add a new task or get an AI suggestion!' : 
                   currentFilter === 'active' ? 'All tasks are completed!' : 
                   'Complete some tasks to see them here!'}</p>
            </div>
        `;
        return;
    }
    
    filteredTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskElement.innerHTML = `
            <div class="task-content">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <div class="task-text-container">
                    <span class="task-priority-badge task-priority-${task.priority || 'medium'}"></span>
                    <span class="task-text">${task.text}</span>
                    ${task.aiGenerated ? '<span class="ai-badge"><i class="fas fa-robot"></i></span>' : ''}
                </div>
            </div>
            <div class="task-meta">
                <span class="task-category-badge task-category-${task.category || 'general'}">${task.category || 'general'}</span>
                <span class="task-points"><i class="fas fa-gem"></i> ${task.xpValue} XP</span>
                <div class="task-actions">
                    ${!task.completed ? `<button class="task-focus" data-id="${task.id}"><i class="fas fa-stopwatch"></i> Focus</button>` : ''}
                    <button class="task-edit"><i class="fas fa-edit"></i></button>
                    <button class="task-delete"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
        
        safeAddEventListener(taskElement.querySelector('.task-checkbox'), 'change', (e) => {
            toggleTaskComplete(task.id, e.target.checked);
        });
        
        safeAddEventListener(taskElement.querySelector('.task-delete'), 'click', () => {
            deleteTask(task.id);
        });
        
        safeAddEventListener(taskElement.querySelector('.task-edit'), 'click', () => {
            editTask(task.id);
        });
        
        const focusButton = taskElement.querySelector('.task-focus');
        if (focusButton) {
            safeAddEventListener(focusButton, 'click', () => {
                startFocusSession(task.id);
            });
        }
        
        tasksList.appendChild(taskElement);
    });
}

function startFocusSession(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    resetTimer();
    startTimer();
    
    document.querySelector('.pomodoro').scrollIntoView({ behavior: 'smooth' });
    
    document.querySelectorAll('.task-item').forEach(el => {
        el.classList.remove('focus-active');
    });
    
    const taskElement = document.querySelector(`.task-item .task-focus[data-id="${taskId}"]`)?.closest('.task-item');
    if (taskElement) {
        taskElement.classList.add('focus-active');
    }
    
    setCookie('currentFocusTaskId', taskId);
}

function toggleTaskComplete(taskId, completed) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return;
    
    const task = tasks[taskIndex];
    const wasAlreadyCompleted = task.completed;
    
    task.completed = completed;
    task.completedAt = completed ? new Date().toISOString() : null;
    
    if (completed && !wasAlreadyCompleted) {
        awardXP(task.xpValue);
        userStats.completedTasks++;
        
        if (userStats.completedTasks === 1) {
            unlockAchievement('first_task');
        } else if (userStats.completedTasks === 10) {
            unlockAchievement('task_master');
        } else if (userStats.completedTasks === 50) {
            unlockAchievement('productivity_guru');
        }
    }
    else if (!completed && wasAlreadyCompleted) {
        awardXP(-task.xpValue);
        userStats.completedTasks--;
    }
    
    saveTasksToCookie();
    saveUserStats();
    renderTasks();
    updateStats();
}

function deleteTask(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return;
    
    if (tasks[taskIndex].completed) {
        userStats.completedTasks--;
    }
    
    tasks.splice(taskIndex, 1);
    
    saveTasksToCookie();
    saveUserStats();
    renderTasks();
    updateStats();
}

function editTask(taskId) {
    const task = tasks.find(task => task.id === taskId);
    if (!task) return;
    
    currentEditingTaskId = taskId;
    
    if (editTaskInput) {
        editTaskInput.value = task.text;
    }
    
    showEditTaskModal();
}

function startTimer() {
    if (timerRunning) return;
    
    timerRunning = true;
    startTimerBtn.disabled = true;
    pauseTimerBtn.disabled = false;
    
    timerInterval = setInterval(() => {
        timerTime--;
        updateTimerDisplay();
        
        if (timerTime <= 0) {
            timerCompleted();
        }
    }, 1000);
}

function pauseTimer() {
    if (!timerRunning) return;
    
    timerRunning = false;
    clearInterval(timerInterval);
    startTimerBtn.disabled = false;
    pauseTimerBtn.disabled = true;
}

function resetTimer() {
    pauseTimer();
    
    const activeMode = document.querySelector('.mode-btn.active');
    
    let minutes = 25;
    
    if (activeMode.dataset.time === 'custom') {
        const customMinutes = parseInt(customTimeInput?.value);
        if (!isNaN(customMinutes) && customMinutes > 0) {
            minutes = customMinutes;
        }
    } else {
        const presetMinutes = parseInt(activeMode.dataset.time);
        if (!isNaN(presetMinutes)) {
            minutes = presetMinutes;
        }
    }
    
    timerTime = minutes * 60;
    updateTimerDisplay();
}

function timerCompleted() {
    clearInterval(timerInterval);
    timerRunning = false;
    
    if (startTimerBtn) startTimerBtn.disabled = false;
    if (pauseTimerBtn) pauseTimerBtn.disabled = true;
    
    playCompletionSound();
    
    if (currentTimerMode === 'focus') {
        let minutesCompleted = 25;
        
        const activeBtn = document.querySelector('.mode-btn.active');
        if (activeBtn) {
            if (activeBtn.dataset.time === 'custom') {
                const customValue = parseInt(customTimeInput?.value);
                minutesCompleted = !isNaN(customValue) && customValue > 0 ? customValue : 1;
                console.log(`Custom timer completed: ${minutesCompleted} minutes`);
            } else {
                minutesCompleted = parseInt(activeBtn.dataset.time) || 25;
            }
        }
        
        userStats.focusMinutes = Number(userStats.focusMinutes || 0) + minutesCompleted;
        console.log(`Added ${minutesCompleted} minutes. Total focus time: ${userStats.focusMinutes} minutes`);
        
        awardXP(minutesCompleted);
        
        let focusSessions = parseInt(getCookie('focusSessions') || '0');
        focusSessions++;
        setCookie('focusSessions', focusSessions);
        
        if (focusSessions === 5) {
            unlockAchievement('focus_master');
        }
        
        const focusTaskId = getCookie('currentFocusTaskId');
        if (focusTaskId) {
            toggleTaskComplete(parseInt(focusTaskId), true);
            deleteCookie('currentFocusTaskId');
        }
        
        showNotification('Focus session completed! Great job!', 'success', 5000);
        
        const breakBtn = document.querySelector('.mode-btn[data-time="5"]');
        if (breakBtn) {
            breakBtn.click();
        }
    } else {
        showNotification('Break completed! Ready to focus again?', 'info', 5000);
        
        const focusBtn = document.querySelector('.mode-btn[data-time="25"]');
        if (focusBtn) {
            focusBtn.click();
        }
    }
    
    saveUserStats();
    updateStats();
}

function playCompletionSound() {
    const audioSources = [
        'audio/completion.mp3'
    ];
    
    function tryNextAudio(index) {
        if (index >= audioSources.length) {
            console.log('Could not play any audio sources');
            return;
        }
        
        const audio = new Audio(audioSources[index]);
        
        audio.oncanplaythrough = function() {
            audio.play()
                .then(() => console.log('Audio played successfully'))
                .catch(e => {
                    console.log(`Audio play failed for source ${index}: ${e}`);
                    tryNextAudio(index + 1);
                });
        };
        
        audio.onerror = function() {
            console.log(`Audio source ${index} failed to load`);
            tryNextAudio(index + 1);
        };
    }
    
    tryNextAudio(0);
    
    document.body.classList.add('timer-completed');
    setTimeout(() => {
        document.body.classList.remove('timer-completed');
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerTime / 60);
    const seconds = timerTime % 60;
    
    minutesDisplay.textContent = minutes.toString().padStart(2, '0');
    secondsDisplay.textContent = seconds.toString().padStart(2, '0');
}

function awardXP(amount) {
    userStats.xp += amount;
    
    const xpNeeded = calculateXPForNextLevel(userStats.level);
    if (userStats.xp >= xpNeeded) {
        levelUp();
    }
    
    updateUserDisplay();
    saveUserStats();
}

function levelUp() {
    userStats.level++;
    userStats.xp = userStats.xp - calculateXPForNextLevel(userStats.level - 1);
    
    if (userStats.level === 5) {
        unlockAchievement('level_5');
    } else if (userStats.level === 10) {
        unlockAchievement('level_10');
    }
    
    showReward(`Level ${userStats.level}`);
}

function calculateXPForNextLevel(currentLevel) {
    return 75 * currentLevel + 25;
}

function updateUserDisplay() {
    if (userLevelEl) userLevelEl.textContent = userStats.level;
    if (currentXpEl) currentXpEl.textContent = userStats.xp;
    if (streakDaysEl) streakDaysEl.textContent = userStats.streakDays;
    
    const xpNeeded = calculateXPForNextLevel(userStats.level);
    if (xpNeededEl) xpNeededEl.textContent = xpNeeded;
    
    const progressPercentage = Math.min((userStats.xp / xpNeeded) * 100, 100);
    if (xpProgressBar) xpProgressBar.style.width = `${progressPercentage}%`;
}

function updateStats() {
    if (statsCompletedEl) statsCompletedEl.textContent = userStats.completedTasks || 0;
    
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    if (statsAchievementsEl) statsAchievementsEl.textContent = `${unlockedCount}/${achievements.length}`;
    
    const focusMinutes = Number(userStats.focusMinutes || 0);
    
    const hours = Math.floor(focusMinutes / 60);
    const minutes = focusMinutes % 60;
    
    if (statsFocusTimeEl) {
        statsFocusTimeEl.textContent = hours > 0 ? 
            `${hours}h ${minutes}m` : `${minutes} mins`;
        console.log(`Updated focus time display: ${statsFocusTimeEl.textContent} (${focusMinutes} total minutes)`);
    }
    
    const highestStreak = typeof userStats.highestStreak === 'number' ? userStats.highestStreak : 0;
    if (statsHighestStreakEl) statsHighestStreakEl.textContent = `${highestStreak} days`;
}

function checkDailyStreak() {
    const today = new Date().toISOString().split('T')[0];
    const lastActive = userStats.lastActive;
    
    if (userStats.highestStreak === undefined) userStats.highestStreak = 0;
    if (userStats.streakDays === undefined) userStats.streakDays = 0;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (lastActive === yesterdayStr) {
        userStats.streakDays++;
        
        if (userStats.streakDays > userStats.highestStreak) {
            userStats.highestStreak = userStats.streakDays;
        }
    } 
    else if (lastActive !== today) {
        userStats.streakDays = 1;
    }
    
    if (userStats.streakDays === 3) {
        unlockAchievement('streak_3');
    } else if (userStats.streakDays === 7) {
        unlockAchievement('streak_7');
    }
    
    userStats.lastActive = today;
    saveUserStats();
    updateStats();
}

function unlockAchievement(achievementId) {
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement && !achievement.unlocked) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date().toISOString();
        
        saveAchievements();
        
        renderAchievements();
        
        showReward(achievement.title);
        
        awardXP(25);
        
        updateStats();
    }
}

function renderAchievements() {
    if (!achievementsContainer) return;
    
    achievementsContainer.innerHTML = '';
    
    achievements.forEach(achievement => {
        const achievementEl = document.createElement('div');
        achievementEl.className = `achievement ${achievement.unlocked ? 'unlocked' : 'locked'}`;
        achievementEl.innerHTML = `
            <i class="fas ${achievement.icon}"></i>
            <h3>${achievement.title}</h3>
            <p>${achievement.description}</p>
        `;
        achievementsContainer.appendChild(achievementEl);
    });
}

function showReward(title) {
    if (newLevelEl) newLevelEl.textContent = userStats.level;
    if (newAchievementEl) newAchievementEl.textContent = title;
    if (rewardModal) rewardModal.style.display = 'flex';
}

function saveTasksToCookie() {
    setCookie('tasks', tasks);
}

function saveUserStats() {
    if (typeof userStats.focusMinutes !== 'number') {
        userStats.focusMinutes = Number(userStats.focusMinutes || 0);
    }
    
    if (typeof userStats.completedTasks !== 'number') {
        userStats.completedTasks = Number(userStats.completedTasks || 0);
    }
    
    if (typeof userStats.level !== 'number') {
        userStats.level = Number(userStats.level || 1);
    }
    
    if (typeof userStats.xp !== 'number') {
        userStats.xp = Number(userStats.xp || 0);
    }
    
    console.log("Saving user stats:", JSON.stringify(userStats));
    
    setCookie('userStats', userStats);
}

function saveAchievements() {
    setCookie('achievements', achievements);
}

function loadDataFromCookies() {
    tasks = getCookie('tasks') || [];
    userStats = getCookie('userStats') || {
        level: 1,
        xp: 0,
        completedTasks: 0,
        streakDays: 0,
        highestStreak: 0,
        focusMinutes: 0,
        lastActive: new Date().toISOString().split('T')[0]
    };
    
    userStats.focusMinutes = Number(userStats.focusMinutes || 0);
    userStats.completedTasks = Number(userStats.completedTasks || 0);
    userStats.level = Number(userStats.level || 1);
    userStats.xp = Number(userStats.xp || 0);
    userStats.streakDays = Number(userStats.streakDays || 0);
    userStats.highestStreak = Number(userStats.highestStreak || 0);
    
    console.log("Loaded user stats:", JSON.stringify(userStats));
    
    achievements = getCookie('achievements') || initializeAchievements();
    
    const aiUsageCount = getCookie('aiUsageCount');
    if (aiUsageCount !== null) {
        setCookie('aiUsageCount', aiUsageCount);
    }
    
    const focusSessions = getCookie('focusSessions');
    if (focusSessions !== null) {
        setCookie('focusSessions', focusSessions);
    }
}

function resetAllUserData() {
    deleteCookie('tasks');
    deleteCookie('userStats');
    deleteCookie('achievements');
    deleteCookie('aiUsageCount');
    deleteCookie('focusSessions');
    deleteCookie('currentFocusTaskId');
    
    tasks = [];
    userStats = {
        level: 1,
        xp: 0,
        completedTasks: 0,
        streakDays: 0,
        highestStreak: 0,
        focusMinutes: 0,
        lastActive: new Date().toISOString().split('T')[0]
    };
    achievements = initializeAchievements();
    
    renderTasks();
    updateUserDisplay();
    renderAchievements();
    updateStats();
    
    if (resetConfirmModal) resetConfirmModal.style.display = 'none';
    
    showNotification("Your account has been reset successfully.", "success");
}

function showNotification(message, type = 'info', duration = 3000) {
    if (!notificationContainer) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        </div>
    `;
    
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
    }
    
    setTimeout(() => {
        if (notification.isConnected) {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.isConnected) notification.remove();
            }, 300);
        }
    }, duration);
    
    notificationContainer.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
}

function createEditTaskModal() {
    console.log("Creating edit task modal");
    
    const modal = document.createElement('div');
    modal.id = 'edit-task-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Edit Task</h2>
            <textarea id="edit-task-input" placeholder="Task description"></textarea>
            <div class="modal-buttons">
                <button id="save-edit-task" class="btn-primary">Save</button>
                <button id="cancel-edit-task" class="btn-secondary">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    console.log("Edit task modal created and appended to document body");
    
    const saveBtn = document.getElementById('save-edit-task');
    const cancelBtn = document.getElementById('cancel-edit-task');
    const input = document.getElementById('edit-task-input');
    
    if (saveBtn) saveBtn.addEventListener('click', saveEditedTask);
    if (cancelBtn) cancelBtn.addEventListener('click', hideEditTaskModal);
    if (input) {
        input.addEventListener('keypress', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                saveEditedTask();
            }
        });
    }
    
    return modal;
}

function showEditTaskModal() {
    if (editTaskModal) {
        editTaskModal.style.display = 'flex';
        if (editTaskInput) {
            editTaskInput.focus();
        }
    }
}

function hideEditTaskModal() {
    if (editTaskModal) {
        editTaskModal.style.display = 'none';
        currentEditingTaskId = null;
    }
}

function saveEditedTask() {
    if (!editTaskInput || currentEditingTaskId === null) return;
    
    const newText = editTaskInput.value.trim();
    if (!newText) {
        showNotification("Task description cannot be empty", "error");
        return;
    }
    
    const taskIndex = tasks.findIndex(task => task.id === currentEditingTaskId);
    if (taskIndex === -1) return;
    
    tasks[taskIndex].text = newText;
    saveTasksToCookie();
    renderTasks();
    hideEditTaskModal();
    showNotification("Task updated successfully", "success");
}

function initEditTaskModal() {
    if (!document.getElementById('edit-task-modal')) {
        createEditTaskModal();
    }
}

function addTaskStyles() {
    if (!document.getElementById('task-overflow-styles')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'task-overflow-styles';
        styleEl.textContent = `
            .task-text-container {
                display: flex;
                flex: 1;
                align-items: flex-start;
                min-width: 0;
            }
            .task-text {
                word-break: break-word;
                overflow-wrap: break-word;
                max-width: 100%;
                overflow: hidden;
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                line-height: 1.3;
            }
        `;
        document.head.appendChild(styleEl);
    }
}

function loadDarkModeSetting() {
    const darkModeSetting = getCookie('darkMode');
    if (darkModeSetting !== null) {
        applyDarkMode(darkModeSetting);
    }
}

function applyDarkMode(isDark) {
    if (isDark) {
        document.body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.remove('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

darkModeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    if (isDark) {
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
    setCookie('darkMode', isDark);
});

});
