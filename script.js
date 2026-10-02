const input = document.getElementById("taskInput");
const deadlineInput = document.getElementById("deadlineInput");
const button = document.getElementById("addButton");
const list = document.getElementById("taskList");

const searchInput = document.getElementById("searchInput");
const sortButton = document.getElementById("sortButton");
const taskCount = document.getElementById("taskCount");
const alldeleteButton =
    document.getElementById("alldeleteButton");

const className =
    document.getElementById("className");

const classDay =
    document.getElementById("classDay");

const classPeriod =
    document.getElementById("classPeriod");

const classRoom =
    document.getElementById("classRoom");

const addClassButton =
    document.getElementById("addClassButton");

const todaySchedule =
    document.getElementById("todaySchedule");

const notificationButton =
    document.getElementById("notificationButton");

const notificationStatus =
    document.getElementById("notificationStatus");

const celebration =
    document.getElementById("celebration");


let tasks = [];
let classes = [];


/* =================================
   課題保存
================================= */

function saveTasks() {

    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );

}


/* =================================
   課題読み込み
================================= */

function loadTasks() {

    const savedTasks =
        localStorage.getItem("tasks");

    if (savedTasks) {

        tasks = JSON.parse(savedTasks);


        tasks.forEach(task => {

            if (typeof task.notify === "undefined") {
                task.notify = false;
            }

            if (typeof task.notifiedBefore === "undefined") {
                task.notifiedBefore = false;
            }

            if (typeof task.notifiedToday === "undefined") {
                task.notifiedToday = false;
            }

        });

    }

}


/* =================================
   課題追加
================================= */

function addTask() {

    if (input.value.trim() === "") {

        alert("課題名を入力してください");

        return;

    }


    if (deadlineInput.value === "") {

        alert("締切日を入力してください");

        return;

    }


    tasks.push({

        task: input.value,

        deadline: deadlineInput.value,

        completed: false,

        notify: false,

        notifiedBefore: false,

        notifiedToday: false

    });


    saveTasks();

    renderTasks();

    input.value = "";

    deadlineInput.value = "";

}


button.addEventListener(
    "click",
    addTask
);


/* Enter */

input.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            addTask();

        }

    }
);


/* =================================
   検索
================================= */

searchInput.addEventListener(
    "input",
    () => {

        renderTasks();

    }
);


/* =================================
   全消去
================================= */

alldeleteButton.addEventListener(
    "click",
    () => {

        if (tasks.length === 0) {
            return;
        }


        if (
            confirm(
                "すべての課題を削除しますか？"
            )
        ) {

            tasks = [];

            saveTasks();

            renderTasks();

        }

    }
);


/* =================================
   締切順
================================= */

sortButton.addEventListener(
    "click",
    () => {

        tasks.sort(
            (a, b) =>
                new Date(a.deadline) -
                new Date(b.deadline)
        );


        saveTasks();

        renderTasks();

    }
);


/* =================================
   課題表示
================================= */

function renderTasks() {

    list.innerHTML = "";


    const keyword =
        searchInput.value.toLowerCase();


    const result =
        tasks.filter(
            task =>
                task.task
                    .toLowerCase()
                    .includes(keyword)
        );


    result.sort(
        (a, b) =>
            a.completed -
            b.completed
    );


    const remainingTasks =
        tasks.filter(
            task => !task.completed
        );


    taskCount.textContent =
        `残り課題：${remainingTasks.length}件`;


    result.forEach(
        task => {

            const li =
                document.createElement("li");


            /* 完了した課題 */

            if (task.completed) {

                li.classList.add(
                    "completed-task"
                );

            }


            const today =
                new Date();


            const deadline =
                new Date(task.deadline);


            const diffTime =
                deadline - today;


            const diffDays =
                Math.ceil(
                    diffTime /
                    (1000 * 60 * 60 * 24)
                );


            /* 締切の色 */

            let color = "green";


            if (diffDays <= 0) {

                color = "red";

            }
            else if (diffDays <= 3) {

                color = "orange";

            }


            li.innerHTML = `

                <div style="color:${color}">

                    <input
                        type="checkbox"
                        ${task.completed ? "checked" : ""}
                    >

                    <strong>
                        ${task.task}
                    </strong>

                    <br>

                    締切：
                    ${task.deadline}

                    <br>

                    あと${diffDays}日

                </div>

            `;


            /* =================================
               チェック
            ================================= */

            const checkbox =
                li.querySelector("input");


            checkbox.addEventListener(
                "click",
                () => {

                    /*
                        未完了 → 完了
                    */

                    if (
                        checkbox.checked &&
                        !task.completed
                    ) {

                        task.completed = true;

                        saveTasks();

                        /* 達成エフェクト */

                        showAchievement(
                            task.task
                        );

                        /*
                            少し待ってから
                            再表示
                        */

                        setTimeout(
                            () => {

                                renderTasks();

                            },
                            300
                        );

                    }
                    else {

                        task.completed =
                            checkbox.checked;

                        saveTasks();

                        renderTasks();

                    }

                }
            );


            /* =================================
               ボタン
            ================================= */

            const buttonArea =
                document.createElement("div");


            buttonArea.className =
                "task-buttons";


            /* 編集 */

            const editButton =
                document.createElement("button");


            editButton.textContent =
                "✏️ 編集";


            editButton.addEventListener(
                "click",
                () => {

                    const newTask =
                        prompt(
                            "新しい課題名を入力してください",
                            task.task
                        );


                    if (
                        newTask !== null &&
                        newTask.trim() !== ""
                    ) {

                        task.task =
                            newTask;

                        saveTasks();

                        renderTasks();

                    }

                }
            );


            buttonArea.appendChild(
                editButton
            );


            /* 通知 */

            const notifyButton =
                document.createElement("button");


            if (task.notify) {

                notifyButton.textContent =
                    "🔔 通知ON";

                notifyButton.className =
                    "notify-on";

            }
            else {

                notifyButton.textContent =
                    "🔕 通知OFF";

            }


            notifyButton.addEventListener(
                "click",
                async () => {

                    if (!task.notify) {

                        if (
                            !("Notification" in window)
                        ) {

                            alert(
                                "このブラウザは通知に対応していません"
                            );

                            return;

                        }


                        const permission =
                            await Notification.requestPermission();


                        if (
                            permission !== "granted"
                        ) {

                            alert(
                                "通知を許可してください"
                            );

                            return;

                        }


                        task.notify = true;

                    }
                    else {

                        task.notify = false;

                    }


                    saveTasks();

                    renderTasks();

                }
            );


            buttonArea.appendChild(
                notifyButton
            );


            /* 削除 */

            const deleteButton =
                document.createElement("button");


            deleteButton.textContent =
                "🗑 削除";


            deleteButton.className =
                "delete-button";


            deleteButton.addEventListener(
                "click",
                () => {

                    const index =
                        tasks.indexOf(task);


                    tasks.splice(
                        index,
                        1
                    );


                    saveTasks();

                    renderTasks();

                }
            );


            buttonArea.appendChild(
                deleteButton
            );


            li.appendChild(
                buttonArea
            );


            list.appendChild(li);

        }
    );

}


/* =================================
   達成エフェクト
================================= */

function showAchievement(taskName) {

    /*
        「達成！」を表示
    */

    const message =
        document.createElement("div");


    message.className =
        "achievement-message";


    message.textContent =
        "🎉 課題達成！";


    celebration.appendChild(
        message
    );


    /*
        紙吹雪を作る
    */

    for (
        let i = 0;
        i < 50;
        i++
    ) {

        const confetti =
            document.createElement("div");


        confetti.className =
            "confetti";


        confetti.style.left =
            Math.random() * 100 + "%";


        confetti.style.backgroundColor =
            getRandomColor();


        confetti.style.animationDelay =
            Math.random() * 0.5 + "s";


        confetti.style.width =
            6 + Math.random() * 8 + "px";


        confetti.style.height =
            6 + Math.random() * 8 + "px";


        celebration.appendChild(
            confetti
        );


        setTimeout(
            () => {

                confetti.remove();

            },
            2500
        );

    }


    /*
        メッセージ削除
    */

    setTimeout(
        () => {

            message.remove();

        },
        1500
    );

}


/* 紙吹雪の色 */

function getRandomColor() {

    const colors = [

        "#ff595e",
        "#ffca3a",
        "#8ac926",
        "#1982c4",
        "#6a4c93"

    ];


    return colors[
        Math.floor(
            Math.random() *
            colors.length
        )
    ];

}


/* =================================
   時間割
================================= */

function saveClasses() {

    localStorage.setItem(
        "classes",
        JSON.stringify(classes)
    );

}


function loadClasses() {

    const savedClasses =
        localStorage.getItem("classes");


    if (savedClasses) {

        classes =
            JSON.parse(savedClasses);

    }

}


/* 授業追加 */

addClassButton.addEventListener(
    "click",
    () => {

        if (
            className.value.trim() === ""
        ) {

            alert(
                "授業名を入力してください"
            );

            return;

        }


        const newClass = {

            name: className.value,

            day: classDay.value,

            period: classPeriod.value,

            room: classRoom.value

        };


        classes =
            classes.filter(
                item =>
                    !(
                        item.day ===
                            newClass.day &&
                        item.period ===
                            newClass.period
                    )
            );


        classes.push(
            newClass
        );


        saveClasses();

        renderTimetable();

        renderTodaySchedule();


        className.value = "";

        classRoom.value = "";

    }
);


/* 時間割表示 */

function renderTimetable() {

    const slots =
        document.querySelectorAll(
            ".slot"
        );


    slots.forEach(
        slot => {

            slot.innerHTML = "";

            slot.onclick = null;

        }
    );


    classes.forEach(
        (item, index) => {

            const slot =
                document.querySelector(
                    `.slot[data-day="${item.day}"][data-period="${item.period}"]`
                );


            if (!slot) {

                return;

            }


            slot.innerHTML = `

                <div>

                    <div class="class-name">
                        ${item.name}
                    </div>

                    <div class="class-room">
                        ${item.room}
                    </div>

                </div>

            `;


            slot.onclick = () => {

                if (
                    confirm(
                        `${item.name}を削除しますか？`
                    )
                ) {

                    classes.splice(
                        index,
                        1
                    );

                    saveClasses();

                    renderTimetable();

                    renderTodaySchedule();

                }

            };

        }
    );

}


/* =================================
   今日の授業
================================= */

function renderTodaySchedule() {

    const days = [

        "日",
        "月",
        "火",
        "水",
        "木",
        "金",
        "土"

    ];


    const today =
        days[
            new Date().getDay()
        ];


    const todayClasses =
        classes.filter(
            item =>
                item.day === today
        );


    todayClasses.sort(
        (a, b) =>
            Number(a.period) -
            Number(b.period)
    );


    if (
        todayClasses.length === 0
    ) {

        todaySchedule.textContent =
            "今日は授業がありません";

        return;

    }


    todaySchedule.innerHTML =
        todayClasses
            .map(
                item => `

                    <div>

                        <strong>
                            ${item.period}限
                        </strong>

                        　
                        ${item.name}

                        　
                        ${item.room}

                    </div>

                `
            )
            .join("");

}


/* =================================
   通知
================================= */

notificationButton.addEventListener(
    "click",
    async () => {

        if (
            !("Notification" in window)
        ) {

            alert(
                "このブラウザは通知に対応していません"
            );

            return;

        }


        const permission =
            await Notification.requestPermission();


        updateNotificationStatus();


        if (
            permission === "granted"
        ) {

            alert(
                "通知を許可しました！"
            );

        }
        else {

            alert(
                "通知が許可されませんでした"
            );

        }

    }
);


/* 通知状態 */

function updateNotificationStatus() {

    if (
        !("Notification" in window)
    ) {

        notificationStatus.textContent =
            "通知に対応していません";

        return;

    }


    if (
        Notification.permission ===
        "granted"
    ) {

        notificationStatus.textContent =
            "通知を利用できます";

        notificationButton.textContent =
            "🔔 通知許可済み";

        notificationButton.style.background =
            "#2f8f4e";

    }
    else {

        notificationStatus.textContent =
            "通知の許可が必要です";

        notificationButton.textContent =
            "🔔 通知を許可";

        notificationButton.style.background =
            "#333";

    }

}


/* =================================
   課題通知チェック
================================= */

function checkTaskNotifications() {

    if (
        !("Notification" in window)
    ) {

        return;

    }


    if (
        Notification.permission !==
        "granted"
    ) {

        return;

    }


    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    tasks.forEach(
        task => {

            if (!task.notify) {
                return;
            }


            if (task.completed) {
                return;
            }


            const deadline =
                new Date(
                    task.deadline
                );


            deadline.setHours(
                0,
                0,
                0,
                0
            );


            const diff =
                Math.round(
                    (
                        deadline -
                        today
                    ) /
                    (
                        1000 *
                        60 *
                        60 *
                        24
                    )
                );


            /* 前日 */

            if (
                diff === 1 &&
                !task.notifiedBefore
            ) {

                new Notification(
                    "CampusAI 課題通知",
                    {
                        body:
                            `「${task.task}」は明日が締切です！`
                    }
                );


                task.notifiedBefore =
                    true;


                saveTasks();

            }


            /* 当日 */

            if (
                diff === 0 &&
                !task.notifiedToday
            ) {

                new Notification(
                    "CampusAI 課題通知",
                    {
                        body:
                            `「${task.task}」は今日が締切です！`
                    }
                );


                task.notifiedToday =
                    true;


                saveTasks();

            }

        }
    );

}


/* =================================
   起動
================================= */

loadTasks();

loadClasses();

renderTasks();

renderTimetable();

renderTodaySchedule();

updateNotificationStatus();

checkTaskNotifications();