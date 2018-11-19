_schild.report_ ist eine moderne Lösung zum Erstellen von Reports mit Daten
aus der Schild-Datenbank, die den bei Schild mitgelieferten Report-Designer
vollständig ersetzen kann.

Hauptmerkmale von _schild.report_ lassen sich wie folgt zusammenfassen:

* übersichtliche Reporterstellung in lesbarem Format
* perfekte Typografie
* vollständige Steuerung der Druckausgabe
* unterstützung aller gängigen Grafikformate
* schnelle Anzeige der Dokumente
* Live-Vorschau bei der Erstellung von Dokumenten

_schild.report_ verwendet zur Erstellung von Reports das für Internetseiten
verwendete HTML, eine Auszeichnungssprache, die mit Hilfe von sog. Tags
die Darstellung von Elementen steuert. D.h. mit Hilfe von `<b>Fett</b>`
werden Textstellen als **Fett** markiert und ausgegeben. Ebenso kann CSS
eingesetzt werden, mit dessen Hilfe Elemente neben weiteren
Darstellungsmöglichkeiten auch noch frei bzw. in Abhängigkeit zu anderen
Elementen positioniert werden können. Mit Hilfe dieser modernen
Gestaltungstechniken, man werfe einen Blick auf die Internetseiten
größerer Firmen, ist unschwer zu erkennen, dass Schuldokumente keine
große Herausforderung darstellen.

Da HTML statisch ist, also erstmal nicht mit Daten aus der
Schild-Datenbank gefüttert werden kann, wird mit Hilfe von Platzhaltern
gearbeitet, die anschließend die Daten einfügen. Dazu wird eine
JavaScript-Bibliothek namens Svelte verwendet, die sich hervorragend
dazu eignet. Angaben wie `{schueler.Name}` geben den Nachnamen des
Schülers aus. Diese Daten werden von _schild.report_ zur Verfügung gestellt, die
geschriebenen Reports können beliebig darauf zugreifen und verarbeiten
und damit individuelle Schülerdokumente erstellen, die natürlich auch im
Klassensatz verarbeitet werden können.

Da diese Reports im Prinzip einfache HTML-Dokumente sind, können sie in
jedem Texteditor geschriebenen und angeschaut werden. Es werden keine
Binärformate verwendet. Mit ein bisschen Übung lassen sich solche
Dokumente recht gut lesen und schreiben. Ein weiterer Vorteil ist, dass
Svelte auf JavaScript basiert und damit auch Subreports erlaubt, d.h.
man kann kleine Teile eines Reports, die in vielen anderen Dokumenten
verwendet werden, auslagern und wiederverwenden.

Zur Anzeige der HTML-Dokumente setzt _schild.report_ auf Electron, das auf dem
Chromium-Browser aufbaut. Dadurch stehen einer perfekten Typografie
nichts im Wege. Moderne Browsertechnologien sind spezialisiert auf die
Textausgabe am Bildschirm und im Druck und können darüber hinaus viele
Grafikformate verarbeiten. Damit ist es auch möglich, dass _schild.report_
Vektorgrafiken verarbeiten kann, die beliebig skalierbar sind und daher
niemals zu klein oder zu groß dargestellt werden können. Die Qualität
bleibt identisch.

JavaScript ist die Sprache, die von vielen großen Internetfirmen
unterstützt und finanziert wird. Dementsprechend groß ist das Interesse,
dass JavaScript schneller wird. Die Leistungsfähigkeit moderner
JavaScript-Engines macht sich auch in der Anzeige der Reports bemerkbar.
Die Anzeige eines Klassensatzes ist innerhalb einer Sekunde möglich.
Lediglich der Datenverkehr zwischen MySQL-Server und _schild.report_ verzögert die
Darstellung meist um ein oder zwei Sekunden. Geschwindigkeiten, die mit
Schild nicht denkbar wären.

Die in _schild.report_ eingesetzten Vorlagen werden bei jedem Speichervorgang
neu eingelesen und ermöglichen dadurch eine Live-Vorschau von Dokumenten,
während sie geschrieben werden. Dadurch können Fehler direkt behoben werden.

#### Voraussetzungen
_schild.report_ setzt eine MySQL-Datenbank voraus. Access-Datenbanken können
leider nicht angesprochen werden. Dafür läuft _schild.report_ auf Windows, Linux
und MacOS.

Um Reports erstellen oder bearbeiten zu können, sollte ein einfacher Texteditor
vorhanden sein, mit dem sich HTML-Dateien erstellen lassen. Empfehlenswert ist
z.B. Atom oder VS-Code.

#### Installation
Für Windows stehen unter Github aktuelle Ausgaben im MSI-Format zur Verfügung,
d.h. es sind automatisch ausführbare Installationsdateien. Für Linux können auf
Wunsch gerne komprimierte Pakete erstellt werden. Bitte anfragen.

_schild.report_ erstellt im Dokumentenverzeichnis folgende Ordner:

    schild.report
      |- vorlagen
      |- pdf

Der Ordner `pdf` archiviert alle erstellten Dokumente entsprechend dem gewählten Jahr,
`vorlagen` enthält weitere Ordner, die als Sammlung für Reports dienen.

Wird ein Ordner unter `vorlagen` erstellt, erscheint er in der Schüler-, bzw Klassenansicht.
Gleiches gilt für darin abgelegt Reports.

#### Nutzung
Um _schild.report_ nutzen zu können, müssen Reports im oben genannten `vorlagen`-Ordner
abelegt werden. Dazu kann man z.B. die Demo-Reports verwenden, die sich auf Github befinden.