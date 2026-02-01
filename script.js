const mainNewTripBtn = document.getElementById("mainNewTripBtn");
const topTripBtn = document.getElementById("topTripBtn");
const homeBtn = document.getElementById("homeBtn");
const codesBtn = document.getElementById("codesBtn");
const saveTripBtn = document.getElementById("saveTripBtn");
const tripNameInput = document.getElementById("tripNameInput");
const distanceInfo = document.getElementById("distanceInfo");

const homeScreen = document.getElementById("homeScreen");
const mapScreen = document.getElementById("mapScreen");
const codesScreen = document.getElementById("codesScreen");
const tripListDiv = document.getElementById("tripList");

const searchInput = document.getElementById("searchInput");
const routeBtn = document.getElementById("routeBtn");
const poiBtn = document.getElementById("poiBtn");
const deleteBtn = document.getElementById("deleteBtn");
const resultsDiv = document.getElementById("results");

const codeInput = document.getElementById("codeInput");
const codeLabelInput = document.getElementById("codeLabelInput");
const saveCodeBtn = document.getElementById("saveCodeBtn");
const codesList = document.getElementById("codesList");

let map = L.map("map").setView([20,0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

let selectedPlace = null;
let routeMarkers = [], poiMarkers = [], routeLine = null;
let trips = JSON.parse(localStorage.getItem("trips") || "[]");
let codes = JSON.parse(localStorage.getItem("codes") || "[]");
let currentTripIndex = null;

/* NAVIGATION */
function showHome() {
  mapScreen.classList.add("hidden");
  codesScreen.classList.add("hidden");
  homeScreen.classList.remove("hidden");
}

function showMap() {
  homeScreen.classList.add("hidden");
  codesScreen.classList.add("hidden");
  mapScreen.classList.remove("hidden");
  setTimeout(()=>map.invalidateSize(),200);
}

function showCodes() {
  homeScreen.classList.add("hidden");
  mapScreen.classList.add("hidden");
  codesScreen.classList.remove("hidden");
}

homeBtn.onclick = showHome;
codesBtn.onclick = showCodes;

/* TRIPS */
function openNewTrip() {
  tripNameInput.value = "Untitled Trip";
  clearMap();
  currentTripIndex = null;
  showMap();
}

mainNewTripBtn.onclick = openNewTrip;
topTripBtn.onclick = openNewTrip;

function clearMap() {
  routeMarkers.forEach(m=>map.removeLayer(m));
  poiMarkers.forEach(m=>map.removeLayer(m));
  if(routeLine) map.removeLayer(routeLine);
  routeMarkers=[]; poiMarkers=[]; routeLine=null;
  distanceInfo.textContent="";
}

searchInput.addEventListener("input", () => {
  const query = searchInput.value;
  if (query.length < 3) return;
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
    .then(res=>res.json())
    .then(data=>{
      resultsDiv.innerHTML="";
      data.slice(0,5).forEach(place=>{
        const div=document.createElement("div");
        div.className="result-item";
        div.textContent=place.display_name;
        div.onclick=()=>selectPlace(place);
        resultsDiv.appendChild(div);
      });
    });
});

function selectPlace(place){
  selectedPlace=place;
  resultsDiv.innerHTML="";
  map.setView([place.lat,place.lon],10);
  routeBtn.disabled=false;
  poiBtn.disabled=false;
}

function addMarker(type){
  if(!selectedPlace) return;
  const name=selectedPlace.display_name.split(",")[0];
  const marker=L.marker([selectedPlace.lat,selectedPlace.lon]).addTo(map)
    .bindTooltip(name,{permanent:true,direction:"top",className:"stop-label"});
  marker._label=name;

  if(type==="route"){ routeMarkers.push(marker); updateRouteLine(); }
  else poiMarkers.push(marker);
}

routeBtn.onclick=()=>addMarker("route");
poiBtn.onclick=()=>addMarker("poi");

function updateRouteLine(){
  if(routeLine) map.removeLayer(routeLine);
  routeLine=L.polyline(routeMarkers.map(m=>m.getLatLng()),{color:randomColor()}).addTo(map);
  updateDistance();
}

function updateDistance(){
  let total=0;
  for(let i=1;i<routeMarkers.length;i++){
    total+=routeMarkers[i-1].getLatLng().distanceTo(routeMarkers[i].getLatLng());
  }
  distanceInfo.textContent=routeMarkers.length>1?`Route distance: ${(total/1000).toFixed(1)} km`:"";
}

saveTripBtn.onclick=()=>{
  const trip={
    name:tripNameInput.value,
    route:routeMarkers.map(m=>({lat:m.getLatLng().lat,lon:m.getLatLng().lng,label:m._label})),
    pois:poiMarkers.map(m=>({lat:m.getLatLng().lat,lon:m.getLatLng().lng,label:m._label})),
    color:routeLine?routeLine.options.color:randomColor()
  };
  if(currentTripIndex!==null) trips[currentTripIndex]=trip;
  else trips.push(trip);
  localStorage.setItem("trips",JSON.stringify(trips));
  renderTrips();
  showHome();
};

function renderTrips(){
  tripListDiv.innerHTML="";
  trips.forEach((trip,index)=>{
    const card=document.createElement("div");
    card.className="trip-card";
    card.onclick=()=>openTrip(index);

    const title=document.createElement("div");
    title.className="trip-card-title";
    title.textContent=trip.name;

    const preview=document.createElement("div");
    preview.className="trip-preview";

    card.appendChild(title);
    card.appendChild(preview);
    tripListDiv.appendChild(card);

    const mini=L.map(preview,{zoomControl:false,attributionControl:false,dragging:false})
      .setView([trip.route[0]?.lat||0,trip.route[0]?.lon||0],3);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mini);
    if(trip.route.length>1) L.polyline(trip.route.map(p=>[p.lat,p.lon]),{color:trip.color}).addTo(mini);
  });

  if(trips.length>0){
    mainNewTripBtn.classList.add("hidden");
    topTripBtn.classList.remove("hidden");
  }
}

function openTrip(index){
  const trip=trips[index];
  currentTripIndex=index;
  tripNameInput.value=trip.name;
  clearMap();
  showMap();

  trip.route.forEach(p=>{
    const m=L.marker([p.lat,p.lon]).addTo(map)
      .bindTooltip(p.label,{permanent:true,direction:"top",className:"stop-label"});
    m._label=p.label;
    routeMarkers.push(m);
  });

  trip.pois.forEach(p=>{
    const m=L.marker([p.lat,p.lon]).addTo(map)
      .bindTooltip(p.label,{permanent:true,direction:"top",className:"stop-label"});
    poiMarkers.push(m);
  });

  routeLine=L.polyline(routeMarkers.map(m=>m.getLatLng()),{color:trip.color}).addTo(map);
  updateDistance();
}

function randomColor(){
  return `hsl(${Math.floor(Math.random()*360)},70%,45%)`;
}

/* CODES */
function renderCodes(){
  codesList.innerHTML="";
  codes.forEach((c,i)=>{
    const card=document.createElement("div");
    card.className="code-card";
    card.innerHTML=`<strong>${c.label}</strong><br>${c.code}`;
    const del=document.createElement("button");
    del.textContent="X";
    del.onclick=()=>{
      codes.splice(i,1);
      localStorage.setItem("codes",JSON.stringify(codes));
      renderCodes();
    };
    card.appendChild(del);
    codesList.appendChild(card);
  });
}

saveCodeBtn.onclick=()=>{
  if(!codeInput.value) return;
  codes.push({label:codeLabelInput.value||"Code",code:codeInput.value});
  localStorage.setItem("codes",JSON.stringify(codes));
  codeInput.value=""; codeLabelInput.value="";
  renderCodes();
};

renderTrips();
renderCodes();
