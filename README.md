# Finlit

Start het lokale dashboard vanuit deze projectmap:

```sh
npm start
```

Open daarna <http://127.0.0.1:4173>. De lokale server is alleen een previewserver; financiële gegevens worden lokaal in de browser opgeslagen en niet naar een server gestuurd. **Backup maken** downloadt een gedateerde JSON-back-up. Met **Bestand openen** naast die knop kun je een JSON-projectbestand, zoals een eerdere back-up of `data/finance.json`, laden. Transacties kunnen tags hebben die je als extra filter kunt gebruiken. Bij een geselecteerde inkomsten- of uitgavencategorie toont het overzicht tussen de grafieken en de tabel de bedragen per tag voor de gefilterde transacties, zonder verborgen bedragen. Klik op een tag in dit overzicht om de tabel daarop te filteren; klik opnieuw om het tagfilter te wissen. Een transactie met meerdere tags staat bij elke tag, maar telt in het tabeltotaal slechts eenmaal mee. Met de themaknop in de bovenbalk wissel je tussen licht en donker; die voorkeur wordt lokaal onthouden. De mappen `data/`, `backups/` en `projects/` worden niet met Git bijgehouden.

## Statische hosting

Publiceer `index.html` en de map `vendor/` op een statische host; er is geen backend of API nodig. Dezelfde bestanden kunnen ook op een subpad worden gehost. Gegevens staan in IndexedDB van de browser en zijn alleen beschikbaar in die browser, op dat apparaat en voor die website-origin. Ze worden niet automatisch gedeeld of gesynchroniseerd met andere gebruikers of apparaten. Download regelmatig een back-up en bewaar die zelf. Om gegevens mee te nemen naar een andere browser of website, open je daar het JSON-back-upbestand met **Bestand openen**. De lokale preview start je met `npm start`.

Verborgen bedragen worden standaard niet in de tabel getoond. Schakel **Toon verborgen bedragen** in om ze te bekijken of te herstellen.

Bij inkomsten en uitgaven kun je boven de tabel tags toevoegen aan of verwijderen uit de gefilterde transacties. Scheid meerdere tags met komma's of puntkomma's. Verborgen transacties worden alleen aangepast als ze in de gefilterde tabel zichtbaar zijn.

In het zoekveld kun je ook een exact bedrag invoeren, bijvoorbeeld `12,50` of `€ 1.234,56`. Verborgen bedragen zijn niet op bedrag doorzoekbaar.

In **Doelen & taken** kun je doelstellingen, taken en opmerkingen toevoegen, bewerken en verwijderen. Een doelstelling heeft een titel en een optionele langere beschrijving. Een taak kan optioneel aan een doelstelling worden gekoppeld; de voortgang is het percentage afgeronde gekoppelde taken. Boven de takentabel kun je filteren op doelstelling of op taken zonder doelstelling. Afgeronde taken staan doorgestreept onderaan de tabel; je kunt ze weer als onafgerond markeren. Doelstellingen en taken kunnen een deadline hebben. Opmerkingen kunnen los staan of aan een doelstelling of taak worden gekoppeld. Bij het verwijderen van een doelstelling of taak blijven de gekoppelde items bestaan zonder die koppeling. Deze gegevens worden met het project opgeslagen en maken deel uit van back-ups en projectbestanden; oudere projectbestanden beginnen met een leeg overzicht.

Klik op de titel van een doelstelling om zowel taken als opmerkingen daarop te filteren. De opmerkingen omvatten ook die bij taken van de doelstelling. Klik opnieuw om beide filters te wissen of pas de filters afzonderlijk aan boven de lijsten.

Heb je nog gegevens in een oudere versie van het dashboard? Als ze in de browseropslag staan, worden die bij de eerste start automatisch naar IndexedDB overgezet. Als je gegevens in `data/finance.json` staan, laad je dat bestand met **Bestand openen**.
