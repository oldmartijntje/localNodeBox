const timeSynonymList = [
    {
        name: 'the length of Avenger Endgame.',
        minutes: 181,
    },
    {
        name: 'The average time for a baby to be born.',
        minutes: 60 * 24 * 30 * 9,
    },
    {
        name: 'the <a href="https://www.speedrun.com/doom1/runs/mr217r7y" target="_blank">current speedrun world-record<a> on the <a href="https://www.speedrun.com/doom1?h=Episodes_1-4-UV-Speed&x=zd35gvkn-6nj1vjn4.9qj778gq" target="_blank">original DOOM game<a>.',
        minutes: 20.63,
    },
    {
        name: 'the length of the song "<a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">Never gonna give you up</a>" by Rick Astley.',
        minutes: 3.55
    },
    {
        name: 'the time it takes to drive from <a href="https://www.google.com/maps/dir/Rijksmuseum,+Museumstraat+1,+1071+XX+Amsterdam/Eiffel+Tower,+Avenue+Gustave+Eiffel,+Paris,+France/@50.5796636,1.0512154,7z/data=!3m1!4b1!4m14!4m13!1m5!1m1!1s0x47c609eec1bb16e5:0xd54373ae6a408585!2m2!1d4.8852188!2d52.3599976!1m5!1m1!1s0x47e66e2964e34e2d:0x8ddca9ee380ef7e0!2m2!1d2.2944813!2d48.8583701!3e0?entry=ttu&g_ep=EgoyMDI0MTAyOS4wIKXMDSoASAFQAw%3D%3D">Amsterdam to Paris.</a>',
        minutes: 6 * 60 + 22,
        rounding: 2
    },
    {
        name: 'the time it takes to cycle from <a href="https://www.google.com/maps/dir/Rijksmuseum,+Museumstraat,+Amsterdam/Buckingham+Palace,+London+SW1A+1AA,+United+Kingdom/@51.6306555,1.0536134,8z/data=!3m2!4b1!5s0x487605276d38fb6b:0xe1c60228d7946675!4m14!4m13!1m5!1m1!1s0x47c609eec1bb16e5:0xd54373ae6a408585!2m2!1d4.8852188!2d52.3599976!1m5!1m1!1s0x48760520cd5b5eb5:0xa26abf514d902a7!2m2!1d-0.14189!2d51.501364!3e1?entry=ttu&g_ep=EgoyMDI0MTAyOS4wIKXMDSoASAFQAw%3D%3D">London to Amsterdam.</a>',
        minutes: 15 * 60 + 5,
        rounding: 2
    },
    {
        name: 'the time it takes for the sun to implode in the game <a href="https://store.steampowered.com/app/753640/Outer_Wilds" target="_blank">Outer Wilds</a>.',
        minutes: 22
    },
    {
        name: 'the time it takes to watch the entire Bee Movie.',
        minutes: 91
    },
    {
        name: 'the time Tiktok users spend on the app per day.',
        minutes: 93
    },
    {
        name: 'the time I (the creator) spent on my phone between Nov 2nd 2023 and Nov 1st 2024',
        minutes: 1367 * 60 + 51,
        rounding: 2
    },
    {
        name: 'the time I (the creator) spent on my computer between Nov 2nd 2023 and Nov 1st 2024',
        minutes: 1712 * 60 + 20,
        rounding: 2
    },
    {
        name: 'The time it takes for the moon to orbit Earth once',
        minutes: 27.3 * 24 * 60
    },
    {
        name: 'The time it would take to <a href="https://www.google.fr/maps/dir/Los+Angeles,+CA,+USA/Central+Park,+New+York,+NY,+United+States/@29.1272865,-139.4489108,3z/data=!3m1!4b1!4m14!4m13!1m5!1m1!1s0x80c2c75ddc27da13:0xe22fdf6f254608f4!2m2!1d-118.242643!2d34.0549076!1m5!1m1!1s0x89c2589a018531e3:0xb9df1f7387a94119!2m2!1d-73.9655834!2d40.7825547!3e2?entry=ttu&g_ep=EgoyMDI0MTAyOS4wIKXMDSoASAFQAw%3D%3D" target="_blank">walk from Los Angeles to New York City.</a>',
        minutes: 1013 * 60,
        rounding: 2
    },
    {
        name: 'the average lifespan of a butterfly.',
        minutes: 30 * 24 * 60
    },
    {
        name: 'the length of a typical workweek.',
        minutes: 40 * 60
    },
    {
        name: 'the time it takes for a coffee plant to mature and produce its first beans.',
        minutes: 3 * 365.25 * 24 * 60,
        rounding: 2
    },
    {
        name: 'the time it takes light from the Sun to reach Earth.',
        minutes: 8.3,
    },
    {
        name: 'the time required for a full rotation of the International Space Station around Earth.',
        minutes: 90
    },
    {
        name: 'the average time it takes to grow a new fingernail.',
        minutes: 6 * 7 * 24 * 60,
        rounding: 2
    },
    {
        name: 'the time it would take to fly around the Earth non-stop.',
        minutes: 48 * 60,
    },
    {
        name: 'the time it takes for a human hair to grow one inch.',
        minutes: 30 * 24 * 60,
        rounding: 2
    },
    {
        name: 'the time for a solar storm to travel from the Sun to Earth.',
        minutes: 40 * 60,
        rounding: 2
    },
    {
        name: 'the time Duolingo users spend on the app per day.',
        minutes: 6.5
    },
    {
        name: 'how long it would take to type out the entire Bible if you\'d type 10 words / min.',
        minutes: 807361 / 10
    },
    {
        name: 'the time it takes to make mcdonalds fries.',
        minutes: 2
    },
    {
        name: "the average time for an ice cube to melt at room temperature.",
        minutes: 15,
    },
    {
        name: 'times the lenght of a <a href="https://www.speedrun.com/undertale?h=Neutral_Glitchless-1-00-1-001&x=wdmq7352-wl36m6vl.5lmnzgyq" target="_blank">world record glitchless neutral undertale speedrun</a>',
        minutes: 63.5
    },
    {
        name: "the time it takes for a hummingbird to flap its wings 1 million times.",
        minutes: 100
    },
    {
        name: "the time it takes to form a single centimeter of stalactite.",
        minutes: 500000 * 24 * 60,
        rounding: 3
    },
    {
        name: "the time it takes for bamboo to grow one meter.",
        minutes: 2880,
        rounding: 2
    },
    {
        name: 'the time it takes for a tree to grow one ring (one year of growth).',
        minutes: 365.25 * 24 * 60,
        rounding: 2
    },
    {
        name: 'times the length of watching the entirety of parkour civilization (both episodes)',
        minutes: 227.59
    },
    {
        name: 'the time it takes for a honey bee to produce one tablespoon of honey.',
        minutes: 720 * 60,
        rounding: 2
    },
    {
        name: 'the average lifespan of a smartphone before it\'s replaced.',
        minutes: 2 * 365.25 * 24 * 60,
        rounding: 2
    },
    {
        name: 'the time it takes to sail around the world on a traditional sailboat.',
        minutes: 365.25 * 24 * 60,
        rounding: 2
    },
    {
        name: 'the time it takes to train a bonsai tree to full maturity.',
        minutes: 10 * 365.25 * 24 * 60,
        rounding: 2
    },
    {
        name: 'the average time it takes for a diamond to form naturally.',
        minutes: 1000000 * 365.25 * 24 * 60,
        rounding: 6
    },
    {
        name: 'the time it takes for an average person to master a new language through regular practice.',
        minutes: 2 * 365.25 * 24 * 60,
        rounding: 2
    },
    {
        name: 'the time it takes for a bamboo plant to reach its maximum height.',
        minutes: 5 * 365.25 * 24 * 60,
        rounding: 2
    },
    {
        name: 'the time it takes on average to play a 5/6 player game of Catan.',
        minutes: 210,
        rounding: 2
    },
    {
        name: 'the time it takes on average to play a 4 player game of Monopoly.',
        minutes: 90
    },
    {
        name: 'the time it takes a person to blink about 1.5 million times.',
        minutes: 180 * 24 * 60,
        rounding: 2
    },
    {
        name: 'the time it takes for Pluto to complete a full orbit around the Sun.',
        minutes: 248 * 365.25 * 24 * 60,
        rounding: 2
    },
    {
        name: 'the time it takes for an eyelash to grow back after being plucked.',
        minutes: 8 * 7 * 24 * 60,
        rounding: 2
    },
    {
        name: 'the average time it takes for a full computer reboot.',
        minutes: 0.5,
        rounding: 2
    },
    {
        name: 'the time it takes to write 1 gigabyte to a USB 2.0 flash drive.',
        minutes: 3,
        rounding: 1
    },
    {
        name: 'the time it would take to brute-force crack an <a href="https://i.imgur.com/Kbw4ljB.png" target="_blank">11-character alphanumeric</a> password with modern computing power (2021).',
        minutes: 41 * 365.25 * 24 * 60,
        rounding: 2
    },
    {
        name: 'the average lifespan of a solid-state drive (SSD) with typical usage.',
        minutes: 5 * 365.25 * 24 * 60,
        rounding: 2
    },
    {
        name: 'the average time it takes for a human to type a 1,000-word document.',
        minutes: 45,
        rounding: 2
    },
    {
        name: 'the time it takes for a pixel on a high-quality OLED screen to burn in with static content.',
        minutes: 2 * 365.25 * 24 * 60,
        rounding: 2
    },
    {
        name: 'the time it takes for an average player to complete all levels in Super Mario World.',
        minutes: 6 * 60,
        rounding: 2
    },
    {
        name: 'the time it would take you to walk to the <a href="https://minecraft.wiki/w/Tutorials/Far_Lands" target="_blank">Minecraft Farlands</a> if you walk 1 block / second.',
        minutes: 12550821 / 60,
        rounding: 2
    },
    {
        name: 'the time since Minecraft was first released.',
        minutes: (new Date() - new Date('2011-11-18')) / 1000 / 60,
        rounding: 2
    },
    {
        name: 'the time since the author of this website was born. (first day of that month)',
        minutes: (new Date() - new Date('2005-09-01')) / 1000 / 60,
        rounding: 2
    },
    {
        name: ((new Date() - new Date('2100-01-01')) / 1000 / 60) < 0 ? 'the time till we reach the year 2100.' : 'the time since we reached the year 2100.',
        minutes: Math.abs((new Date() - new Date('2100-01-01')) / 1000 / 60),
        rounding: 2
    },
    {
        name: 'the time since the creation of this webpage.',
        minutes: (new Date() - new Date('2024-11-01')) / 1000 / 60,
        rounding: 2
    },
    {
        name: 'the time it takes to walk around the circumference of Earth. (assuming you walk 5 km/h)',
        minutes: 40075 / 5 * 60,
        rounding: 2
    },
    {
        name: 'the time it would take for a snail to cross the Golden Gate Bridge.',
        minutes: 2737 / 0.048,
        rounding: 2
    },
    {
        name: 'the time needed to handwrite all of Shakespeare’s works. (assuming 10 words per minute)',
        minutes: 884000 / 10,
        rounding: 3
    },
    {
        name: 'the time it takes to cook a Thanksgiving turkey.',
        minutes: 3.5 * 60,
    },
    {
        name: 'the time it would take to reach the moon on foot. (assuming you walk 5 km/h)',
        minutes: 384400 * 1000 / 5 / 60,
        rounding: 3
    },
    {
        name: 'the time it would take to fly to Mars with current spacecraft technology.',
        minutes: 9 * 30 * 24 * 60,
        rounding: 2
    },
    {
        name: 'the time it would take to walk the length of the Great Wall of China. (assuming you walk 5 km/h)',
        minutes: 21196 / 5 * 60,
        rounding: 2
    },
    {
        name: 'the average time it takes for a cactus to bloom.',
        minutes: 15 * 365.25 * 24 * 60,
        rounding: 2
    },
    {
        name: 'the time it takes to assemble an average IKEA bookshelf.',
        minutes: 2 * 60,
        rounding: 2
    },
    {
        name: 'the time it takes on average for coral to grow one centimeter.',
        minutes: 10 * 365.25 * 24 * 60,
        rounding: 2
    },
    {
        name: 'the time it would take to binge-watch every Marvel movie released up to 2023.',
        minutes: 3 * 24 * 60 + 21,
        rounding: 2
    },
    {
        name: 'the time it takes for the Earth’s magnetic poles to reverse.',
        minutes: 780000 * 365.25 * 24 * 60, // approx. 780,000 years
        rounding: 6
    },
    {
        name: 'the time it would take to write out all known digits of pi if you typed 1 digit per second.',
        minutes: 314159 / 60,
        rounding: 2
    },
    {
        name: 'the time required for a rubber band to disintegrate naturally.',
        minutes: 60 * 24 * 365.25 * 2,
        rounding: 2
    },
    {
        name: 'the time it takes a cicada to live underground before emerging.',
        minutes: 17 * 365.25 * 24 * 60,
        rounding: 2
    },
    {
        name: 'the time it takes the creator of this website to shower (on average).',
        minutes: 20,
        rounding: 2
    },
    {
        name: 'the time it\'ll take to essambe <a href="https://www.lego.com/en-us/product/x-men-the-x-mansion-76294" target="_blank">Lego set 76294</a> if you place 1 piece per minute. (3093 pieces)',
        minutes: 3093,
        rounding: 2
    },
    {
        name: 'the time it\'ll take to essambe <a href="https://www.lego.com/en-us/product/eiffel-tower-10307" target="_blank">Lego set 10307</a> (eiffel tower) if you place 2 pieces per minute. (10001 pieces)',
        minutes: 10001 / 2,
        rounding: 2
    },
    {
        name: 'the time it\'ll take to essambe <a href="https://www.lego.com/en-us/product/lego-titanic-10294" target="_blank">Lego set 10294</a> (Titanic) if you place 3 pieces per minute. (9090 pieces)',
        minutes: 9090 / 3,
        rounding: 2
    },
    {
        name: 'the time that shops have Sinterklaas Sweets in stock in the Netherlands.',
        minutes: 60 * 24 * 80,
        rounding: 2
    }
]