const contractSource = `
/* 
AEternity Smart Contract to create a decentralized pokedex!  Function Usage and such above each.
Dacade.org Course
Antonio Savage
*/

// need to start with creating the contract
contract Pokedex =

  record poke = 
    { creatorAddress : address,
      name           : string,
      url            : string,
      category       : string,
      voteCount      : int }

  record state = {
     pokes       : map( int, poke ),
     pokesLength : int }

// initiates the poke variable into a function
  function init() = 
    { pokes = {},
      pokesLength = 0 }

// can call getPoke function to get the value inside of poke
// usage: getPoke, args:index number, Return Type: (address,string,string,string,int)
  public function getPoke(index : int) : poke =
    switch(Map.lookup( index, state.pokes ))
      None    => abort("This Pokemon has not been added yet, please add it to the Pokedex!")
      Some(x) => x

// user is able to enter a URL string into the registerPoke function
// usage: registerPoke, "url", "pokemonName", "category" Return Type: int
  public stateful function registerPoke(name' : string, url' : string, category' : string) =
    let poke = { creatorAddress = Call.caller, name = name', url = url', category = category', voteCount = 0}
    let index = getPokesLength() +1
    put( state { pokes[index] = poke, pokesLength = index })

// usage: getPokesLength, args:none, Return Type: int
  public function getPokesLength() : int = 
    state.pokesLength 

// usage: votepoke, args: poke index number, Return Type: int
  public stateful function votepoke( index : int) =
    let poke = getPoke(index)
    Chain.spend(poke.creatorAddress, Call.value)
    let updatedVoteCount = poke.voteCount + Call.value
    let updatedPokes = state.pokes{ [index].voteCount = updatedVoteCount }
    put(state{ pokes = updatedPokes })
`;

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

async function callStatic(func, args) {
  const contract = await client.getContractInstance(contractSource, {contractAddress});
  const calledGet = await contract.call(func, args, {callStatic: true}).catch(e => console.error(e));
  const decodedGet = await calledGet.decode().catch(e => console.error(e));

  return decodedGet; 
}

async function contractCall(func, args, value) {
  const contract = await client.getContractInstance(contractSource, {contractAddress});
  const calledSet = await contract.call(func, args, {amount: value}).catch(e => console.error(e));

  return calledSet;
}

// place the registered pokemon in cards
window.addEventListener('load', async () => {
  $("#loader").show();

  client = await Ae.Aepp();

  pokesLength = await callStatic('getPokesLength', []);

  for (let i = 1; i <= pokesLength; i++) {
    const poke = await callStatic('getPoke', [i]);

    pokeArray.push({
      pokeName: poke.name,
      pokeUrl: poke.url,
      pokeCategory: poke.category,
      index: i,
      votes: poke.voteCount,
    });
  }

  renderPokes();

  $("#loader").hide();
});

jQuery("#pokeBody").on("click", ".voteBtn", async function(event){
  $("#loader").show();

  let value = $(this).siblings('input').val();
  let index = event.target.id;

  await contractCall('votepoke', [index], value);

  const foundIndex = pokeArray.findIndex(poke => poke.index == event.target.id);
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


  await contractCall('registerPoke', [url, name, category], 0);

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