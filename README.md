# Finlit

Start het lokale dashboard vanuit deze projectmap:

```sh
npm start
```

Open daarna <http://127.0.0.1:4173>. Laat de lokale server draaien zolang je het dashboard gebruikt; financiële gegevens worden opgeslagen in `data/finance.json`. Met **Backup maken** wordt een gedateerde kopie in `backups/` aangemaakt. In **Instellingen** kun je met **Projectbestand opslaan als…** een benoemde momentopname bewaren in `projects/`; bestaande bestanden worden alleen na bevestiging overschreven. Transacties kunnen tags hebben die je als extra filter kunt gebruiken en die geen extra bedragen meetellen. Met de themaknop in de bovenbalk wissel je tussen licht en donker; die voorkeur wordt lokaal onthouden. De mappen `data/`, `backups/` en `projects/` worden niet met Git bijgehouden.

Heb je nog een oudere dashboardpagina met gegevens in de browseropslag? Start eerst de server en open daarna die oude `file://`-pagina. Saldo zet de gegevens eenmalig over als er nog geen projectbestand bestaat en opent vervolgens het dashboard via `http://127.0.0.1:4173`. Een bestaand projectbestand wordt nooit door deze migratie overschreven.
