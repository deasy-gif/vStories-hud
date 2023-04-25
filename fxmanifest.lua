fx_version 'adamant'

game 'gta5'

version '1.0.0'

server_scripts {
	'@oxmysql/lib/MySQL.lua',
    'config.lua',
    'server/*.lua',
}

client_scripts {
    'config.lua',
    'client.lua',
    'scoreboard.lua'
}

ui_page "ui/index.html"

files {
    'ui/index.html',
    'ui/style.scss',
    'ui/style.css',
    'ui/style.css.map',
    'ui/*.js',
    'ui/chimes/*.mp3',
    'ui/img/**/*.*',
    'ui/vhs.ttf',
}

shared_script '@es_extended/imports.lua'

exports {
    'toggleHud',
    'showHud',
    'hideHud',
    'factionNotification',
    'setSCCode',
    'setSCHorn',
    'setSCManual',
    'setSCSiren1',
    'setSCSiren2',
    'setSCAux',
    'isCamActive'
}