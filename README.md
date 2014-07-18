#FromAtoBree

A route planner for Lord of the Rings Online.

[![browser support](https://ci.testling.com/booyaa/FromAtoBree.png)
](https://ci.testling.com/booyaa/FromAtoBree)

[![Build Status](https://travis-ci.org/booyaa/FromAtoBree.svg?branch=master)](https://travis-ci.org/booyaa/FromAtoBree)

If you need an in-game plugin might I suggest Vinny's excellent [TravelRef](http://www.lotrointerface.com/downloads/info524-Travellocationsreference.html). 

## Version 2.1.3 has landed

Both web and command lines can now restrict limited routes based on your level, faction standing or quest completion!

## Usage

### Webpage

The quickest way to try the lib is to use the demo website: [booyaa.github.io/FromAtoBree](http://booyaa.github.io/FromAtoBree/)

Travel time and route cost look broken on the webpage, so please don't use it for financial or temporal decision making. Always consult a professional.

### Command line client

```npm install -g fromatobree```

```
bin/index.js # i think the installer might actually call the bin/fatb, i have no fucking idea! lol
From A to Bree v2.1.3

usage:
index.js <start> <finish>    - plan route
index.js lookup <place>      - lookup place
index.js listregions         - lists regions
index.js listplaces <region> - list places for a given region
index.js listreqs <term> - list codes for factions or quests

to impose restrictions, create a config file called .fromatobree.json in your
home directory. The format is:
{
  "weighting": true,
  "level": 40,
  "standing": [
    "Q1",
    "R1"
  ]
}
key:
weighting - use weighted route, this means some destinations will become
            unavailable because you lack the requirements.
level     - your current level in the game.
standing  - any faction reputation or quests you may have completed. use
            the 'listreqs' command  to see a list of codes

```

### Installation / further development

* Probably a good idea to fork/clone/thing the rep.
* Install the development deps
* It's quite REPL friendly

```
$>node
> var FATB = require('fromatobree');
undefined
> var fatb = new FATB(); // will not use route weighting i.e. no restrictions
undefined
> fatb.FindPath('Hobbiton','Suri-kyla');
[ 'Hobbiton',
  'West Bree',
  'Suri-kyla' ]
>
```

## Bugs, feature requests or suggestions

Please file them as an issue through the github repo. This is also where the roadmap lives.

## Credits / Acknowledgements

Vinny (TravelRef Plugin author) who kindly gave me permission to use his stable data. The valuable data has help speed up the development of this app.

qiao for his web client build script in his awesome [PathFinding.js](https://github.com/qiao/PathFinding.js) lib.

GO EAGLES!
.
