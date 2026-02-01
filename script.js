function openTab(id, el){
  document.querySelectorAll(".panel").forEach(p=>p.classList.remove("active"));
  document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  el.classList.add("active");
}

// ---------- BREAD ----------
const breadFlour=document.getElementById("breadFlour");
const breadWheat=document.getElementById("breadWheat");
const breadCount=document.getElementById("breadCount");
const breadSize=document.getElementById("breadSize");
const breadHydration=document.getElementById("breadHydration");
const breadYeast=document.getElementById("breadYeast");
const breadResults=document.getElementById("breadResults");

for(let h=40; h<=90; h+=2){
  breadHydration.innerHTML+=`<option value="${h}">${h}%</option>`;
}

function calcBread(){
  const flourAvailable=+breadFlour.value;
  const wheatPercent=+breadWheat.value||0;
  const count=+breadCount.value;
  const flourPerLoaf=+breadSize.value;
  const hydration=+breadHydration.value;
  const yeast=breadYeast.value;

  if(!count||!flourPerLoaf||!hydration||!yeast){ breadResults.innerHTML="<em>Please choose all options.</em>"; return; }

  const totalFlour=flourPerLoaf*count;
  const wholeWheatFlour=totalFlour*(wheatPercent/100);
  const whiteFlour=totalFlour-wholeWheatFlour;

  const water=totalFlour*(hydration/100);
  const salt=totalFlour*0.02;
  const yeastAmount=yeast==="sourdough"?totalFlour*0.2:totalFlour*0.01;
  const totalDough=totalFlour+water+salt+yeastAmount;
  const perLoaf=totalDough/count;
  const diff=flourAvailable-totalFlour;
  const warning = diff<0 ? `<span class="warning">⚠ Not enough flour!</span>` : "";

  breadResults.innerHTML=`
  <strong>Total (${count} loaves):</strong><br>
  Flour: ${totalFlour.toFixed(0)} g<br>
  • White: ${whiteFlour.toFixed(0)} g<br>
  • Whole wheat: ${wholeWheatFlour.toFixed(0)} g<br>
  Water: ${water.toFixed(0)} g<br>
  Salt: ${salt.toFixed(1)} g<br>
  Yeast: ${yeastAmount.toFixed(1)} g<br><br>
  <strong>Per loaf:</strong> ${perLoaf.toFixed(0)} g<br><br>
  ${diff>=0?`You’ll have ${diff.toFixed(0)}g flour left.`:`You need ${Math.abs(diff).toFixed(0)}g more flour.`} ${warning}
  `;
}

// ---------- PIZZA ----------
const pizzaFlourInput=document.getElementById("pizzaFlour");
const pizzaWheatInput=document.getElementById("pizzaWheat");
const pizzaCountInput=document.getElementById("pizzaCount");
const pizzaSizeSelect=document.getElementById("pizzaSize");
const pizzaHydrationSelect=document.getElementById("pizzaHydration");
const pizzaYeastSelect=document.getElementById("pizzaYeast");
const pizzaResultsDiv=document.getElementById("pizzaResults");

const pizzaSizes=[10,11,12,13,14,15,16,17,18];
const pizzaBase12=270; 
const pizzaSaltPerc=0.025;

pizzaSizes.forEach(size=>{
  const dough= pizzaBase12*(size/12)**2;
  pizzaSizeSelect.innerHTML+=`<option value="${size}">${size}" (${dough.toFixed(0)}g dough)</option>`;
});

for(let h=40;h<=90;h+=2){
  pizzaHydrationSelect.innerHTML+=`<option value="${h}">${h}%</option>`;
}

function calcPizza(){
  const flourAvailable=+pizzaFlourInput.value;
  const wheatPercent=+pizzaWheatInput.value||0;
  const count=+pizzaCountInput.value;
  const size=+pizzaSizeSelect.value;
  const hydration=+pizzaHydrationSelect.value;
  const yeast=pizzaYeastSelect.value;

  if(!flourAvailable||!count||!size||!hydration||!yeast){ pizzaResultsDiv.innerHTML="<em>Please choose all options.</em>"; return; }

  const yeastPerc=yeast==="sourdough"?0.2:yeast==="dry"?0.005:0.01;
  const doughOne=pizzaBase12*(size/12)**2;
  const flour= doughOne / (1 + hydration/100 + pizzaSaltPerc + yeastPerc);
  const totalFlourNeeded=flour*count;

  const wholeWheatFlour=totalFlourNeeded*(wheatPercent/100);
  const whiteFlour=totalFlourNeeded-wholeWheatFlour;

  const water= flour*(hydration/100)*count;
  const salt= flour*pizzaSaltPerc*count;
  const yeastAmount= flour*yeastPerc*count;
  const totalDough=(flour+flour*(hydration/100)+flour*pizzaSaltPerc+flour*yeastPerc)*count;
  const diff=flourAvailable-totalFlourNeeded;
  const warning = diff<0 ? `<span class="warning">⚠ Not enough flour!</span>` : "";

  pizzaResultsDiv.innerHTML=`
    <strong>Total (${count} pizzas):</strong><br>
    Flour: ${totalFlourNeeded.toFixed(0)} g<br>
    • White: ${whiteFlour.toFixed(0)} g<br>
    • Whole wheat: ${wholeWheatFlour.toFixed(0)} g<br>
    Water: ${water.toFixed(0)} g<br>
    Salt: ${salt.toFixed(1)} g<br>
    Yeast: ${yeastAmount.toFixed(1)} g<br><br>
    <strong>Per pizza dough:</strong> ${doughOne.toFixed(0)} g<br><br>
    ${diff>=0?`You’ll have ${diff.toFixed(0)}g flour left.`:`You need ${Math.abs(diff).toFixed(0)}g more flour.`} ${warning}
  `;
}

// Auto updates
[breadFlour,breadWheat,breadCount,breadSize,breadHydration,breadYeast].forEach(el=>el.addEventListener("input",calcBread));
[pizzaFlourInput,pizzaWheatInput,pizzaCountInput,pizzaSizeSelect,pizzaHydrationSelect,pizzaYeastSelect].forEach(el=>el.addEventListener("input",calcPizza));

// Notes
const notesText=document.getElementById("notesText");
const savedMsg=document.getElementById("savedMsg");
function saveNotes(){localStorage.setItem("doughNotes",notesText.value);savedMsg.textContent="Notes saved ✔";}
notesText.value=localStorage.getItem("doughNotes")||"";
