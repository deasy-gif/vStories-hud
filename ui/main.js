const stats = {
    "health": {
        label: "health",
        value: 100,
        color: "#FE324A",
    },
    "armor": {
        label: "armor",
        value: 100,
        color: "#AB57FF",
    },
    "food": {
        label: "food",
        value: 100,
        color: "#FFA959",
    },
    "water": {
        label: "hydration",
        value: 100,
        color: "#5EF0E6",
    }
}

let seatBeltStatus = false

let car_indicators = {
    "seatbelt": {
        state: 0,
        key: "B"
    },
    "headlight": {
        state: 0,
        key: "H"
    },
    "doors": {
        state: 0,
        key: "U"
    },
    "engine": {
        state: 0,
        key: "Y"
    }
}

let sirens = {
    "mode": 0,
    //"use": 0,
    "code": 0,
    "aux": false
}

const settings = {}

toggleHud(true)

// generowanie settingsów
function generateSettings(_settings) {
    $("#hud-settings-container").html(`
        <button id="hud-settings-close">
            <i class="fal fa-times"></i>
        </button>
        <div class="hud-settings-header">
            <div class="menu-option-square">
            </div>
            <span>
                Ustawienia
            </span>
        </div>
    `)
    _settings.forEach((category) =>{
        $("#hud-settings-container").append(`
            <div class="hud-settings-title">
                ${category.label}
            </div>
        `);

        category["items"].forEach((setting) =>{
            settings[setting.id] = setting.value

            if(setting.type === 'toggle') {
                $("#hud-settings-container").append(`
                    <div class="hud-settings-option-container">
                        <div class="hud-settings-option-title">
                            <div class="menu-option-square2">
                            </div>
                            <span>
                                ${setting.label}
                            </span>
                        </div>
                        <label class="hud-settings-checkbox-container">
                            <input type="checkbox" class="hud-settings-checkbox-input" id="checkbox-${setting.id}" ${setting.value == 1 ? "checked": ""}>
                            <div class="hud-settings-checkbox">
                                ${setting.id != 'units_of_measurement' ? `
                                <div class="hud-settings-checkbox-unchecked">
                                    off
                                </div>
                                <div class="hud-settings-checkbox-checked">
                                    on
                                </div>
                                ` : `
                                <div class="hud-settings-checkbox-unchecked" style="border: 0.2vh #02E1A4 solid">
                                    km/h
                                </div>
                                <div class="hud-settings-checkbox-checked">
                                    mph
                                </div>
                                `}
                            </div>
                        </label>
                    </div>
                `);
            } else {
                $("#hud-settings-container").append(`
                    <div class="hud-settings-option-container">
                        <div class="hud-settings-option-title">
                            <div class="menu-option-square2">
                            </div>
                            <span>
                                ${setting.label}
                            </span>
                        </div>
                        <div class="hud-settings-range-container" id="bg-range-${setting.id}">
                            <input type="range" min="${setting.id == 'player_info_scale' ? 0.75 : 0}" max="${setting.id == 'player_info_scale' ? 1.0 : 100}" step="${setting.id == 'player_info_scale' ? 0.01 : 1}" value="${setting.value}" class="hud-settings-range" id="range-${setting.id}">
                            <div class="hud-settings-range-value" id="val-range-${setting.id}"></div>
                        </div>
                    </div>
                `);
            }
        })
    })

    const ranges = document.querySelectorAll('.hud-settings-range');
    const checkboxes = document.querySelectorAll('.hud-settings-checkbox-input');
    ranges.forEach(range =>{
        updateSlider(range, true);
        range.oninput = (e) =>
            updateSlider(e.target)
    })
    checkboxes.forEach(checkbox=>{
        checkbox.onchange = (e) =>
            updateCheckbox(e.target)
    })

    applySettings()
    $("#hud-settings-close").on('click', hideSettings);
}
//zamykanie i otwieranie settingsów
function showSettings() {
    $("#hud-settings-wrapper").fadeIn(1000)
}
function hideSettings() {
    $("#hud-settings-wrapper").fadeOut(1000)
    sendRequest("closeSettings")
}

//działanie sliderów w settingsach
const updateSlider = (target, isFirst) => {
    let target_id = $(target).attr('id');
    if(target_id != 'range-player_info_scale') {
        $(`#val-${target_id}`).html(`${target.value}%`)
    } else {
        $(`#val-${target_id}`).html(`x${parseFloat(target.value).toFixed(2).replace(/\.?00+$/, ".0")}`)
    }
    $(`#bg-${target_id}`).css('background',`linear-gradient(90deg, rgba(255, 255, 255, 0.175) 0%, rgba(255, 255, 255, 0.175) ${target.value}%, transparent ${target.value}%, transparent 100%)`)
    if(target.value == 0) {
        $(`#bg-${target_id}`).css('border', '0.2vh #FF3F3F solid')
    } else {
        $(`#bg-${target_id}`).css('border', '0.2vh #02E1A4 solid')
    }

    if (isFirst !== true) {
        const id = target_id.substr(6)
        settings[id] = target.value
        sendRequest("saveSetting", {id: id, value: target.value})
        applySettings()
    }
}
const updateCheckbox = (target) => {
    const id = $(target).attr('id').substr(9);
    const value = $(target).is(":checked") ? 1 : 0

    settings[id] = value
    sendRequest("saveSetting", {id: id, value: value})
    applySettings()
}

const applySettings = ()=> {
    togglePlayerStats(settings["display_stats"] == 1)
    toggleHint(settings['hints'])
}
// updatowanie mica
function updateMic(val) {
    switch (val) {
        case 1:
            $("#mic-level").css('height', '33%');
            break;
        case 2:
            $("#mic-level").css('height', '66%');
            break;
        case 3:
            $("#mic-level").css('height', '100%');
            break;
        default:
            break;
    }
}

function showTalking(isTalking) {
    if (isTalking) {
        $("#mic-img").addClass('statusItem-pulse')
        $("#mic-img").attr('src', 'img/mic_active.svg')
    }  else {
        $("#mic-img").removeClass('statusItem-pulse')
        $("#mic-img").attr('src', 'img/mic.svg')
    }
}

function toggleSirens(type, value) {
    if(type === 'horn' || type === 'manual') {
        if(value) {
            $(`#sirens-${type}`).addClass("active-sirens-use-btn")
        } else {
            $(`#sirens-${type}`).removeClass("active-sirens-use-btn")
        }
    } else if(type ==='aux') {
        if(value) {
            $(`#sirens-aux`).addClass("active-sirens-aux-btn")
        } else {
            $(`#sirens-aux`).removeClass("active-sirens-aux-btn")
        }
    } else {
        // if(type === 'horn' && value) {
        //     $(`.active-sirens-mode-btn`)[0].removeClass(`active-sirens-mode-btn`);
        // }
        $(`.active-sirens-${type}-btn`).removeClass(`active-sirens-${type}-btn`);
        $(`#sirens-${type}-${value}`).addClass(`active-sirens-${type}-btn`);
    }
}


// funkcja wyswietlajaca przyciski w carhudzie z configu
function prepareIndicators() {
    $('#car-dash-buttons-container').html('');
    $.each(car_indicators, function(type){
        $('#car-dash-buttons-container').append(`
            <div class="car-dash-buttons" id="${type}-container">
                <img class="car-dash-buttons-img" src="img/indicators/${type}-${car_indicators[type].state}.svg" id='${type}-img'>
                <div class="car-dash-buttons-key car-dash-buttons-key-state-${type === "seatbelt" ? type : car_indicators[type].state}" id='${type}-key'>
                    ${car_indicators[type].key}
                </div>
            </div>
        `);
    });
    $("#seatbelt-container").css({'top': '10vh', 'left': '-4.3vh'});
    $("#headlight-container").css({'top': '13vh', 'left': '-4.1vh'});
    $("#doors-container").css({'top': '16vh', 'left': '-3.4vh'});
    $("#engine-container").css({'top': '19vh', 'left': '-2.2vh'});
    // $("#seatbelt-container").css('top', '2vh', 'left', '2vh');
}
// funkcja updatująca nazwe ulicy oraz kierunek jazdy
function updateStreetLabel(direction, label1, label2) {
    $('#gps-direction').html(direction);
    $('#gps-location-1').html(label1);
    $('#gps-location-2').html(label2);
}

// funkcja przelaczajaca przyciski w car hudzie (pasy itp)
function toggleIndicator(type, state){
    let number = state === true ? 1 : 0
    if (typeof(state) === "string"){
        number = state
    }

    const keyElement = document.getElementById(`${type}-key`)

    keyElement.className = "car-dash-buttons-key"
    keyElement.classList.add(`car-dash-buttons-key-state-${type === "seatbelt" && number == 0 ? "seatbelt" : number}`)
    document.getElementById(`${type}-img`).src = `img/indicators/${type}-${number}.svg`
} 

function createCharacterStats() {
    $('#status').html('')

    $.each(stats, function(type){
        $('#status').append(`
            <div id="${type}" class="statusItem">
                <div>
                    <svg viewBox="0 0 300 300" style="transform: rotate(90deg);">
                        <defs>
                                <linearGradient id="gradient-${stats[type].label}">
                                    <stop
                                        offset="100%"
                                        style="stop-color:${stats[type].color}; stop-opacity: 1;"
                                    />
                                    <stop
                                        offset="100%"
                                        style="stop-color:${stats[type].color}; stop-opacity: 1;"
                                    />
                                </linearGradient>

                                <filter id="shadowsvg">
                                    <feDropShadow dx="0" dy="0" stdDeviation="5"
                                        flood-color="black"/>
                                </filter>
                        </defs>
                        <path
                            transform="translate(100,100)"
                            strokeLinejoin="round"
                            fill="rgba(0,0,0,0.4)"
                            stroke="url(#gradient-${stats[type].label})"
                            stroke-opacity="1"
                            d="M38,2 
                            L82,2 
                            A12,12 0 0,1 94,10 
                            L112,44 
                            A12,12 0 0,1 112,56
                            L94,90
                            A12,12 0 0,1 82,98
                            L38,98
                            A12,12 0 0,1 26,90
                            L8,56
                            A12,12 0 0,1 8,44
                            L26,10
                            A12,12 0 0,1 38,2"
                        ></path>
                    </svg>
                    <img src="img/characterStats/${stats[type].label}.svg">
                </div>
            </div>
        `)
    })
}

function updateCharacterStats(name, value) {
    const percentage = 100 - value;
    const percentage_offset1 = percentage - 10;
    const percentage_offset2 = percentage + 10;
    const opacity = percentage_offset1 < -9 ? 1 : 0;
    const opacity2 = value <= 0 ? 0 : 1;

    if (settings["pulse_when_low"] != 0 && value <= settings["pulse_when_low"]) {
        $(`#${name}`).addClass('statusItem-pulse');
    } else {
        $(`#${name}`).removeClass('statusItem-pulse');
    }

    if (name === "armor" && settings["display_armor"] == 1 && value == 0) {
        return $(`#${name}`).hide();
    }

    if (value > settings[`min_${name}_value`]) {
        $(`#${name}`).hide();
    } else {
        $(`#${name}`).show();
        $(`#gradient-${stats[name].label}`).html(`
            <stop
                offset="${percentage_offset1}%"
                style="stop-color:${stats[name].color}; stop-opacity: ${opacity};"
            />
            <stop
                offset="${percentage_offset2}%"
                style="stop-color:${stats[name].color}; stop-opacity: ${opacity2};"
            />
        `)
    }
}

function toggleScoreboard(state, data) {
    switch (state) {
        case true: {
            $('.scoreboard').show();
            updateScoreboard("players", data.players);
            updateScoreboard("police", data.groups.police.count);
            updateScoreboard("ems", data.groups.ambulance.count);
            updateScoreboard("doj", data.doj.count);
            updateScoreboard("mech", data.groups.mechanic.count);
            // updateScoreboard("taxi", data.taxi.count);
            updateMaxPlayers(data.maxPlayers);
            break;
        }
        default: {
            $('.scoreboard').hide();
            break;
        }
    }
}

function updateScoreboard(faction, count) {
    $(`.${faction}`).children('.count').html(count);
}

function updateMaxPlayers(count) {
    $('.max-players').html('/' + count)
}




// zadymiarskie powiadomienia
let template, baseClass = 'polnotif', notificationsList = [],
    listElement = document.getElementById("polnotif-container"),
    template_itemnotif, baseClass_itemnotif = 'progressbar-usage',
    notificationsList_itemnotif = [], listElement_itemnotif  =  document.getElementById('progressbar-usage-container'),
    baseClass_notif = 'notif', notificationsList_notif = [], listElement_notif = document.getElementById('notif-container'),
    template_notif;
    


// notificationsList.push(
//     {
//         code: '10-73',
//         color: '#abcabc',
//         time: '',
//         title: 'Zgłoszenie z centrali',
//         content: []
//     }
// );
// notificationsList_itemnotif.push(
//     {
//         title1: 'Użyto',
//         title2: 'Piwo',
//         time: '',
//         item: 'beer' //img
//     }
// );

template = (() => {
	let elm = document.getElementsByClassName('polnotif')[0],
	    tmp = elm.cloneNode(true)
	
	tmp.classList.add(baseClass + '--Close')
	tmp.classList.add(baseClass + '--Optimize')
	
	elm.remove()
	
	listElement.innerHTML = ''
	
	return tmp
})()

template_itemnotif = (() => {
	let elm = document.getElementsByClassName('progressbar-usage')[0],
	    tmp = elm.cloneNode(true)
	
	//tmp.classList.add(baseClass_itemnotif + '--Close')
	tmp.classList.add(baseClass_itemnotif + '--Optimize')
	
	elm.remove()
	
	listElement_itemnotif.innerHTML = ''
	
	return tmp
})()

template_notif = (() => {
	let elm = document.getElementsByClassName('notif')[0],
	    tmp = elm.cloneNode(true)
	
	//tmp.classList.add(baseClass + '--Close')
	tmp.classList.add(baseClass + '--Optimize')
	
	elm.remove()
	
	listElement.innerHTML = ''
	
	return tmp
})()

function Notification (template, _class, config = {}) {
	const element = template.cloneNode(true)
	
	function handler (__class, attr, value) {
        const tmp = element.getElementsByClassName(_class + __class)[0]
		switch (attr) {
            case "content": {
                for (let i = 0; i < value.length; i++) {
                    element.getElementsByClassName(`polnotif-row-${value[i].type}`)[0].style.display = 'flex';
                    element.getElementsByClassName(`polnotif-row-text-${value[i].type}`)[0].innerText = value[i].text
                }

                break
            }
            case "value": {
                tmp.innerHTML = value
                break
            }
            case "color": {
                tmp.style.background = value
                break
            }
            case "src": {
                $(tmp).attr('src', value)
            }
            default: break;
        }
	}

    switch (_class) {
        case "polnotif": {
            handler('-header-code', 'value', config.title1)
            handler('-header-code', 'color', config.bgColor)
            handler('-header-title', 'value', config.title2)
            handler('', 'content', config.content)
            break
        }
        case "progressbar-usage": {
            handler('-title', 'value', config.title1)
            handler('-title2', 'value', config.title2)
            // if(config.meta) {
                // handler('-img', 'src', `https://img.realmrp.pl/off/clothes/${config.item}_${config.meta.number}_${config.meta.color}.webp`)
            // } else {
                handler('-img', 'src', `https://img.realmrp.pl/off/items/${(config.item).toLowerCase()}.webp`)
            // }
            break
        }
        case "notif": {
            handler('-title', 'value', config.header)
            handler('-desc', 'value', config.content)
            handler('-img', 'src', `img/notif/${config.type}.png`)
            break
        }
        default: break;
    }
	
	return element
}

// function Notification_itemnotif (config = {}) {
// 	const element = template_itemnotif.cloneNode(true)
	
// 	function handler (klass, attr, value) {
//         const tmp = element.getElementsByClassName(baseClass_itemnotif + klass)[0]
// 		switch (attr) {
//             case "src": {
//                 $(tmp).attr('src', `https://cfx-nui-realm_inventory/web/build/assets/img/items/${value}.png`)
//             }
//             case "value": {
//                 tmp.innerText = value
//                 break
//             }
//             default: break;
//         }
// 	}
	
// 	handler('-title', 'value', config.title1)
// 	handler('-title2', 'value', config.title2)
// 	handler('-img', 'src', config.item)
	
// 	return element
// }

function addNotification (notification, callback) {
	listElement.insertAdjacentElement('beforeEnd', notification)
	
	setTimeout(() => {
		notification.classList.remove(baseClass + '--Close')
		setTimeout(() => {
			notification.classList.remove(baseClass + '--Optimize')
			
			if (typeof callback === 'function') callback()
		}, 875)
	}, 25)

    setTimeout(() =>{
        // let tmp;
	
        // tmp = document.getElementsByClassName(baseClass)
        
        // for (let i = 0; i < tmp.length; i++) {
        //     if (!tmp[i].classList.contains(baseClass + '--Close')) {
        //         notification = tmp[i]
        //         break
        //     }
        // }
        
        removeNotification(notification, () => {
            if (!listElement.children.length) {
                listElement.innerHTML = ''
            }
        })
    }, 5000)
}

function addNotification_itemnotif (notification, callback) {
	listElement_itemnotif.insertAdjacentElement('beforeEnd', notification)
	progressbar_usage(notification)
	setTimeout(() => {
        notification.classList.add(baseClass_itemnotif + '--Open')
		notification.classList.remove(baseClass_itemnotif + '--Close')
		setTimeout(() => {
			notification.classList.remove(baseClass_itemnotif + '--Optimize')
			
			if (typeof callback === 'function') callback()
		}, 875)
	}, 25)

    setTimeout(() =>{
        // let tmp;
	
        // tmp = document.getElementsByClassName(baseClass_itemnotif)
        
        // for (let i = 0; i < tmp.length; i++) {
        //     if (!tmp[i].classList.contains(baseClass_itemnotif + '--Close')) {
        //         notification = tmp[i]
        //         break
        //     }
        // }
        
        removeNotification_itemnotif(notification, () => {
            if (!listElement_itemnotif.children.length) {
                listElement_itemnotif.innerHTML = ''
            }
        })
    }, 5000)
}

function addNotification_notif (notification, time, callback) {
	listElement_notif.insertAdjacentElement('beforeEnd', notification)
	progressbar_notif(notification, time)
	setTimeout(() => {
        notification.classList.add(baseClass_notif + '--Open')
		notification.classList.remove(baseClass_notif + '--Close')
		setTimeout(() => {
			notification.classList.remove(baseClass_notif + '--Optimize')
			
			if (typeof callback === 'function') callback()
		}, 875)
	}, 25)

    setTimeout(() =>{        
        removeNotification_notif(notification, () => {
            if (!listElement_notif.children.length) {
                listElement_notif.innerHTML = ''
            }
        })
    }, time)
}

function removeNotification (notification, callback) {
	notification.classList.add(baseClass + '--Optimize')
	notification.classList.add(baseClass + '--Close')
	
	setTimeout(() => {
		notification.remove()
		
		if (typeof callback === 'function') callback()
	}, 875)
}
function removeNotification_itemnotif (notification, callback) {
    notification.classList.remove(baseClass_itemnotif + '--Open')
	notification.classList.add(baseClass_itemnotif + '--Optimize')
	notification.classList.add(baseClass_itemnotif + '--Close')
	
    setTimeout(() => {
        notification.remove()
        
        if (typeof callback === 'function') callback()

    }, 500)
}
function removeNotification_notif (notification, callback) {
    notification.classList.remove(baseClass_notif + '--Open')
	notification.classList.add(baseClass_notif + '--Optimize')
	notification.classList.add(baseClass_notif + '--Close')
	
    setTimeout(() => {
        notification.remove()
        
        if (typeof callback === 'function') callback()

    }, 500)
}

let showOxygenTimeout
let hideOxygenTimeout
const updateOxygen = (state, percentage) => {
    switch (!!state) { // sztuczka na zamiane na boolean
        case true: {
            if ($('#oxygen-level-container').css('display') === "none") {
                clearTimeout(hideOxygenTimeout);

                showOxygenTimeout = setTimeout(() => {
                    $("#oxygen-level-container").css("display", "flex")
                    $("#oxygen-level-container").fadeTo(500, 1);
                }, 100)
            }

            document.getElementById("oxygen-level-progressbar").style.width = `${percentage >= 0 ? percentage : 0}%`;
            document.getElementById("oxygen-level-value").innerHTML = `${Math.round(percentage >= 0 ? percentage : 0)}%`
            break;
        }
        case false: {
            clearTimeout(showOxygenTimeout);
            hideOxygenTimeout = setTimeout(() => {
                $('#oxygen-level-container').fadeTo(500, 0, () => {
                    $("#oxygen-level-container").css("display", "none")
                });
            }, 100)
        }
        default: break;
    }
}

let progressBar
function showProgressBar(title, time) {
    $('#progressbar-white-container').css("display", "flex");
    $("#progressbar-white-container").fadeTo(500, 1);

    $("#progressbar-white-title").html(title);
    const elem = document.querySelector("#progressbar-white");
    let width = 0;

    const frame = () => {
        if (width >= 100) {
            sendRequest("finishProgressBar")
            clearInterval(progressBar);

            $('#progressbar-white-container').fadeTo(500, 0, () => {
                $('#progressbar-white-container').css("display", "none")
            });
        } else {
            width += 100 / (time / 1000) / 20;
            elem.style.width = width + "%";
        }
    }
    progressBar = setInterval(frame, 50); // 20 hz
}

function cancelProgressBar() {
    clearInterval(progressBar);

    $('#progressbar-white-container').fadeTo(500, 0, () => {
        $('#progressbar-white-container').css("display", "none")
    });
}

// PROGRESS BAR TEN ZIELONY (ITEMY)
function progressbar_usage(element) {
    const time = 5000 // w milisekundach
    const elem = element.querySelector(".progressbar-usage-bar");
    let height = 100;

    const frame = () => {
        if (height <= 0) {
            clearInterval(progressbarUsageInterval);
        } else {
            height -= 100 / (time / 1000) / 20;
            elem.style.height = height + "%";
        }
    }
    const progressbarUsageInterval = setInterval(frame, 50); // 20 hz
}
function progressbar_notif(element, _time) {
    const time = _time // w milisekundach
    const elem = element.querySelector(".notif-progressbar-circle");
    let radius = elem.r.baseVal.value;
    let circumference = radius * 2 * Math.PI;
    let value = circumference;
    elem.style.strokeDasharray = `${value} ${circumference}`;

    const frame = () => {
        if (value <= 0) {
            clearInterval(progressbarNotifInterval);
        } else {
            value -= circumference / (time / 1000) / 20;
            elem.style.strokeDasharray = `${value} ${circumference}`;
        }
    }
    const progressbarNotifInterval = setInterval(frame, 50); // 20 hz
}

// to gowno rysuje tło obrotów
function drawSpeedometer() {
    let circle = document.getElementById("speedometer-background");
    let radius = circle.r.baseVal.value;
    let circumference = radius * 2 * Math.PI;

    let gap = circumference*(1/300);
    let line1 = circumference*(1/2);
    let line2 = circumference*(1/8) - gap;
    let line3 = line2/3 - 3*gap;

    circle.style.strokeDasharray = `${line1} ${gap} ${line2} ${gap} ${line3} ${gap} ${line3} ${gap} ${line3} ${gap} ${line3} ${circumference} `;

    let circle_nitro = document.getElementById("nitro-background");
    let radius_nitro = circle_nitro.r.baseVal.value;
    let circumference_nitro = radius_nitro * 2 * Math.PI;
    let line_nitro = circumference_nitro*(1/15);
    let gap_nitro = circumference_nitro*(1/200);
    circle_nitro.style.strokeDasharray= `${line_nitro} ${gap_nitro} ${line_nitro} ${gap_nitro} ${line_nitro} ${gap_nitro} ${line_nitro} ${circumference_nitro}`;

}

function drawNitro(val) {
    let circle = document.getElementById("nitro");
    let radius = circle.r.baseVal.value;
    let circumference = radius * 2 * Math.PI;
    let full = 278*1.314
    let percentage_nitro = val/full
    let gap_nitro = circumference*(1/200);
    circle.style.strokeDasharray = `${circumference * percentage_nitro} ${circumference}`;
    if (val > 74) {
        circle.style.strokeDasharray = `${circumference * (1/15)} ${gap_nitro} ${circumference * (1/15)} ${gap_nitro} ${circumference * (1/15)} ${gap_nitro} ${circumference * (val-74)/full} ${circumference}`;
    } else if (val > 49) {
        circle.style.strokeDasharray = `${circumference * (1/15)} ${gap_nitro} ${circumference * (1/15)} ${gap_nitro} ${circumference * (val-49)/full} ${circumference}`;
    } else if (val > 24) {
        circle.style.strokeDasharray = `${circumference * (1/15)} ${gap_nitro} ${circumference * (val-24)/full} ${circumference}`;
    } else {
        circle.style.strokeDasharray = `${circumference * percentage_nitro} ${circumference}`;
    }
}

// to gówno updatuje aktualne val obrotów
function updateRPM(val) {
    let circle = document.getElementById("speedometer");
    let bar = document.getElementById("speedometer-bar");
    let radius = circle.r.baseVal.value;
    let circumference = radius * 2 * Math.PI;

    // let full = 100*1.465
    let full = 100*1.314
    let percentage_speed = val/full
    let gap = circumference*(1/300);
    let line2 = circumference*(1/8) - gap;
    let line3 = line2/3 - 3*gap;

    bar.style.strokeDasharray = `0 ${circumference*percentage_speed} 0.5vh ${circumference}`;
    //circle.style.strokeDasharray = `${circumference*percentage_speed} ${circumference}`;
    if(val < 65.7) {
        circle.style.strokeDasharray = `${circumference*percentage_speed} ${circumference}`;
    } 
    else if (val < 82.15) {
        circle.style.strokeDasharray = `${circumference*(1/2)} ${gap} ${circumference*(val-65.7)/full} ${circumference}`;
    } else if (val < 86.6) {
        circle.style.strokeDasharray = `${circumference*(1/2)} ${gap} ${line2} ${gap} ${circumference*(val-82.15)/full} ${circumference}`;
    } else if (val < 91.05) {
        circle.style.strokeDasharray = `${circumference*(1/2)} ${gap} ${line2} ${gap} ${line3} ${gap} ${circumference*(val-86.6)/full} ${circumference}`;
    } else if (val < 95.5) {
        circle.style.strokeDasharray = `${circumference*(1/2)} ${gap} ${line2} ${gap} ${line3} ${gap} ${line3} ${gap} ${circumference*(val-91.05)/full} ${circumference}`;
    } else {
        circle.style.strokeDasharray = `${circumference*(1/2)} ${gap} ${line2} ${gap} ${line3} ${gap} ${line3} ${gap} ${line3} ${gap} ${circumference*(val-95.5)/full} ${circumference}`;
    }
}

const updateDigits = (_value, type) => {
    const length =  type === "speed" ? 3
                    : type === "id" ? 4
                    : 5; // index
    const value = _value.toString().padStart(length, "0");

    for (let i = 0; i < length; i++) {
        $(`#${type}-digit-${i + 1}`).html(value[i]);
    }

    $(`.zero-${type}`).removeClass(`zero-${type}`);

    for (let i = 0; i < length; i++) {
        if (value[i] != 0) {
            break;
        }

        $(`#${type}-digit-${i + 1}`).addClass(`zero-${type}`);
    }
}
const updatePlayerInfoScale = () => {
    $('#info-container').css('transform', `scale(${settings['player_info_scale']}`);
}

const updateCarHudUnits = () => {
    $('#car-dash-values-units').html(`${settings['units_of_measurement'] ? 'mph' : 'km/h'}`)
}
// funkcja od updatowania predkosci
function updateSpeed(value) {
    updateDigits(value, "speed")
}

//zmiana itemu w slocie
function updateItemSlot(number, name) {
    const slot = $(`#item-slot-${number}`).find('img')

    if (number && name) {
        slot.attr("src", `https://img.realmrp.pl/off/items/${name.toLowerCase()}.webp`);
        slot.show()
    } else {
        slot.hide()
        slot.attr("src", ``);
    }
}

// let elobenc = 0
// let dupka = setInterval(tescik, 5)
// function tescik() {
//     if(elobenc > 100) {
//         clearInterval(dupka);
//     } else {
//     drawSpeedometer2(elobenc)
//     elobenc = elobenc + 0.1;
//     }
// }

// updateCarHud1(20, 30, 40, 0, 50)

function updatePlayerId(playerId, userId) {
    // $('#player-id').html(playerId);
    updateDigits(playerId, "id");
    const userIdNew = userId.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    // $('#player-index').html(`#${userIdNew}`);
    updateDigits(userIdNew, "index");
}

function toggleHud(state) {
    if (state) {
        $("#hud-container").show()
    } else {
        $("#hud-container").hide()
    }
}

function toggleCarHud(state, hasNitrous) {
    if (state) {
        $("#car-dash").css("display", "flex")
        drawSpeedometer();
        updateSpeed(0)
        updateRPM(0);
        if (hasNitrous) {
            drawNitro(0);
            $("#nitro").show()
            $("#nitro-background").show()  
        }
    } else {
        $("#car-dash").css("display", "none")
        $("#nitro").hide()
        $("#nitro-background").hide()  
    }
}

function toggleStreetLabel(state) {
    if (state) {
        $("#gps-container").css("display", "flex")
    } else {
        $("#gps-container").css("display", "none")
    }
}

function togglePlayerStats(state) {
    if (state) {
        $("#status").css("display", "flex")
    } else {
        $("#status").css("display", "none")
    }
}

function toggleSirenController(state) {
    if (state) {
        $('#sirens-container').css("display", "flex")
    } else {
        $('#sirens-container').css("display", "none")
    }
}

function toggleBoundItems(state) {
    if (state) {
        // $("#item-slots").css('opacity', 1)
        $("#item-slots").animate({
            'marginBottom': '0',
            'opacity': 1
        }, 300);
    } else {
        $("#item-slots").animate({
            'marginBottom': '-12vh',
            'opacity': 0
        }, 300);
        // setTimeout(function() {
        //     $("#item-slots").css('display', 'none')
        // }, 500)
    }
}

// key info

const updateKeyInfo = (keys) => {
    $("#keys-info-container").html('')
    let keyCounter = 0
    $.each(keys, function(index, data) {
        if (keyCounter % 3 == 0) {
            $("#keys-info-container").append(`
                <div class='keys-info-column'>
                </div>
            `)
        }
        $(".keys-info-column").last().append(`
            <div class='keys-info-flex'>
                <div class='keys-info-key'>
                    ${data.key.length > 1 ? 
                        `
                            <img class='keys-info-keyimg' src='img/keys/${data.key}.png' >
                        ` 
                            : 
                        `
                            ${data.key}
                        `
                    }
                </div>
                <svg viewBox="0 0 122 100" style="transform: rotate(90deg);">
                    <!-- <defs>
                            <linearGradient class="keys-info-stroke">
                                <stop
                                    offset="0%"
                                    style="stop-color: red; stop-opacity: 1;"
                                />
                                <stop
                                    offset="0%"
                                    style="stop-color: red; stop-opacity: 1;"
                                />
                            </linearGradient>
                    </defs> -->
                    <path
                        strokeLinejoin="round"
                        fill="rgba(0,0,0,0.5)"
                        stroke="#02E1A4"
                        stroke-width="8"
                        stroke-opacity="1"
                        d="M38,2 
                        L82,2 
                        A12,12 0 0,1 94,10 
                        L112,44 
                        A12,12 0 0,1 112,56
                        L94,90
                        A12,12 0 0,1 82,98
                        L38,98
                        A12,12 0 0,1 26,90
                        L8,56
                        A12,12 0 0,1 8,44
                        L26,10
                        A12,12 0 0,1 38,2"
                    ></path>
                </svg>
                <div class='keys-info-label'>
                    ${data.msg}
                </div>
            </div>
        `)
        keyCounter++;
    })
}

// hints

const toggleHint = (status, data, clear) => {
    if(status && settings['hints'] == true) {
        if (data?.title && data?.content) {
            $("#hint-title").text(data.title)
            $("#hint-content").html(data.content)
        }

        if ($("#hint-title").text() != "" && $("#hint-content").html()) {
            $("#hint-container").show()
        }
    } else {
        $("#hint-container").hide()

        if (clear) {
            $("#hint-title").text('')
            $("#hint-content").html('')
        }
    }
}

window.addEventListener('message', (event) => {
    const data = event.data
    switch (data.action) {
        case "updateTalking":
            showTalking(data.talking)
            break;
        case "updateMumble":
            updateMic(data.status)
            break;
        case "updatePlayerId":
            updatePlayerId(data.id, data.index)
            break;
        case "updateBasics":
            updatePlayerInfoScale()
            updateCharacterStats("health", data.health)
            updateCharacterStats("armor", data.armor)
            break;
        case "updateStatus":
            updateCharacterStats("food", data.food);
            updateCharacterStats("water", data.water);
            break;
        case "showFactionNotification":
            addNotification(Notification(template, baseClass, data.data))
            break;
        case 'updateCarHud':
            toggleIndicator("doors", data.isVehicleLocked)
            toggleIndicator("engine", data.isVehicleBroken === true ? "3" : !data.isEngineRunning)
            toggleIndicator("headlight", data.hasLightsOn === true ? data.lightsType : false)

            updateCarHudUnits()

            updateSpeed(data.speed)
            updateRPM(data.rpm)
            updateStreetLabel(data.direction, data.zone, data.street)

            if (data.hasNitrous === true) {
                drawNitro(data.nitrousFuel)
            }

            break;
        case "updateSeatBelt":
            if (seatBeltStatus != data.status) {
                seatBeltStatus = data.status
                toggleIndicator("seatbelt", seatBeltStatus)
            }
            break;
        case "hideHud":
            toggleHud(false)
            break;
        case "showHud":
            toggleHud(true)
            break;
        case "showCarHud":
            toggleCarHud(true, data.hasNitrous)
            toggleStreetLabel(true)
            break;
        case "hideCarHud":
            toggleCarHud(false)
            toggleStreetLabel(false)
            break;
        case "toggleSirenControl":
            toggleSirenController(data.state)
            break;
        case "toggleBodycamNoUpdate":
            toggleBodycam(data.state);
            break;
        case "toggleBodycam":
            toggleBodycam(data.state);
            updateBodycamData("bodycam", data.data.name, data.data.department);
            break;
        case "toggleGoPro":
            toggleBodycam(data.state);
            updateBodycamData("gopro");
            break;
        case "loadSettings":
            generateSettings(data.settings)
            break;
        case "displaySettings":
            showSettings()
            break;
        case "toggleBoundItems":
            toggleBoundItems(data.state);
            break
        case "toggleSirens":
            toggleSirens(data.type, data.state)
            break
        case "updateItemSlot":
            updateItemSlot(data.number, data.name)
            break
        case "itemNotification":
            addNotification_itemnotif(Notification(template_itemnotif, baseClass_itemnotif, data.data))
            break
        case "sendNotification":
            addNotification_notif(Notification(template_notif, baseClass_notif, data.data), data.data.time)
            break
        case "showProgressBar":
            showProgressBar(data.label, data.duration)
            break
        case "cancelProgressBar":
            cancelProgressBar();
            break
        case "updateOxygen":
            updateOxygen(data.state, data.percentage)
            break;
        case "refreshKeyInfo":
            updateKeyInfo(data.data)
            break;
        case "toggleCam": {
            isCamEnabled = data.status
            if (isCamEnabled === true) {
                toggleHud(false)
            } else {
                toggleHud(true)
            }
            break;
        }
        // case "loaded":{
        //     sendRequest('documentReady')
        //     break
        // }
        case "toggleScoreboard":
            toggleScoreboard(data.state, data.data)
            break;
        // case "switchNotifs":
        //     switchNotifs(true);
        //     break;
        // case "clearNotifs":
        //     $('#all-notifs').html('');
        //     $('#new-notifs').html('');
        //     break;
        case "hidePlayerStats":
            togglePlayerStats(false)
            break;
        case "showPlayerStats":
            togglePlayerStats(true)
            break;
        // case "hideWaterMark":
        //     toggleWaterMark(false)
        //     break;
        // case "showWaterMark":
        //     toggleWaterMark(true)
        //     break;
        case "displayBindings":
            toggleItemSlots(true)
            break;
        case "hideBindings":
            toggleItemSlots(false)
            break;
        // case "bodycamBeep":
        //     bodycamBeep();
        //     break;
        default:
            break;
    }
});

const sendRequest = async (action = "", data = {}) => {
    return new Promise((resolve, reject) => {
        if (typeof(GetParentResourceName) === "function") {
            fetch(`https://${GetParentResourceName()}/${action}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                },
                body: JSON.stringify(data)
            })
                .then(response => response.json())
                .then(result => {
                    resolve(result)
                })
                .catch(error => {
                    reject(error)
                });
        } else {
            console.log(action)
            console.log(JSON.stringify(data, null, 4))
        }
    })
}

updateMic(2);
prepareIndicators();
createCharacterStats();
drawSpeedometer();
updateSpeed(0)
updateRPM(0);
drawNitro(0);