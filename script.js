const contractAddress = 'ct_zT9xbVzCh6Kbwbgzy3vZgEAjb7EhZ4KfWmqwCxyN8vhnfhp8s';
var client = null;
var pokeArray = [];
var pokesLength = 0;

function renderPokes() {
pokeArray = pokeArray.sort(function(a,b){return b.votes-a.votes;});
var template = $('#template').html();
Mustache.parse(template);
var rendered = Mustache.render(template, {pokeArray});
$('#pokeBody').html(rendered);
}

function renderCategories() {
  pokeArray = pokeArray.sort(function(a,b){return b.votes-a.votes;});
  var templateCategory = $('#templateCategory').html();
  Mustache.parse(templateCategory);
  var rendered = Mustache.render(templateCategory, {pokeArray});
  $('#pokeCategory').html(rendered);
  }

async function callStatic(func, args, types) {
  const calledGet = await client.contractCallStatic(contractAddress, 'sophia-address', func, {args}).catch(e => console.error(e));
  const decodedGet = await client.contractDecodeData(types, calledGet.result.returnValue).catch(e => console.error(e));

  return decodedGet; 
}

async function contractCall(func, args, value, types) {
  const calledSet = await client.contractCall(contractAddress, 'sophia-address',contractAddress, func, {args, options: {amount:value}}).catch(async e => {
    const decodedError = await client.contractDecodeData(types, e.returnValue).catch(e => console.log(e));
  });
  return;
}

window.addEventListener('load', async () => {
  $("#loader").show();

  client = await Ae.Aepp();

  const getPokesLength = await callStatic('getPokesLength', '()', 'int');
  pokesLength = getPokesLength.value;

  for (let i = 1; i <= pokesLength; i++) {
    const poke = await callStatic('getPoke',`(${i})`,'(address, string, string, string, int)');

    pokeArray.push({
      pokeName: poke.value[1].value,
      pokeUrl: poke.value[2].value,
      pokeCategory: poke.value[3].value,
      index: i,
      votes: poke.value[4].value,
    });
  }
  renderPokes();
  renderCategories();

  $("#loader").hide();
});

jQuery("#pokeBody").on("click", ".voteBtn", async function(event){
$("#loader").show();

const value = $(this).siblings('input').val();
const dataIndex = event.target.id;

await contractCall('votepoke',`(${dataIndex})`,value,'(int)');

const foundIndex = pokeArray.findIndex(poke => poke.index == dataIndex);
pokeArray[foundIndex].votes += parseInt(value, 10);

renderPokes();
renderCategories();

$("#loader").hide();

});

$('#registerBtn').click(async function(){
  $("#loader").show();
  const name = ($('#regName').val()),
        url = ($('#regUrl').val()),
        category = ($('#regCategory').val());



  await contractCall('registerPoke',`("${name}","${url}","${category}")`,0,'(int)');

  pokeArray.push({
    pokeName: name,
    pokeUrl: url,
    pokeCategory: category,
    index: pokeArray.length+1,
    votes: 0
});

renderPokes();
renderCategories();

$("#loader").hide();
});
// filter by category
filterSelection("all")
function filterSelection(c) {
  var x, i;
  x = document.getElementsById("pokeCategory");
  if (c == "all") c = "";
  for (i = 0; i < x.length; i++) {
    w3RemoveId(x[i], "show");
    if (x[i].id.indexOf(c) > -1) w3AddId(x[i], "show");
  }
}

function w3AddId(element, name) {
  var i, arr1, arr2;
  arr1 = element.id.split(" ");
  arr2 = name.split(" ");
  for (i = 0; i < arr2.length; i++) {
    if (arr1.indexOf(arr2[i]) == -1) {element.id += " " + arr2[i];}
  }
}

function w3RemoveId(element, name) {
  var i, arr1, arr2;
  arr1 = element.id.split(" ");
  arr2 = name.split(" ");
  for (i = 0; i < arr2.length; i++) {
    while (arr1.indexOf(arr2[i]) > -1) {
      arr1.splice(arr1.indexOf(arr2[i]), 1);     
    }
  }
  element.id = arr1.join(" ");
}

// Add active id to the current button (highlight it)
var btnContainer = document.getElementById("myBtnContainer");
var btns = btnContainer.getElementsById("btn");
for (var i = 0; i < btns.length; i++) {
  btns[i].addEventListener("click", function(){
    var current = document.getElementsById("active");
    current[0].id = current[0].id.replace(" active", "");
    this.id += " active";
  });
}
