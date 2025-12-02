const repl = require("repl");
const fetch = require("node-fetch").default;

console.log("Welcome to Pokedex CLI");

const commands = {
  help: {
    command: "help",
    description: "List help for all the commands.",
    cb: helpCmd,
  },
  exit: {
    command: "exit",
    description: "Exit the command line interface.",
    cb: exitCmd,
  },
  map: {
    command: "map",
    description: "List the locations, To go to previous map add -p flag.",
    cb: mapCmd,
  },
  pokemon: {
     command: "pokemon",
     description: "Find a random pokemon.",
     cb: pokedexCmd,
    },

    info: {
        command: "info",
        description: "Give info related to pokemon.",
        cb: AbilityCmd,
    },
  
};

const currentPage = {
  next: "https://pokeapi.co/api/v2/location/",
  prev: null,
};

const currentPage2 = {
    next: "https://pokeapi.co/api/v2/pokemon/",
    prev:  null,
};

async function getLocationData(url) {
  const response = await fetch(url);
  const locationResults = await response.json();
  currentPage.next = locationResults.next;
  currentPage.prev = locationResults.previous;
  return locationResults;
}

async function mapCmd(arg) {
  let url = currentPage.next;

  if (arg && arg.length > 0 && arg[0] === "-p") {
    if (currentPage.prev) url = currentPage.prev;
    else {
      console.log("Previous Map Does Not Exist");
      return;
    }
  }

  const locationData = await getLocationData(url);
  locationData.results.forEach((locationInfo) => {
    console.log(`--> ${locationInfo.name}`);
  });
}

function exitCmd() {
  console.log("Goodbye !!");
  process.exit(0);
}

function helpCmd() {
  let helpString = `Welcome to pokedex, We have following commands:`;
  let index = 1;
  for (const cmd in commands) {
    helpString += `\n ${index}. ${commands[cmd].command} \t ${commands[cmd].description}`;
    index++;
  }
  console.log(helpString);
}

async function getPokemonname(url) {
    const response = await fetch(url);
    const NameResults = await response.json();
    currentPage2.next = NameResults.next;
    currentPage2.prev = NameResults.previous;
    return NameResults;
}

async function pokedexCmd(arg){
    console.log(`Searching for a new pokemon:`);
    let url = currentPage2.next;

    if(arg && arg.length>0 && arg[0]==="-n"){
    if(currentPage2.next){
        url =currentPage2.next;

    }else{
        console.log("Previous page does not exist.");
        return;
    }
    }

    const namedata=await getPokemonname(url);
    let arr=[];
    namedata.results.forEach((nameinfo)=>{
        arr.push(nameinfo.name);
        });
        
        const randomIndex = Math.floor(Math.random() * arr.length);
        console.log(`--> ${arr[randomIndex]}`);
  
};

function getAbilityByPokemonName(arr,name) {
    const pokemon = arr.find(p => p.name === name);
    return pokemon ? pokemon.abilities : null;
}


async function AbilityCmd(arg) {
    if (!arg || arg.length === 0) {
      console.log("Please provide a Pokémon name. Example: info clefairy");
      return;
    }
  
    const pokemonName = arg[0].toLowerCase();
  
    console.log(`Searching abilities for: ${pokemonName} ...`);
  
    // Fetch full Pokémon data
    const url = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;
    const response = await fetch(url);
  
    if (!response.ok) {
      console.log(`Pokémon "${pokemonName}" not found.`);
      return;
    }
  
    const pokemonData = await response.json();
  
    console.log(`${pokemonName} --> abilities:`);
  
    pokemonData.abilities.forEach(item => {
      console.log(
        `• ${item.ability.name} (hidden: ${item.is_hidden}, slot: ${item.slot})`
      );
    });
  }
  


const cliTool = repl.start({
  prompt: "Pokedex >",
  eval: async (cmd, context, file, callback) => {
    try {
      const input = cmd.trim().toLowerCase(); //User Input.

      const [command, ...args] = input.split(" "); // [map , arg1, arg2, arg3]

      if (commands[command]) await commands[command].cb(args);
      else
        console.log(
          `Invalid Command "${input}", Please refer help for more details`
        );
      callback(null);
    } catch (e) {
      callback(e); // Handle errors
    }
  },
});

cliTool.on("reset", () => {});
/**
 * 1. Create Pokedex Folder
 * 2. Create Index.js
 * 3. NPM init -y
 * 4. Add repl code in index.js
 * 5. Add Help and exit command
 * 6. Install node-fetch (npm i node-fetch)
 * 7. Create map command
 */