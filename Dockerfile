# Używamy oficjalnego obrazu Node.js jako bazy
FROM node:18-alpine 

# Ustawiamy katalog roboczy wewnątrz kontenera
WORKDIR /usr/src/app

# Kopiujemy plik package.json i instalujemy zależności
COPY package*.json ./
RUN npm install --only=production

# Kopiujemy resztę kodu
COPY . .

# Serwer nasłuchuje na porcie 3000 (jak w server.js)
EXPOSE 3000

# Uruchamiamy aplikację
CMD [ "npm", "start" ]
