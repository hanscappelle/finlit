# Finlit

Start het lokale dashboard vanuit deze projectmap:

```sh
npm start
```

Open daarna <http://127.0.0.1:4173>. Laat de lokale server draaien zolang je het dashboard gebruikt; financiële gegevens worden opgeslagen in `data/finance.json`. Met **Backup maken** wordt een gedateerde kopie in `backups/` aangemaakt. In **Instellingen** kun je met **Projectbestand opslaan als…** een benoemde momentopname bewaren in `projects/`; bestaande bestanden worden alleen na bevestiging overschreven. Transacties kunnen tags hebben die je als extra filter kunt gebruiken. Bij een geselecteerde inkomsten- of uitgavencategorie toont het overzicht tussen de grafieken en de tabel de bedragen per tag voor de gefilterde transacties, zonder verborgen bedragen. Klik op een tag in dit overzicht om de tabel daarop te filteren; klik opnieuw om het tagfilter te wissen. Een transactie met meerdere tags staat bij elke tag, maar telt in het tabeltotaal slechts eenmaal mee. Met de themaknop in de bovenbalk wissel je tussen licht en donker; die voorkeur wordt lokaal onthouden. De mappen `data/`, `backups/` en `projects/` worden niet met Git bijgehouden.

Verborgen bedragen worden standaard niet in de tabel getoond. Schakel **Toon verborgen bedragen** in om ze te bekijken of te herstellen.

In **Doelen & taken** kun je doelstellingen, taken en opmerkingen toevoegen, bewerken en verwijderen. Een doelstelling heeft een titel en een optionele langere beschrijving. Een taak kan optioneel aan een doelstelling worden gekoppeld; de voortgang is het percentage afgeronde gekoppelde taken. Boven de takentabel kun je filteren op doelstelling of op taken zonder doelstelling. Afgeronde taken staan doorgestreept onderaan de tabel; je kunt ze weer als onafgerond markeren. Doelstellingen en taken kunnen een deadline hebben. Opmerkingen kunnen los staan of aan een doelstelling of taak worden gekoppeld. Bij het verwijderen van een doelstelling of taak blijven de gekoppelde items bestaan zonder die koppeling. Deze gegevens worden met het project opgeslagen en maken deel uit van back-ups en projectbestanden; oudere projectbestanden beginnen met een leeg overzicht.

Heb je nog een oudere dashboardpagina met gegevens in de browseropslag? Start eerst de server en open daarna die oude `file://`-pagina. Saldo zet de gegevens eenmalig over als er nog geen projectbestand bestaat en opent vervolgens het dashboard via `http://127.0.0.1:4173`. Een bestaand projectbestand wordt nooit door deze migratie overschreven.
