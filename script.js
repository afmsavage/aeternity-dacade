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

async function callStatic(func, args, types) {
  const calledGet = await client.contractCallStatic(contractAddress, 
    'sophia-address', func, {args}).catch(e => console.error(e));
  const decodedGet = await client.contractDecodeData(types, 
    calledGet.result.returnValue).catch(e => console.error(e));

  return decodedGet; 
}

async function contractCall(func, args, value, types) {
  const calledSet = await client.contractCall(contractAddress, 
    'sophia-address',contractAddress, func, {args, options: {amount:value}}).catch(async e => {
    const decodedError = await client.contractDecodeData(types, 
      e.returnValue).catch(e => console.log(e));
  });
  return;
}

// place the registered pokemon in cards
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

$("#loader").hide();

});
// register a pokemon to the contract
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

$("#loader").hide();
});