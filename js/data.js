/* ============================================================
 * data.js — Country-specific datasets for fictional address
 * generation. All data is synthetic, used only to produce
 * plausible-looking sample data for testing & UI mockups.
 * ============================================================ */

const FIRST_NAMES = {
  US: ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"],
  GB: ["Oliver", "Amelia", "Harry", "Olivia", "George", "Isla", "Noah", "Ava", "Jack", "Emily", "Leo", "Sophia", "Oscar", "Grace", "Charlie", "Mia", "Arthur", "Poppy", "Henry", "Lily"],
  CA: ["Liam", "Emma", "Noah", "Olivia", "William", "Charlotte", "Benjamin", "Sophia", "Lucas", "Ava", "Henry", "Mia", "Alexander", "Isabella", "Mason", "Amelia", "Ethan", "Harper", "Jacob", "Evelyn"],
  AU: ["Jack", "Charlotte", "Oliver", "Olivia", "Noah", "Amelia", "William", "Isla", "Lucas", "Mia", "Thomas", "Ava", "Henry", "Grace", "Ethan", "Chloe", "James", "Ruby", "Mason", "Sophie"],
  DE: ["Maximilian", "Sophie", "Alexander", "Marie", "Paul", "Maria", "Leon", "Sophia", "Lukas", "Anna", "Felix", "Emma", "Jonas", "Hanna", "David", "Mia", "Tim", "Lea", "Niklas", "Lena"],
  FR: ["Lucas", "Emma", "Hugo", "Jade", "Louis", "Louise", "Adam", "Alice", "Raphaël", "Chloé", "Arthur", "Lina", "Jules", "Rose", "Léo", "Léa", "Gabriel", "Anna", "Maël", "Mila"],
  JP: ["Haruto", "Yui", "Yuto", "Hina", "Sota", "Aoi", "Yuki", "Sakura", "Hayato", "Yuna", "Daiki", "Mei", "Ren", "Riko", "Takumi", "Akari", "Kaito", "Mio", "Sho", "Ema"],
  ID: ["Budi", "Siti", "Agus", "Dewi", "Andi", "Rina", "Joko", "Sari", "Bambang", "Indah", "Hendra", "Maya", "Rizki", "Putri", "Dimas", "Anita", "Eko", "Lestari", "Wahyu", "Ratna"],
  SG: ["Wei", "Mei", "Jun", "Ling", "Hao", "Xin", "Jie", "Hui", "Rui", "Yan", "Ahmad", "Siti", "Raj", "Priya", "Kumar", "Devi", "Tan", "Lim", "Wong", "Chen"],
  NL: ["Daan", "Emma", "Sem", "Julia", "Lucas", "Sophie", "Levi", "Mila", "Finn", "Tess", "Bram", "Anna", "Milan", "Lotte", "Jesse", "Eva", "Noah", "Saar", "Liam", "Lynn"],
  BR: ["Miguel", "Helena", "Arthur", "Alice", "Heitor", "Laura", "Bernardo", "Maria", "Theo", "Manuela", "Davi", "Sophia", "Lorenzo", "Valentina", "Gabriel", "Heloísa", "Pedro", "Júlia", "Matheus", "Lara"],
  MX: ["Santiago", "Sofía", "Mateo", "Valentina", "Sebastián", "Isabella", "Leonardo", "Camila", "Matías", "Valeria", "Emiliano", "Mariana", "Diego", "Gabriela", "Daniel", "Daniela", "Nicolás", "Renata", "Alejandro", "Andrea"]
};

const LAST_NAMES = {
  US: ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"],
  GB: ["Smith", "Jones", "Taylor", "Brown", "Williams", "Wilson", "Johnson", "Davies", "Robinson", "Wright", "Thompson", "Evans", "Walker", "White", "Roberts", "Green", "Hall", "Wood", "Jackson", "Clarke"],
  CA: ["Smith", "Brown", "Tremblay", "Martin", "Roy", "Wilson", "MacDonald", "Gagnon", "Johnson", "Taylor", "Anderson", "Thompson", "Campbell", "White", "Lee", "Mitchell", "Murphy", "Stewart", "Reid", "Bouchard"],
  AU: ["Smith", "Jones", "Williams", "Brown", "Wilson", "Taylor", "Johnson", "White", "Martin", "Anderson", "Thompson", "Nguyen", "Thomas", "Walker", "Harris", "Lee", "Ryan", "Robinson", "Kelly", "King"],
  DE: ["Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann", "Schäfer", "Koch", "Bauer", "Richter", "Klein", "Wolf", "Schröder", "Neumann", "Schwarz", "Zimmermann"],
  FR: ["Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Durand", "Leroy", "Moreau", "Simon", "Laurent", "Lefebvre", "Michel", "Garcia", "David", "Bertrand", "Roux", "Vincent", "Fournier"],
  JP: ["Sato", "Suzuki", "Takahashi", "Tanaka", "Watanabe", "Ito", "Yamamoto", "Nakamura", "Kobayashi", "Kato", "Yoshida", "Yamada", "Sasaki", "Yamaguchi", "Matsumoto", "Inoue", "Kimura", "Hayashi", "Shimizu", "Saito"],
  ID: ["Wijaya", "Santoso", "Pratama", "Hidayat", "Saputra", "Setiawan", "Nugroho", "Susanto", "Halim", "Tanuwijaya", "Kusuma", "Permana", "Suryadi", "Wibowo", "Hartono", "Iskandar", "Lesmana", "Mulyadi", "Subroto", "Gunawan"],
  SG: ["Tan", "Lim", "Lee", "Ng", "Ong", "Wong", "Goh", "Chua", "Chan", "Koh", "Teo", "Ang", "Yeo", "Kumar", "Singh", "Rahman", "Ibrahim", "Hassan", "Ali", "Raj"],
  NL: ["de Jong", "Jansen", "de Vries", "van den Berg", "van Dijk", "Bakker", "Janssen", "Visser", "Smit", "Meijer", "de Boer", "Mulder", "de Groot", "Bos", "Vos", "Peters", "Hendriks", "van Leeuwen", "Dekker", "Brouwer"],
  BR: ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida", "Lopes", "Soares", "Fernandes", "Vieira", "Barbosa"],
  MX: ["Hernández", "García", "Martínez", "López", "González", "Rodríguez", "Pérez", "Sánchez", "Ramírez", "Cruz", "Flores", "Gómez", "Morales", "Vázquez", "Reyes", "Jiménez", "Díaz", "Torres", "Gutiérrez", "Ruiz"]
};

const STREET_NAMES = {
  US: ["Main", "Oak", "Pine", "Maple", "Cedar", "Elm", "Washington", "Lake", "Hill", "Park", "Sunset", "River", "Lincoln", "Jefferson", "Madison", "Spring", "Church", "Highland", "Forest", "Meadow"],
  GB: ["High", "Church", "Mill", "Victoria", "Albert", "Station", "Park", "King's", "Queen's", "York", "London", "Manor", "School", "New", "Old", "West", "East", "North", "South", "Green"],
  CA: ["King", "Queen", "Yonge", "Bay", "Bloor", "Front", "Maple", "Oak", "Pine", "Spruce", "Lake", "River", "Mountain", "Forest", "Sherbrooke", "Saint-Catherine", "Robson", "Granville", "Portage", "Jasper"],
  AU: ["George", "Pitt", "Collins", "Bourke", "Queen", "King", "Elizabeth", "Sydney", "Beach", "Coast", "Harbour", "Bay", "Park", "Bridge", "Church", "Station", "High", "Main", "Victoria", "Albert"],
  DE: ["Hauptstraße", "Bahnhofstraße", "Gartenstraße", "Schulstraße", "Dorfstraße", "Bergstraße", "Kirchstraße", "Lindenstraße", "Goethestraße", "Schillerstraße", "Mozartstraße", "Beethovenstraße", "Wiesenweg", "Waldweg", "Am Markt"],
  FR: ["de la République", "de la Paix", "Victor Hugo", "de Rivoli", "Saint-Honoré", "des Champs-Élysées", "de la Liberté", "Pasteur", "Voltaire", "Rousseau", "Molière", "Jean Jaurès", "de Gaulle", "de Verdun", "des Fleurs"],
  JP: ["Sakura", "Aoyama", "Roppongi", "Shibuya", "Ginza", "Shinjuku", "Akihabara", "Asakusa", "Ueno", "Harajuku", "Ikebukuro", "Marunouchi", "Nihonbashi", "Yotsuya", "Kanda"],
  ID: ["Sudirman", "Thamrin", "Gatot Subroto", "Kuningan", "Rasuna Said", "Diponegoro", "Hayam Wuruk", "Gajah Mada", "Pemuda", "Merdeka", "Pahlawan", "Veteran", "Asia Afrika", "Braga", "Malioboro"],
  SG: ["Orchard", "Marina", "Raffles", "Bugis", "Clarke", "Boat", "River Valley", "Tanglin", "Holland", "Bukit Timah", "Serangoon", "Geylang", "Tampines", "Jurong", "Sentosa"],
  NL: ["Hoofdstraat", "Kerkstraat", "Schoolstraat", "Dorpsstraat", "Molenstraat", "Stationsstraat", "Marktplein", "Beatrixlaan", "Wilhelminalaan", "Julianastraat", "Oranjelaan", "Damrak", "Prinsengracht", "Herengracht", "Keizersgracht"],
  BR: ["Paulista", "Atlântica", "Rio Branco", "das Flores", "Sete de Setembro", "Quinze de Novembro", "Brigadeiro", "Faria Lima", "Ipiranga", "Augusta", "Consolação", "Liberdade", "Independência", "Brasil", "São João"],
  MX: ["Reforma", "Insurgentes", "Juárez", "Hidalgo", "Madero", "Revolución", "Independencia", "Constitución", "Morelos", "Allende", "Zaragoza", "Cinco de Mayo", "Veinte de Noviembre", "División del Norte", "Universidad"]
};

const STREET_TYPES = {
  US: ["St", "Ave", "Blvd", "Rd", "Dr", "Ln", "Way", "Ct", "Pl", "Ter"],
  GB: ["Street", "Road", "Lane", "Avenue", "Close", "Drive", "Way", "Place", "Court", "Mews"],
  CA: ["St", "Ave", "Blvd", "Rd", "Dr", "Cres", "Way", "Ct", "Pl", "Terr"],
  AU: ["Street", "Road", "Avenue", "Drive", "Lane", "Place", "Court", "Crescent", "Way", "Parade"],
  DE: [""],
  FR: ["Rue", "Avenue", "Boulevard", "Place", "Allée", "Impasse", "Chemin", "Quai", "Cours", "Voie"],
  JP: [""],
  ID: ["Jl.", "Jalan"],
  SG: ["Road", "Street", "Avenue", "Drive", "Lane", "Crescent", "Way", "Link", "Place", "Walk"],
  NL: [""],
  BR: ["Rua", "Avenida", "Travessa", "Alameda", "Praça", "Largo", "Estrada", "Rodovia"],
  MX: ["Calle", "Avenida", "Paseo", "Boulevard", "Privada", "Callejón", "Andador", "Circuito"]
};

/* Each region entry: [regionName, regionCode, [city,...]] */
const REGIONS = {
  US: [
    ["California", "CA", ["Los Angeles", "San Francisco", "San Diego", "Sacramento", "San Jose", "Oakland", "Fresno", "Long Beach"]],
    ["New York", "NY", ["New York", "Buffalo", "Rochester", "Albany", "Syracuse", "Yonkers"]],
    ["Texas", "TX", ["Houston", "Austin", "Dallas", "San Antonio", "Fort Worth", "El Paso", "Arlington"]],
    ["Florida", "FL", ["Miami", "Orlando", "Tampa", "Jacksonville", "Tallahassee", "Fort Lauderdale"]],
    ["Illinois", "IL", ["Chicago", "Springfield", "Peoria", "Rockford", "Naperville"]],
    ["Washington", "WA", ["Seattle", "Spokane", "Tacoma", "Olympia", "Bellevue"]],
    ["Massachusetts", "MA", ["Boston", "Cambridge", "Worcester", "Springfield", "Lowell"]],
    ["Colorado", "CO", ["Denver", "Boulder", "Colorado Springs", "Aurora", "Fort Collins"]]
  ],
  GB: [
    ["England", "ENG", ["London", "Manchester", "Birmingham", "Liverpool", "Leeds", "Bristol", "Sheffield", "Newcastle"]],
    ["Scotland", "SCT", ["Edinburgh", "Glasgow", "Aberdeen", "Dundee", "Stirling", "Inverness"]],
    ["Wales", "WLS", ["Cardiff", "Swansea", "Newport", "Wrexham", "Bangor"]],
    ["Northern Ireland", "NIR", ["Belfast", "Derry", "Lisburn", "Newry", "Armagh"]]
  ],
  CA: [
    ["Ontario", "ON", ["Toronto", "Ottawa", "Mississauga", "Hamilton", "London", "Kitchener", "Windsor"]],
    ["Quebec", "QC", ["Montreal", "Quebec City", "Laval", "Gatineau", "Sherbrooke", "Trois-Rivières"]],
    ["British Columbia", "BC", ["Vancouver", "Victoria", "Burnaby", "Surrey", "Richmond", "Kelowna"]],
    ["Alberta", "AB", ["Calgary", "Edmonton", "Red Deer", "Lethbridge", "Medicine Hat"]],
    ["Manitoba", "MB", ["Winnipeg", "Brandon", "Steinbach", "Portage la Prairie"]],
    ["Nova Scotia", "NS", ["Halifax", "Sydney", "Dartmouth", "Truro"]]
  ],
  AU: [
    ["New South Wales", "NSW", ["Sydney", "Newcastle", "Wollongong", "Central Coast", "Maitland"]],
    ["Victoria", "VIC", ["Melbourne", "Geelong", "Ballarat", "Bendigo", "Shepparton"]],
    ["Queensland", "QLD", ["Brisbane", "Gold Coast", "Sunshine Coast", "Townsville", "Cairns"]],
    ["Western Australia", "WA", ["Perth", "Fremantle", "Bunbury", "Geraldton", "Albany"]],
    ["South Australia", "SA", ["Adelaide", "Mount Gambier", "Whyalla", "Port Augusta"]],
    ["Tasmania", "TAS", ["Hobart", "Launceston", "Devonport", "Burnie"]]
  ],
  DE: [
    ["Bayern", "BY", ["München", "Nürnberg", "Augsburg", "Würzburg", "Regensburg", "Ingolstadt"]],
    ["Berlin", "BE", ["Berlin"]],
    ["Hamburg", "HH", ["Hamburg"]],
    ["Nordrhein-Westfalen", "NW", ["Köln", "Düsseldorf", "Dortmund", "Essen", "Bonn", "Münster"]],
    ["Hessen", "HE", ["Frankfurt am Main", "Wiesbaden", "Kassel", "Darmstadt"]],
    ["Baden-Württemberg", "BW", ["Stuttgart", "Mannheim", "Karlsruhe", "Freiburg", "Heidelberg"]],
    ["Sachsen", "SN", ["Dresden", "Leipzig", "Chemnitz", "Zwickau"]]
  ],
  FR: [
    ["Île-de-France", "IDF", ["Paris", "Versailles", "Boulogne-Billancourt", "Saint-Denis", "Argenteuil"]],
    ["Provence-Alpes-Côte d'Azur", "PAC", ["Marseille", "Nice", "Toulon", "Aix-en-Provence", "Cannes"]],
    ["Auvergne-Rhône-Alpes", "ARA", ["Lyon", "Grenoble", "Saint-Étienne", "Clermont-Ferrand", "Annecy"]],
    ["Occitanie", "OCC", ["Toulouse", "Montpellier", "Nîmes", "Perpignan", "Béziers"]],
    ["Nouvelle-Aquitaine", "NAQ", ["Bordeaux", "Limoges", "Poitiers", "La Rochelle", "Pau"]],
    ["Hauts-de-France", "HDF", ["Lille", "Amiens", "Roubaix", "Tourcoing", "Dunkerque"]],
    ["Bretagne", "BRE", ["Rennes", "Brest", "Quimper", "Lorient", "Vannes"]]
  ],
  JP: [
    ["Tokyo", "13", ["Shinjuku", "Shibuya", "Minato", "Chiyoda", "Chuo", "Setagaya", "Bunkyo"]],
    ["Osaka", "27", ["Osaka", "Sakai", "Higashiosaka", "Toyonaka", "Suita"]],
    ["Kanagawa", "14", ["Yokohama", "Kawasaki", "Sagamihara", "Fujisawa", "Yokosuka"]],
    ["Aichi", "23", ["Nagoya", "Toyota", "Okazaki", "Toyohashi", "Ichinomiya"]],
    ["Hokkaido", "01", ["Sapporo", "Hakodate", "Asahikawa", "Obihiro", "Kushiro"]],
    ["Fukuoka", "40", ["Fukuoka", "Kitakyushu", "Kurume", "Omuta"]],
    ["Kyoto", "26", ["Kyoto", "Uji", "Kameoka", "Joyo"]]
  ],
  ID: [
    ["DKI Jakarta", "JK", ["Jakarta Pusat", "Jakarta Selatan", "Jakarta Barat", "Jakarta Timur", "Jakarta Utara"]],
    ["Jawa Barat", "JB", ["Bandung", "Bekasi", "Bogor", "Depok", "Cimahi", "Sukabumi"]],
    ["Jawa Tengah", "JT", ["Semarang", "Solo", "Magelang", "Pekalongan", "Tegal", "Salatiga"]],
    ["Jawa Timur", "JI", ["Surabaya", "Malang", "Kediri", "Madiun", "Mojokerto", "Probolinggo"]],
    ["Bali", "BA", ["Denpasar", "Ubud", "Kuta", "Gianyar", "Singaraja"]],
    ["DI Yogyakarta", "YO", ["Yogyakarta", "Sleman", "Bantul", "Wates"]],
    ["Sumatera Utara", "SU", ["Medan", "Binjai", "Pematangsiantar", "Tebing Tinggi"]],
    ["Sulawesi Selatan", "SN", ["Makassar", "Parepare", "Palopo"]]
  ],
  SG: [
    ["Central Region", "CR", ["Singapore"]],
    ["East Region", "ER", ["Singapore"]],
    ["North Region", "NR", ["Singapore"]],
    ["North-East Region", "NER", ["Singapore"]],
    ["West Region", "WR", ["Singapore"]]
  ],
  NL: [
    ["Noord-Holland", "NH", ["Amsterdam", "Haarlem", "Alkmaar", "Hilversum", "Zaanstad"]],
    ["Zuid-Holland", "ZH", ["Rotterdam", "Den Haag", "Leiden", "Delft", "Dordrecht"]],
    ["Utrecht", "UT", ["Utrecht", "Amersfoort", "Nieuwegein", "Veenendaal"]],
    ["Noord-Brabant", "NB", ["Eindhoven", "Tilburg", "Breda", "'s-Hertogenbosch"]],
    ["Gelderland", "GE", ["Nijmegen", "Arnhem", "Apeldoorn", "Ede"]],
    ["Overijssel", "OV", ["Enschede", "Zwolle", "Deventer", "Hengelo"]],
    ["Limburg", "LI", ["Maastricht", "Heerlen", "Venlo", "Sittard"]]
  ],
  BR: [
    ["São Paulo", "SP", ["São Paulo", "Campinas", "Santos", "Guarulhos", "Osasco", "Ribeirão Preto"]],
    ["Rio de Janeiro", "RJ", ["Rio de Janeiro", "Niterói", "Nova Iguaçu", "Duque de Caxias", "Petrópolis"]],
    ["Minas Gerais", "MG", ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora"]],
    ["Bahia", "BA", ["Salvador", "Feira de Santana", "Vitória da Conquista", "Ilhéus"]],
    ["Paraná", "PR", ["Curitiba", "Londrina", "Maringá", "Ponta Grossa"]],
    ["Rio Grande do Sul", "RS", ["Porto Alegre", "Caxias do Sul", "Pelotas", "Santa Maria"]],
    ["Pernambuco", "PE", ["Recife", "Olinda", "Caruaru", "Petrolina"]]
  ],
  MX: [
    ["Ciudad de México", "CMX", ["Ciudad de México", "Coyoacán", "Iztapalapa", "Tlalpan"]],
    ["Jalisco", "JAL", ["Guadalajara", "Zapopan", "Tlaquepaque", "Tonalá", "Puerto Vallarta"]],
    ["Nuevo León", "NLE", ["Monterrey", "San Pedro", "San Nicolás", "Apodaca", "Guadalupe"]],
    ["Puebla", "PUE", ["Puebla", "Tehuacán", "San Martín Texmelucan", "Atlixco"]],
    ["Veracruz", "VER", ["Veracruz", "Xalapa", "Coatzacoalcos", "Córdoba", "Orizaba"]],
    ["Yucatán", "YUC", ["Mérida", "Valladolid", "Tizimín", "Progreso"]],
    ["Quintana Roo", "ROO", ["Cancún", "Playa del Carmen", "Chetumal", "Cozumel"]]
  ]
};

const SECONDARY_LINES = {
  US: ["Apt", "Suite", "Unit", "Floor", "#"],
  GB: ["Flat", "Floor", "Apartment", "Unit"],
  CA: ["Apt", "Suite", "Unit", "#"],
  AU: ["Unit", "Apartment", "Suite", "Level"],
  DE: ["Wohnung", "Etage", "Hinterhaus"],
  FR: ["Apt", "Étage", "Bât."],
  JP: ["Apt.", "Bldg.", "Mansion"],
  ID: ["No.", "Blok", "RT/RW", "Lt."],
  SG: ["#", "Unit", "Block"],
  NL: ["Etage", "Hs", "App."],
  BR: ["Apto", "Bloco", "Casa", "Sala"],
  MX: ["Depto.", "Int.", "Edificio", "Piso"]
};

const COUNTRIES = {
  US: { name: "United States", flag: "🇺🇸", phoneCode: "+1", phonePattern: "(###) ###-####", postalPattern: "#####" },
  GB: { name: "United Kingdom", flag: "🇬🇧", phoneCode: "+44", phonePattern: "0#### ######", postalPattern: "@@# #@@" },
  CA: { name: "Canada", flag: "🇨🇦", phoneCode: "+1", phonePattern: "(###) ###-####", postalPattern: "@#@ #@#" },
  AU: { name: "Australia", flag: "🇦🇺", phoneCode: "+61", phonePattern: "0### ### ###", postalPattern: "####" },
  DE: { name: "Germany", flag: "🇩🇪", phoneCode: "+49", phonePattern: "0### #######", postalPattern: "#####" },
  FR: { name: "France", flag: "🇫🇷", phoneCode: "+33", phonePattern: "0# ## ## ## ##", postalPattern: "#####" },
  JP: { name: "Japan", flag: "🇯🇵", phoneCode: "+81", phonePattern: "0##-####-####", postalPattern: "###-####" },
  ID: { name: "Indonesia", flag: "🇮🇩", phoneCode: "+62", phonePattern: "08##-####-####", postalPattern: "#####" },
  SG: { name: "Singapore", flag: "🇸🇬", phoneCode: "+65", phonePattern: "#### ####", postalPattern: "######" },
  NL: { name: "Netherlands", flag: "🇳🇱", phoneCode: "+31", phonePattern: "06-########", postalPattern: "#### @@" },
  BR: { name: "Brazil", flag: "🇧🇷", phoneCode: "+55", phonePattern: "(##) #####-####", postalPattern: "#####-###" },
  MX: { name: "Mexico", flag: "🇲🇽", phoneCode: "+52", phonePattern: "## #### ####", postalPattern: "#####" }
};
