let routeData = ""
let tripData = ""
let stopTimeData = ""
let busStopData = ""

async function getRoutes(){
  let response = await fetch('../data/BusProject/routes.txt');
  let dataText = await response.text();
  return dataText;
}

async function getTrips(){
  let response = await fetch('../data/BusProject/trips.txt');
  let dataText = await response.text();
  return dataText;
}

async function getStopTimes(){
  let response = await fetch('../data/BusProject/stop_times.txt');
  let dataText = await response.text();
  return dataText;
}

async function getStops(){
  let response = await fetch('../data/BusProject/stops.txt');
  let dataText = await response.text();
  return dataText;
}

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
  var list = document.getElementById("routeacc")
  routeData = await getRoutes();
  tripData = await getTrips();
  stopTimeData = await getStopTimes();
  busStopData = await getStops();

  const rows = routeData.toString().trim().split('\n')
  const tripRows = tripData.toString().trim().split('\n')
  const stopTimeRows = stopTimeData.toString().trim().split('\n')
  const busStopRows = busStopData.toString().trim().split('\n')
  

    let index = 0
    for (const r of rows) {
      index++
      const [routeName, routeType , routeTextColor, routeColor, agency, route_id, route_url, route_desc, route_short_name] = r.split(',')
      if(index != 1){
      
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
        acButton.innerHTML = "Route " + route_short_name + " - " + routeName;
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

        for (const t of tripRows) {
          tripIndex++
          const [block_id, routeNumber , wheelChairAccessible, directionID, routeLetterDestination, shape_id, serviceIDDay, tripID, directionName] = t.split(',')
          if(parseInt(routeNumber.replace(/\D/g,'')) == parseInt(route_short_name.replace(/\D/g,''))){



            if((serviceIDDay.replace(/\d+/g, '') == "Saturday Plus_merged_") && weekdaysFound == false){
              weekdaysFound = true;
            }

            if((serviceIDDay.replace(/\d+/g, '') == "Sunday Minus_merged_") && weekendsFound == false){
              weekendsFound = true;
            }

            if(!foundVariations.includes(directionName + " Route " + routeNumber + " " + routeLetterDestination)){

              foundVariations.push(directionName + " Route " + routeNumber + " " + routeLetterDestination);

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
              bcButton.innerHTML = directionName + " Route " + routeNumber + " " + routeLetterDestination;
              bcButton.id = "bcButtonRoute" + index.toString() + tripIndex.toString();

              bheading.appendChild(bcButton);

        // #2 Children


              var theList = document.createElement("ol");
              theList.classList.add("list-group", "list-group-numbered");

              // Before making sub-route (inner) visible, lets find all the stops for the sub-route
              let stopIndex = 0;
              let equalTripIDs = false;
              let starterTime = ""

              for (const sto of stopTimeRows) {
                stopIndex++;
                const [sTripID, sArrivalTime , sDepartTime, sStopID, sStopSequence, sStopHeadsign, sPickupType, sDropOff, sShapeDistTravel, sTimePoint] = sto.split(',')

              if(tripID == sTripID){
                if(equalTripIDs == false){
                  starterTime = sDepartTime
                }
                equalTripIDs = true;

                var stopGroup = document.createElement("li");
                stopGroup.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-start");
                stopGroup.id = "stopGroup_" + index.toString() + tripIndex.toString() + stopIndex.toString();
                
                var stopShift = document.createElement("div");
                stopShift.classList.add("ms-2",  "me-auto");
                stopGroup.appendChild(stopShift)

                var stopHeading = document.createElement("div");
                stopHeading.textContent = "Stop Name Not Found!";
                stopShift.appendChild(stopHeading)

                for (const bst of busStopRows) {
                  const [b_lat, b_wheelchair , b_stopCode, b_stop_lon, b_stop_timezone, b_stop_url, b_parent_station, b_stop_desc, b_stop_name, b_locationtype, b_stopID, b_zoneID] = bst.split(',')
                  if(sStopID == b_stopID){
                    stopHeading.innerHTML = b_stop_name;

                    if(b_wheelchair == 1){
                        var badge = document.createElement("span");
                        badge.classList.add("badge", "bg-success");
                        badge.innerHTML = "Accessible"
                        badge.id = "Badge_AC_" + index.toString() + tripIndex.toString() + stopIndex.toString();
                        stopHeading.appendChild(badge)
                    }

                    break;
                  }
                }



                var subTextOvernight = document.createElement("li"); // Time Elapsed Text Section
                subTextOvernight.innerHTML = "Time Elapsed: " + getTimeElapsed(starterTime, sDepartTime)
                subTextOvernight.id = "subText" + sStopID + "-" + routeNumber + "-" + routeLetterDestination + "TimeElapsed"
                stopHeading.appendChild(subTextOvernight);

                theList.appendChild(stopGroup);

              }else if(equalTripIDs == true){
                break;
              }            


              }

              // Final Step (inner)

              bflush.appendChild(theList);


              innerAccord.appendChild(bRoute);




            }
          }
        }
        if(foundVariations.length == 0){
          var badge = document.createElement("span");
          badge.classList.add("badge", "bg-danger");
          badge.innerHTML = "Temporary Suspension"
          badge.id = "Badge_SUSPENSION_" + index.toString();
          acButton.appendChild(badge)
        }

        if((!weekdaysFound) && foundVariations.length != 0){ // In the event a bus does not run on weekdays, we will give a warning message
          var badge = document.createElement("span");
          badge.classList.add("badge", "bg-success");
          badge.innerHTML = "NO Weekday Service"
          badge.id = "Badge_SERVICEWeekdays_" + index.toString() + tripIndex.toString();
          acButton.appendChild(badge)
        }

        if(weekendsFound){
        var badge = document.createElement("span");
        badge.classList.add("badge", "bg-secondary");
        badge.innerHTML = "Weekends"
        badge.id = "Badge_SERVICEWeekends_" + index.toString() + tripIndex.toString();
        acButton.appendChild(badge)
        }


        // Final Step (outer)

        list.appendChild(aRoute);
        
      
      }
    }





    document.getElementById("loadingnotice").remove();
    document.getElementById("loadingspinner").remove();

}

main();








