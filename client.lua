local index = 0

local isPedInVehicle = false
local speed = 0
local lastSpeed = 0
local lastStreet1 = 0
local hudSettings = nil
local higiena = 0


DisplayRadar(false)

RegisterNetEvent('esx:playerLoaded')
AddEventHandler('esx:playerLoaded', function(xPlayer)
  ESX.PlayerData = xPlayer
  ESX.PlayerLoaded = true

  Wait(100)

  SendNUIMessage({
    action = "showHud",
  })


end)

RegisterNetEvent('esx:onPlayerLogout')
AddEventHandler('esx:onPlayerLogout', function()
  ESX.PlayerLoaded = false
  ESX.PlayerData = {}

  SendNUIMessage({
    action = "hideHud",
  })

end)

local opis = false

CreateThread(function()
    while true do
        if IsPauseMenuActive() then

        else

  
            local ped = PlayerPedId()
            local health, armour, hunger, thirst = (GetEntityHealth(ped) - 100), GetPedArmour(ped), 0, 0
            TriggerEvent('esx_status:getStatus', 'hunger', function(status)
                hunger = status.getPercent()
            end)
            TriggerEvent('esx_status:getStatus', 'thirst', function(status)
                thirst = status.getPercent()
            end)


            if NetworkGetTalkerProximity() == 1.5 then
                hghdfgdfgfd = 1
            elseif NetworkGetTalkerProximity() == 6.0 then
                hghdfgdfgfd = 2
            elseif NetworkGetTalkerProximity() == 15.0 then
                hghdfgdfgfd = 3
            end

        SendNUIMessage({
			action = "updatePlayerId";
			id = GetPlayerServerId(PlayerId());
		})
            SendNUIMessage({
                action = "updateStatus";
                -- status = {[1] = hunger, [2] = thirst},
                food = hunger;
                water = thirst;
                higiena = higiena;
            })
    
            SendNUIMessage({
                action = "updateBasics";
                health = health;
                armour = armour;
            })

            SendNUIMessage({
                action = "updateTalking";
                talking = NetworkIsPlayerTalking(PlayerId());
            })

            SendNUIMessage({
                action = "updateMumble";
                status = hghdfgdfgfd;
            })
        end
  
        Citizen.Wait(500)
    end
  end)

--Carhud
local directions = { [0] = 'N', [45] = 'NW', [90] = 'W', [135] = 'SW', [180] = 'S', [225] = 'SE', [270] = 'E', [315] = 'NE', [360] = 'N', } 

Citizen.CreateThread(function()
    while true do
      local playerPed = PlayerPedId()
      local ped = PlayerPedId()

        local speed = (GetEntitySpeed(GetVehiclePedIsIn(GetPlayerPed(-1))))
        local finalSpeed = math.ceil(speed * 3.6)
        local PedCar = GetVehiclePedIsUsing(PlayerPedId(), false)
    
        for k, v in pairs(directions) do
            direction = GetEntityHeading(ped)
            if math.abs(direction - k) < 22.5 then
                direction = v
                break
            end
        end
        local x, y, z = table.unpack(GetEntityCoords(ped))
        local ul = GetStreetNameAtCoord(x, y, z)
        local ulica = GetStreetNameFromHashKey(ul)
        
		local vehicle = GetVehiclePedIsIn(GetPlayerPed(-1))
		local ison = GetIsVehicleEngineRunning(vehicle)
        local zamknietestatus = false

        -- print(GetIsVehicleEngineRunning(vehicle))
  
        if GetVehicleDoorLockStatus(vehicle) == 4 then
            zamknietestatus = true
        else
            zamknietestatus = false
        end
      isPedInVehicle = IsPedInAnyVehicle(playerPed, false)
  


  
      DisplayRadar(isPedInVehicle)

    --   print(GetVehicleLightsState(vehicle))
  
      if isPedInVehicle then
            local rpm = GetVehicleCurrentRpm(GetVehiclePedIsIn(GetPlayerPed(-1)))
            local finalRPM = rpm*100
            SendNUIMessage({
                action = "showCarHud";
            })

            SendNUIMessage({
                action = "updateCarHud";
                speed = finalSpeed;
				rpm = finalRPM;
                direction = direction;
                zone = ulica;
                -- lightState = GetVehicleLightsState(vehicle);
                isEngineRunning = ison;
                isVehicleLocked = zamknietestatus;
            })

      else
        SendNUIMessage({
            action = "hideCarHud";
            })
        speed = 0
        lastSpeed = 0
      end
  
      Citizen.Wait(250)
    end
  end)



-- Citizen.CreateThread(function()
--     while true do

--         local ped = PlayerPedId()



--         local speed = (GetEntitySpeed(GetVehiclePedIsIn(GetPlayerPed(-1))))
--         local finalSpeed = math.ceil(speed * 3.6)
--         local PedCar = GetVehiclePedIsUsing(PlayerPedId(), false)
    
--         for k, v in pairs(directions) do
--             direction = GetEntityHeading(ped)
--             if math.abs(direction - k) < 22.5 then
--                 direction = v
--                 break
--             end
--         end
--         local x, y, z = table.unpack(GetEntityCoords(ped))
--         local ul = GetStreetNameAtCoord(x, y, z)
--         local ulica = GetStreetNameFromHashKey(ul)
--         local rpm = GetVehicleCurrentRpm(GetVehiclePedIsIn(GetPlayerPed(-1)))
-- 		local vehicle = GetVehiclePedIsIn(GetPlayerPed(-1))
--         local finalRPM = rpm*100
-- 		local ison = GetIsVehicleEngineRunning(vehicle)
--         if IsPedInAnyVehicle(ped, false) then


-- 			SendNUIMessage({
--                 action = "showCarHud";
--             })

--             SendNUIMessage({
--                 action = "updateCarHud";
--                 speed = finalSpeed;
-- 				rpm = finalRPM;
--                 direction = direction;
--                 zone = ulica;
--                 battery = ison;
--             })
--         elseif not IsPedInAnyVehicle(ped, false) then
-- 			SendNUIMessage({
--                 action = "hideCarHud";
--             })
--         end
--         Wait(1000)
--     end
-- end)

RegisterCommand('options', function()
	SetNuiFocus(true,true)
	SendNUIMessage({
		action = "displaySettings";
	})
end)

RegisterCommand('cam', function()
	SendNUIMessage({
		action = "toggleCam";
		status = true
	})
end)

RegisterCommand('testprog', function()
    exports['realm_hud']:Progbar('Testowy ProgBar', 1000)
end)

RegisterCommand('testnotify', function()
    exports['realm_hud']:addNotification('msg', 'Testowa Notyfikacja', 'Testowa Notyfikacja Testowa Notyfikacja Testowa Notyfikacja Testowa Notyfikacja Testowa Notyfikacja Testowa NotyfikacjaTestowa Notyfikacja')
end)


exports("addNotification", function(type, header , content)
    Notify('information', header , content, 5000);
end)

function Notify(type, header , content, time)
    SendNUIMessage({
		action = "sendNotification";
		data = {		
		type = type;
		header = header;
		content = content;
		time = time}
	})
end

exports("Progbar", function(label , time)
    Prog(label , time);
end)

function Prog(label , time)
    SendNUIMessage({
		action = "showProgressBar";
		label = label;
		duration = time;
	})
end



RegisterNetEvent('realm:bodycam', function(imie)
	SendNUIMessage({
		action = "toggleBodycam";
		state = true;
        data = {name = imie, department = 'Police Department'}
	})
end)

RegisterCommand('testnotifjakiesjebane', function()
	SendNUIMessage({
		action = "createMiniNotif";
        text = 'test',
        time = 5000,
	})
end)

RegisterNUICallback('sendRequest', function(action, data)
	SetNuiFocus(false,false)
end)


