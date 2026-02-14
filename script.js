function getAppData() {
    return JSON.parse(localStorage.getItem("emotiApp")) || {
        users: {},
        groupFeed: []
    };
}

function saveAppData(data) {
    localStorage.setItem("emotiApp", JSON.stringify(data));
}

function login() {
    let name = document.getElementById("username").value.trim();
    if (!name) return alert("Enter your name");

    let data = getAppData();

    if (!data.users[name]) {
        data.users[name] = {
            mood: "Happy",
            moodHistory: [],
            inbox: [],
            careScore: 0
        };
    }

    saveAppData(data);
    localStorage.setItem("currentUser", name);

    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");
    document.getElementById("navbar").classList.remove("hidden");
    document.getElementById("navUser").innerText = name;

    renderAll();
}

function logout() {
    localStorage.removeItem("currentUser");
    location.reload();
}

function setMood(mood) {
    let data = getAppData();
    let user = localStorage.getItem("currentUser");

    data.users[user].mood = mood;
    data.users[user].moodHistory.push({
        mood,
        time: new Date().toLocaleString()
    });

    data.groupFeed.unshift({
        from: user,
        mood,
        time: new Date().toLocaleString()
    });

    saveAppData(data);
    renderAll();
}

function renderAll() {
    renderFeed();
    renderInbox();
    renderSummary();
    renderCareScore();
}

function getBadgeClass(mood) {
    if (mood === "Happy") return "badge-happy";
    if (mood === "Low") return "badge-low";
    if (mood === "Overwhelmed") return "badge-overwhelmed";
    return "badge-support";
}

function renderFeed() {
    let data = getAppData();
    let user = localStorage.getItem("currentUser");
    let feedDiv = document.getElementById("feed");
    feedDiv.innerHTML = "";

    if (data.groupFeed.length === 0) {
        feedDiv.innerHTML = "<p>No emotional updates yet. Be the first to share 🌿</p>";
        return;
    }

    data.groupFeed.forEach(item => {
        let div = document.createElement("div");
        div.className = "feed-item";

        div.innerHTML = `
            <strong>${item.from}</strong> 
            <span class="badge ${getBadgeClass(item.mood)}">${item.mood}</span><br>
            <small>${item.time}</small><br>
            ${item.from !== user ? `
                <button onclick="sendResponse('${item.from}','hug')">🤗</button>
                <button onclick="sendResponse('${item.from}','msg')">💬</button>
            ` : ""}
        `;

        feedDiv.appendChild(div);
    });
}

function sendResponse(target, type) {
    let data = getAppData();
    let user = localStorage.getItem("currentUser");

    let message = type === "hug"
        ? user + " sent you a hug 🤗"
        : user + " says: I'm here for you ❤️";

    data.users[target].inbox.unshift({
        text: message,
        time: new Date().toLocaleString()
    });

    data.users[user].careScore += 1;

    saveAppData(data);
    renderAll();
}

function renderInbox() {
    let data = getAppData();
    let user = localStorage.getItem("currentUser");
    let inboxDiv = document.getElementById("inbox");
    inboxDiv.innerHTML = "";

    if (data.users[user].inbox.length === 0) {
        inboxDiv.innerHTML = "<p>No messages yet. Your support will appear here 💛</p>";
        return;
    }

    data.users[user].inbox.forEach(msg => {
        let div = document.createElement("div");
        div.className = "inbox-item";
        div.innerHTML = `${msg.text}<br><small>${msg.time}</small>`;
        inboxDiv.appendChild(div);
    });
}

function renderSummary() {
    let data = getAppData();
    let happy = 0, low = 0, support = 0;

    Object.values(data.users).forEach(u => {
        if (u.mood === "Happy") happy++;
        if (u.mood === "Low") low++;
        if (u.mood === "Need Support") support++;
    });

    document.getElementById("summary").innerText =
        `💚 ${happy} Happy   💛 ${low} Low   ❤️ ${support} Need Support`;
}

function renderCareScore() {
    let data = getAppData();
    let user = localStorage.getItem("currentUser");

    document.getElementById("careScore").innerText =
        "💖 Care Score: " + data.users[user].careScore;
}
