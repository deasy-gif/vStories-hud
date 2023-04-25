let bodycamInterval

function toggleBodycam(state) {
    switch (state) {
        case true:
            updateDate()

            $('#bodycam-container').css('display', 'flex');

            bodycamInterval = setInterval(function() {
                updateDate();
            }, 1000);

            break;
        default:
            $('#bodycam-container').css('display', 'none');

            clearInterval(bodycamInterval)

            break;
    }
}

function updateBodycamData(type, officer, deptName) {
    switch (type) {
        case "bodycam":
            $('#bodycam-row-1').html(`REC <i id="dot" class="fas fa-circle"></i> AXON BODY 3`);
            $('#bodycam-row-2').html(officer);
            $('#bodycam-row-3').html(deptName);
            $('#bodycam-img').attr('src', 'https://i.imgur.com/AokuZ59.png');
            break;
    
        case "gopro":
            $('#bodycam-row-1').html(`REC <i id="dot" class="fas fa-circle"></i> GoPro`);
            $('#bodycam-row-2').html('');
            $('#bodycam-row-3').html('');
            $('#bodycam-img').attr('src', 'https://i.imgur.com/oS6ssal.png');
            break;
    }
}

const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
]

function updateDate() {
    const date = new Date();
    const day = date.getDate().toString().padStart(2, "0");
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    let ampm = "AM";
    let hours = date.getHours();
    if(hours > "12") {
        hours = hours - 12;
        ampm = "PM";
    }

    hours.toString().padStart(2, "0");

    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    $('#bodycam-info-date').html(`${day} ${month} ${year} | ${hours}:${minutes}:${seconds} ${ampm}`);
}

function toDateTime(secs) {
    const t = new Date(Date.UTC(1970, 0, 1));
    t.setUTCSeconds(secs);
    return t;
}

const updateBodycamClock = (time) => {
    document.getElementById('bodycam-clock').innerText = time
}

const updateBodycamDate = (time) => {
    const date = toDateTime(time)

    const day = date.getDate().toString().padStart(2, "0");
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    document.getElementById('bodycam-date').innerText = `${day} ${month} ${year}`
}