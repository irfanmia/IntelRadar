// Country → Major Airports mapping with IATA codes and common routes

export interface Airport {
  iata: string
  name: string
  city: string
}

export interface AirportRoute {
  airline: string
  airlineCode: string
  flightPrefix: string
  destinations: string[] // IATA codes
}

export const COUNTRY_AIRPORTS: Record<string, Airport[]> = {
  'united-arab-emirates': [
    { iata: 'DXB', name: 'Dubai International', city: 'Dubai' },
    { iata: 'AUH', name: 'Abu Dhabi International', city: 'Abu Dhabi' },
  ],
  'saudi-arabia': [
    { iata: 'RUH', name: 'King Khalid International', city: 'Riyadh' },
    { iata: 'JED', name: 'King Abdulaziz International', city: 'Jeddah' },
  ],
  india: [
    { iata: 'DEL', name: 'Indira Gandhi International', city: 'Delhi' },
    { iata: 'BOM', name: 'Chhatrapati Shivaji Maharaj', city: 'Mumbai' },
    { iata: 'BLR', name: 'Kempegowda International', city: 'Bangalore' },
  ],
  pakistan: [
    { iata: 'ISB', name: 'Islamabad International', city: 'Islamabad' },
    { iata: 'KHI', name: 'Jinnah International', city: 'Karachi' },
    { iata: 'LHE', name: 'Allama Iqbal International', city: 'Lahore' },
  ],
  'united-kingdom': [
    { iata: 'LHR', name: 'London Heathrow', city: 'London' },
    { iata: 'LGW', name: 'London Gatwick', city: 'London' },
  ],
  'united-states': [
    { iata: 'JFK', name: 'John F. Kennedy International', city: 'New York' },
    { iata: 'LAX', name: 'Los Angeles International', city: 'Los Angeles' },
    { iata: 'ORD', name: "O'Hare International", city: 'Chicago' },
  ],
  turkey: [
    { iata: 'IST', name: 'Istanbul Airport', city: 'Istanbul' },
    { iata: 'SAW', name: 'Sabiha Gökçen', city: 'Istanbul' },
  ],
  qatar: [
    { iata: 'DOH', name: 'Hamad International', city: 'Doha' },
  ],
  egypt: [
    { iata: 'CAI', name: 'Cairo International', city: 'Cairo' },
  ],
  japan: [
    { iata: 'NRT', name: 'Narita International', city: 'Tokyo' },
    { iata: 'HND', name: 'Tokyo Haneda', city: 'Tokyo' },
  ],
  'south-korea': [
    { iata: 'ICN', name: 'Incheon International', city: 'Seoul' },
  ],
  germany: [
    { iata: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt' },
  ],
  france: [
    { iata: 'CDG', name: 'Charles de Gaulle', city: 'Paris' },
  ],
  australia: [
    { iata: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney' },
    { iata: 'MEL', name: 'Melbourne Airport', city: 'Melbourne' },
  ],
  russia: [
    { iata: 'SVO', name: 'Sheremetyevo', city: 'Moscow' },
  ],
  ukraine: [
    { iata: 'KBP', name: 'Boryspil International', city: 'Kyiv' },
  ],
  china: [
    { iata: 'PEK', name: 'Beijing Capital', city: 'Beijing' },
    { iata: 'PVG', name: 'Shanghai Pudong', city: 'Shanghai' },
  ],
  lebanon: [
    { iata: 'BEY', name: 'Rafic Hariri International', city: 'Beirut' },
  ],
  israel: [
    { iata: 'TLV', name: 'Ben Gurion International', city: 'Tel Aviv' },
  ],
  iraq: [
    { iata: 'BGW', name: 'Baghdad International', city: 'Baghdad' },
    { iata: 'EBL', name: 'Erbil International', city: 'Erbil' },
  ],
  iran: [
    { iata: 'IKA', name: 'Imam Khomeini International', city: 'Tehran' },
  ],
  jordan: [
    { iata: 'AMM', name: 'Queen Alia International', city: 'Amman' },
  ],
  kuwait: [
    { iata: 'KWI', name: 'Kuwait International', city: 'Kuwait City' },
  ],
  bahrain: [
    { iata: 'BAH', name: 'Bahrain International', city: 'Manama' },
  ],
  oman: [
    { iata: 'MCT', name: 'Muscat International', city: 'Muscat' },
  ],
  syria: [
    { iata: 'DAM', name: 'Damascus International', city: 'Damascus' },
  ],
  yemen: [
    { iata: 'SAH', name: 'Sana\'a International', city: 'Sana\'a' },
  ],
  sudan: [
    { iata: 'KRT', name: 'Khartoum International', city: 'Khartoum' },
  ],
  palestine: [
    { iata: 'GZA', name: 'Gaza International (Closed)', city: 'Gaza' },
  ],
  'north-korea': [
    { iata: 'FNJ', name: 'Pyongyang Sunan', city: 'Pyongyang' },
  ],
  nigeria: [
    { iata: 'LOS', name: 'Murtala Muhammed', city: 'Lagos' },
    { iata: 'ABV', name: 'Nnamdi Azikiwe', city: 'Abuja' },
  ],
  kenya: [
    { iata: 'NBO', name: 'Jomo Kenyatta', city: 'Nairobi' },
  ],
  'south-africa': [
    { iata: 'JNB', name: 'OR Tambo International', city: 'Johannesburg' },
  ],
  brazil: [
    { iata: 'GRU', name: 'São Paulo–Guarulhos', city: 'São Paulo' },
  ],
  canada: [
    { iata: 'YYZ', name: 'Toronto Pearson', city: 'Toronto' },
  ],
  taiwan: [
    { iata: 'TPE', name: 'Taiwan Taoyuan', city: 'Taipei' },
  ],
  venezuela: [
    { iata: 'CCS', name: 'Simón Bolívar', city: 'Caracas' },
  ],
}

// Common airline routes from each airport
export const AIRLINE_ROUTES: Record<string, AirportRoute[]> = {
  DXB: [
    { airline: 'Emirates', airlineCode: 'EK', flightPrefix: 'EK', destinations: ['LHR', 'JFK', 'BOM', 'DEL', 'CDG', 'SYD', 'ICN', 'NRT', 'IST', 'CAI'] },
    { airline: 'flydubai', airlineCode: 'FZ', flightPrefix: 'FZ', destinations: ['IST', 'KHI', 'AMM', 'BAH', 'KWI', 'DOH', 'BEY', 'CAI'] },
    { airline: 'Air India', airlineCode: 'AI', flightPrefix: 'AI', destinations: ['DEL', 'BOM', 'BLR', 'KHI'] },
  ],
  LHR: [
    { airline: 'British Airways', airlineCode: 'BA', flightPrefix: 'BA', destinations: ['JFK', 'DXB', 'CDG', 'FRA', 'IST', 'DEL', 'NRT', 'SYD', 'DOH'] },
    { airline: 'Virgin Atlantic', airlineCode: 'VS', flightPrefix: 'VS', destinations: ['JFK', 'LAX', 'DEL', 'HND'] },
  ],
  JFK: [
    { airline: 'Delta', airlineCode: 'DL', flightPrefix: 'DL', destinations: ['LHR', 'CDG', 'FRA', 'NRT', 'ICN', 'LAX', 'ORD'] },
    { airline: 'Emirates', airlineCode: 'EK', flightPrefix: 'EK', destinations: ['DXB'] },
    { airline: 'Qatar Airways', airlineCode: 'QR', flightPrefix: 'QR', destinations: ['DOH'] },
  ],
  DOH: [
    { airline: 'Qatar Airways', airlineCode: 'QR', flightPrefix: 'QR', destinations: ['LHR', 'JFK', 'CDG', 'IST', 'DEL', 'BOM', 'NRT', 'SYD', 'CAI', 'KHI'] },
  ],
  IST: [
    { airline: 'Turkish Airlines', airlineCode: 'TK', flightPrefix: 'TK', destinations: ['LHR', 'JFK', 'CDG', 'FRA', 'DXB', 'CAI', 'DEL', 'ICN', 'NRT'] },
  ],
  CAI: [
    { airline: 'EgyptAir', airlineCode: 'MS', flightPrefix: 'MS', destinations: ['LHR', 'CDG', 'FRA', 'DXB', 'DOH', 'IST', 'AMM', 'JED', 'RUH'] },
  ],
  DEL: [
    { airline: 'Air India', airlineCode: 'AI', flightPrefix: 'AI', destinations: ['LHR', 'JFK', 'DXB', 'BOM', 'SYD', 'NRT', 'ICN', 'FRA'] },
    { airline: 'IndiGo', airlineCode: '6E', flightPrefix: '6E', destinations: ['BOM', 'BLR', 'DXB', 'DOH', 'IST', 'KWI'] },
  ],
  RUH: [
    { airline: 'Saudia', airlineCode: 'SV', flightPrefix: 'SV', destinations: ['LHR', 'CDG', 'CAI', 'IST', 'DXB', 'KHI', 'DEL', 'JED'] },
  ],
  BOM: [
    { airline: 'Air India', airlineCode: 'AI', flightPrefix: 'AI', destinations: ['LHR', 'JFK', 'DXB', 'DEL', 'DOH'] },
  ],
  ICN: [
    { airline: 'Korean Air', airlineCode: 'KE', flightPrefix: 'KE', destinations: ['JFK', 'LAX', 'NRT', 'CDG', 'FRA', 'LHR', 'DXB'] },
    { airline: 'Asiana', airlineCode: 'OZ', flightPrefix: 'OZ', destinations: ['NRT', 'PEK', 'LAX', 'FRA'] },
  ],
}

// Fallback routes for airports not in AIRLINE_ROUTES
export const DEFAULT_ROUTES: AirportRoute = {
  airline: 'Local Carrier',
  airlineCode: 'LC',
  flightPrefix: 'LC',
  destinations: ['DXB', 'LHR', 'IST', 'CDG', 'FRA'],
}
