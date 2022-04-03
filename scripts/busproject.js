var list = document.getElementById("routeacc")

let routeData = ""
let tripData = ""
let stopTimeData = ""
let busStopData = ""

let AvoidDuplicateTrips = true; // This should typically be set to true (but in the event the data files ever change to not include duplicate trips this can be set to false)

const tripsMade = new Map(); // [Subroute Name (0), Day (1)]
const tripDays = new Map();
const alsoServes = new Map();

// Fetches the routes.txt data file, some of the data contained here is the route name, route number and route color
async function getRoutes(){
  let response = await fetch('../data/BusProject/routes.txt');
  let dataText = await response.text();
  return dataText;
}

// Fetches the trips.txt data file, some of the data contained here is the day of week the trip runs and sub-route name
async function getTrips(){
  let response = await fetch('../data/BusProject/trips.txt');
  let dataText = await response.text();
  return dataText;
}

// Fetches the stop_times.txt data file, some of the data contained here is the time a bus on a certain trip leaves each stop
async function getStopTimes(){
  let response = await fetch('../data/BusProject/stop_times.txt');
  let dataText = await response.text();
  return dataText;
}

// Fetches the stops.txt data file, some of the data contained here is the stop name and stop id
async function getStops(){
  let response = await fetch('../data/BusProject/stops.txt');
  let dataText = await response.text();
  return dataText;
}

// Given a time and array, add the time to an array and sort
function sortTimes(currentArr, newTime){
  const newArray = currentArr.slice(); // Duplicate the array
  newArray.push(newTime);
  newArray.sort();
  return newArray;
}

// Find the time elapsed between a starting time and end time in a string format (HH:MM:SS)
function getTimeElapsed(startingTime, endingTime){
  const stTime = startingTime.trim().split(":");
  const enTime = endingTime.trim().split(":");

  let secsElapsed = ( (parseInt(enTime[0])) - (parseInt(stTime[0])) ) * 3600;
  secsElapsed = secsElapsed + ((parseInt(enTime[1]) - parseInt(stTime[1])) * 60);
  secsElapsed = secsElapsed + (parseInt(enTime[2]) - parseInt(stTime[2]));

  let hours = Math.floor(secsElapsed/3600);
  secsElapsed = secsElapsed - (3600*hours);

  let mins = Math.floor(secsElapsed/60);
  secsElapsed = secsElapsed - (60*mins);

  hours = hours.toString();
  mins = mins.toString();
  secsElapsed = secsElapsed.toString();

  // Style it to be in 00:00:00 format
  if(hours.length == 1){
    hours = "0" + hours;
  }
  if(mins.length == 1){
    mins = "0" + mins;
  }
  if(secsElapsed.length == 1){
    secsElapsed = "0" + secsElapsed;
  }

  return hours + ":" + mins + ":" + secsElapsed
}

async function main(){
  routeData = await getRoutes();
  tripData = await getTrips();
  stopTimeData = await getStopTimes();
  busStopData = await getStops();

  // Split by new line (each is a new entry)
  const rowsUnsorted = routeData.toString().trim().split('\n')
  const rows = []
  const tripRows = tripData.toString().trim().split('\n')
  const stopTimeRows = stopTimeData.toString().trim().split('\n')
  const busStopRows = busStopData.toString().trim().split('\n')

  var placeHolder;
  let lowestFound = Infinity
  let toRemove = 0;
  let originalLength = rowsUnsorted.length;
  
  
  for(let i = 1; i<originalLength; i++){
    lowestFound = Infinity
    toRemove = 0;
    for(let x = 1; x<rowsUnsorted.length; x++){
      const [routeName2, routeType2 , routeTextColor2, routeColor2, agency2, route_id2, route_url2, route_desc2, route_short_name2] = rowsUnsorted[x].split(',') // Data is seperated by commas
      if(lowestFound > parseInt(route_short_name2.replace(/\D/g,''))){
        lowestFound = parseInt(route_short_name2.match(/([0-9])+/,""));
        toRemove = x;
      }
    }
    placeHolder = rowsUnsorted.splice(toRemove, 1);
    rows.push(placeHolder[0]);
  }

  let targetDate = "";
  let largestTime = 0;


  let firstIndex = 0;

  // Determining what the newest service date is
if(AvoidDuplicateTrips == true){
  for (const t of tripRows) {
    firstIndex++
    const [block_id, routeNumber , wheelChairAccessible, directionID, routeLetterDestination, shape_id, serviceIDDay, tripID, directionName] = t.split(',')

    // Running for around 2000 lines should be more than enough to determine the newest service date
    if(firstIndex > 2000){
      break;
    }

    // 2022-01 or 2022-03 for example, sometimes outdated trips are left in the document (I assume near service changes), so we should only consider the newest ones
    let smallString = block_id.substring(block_id.length-7, block_id.length);
    const sepTime = smallString.trim().split("-");
    let thisTime = ( (parseInt(sepTime[0])*14) + (parseInt(sepTime[1])) ); // Give priority to the year, I could of used *12, but the year will always be more important so any number above 12 works
    if(thisTime > largestTime){
      largestTime = thisTime;
      targetDate = smallString;
    }
  }
}
  

    let index = 0
    // Loop through the route data
    for (const r of rows) {
      index++
      const [routeName, routeType , routeTextColor, routeColor, agency, route_id, route_url, route_desc, route_short_name] = r.split(',') // Data is seperated by commas

      
        // Make an accordion-item (and children) for each route
        var aRoute = document.createElement("div");
        aRoute.classList.add("accordion-item");
        aRoute.id = "accrRoute" + index.toString();
        
        var heading = document.createElement("h2"); // #1 => Accordion - Header
        heading.classList.add("accordion-header");
        heading.id = "flush-heading" + index.toString();
        aRoute.appendChild(heading);

        var flush = document.createElement("div"); // #2 => Flush-collapse
        flush.id = "flush-collapse" + index.toString();
        flush.classList.add("accordion-collapse", "collapse");
        flush.setAttribute("aria-labelledby", "flush-heading" + index.toString());
        flush.setAttribute("data-bs-parent", "#routeacc");
        aRoute.appendChild(flush);

        // #1 Children

        var acButton = document.createElement("button");
        acButton.classList.add("accordion-button", "collapsed");
        acButton.setAttribute("type", "button");
        acButton.setAttribute("data-bs-toggle", "collapse");
        acButton.setAttribute("data-bs-target", "#flush-collapse" + index.toString());
        acButton.setAttribute("aria-expanded", "false");
        acButton.setAttribute("aria-controls", "flush-collapse" + index.toString());
        acButton.innerHTML = "Route " + route_short_name + " - " + routeName; // TEXT: Display route number and name to user
        acButton.id = "acButtonRoute" + index.toString();

        heading.appendChild(acButton);

        // #2 Children

        var acBody = document.createElement("div");
        acBody.classList.add("accordion-body");
        acBody.innerHTML = "test"
        //flush.appendChild(acBody);

        var innerAccord = document.createElement("div");
        innerAccord.classList.add("accordion", "accordion-flush");
        innerAccord.id = "inneracc" + index.toString();
        flush.appendChild(innerAccord)

        // Determining if a route is PULSE or Blue Night

        if(routeColor == "0000ff"){ // Blue Night
          var badge = document.createElement("span");
          badge.classList.add("badge", "bg-primary");
          badge.innerHTML = "Blue Night"
          badge.id = "Badge_BN_" + index.toString();
          acButton.appendChild(badge)
        }else if(routeColor == "cc6600"){ // PULSE
          var badge = document.createElement("span");
          badge.classList.add("badge", "bg-warning", "text-dark");
          badge.innerHTML = "PULSE"
          badge.id = "Badge_PULSE_" + index.toString();
          acButton.appendChild(badge)
        }

        // Get all route variations
        let tripIndex = 0;
        let foundVariations = [];
        let foundDays = [];

        let weekdaysFound = false;
        let weekendsFound = false;
        let tripName = ""

        for (const t of tripRows) {
          tripIndex++
          const [block_id, routeNumber , wheelChairAccessible, directionID, routeLetterDestination, shape_id, serviceIDDay, tripID, directionName] = t.split(',')
          if(block_id.includes(targetDate) || AvoidDuplicateTrips == false){

          // The trip name will be the direction, route number and sub-route variation. shape_id is used to account for subroutes where all other information is identical but the stops are different.
          tripName = directionName.replace(/\s/g,'') + " Route " + routeNumber.replace(/\s/g,'') + " " + routeLetterDestination.replace(/\s/g,'') + " " + shape_id.toString().substring(0, shape_id.toString().indexOf('_Tim'));

          // Add a new trip to our map only if it was not found yet
          if(!tripsMade.has(tripID)){
            tripsMade.set(tripID, [tripName, serviceIDDay, routeNumber])
          }

          if(parseInt(routeNumber.replace(/\D/g,'')) == parseInt(route_short_name.replace(/\D/g,''))){


            // Check if service runs on weekdays
            if((serviceIDDay.replace(/\d+/g, '') == "Saturday Plus_merged_" || serviceIDDay.replace(/\d+/g, '') == "Weekday") && weekdaysFound == false){
              weekdaysFound = true;
            }

            // Check if service runs on Sunday (Minus) or Saturday (Plus) or 7 days a week (Overnight)
            if((serviceIDDay.replace(/\d+/g, '') == "Sunday Minus_merged_" || serviceIDDay.replace(/\d+/g, '') == "Sunday Plus_merged_" || serviceIDDay.replace(/\d+/g, '') == "Overnight All Days_merged_" || serviceIDDay.replace(/\d+/g, '') == "Saturday" || serviceIDDay.replace(/\d+/g, '') == "Sunday") && weekendsFound == false){
              weekendsFound = true;
            }

            // Do not duplicate any route variations found
            if(!foundVariations.includes(tripName)){

              foundVariations.push(tripName);


              // Make an accordion-item for each sub-route
              var bRoute = document.createElement("div");
              bRoute.classList.add("accordion-item");
              bRoute.id = "accrRoute-inner" + index.toString() + tripIndex.toString();
        
              var bheading = document.createElement("h2"); // #1 => Accordion - Header
              bheading.classList.add("accordion-header");
              bheading.id = "flush-heading-inner" + index.toString() + tripIndex.toString();
              bRoute.appendChild(bheading);

              var bflush = document.createElement("div"); // #2 => Flush-collapse
              bflush.id = "flush-collapse-inner" + index.toString() + tripIndex.toString();
              bflush.classList.add("accordion-collapse", "collapse");
              bflush.setAttribute("aria-labelledby", "flush-heading-inner" + index.toString() + tripIndex.toString());
              bflush.setAttribute("data-bs-parent", "#inneracc" + index.toString());
              bRoute.appendChild(bflush);

              // #1 Children

              var bcButton = document.createElement("button");
              bcButton.classList.add("accordion-button", "collapsed");
              bcButton.setAttribute("type", "button");
              bcButton.setAttribute("data-bs-toggle", "collapse");
              bcButton.setAttribute("data-bs-target", "#flush-collapse-inner" + index.toString() + tripIndex.toString());
              bcButton.setAttribute("aria-expanded", "false");
              bcButton.setAttribute("aria-controls", "flush-collapse-inner" + index.toString() + tripIndex.toString());
              bcButton.id = "bcButtonRoute" + index.toString() + tripIndex.toString();

              var table = document.createElement("table");
              bcButton.appendChild(table);

              var firstRow = document.createElement("tr");
              table.appendChild(firstRow);

              var headline = document.createElement("td");
              headline.innerHTML = directionName + " Route " + routeNumber + " " + routeLetterDestination; // TEXT: Contains the direction, route number and sub-route details
              firstRow.appendChild(headline);

              var secondRow = document.createElement("tr");
              table.appendChild(secondRow);

              var firstStop = document.createElement("td"); // Some sub-routes end at the same place but start at different points, so show the first stop to make it less confusing
              firstStop.innerHTML = "First Stop: Not Found";
              firstStop.id = "FirstStop" + index.toString() + tripIndex.toString();
              secondRow.appendChild(firstStop);

              bheading.appendChild(bcButton);


              // #2 Children


              var theList = document.createElement("ol");
              theList.classList.add("list-group", "list-group-numbered");

              // Before making sub-route (inner) visible, lets find all the stops for the sub-route
              let stopIndex = 0;
              let equalTripIDs = false;
              let starterTime = "";
              let firstStopID = 0;

              // Loop through all the stop times
              for (const sto of stopTimeRows) {
                stopIndex++;
                const [sTripID, sArrivalTime , sDepartTime, sStopID, sStopSequence, sStopHeadsign, sPickupType, sDropOff, sShapeDistTravel, sTimePoint] = sto.split(',');

                // Check if the trip ID of the stop time matches the trip we are looking at
                if(tripID == sTripID){
                  if(equalTripIDs == false){
                    starterTime = sDepartTime;
                    firstStopID = sStopID;
                  }
                  equalTripIDs = true;

                  var stopGroup = document.createElement("li");
                  stopGroup.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-start");
                  stopGroup.id = "stopGroup_" + index.toString() + tripIndex.toString() + stopIndex.toString();
                
                  var stopShift = document.createElement("div");
                  stopShift.classList.add("ms-2",  "me-auto");
                  stopGroup.appendChild(stopShift);

                  var stopHeading = document.createElement("div");
                  stopHeading.textContent = "Stop Name Not Found!"; // Default text
                  stopHeading.id = index.toString() + tripIndex.toString() + stopIndex.toString();
                  stopShift.appendChild(stopHeading);

                  // Loop through the bus stop file
                  for (const bst of busStopRows) {
                    const [b_lat, b_wheelchair , b_stopCode, b_stop_lon, b_stop_timezone, b_stop_url, b_parent_station, b_stop_desc, b_stop_name, b_locationtype, b_stopID, b_zoneID] = bst.split(',')
                    if(sStopID == b_stopID){
                      stopHeading.innerHTML = b_stop_name; // Update the bus stop name

                      if(b_stopID == firstStopID){
                        firstStop.innerHTML = "Origin stop: " + b_stop_name; // Update text showing first stop on a sub-route
                      }

                      // Check if a bus stop is wheelchair accessible
                      if(b_wheelchair == 1){
                        var badge = document.createElement("span");
                        badge.classList.add("badge", "bg-success");
                        badge.innerHTML = "Accessible";
                        badge.id = "Badge_AC_" + index.toString() + tripIndex.toString() + stopIndex.toString();
                        stopHeading.appendChild(badge);
                      }

                      // Badge used if this stop has other routes using it
                      var badgeConnect = document.createElement("span");
                      badgeConnect.classList.add("badge", "bg-light", "text-dark");
                      badgeConnect.innerHTML = "";
                      badgeConnect.id = "Badge_CO_" + tripName + sStopID;
                      stopHeading.appendChild(badgeConnect);

                      // Keep track of the routes this bus stop servers
                      let routesArray = []
                      routesArray = alsoServes.get(b_stopID);
                      if(routesArray){
                        if(!routesArray.includes(route_short_name)){
                          routesArray.push(route_short_name);
                          alsoServes.set(b_stopID, routesArray);
                        }
                      }else{
                        alsoServes.set(b_stopID, [route_short_name]);
                      }

                      break;
                    }
                  }


                  // Show the time elapsed between a stop and the origin
                  var subTextElapsed = document.createElement("li"); // Time Elapsed Text Section
                  subTextElapsed.innerHTML = "<b>Time Elapsed:</b> " + getTimeElapsed(starterTime, sDepartTime);
                  subTextElapsed.id = "subText" + sStopID + "-" + routeNumber + "-" + routeLetterDestination + "TimeElapsed";
                  stopHeading.appendChild(subTextElapsed);

                  // Show the stop times during all days (overnight)
                  var subTextAllDays = document.createElement("li");
                  subTextAllDays.innerHTML = "This stop is served more than once, all times are listed on the first occurance";
                  subTextAllDays.id = "subText" + tripName + sStopID + "Overnight All Days_merged_";
                  tripDays.set("subText" + tripName + sStopID + "Overnight All Days_merged_", [])
                  stopHeading.appendChild(subTextAllDays);

                  // Show weekday stop times
                  var subTextWeekdays = document.createElement("li");
                  subTextWeekdays.innerHTML = "";
                  subTextWeekdays.id = "subText" + tripName.toString() + sStopID.toString() + "Saturday Plus_merged_";
                  tripDays.set("subText" + tripName.toString() + sStopID.toString() + "Saturday Plus_merged_", [])
                  stopHeading.appendChild(subTextWeekdays);

                  // Show weekday stop times (new format)
                  var subTextWeekdays = document.createElement("li");
                  subTextWeekdays.innerHTML = "";
                  subTextWeekdays.id = "subText" + tripName.toString() + sStopID.toString() + "Weekday";
                  tripDays.set("subText" + tripName.toString() + sStopID.toString() + "Weekday", [])
                  stopHeading.appendChild(subTextWeekdays);

                  // Show weekday (post-secondary school year) stop times
                  var subTextPostSecondary = document.createElement("li");
                  subTextPostSecondary.innerHTML = "";
                  subTextPostSecondary.id = "subText" + tripName + sStopID + "Post-Secondary_merged_";
                  tripDays.set("subText" + tripName + sStopID + "Post-Secondary_merged_", [])
                  stopHeading.appendChild(subTextPostSecondary);

                  // Show Saturday stop times
                  var subTextSaturday = document.createElement("li");
                  subTextSaturday.innerHTML = "";
                  subTextSaturday.id = "subText" + tripName + sStopID + "Sunday Plus_merged_";
                  tripDays.set("subText" + tripName + sStopID + "Sunday Plus_merged_", [])
                  stopHeading.appendChild(subTextSaturday);

                  // Show Saturday stop times (new format)
                  var subTextSaturday = document.createElement("li");
                  subTextSaturday.innerHTML = "";
                  subTextSaturday.id = "subText" + tripName + sStopID + "Saturday";
                  tripDays.set("subText" + tripName + sStopID + "Saturday", [])
                  stopHeading.appendChild(subTextSaturday);

                  // Show sunday stop times
                  var subTextSunday = document.createElement("li");
                  subTextSunday.innerHTML = "";
                  subTextSunday.id = "subText" + tripName + sStopID + "Sunday Minus_merged_";
                  tripDays.set("subText" + tripName + sStopID + "Sunday Minus_merged_", [])
                  stopHeading.appendChild(subTextSunday);

                  // Show sunday stop times (new format)
                  var subTextSunday = document.createElement("li");
                  subTextSunday.innerHTML = "";
                  subTextSunday.id = "subText" + tripName + sStopID + "Sunday";
                  tripDays.set("subText" + tripName + sStopID + "Sunday", [])
                  stopHeading.appendChild(subTextSunday);

                  theList.appendChild(stopGroup);

              }else if(equalTripIDs == true){
                break; // Break to avoid un-needed looping
              }            


              }

              // Final Step (inner)

              bflush.appendChild(theList);


              innerAccord.appendChild(bRoute);




            }
          }
        } // End bracket for target date search
        } // End bracket for trips loop

        // If a route has no sub-routes, that means it is not currently running
        if(foundVariations.length == 0){
          var badge = document.createElement("span");
          badge.classList.add("badge", "bg-danger");
          badge.innerHTML = "Temporary Suspension"
          badge.id = "Badge_SUSPENSION_" + index.toString();
          acButton.appendChild(badge)
        }

        // In the event a bus does not run on weekdays, we will give a warning message
        if((!weekdaysFound) && foundVariations.length != 0){
          var badge = document.createElement("span");
          badge.classList.add("badge", "bg-success");
          badge.innerHTML = "NO Weekday Service";
          badge.id = "Badge_SERVICEWeekdays_" + index.toString() + tripIndex.toString();
          acButton.appendChild(badge);
        }

        // Display when a route runs on weekends
        if(weekendsFound){
        var badge = document.createElement("span");
        badge.classList.add("badge", "bg-secondary");
        badge.innerHTML = "Weekends";
        badge.id = "Badge_SERVICEWeekends_" + index.toString() + tripIndex.toString();
        acButton.appendChild(badge);
        }


        // Final Step (outer)

        list.appendChild(aRoute);
        
      
      
    }


    // Loop through stop times
    for (const sto of stopTimeRows) {
      const [sTripID, sArrivalTime , sDepartTime, sStopID, sStopSequence, sStopHeadsign, sPickupType, sDropOff, sShapeDistTravel, sTimePoint] = sto.split(',');
      if(tripsMade.has(sTripID) && (sTripID.includes(targetDate) || AvoidDuplicateTrips == false)){
        // Subroute name [0], day [1], routeNumber[2]
        let foundData = tripsMade.get(sTripID);
        let theDate = foundData[1].replace(/\d+/g, '');
        let elementFound = document.getElementById("subText" + foundData[0] + sStopID + theDate);
        let returnedArray = []
        if(elementFound){
          if(tripDays.has("subText" + foundData[0] + sStopID + theDate)){
            returnedArray = sortTimes(tripDays.get("subText" + foundData[0] + sStopID + theDate), sDepartTime)
            tripDays.set("subText" + foundData[0] + sStopID + theDate, returnedArray)

            let arrayOfSharedStops = alsoServes.get(sStopID).slice();
            let thisRoute = foundData[2]
            if(arrayOfSharedStops){
              
              for(let i = 0; i<arrayOfSharedStops.length; i++){
                if(arrayOfSharedStops[i].replace(/\D/g,'') == thisRoute.replace(/\D/g,'')){
                  arrayOfSharedStops.splice(i, 1);
                }else{
                }
              }

              // Show routes that share this stop
              if(arrayOfSharedStops.length > 0){
                document.getElementById("Badge_CO_" + foundData[0] + sStopID).innerHTML = arrayOfSharedStops.join(" / ");
              }

            }

            // Insert stop times into the interface
            if(elementFound.innerHTML.search(sDepartTime) == -1){
              if(theDate == "Post-Secondary_merged_"){
                elementFound.innerHTML = "<b>Weekdays (Post Secondary School Year):</b> " + returnedArray.join(", ");
              }else if(theDate == "Sunday Plus_merged_"){
                elementFound.innerHTML = "<b>Saturday:</b> " + returnedArray.join(", ");
              }else if(theDate == "Sunday Minus_merged_"){
                elementFound.innerHTML = "<b>Sunday:</b> " + returnedArray.join(", ");
              }else if(theDate == "Overnight All Days_merged_"){
                elementFound.innerHTML = "<b>All days:</b> " + returnedArray.join(", ");
              }else if(theDate == "Saturday Plus_merged_"){
                elementFound.innerHTML = "<b>Weekdays:</b> " + returnedArray.join(", ");
              }else if(theDate == "Saturday"){
                elementFound.innerHTML = "<b>Saturday:</b> " + returnedArray.join(", ");
              }else if(theDate == "Sunday"){
                elementFound.innerHTML = "<b>Sunday:</b> " + returnedArray.join(", ");
              }else if(theDate == "Weekday"){
                elementFound.innerHTML = "<b>Weekdays:</b> " + returnedArray.join(", ");
              }
            }
          }
        }
      }
    }

    tripDays.forEach( function(value, key){
      if(value.length == 0){
        document.getElementById(key).innerHTML = "";
      }
    })



    document.getElementById("loadingnotice").innerHTML = "The following is using service times effective from: " + targetDate // Effective date for trips shown
    document.getElementById("loadingspinner").remove(); // Loading is done, remove the spinner


}

main();








