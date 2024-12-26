var greenCircle = document.querySelector('.green-circle');
var redCircle = document.querySelector('.red-circle');
var play = document.querySelector('.play');
var close = document.querySelector('.close');
var work = document.querySelector('.work');
var start = document.querySelector('.start');
var stop = document.querySelector('.stop');
var reload = document.querySelector('.reload');
var text = document.querySelector('.text');
var logCount = 0;
var gridItem3 = document.querySelector('.grid-item_3');

play.addEventListener('click', function() {
    localStorage.removeItem('events');
    fetch ("http://98.83.25.7:8000/clear-events", {
        method: "POST"
    });
    work.style.display = 'flex';
    randomPlace();
    logOneEvent('play');
})

start.addEventListener('click', function() {
    startAnimation();
    start.style.display = 'none';
    stop.style.display = 'inline-block';
    logOneEvent('start');
});

stop.addEventListener('click', function() {
    clearInterval(anim);
    start.style.display = 'inline-block';
    stop.style.display = 'none';
    logOneEvent('stop');
});

reload.addEventListener('click', function() {
    randomPlace();
    reload.style.display = 'none';
    start.style.display = 'inline-block';
    logOneEvent('reload');
});

close.addEventListener('click', function() {
    clearInterval(anim);
    logOneEvent('close');
    logAllEvents();
    work.style.display = 'none';
    stop.style.display = 'none';
    reload.style.display = 'none';
    start.style.display = 'inline-block';
});

function deleteComparisionTables() {
    var tables = document.querySelectorAll('table');
    tables.forEach(table => table.remove());
}

function createComparisionTable(tableName, firstColumnName, secondColumnName, firstColumns, secondColumns) {
    var table = document.createElement('table');
    var th = document.createElement('th');
    var caption = document.createElement('caption');

    caption.textContent = tableName;
    table.appendChild(caption);
    th.textContent = firstColumnName;
    table.appendChild(th);
    th = document.createElement('th');
    th.textContent = secondColumnName;
    table.appendChild(th);

    for (var i = 0; i < firstColumns.length; i++) {
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        td.textContent = firstColumns[i].number + ' ' + firstColumns[i].info + ' ' + firstColumns[i].time;
        tr.appendChild(td);

        if (secondColumns.length > i) {
            td = document.createElement('td');
            td.textContent = secondColumns[i].number + ' ' + secondColumns[i].info + ' ' + secondColumns[i].time;
            tr.appendChild(td);
        }

        table.appendChild(tr);
    }
    
    gridItem3.appendChild(table);
}

function randomPlace() {
    greenCircle.style.left = Math.random() * greenCircle.offsetParent.offsetWidth + 'px';
    redCircle.style.top = Math.random() * redCircle.offsetParent.offsetHeight + 'px';
}

function startAnimation() {
    var greenDirection = 1;
    var redDirection = 1;

    anim = setInterval(function() {
        var greenLeft = parseInt(greenCircle.style.left);
        var redTop = parseInt(redCircle.style.top);

        if (greenLeft >= greenCircle.offsetParent.offsetWidth - greenCircle.offsetWidth || greenLeft <= 0) {
            greenDirection *= -1;
            logOneEvent('green change direction');
        }

        if (redTop >= redCircle.offsetParent.offsetHeight - redCircle.offsetHeight || redTop <= 0) {
            redDirection *= -1;
            logOneEvent('red change direction');
        }

        greenCircle.style.left = greenLeft + 5 * greenDirection + 'px';
        redCircle.style.top = redTop + 5 * redDirection + 'px';

        logOneEvent('green circle position: ' + greenCircle.style.left + ' ' + greenCircle.style.top);
        logOneEvent('red circle position: ' + redCircle.style.left + ' ' + redCircle.style.top);

        if (greenCircle.getBoundingClientRect().left < redCircle.getBoundingClientRect().right &&
            greenCircle.getBoundingClientRect().right > redCircle.getBoundingClientRect().left &&
            greenCircle.getBoundingClientRect().top < redCircle.getBoundingClientRect().bottom &&
            greenCircle.getBoundingClientRect().bottom > redCircle.getBoundingClientRect().top) {
            clearInterval(anim);
            logOneEvent('collision');
            stop.style.display = 'none';
            reload.style.display = 'inline-block';
        }
    }, 30);
}

function logOneEvent(newText) {
    text.innerText = newText;

    fetch("http://98.83.25.7:8000/save-one-event", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            number: logCount,
            info: newText
        })
    });

    var events = JSON.parse(localStorage.getItem('events')) || [];
    events.push({ number: logCount, info: newText, time: new Date().toLocaleString() });
    localStorage.setItem('events', JSON.stringify(events));
    logCount++;
}

function logAllEvents() {
    fetch("http://98.83.25.7:8000/save-all-events", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            timed_events: JSON.parse(localStorage.getItem('events'))
        })
    }).then(() => {
        deleteComparisionTables();

        var localStorageEvents = JSON.parse(localStorage.getItem('events'));

        fetch("http://98.83.25.7:8000/get-by-one-events", {
            method: "GET"
        }).then(response => response.json()).then(data => {
            console.log(data)
            createComparisionTable('When every event is sent to server', 'local', 'server', localStorageEvents, data);
        });

        fetch("http://98.83.25.7:8000/get-by-all-events", {
            method: "GET"
        }).then(response => response.json()).then(data => {
            console.log(data)
            createComparisionTable('When events are accumulated', 'local', 'server', localStorageEvents, data);
        });   
    });
}