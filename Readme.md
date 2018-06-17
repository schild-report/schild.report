_schild.report_ ist das Ergebnis einer mehrjährigen Entwicklungsarbeit an einer
Lösung, die die Erstellung von Dokumenten mit Daten aus der
Schild-Datenbank erleichtert. Zwar bringt Schild einen Report-Designer
mit, aber der ist in seinem Funktionsumfang eingeschränkt und der
Komfort für Benutzer ist wohl eher dem Zweck untergeordnet. Man kann
mit Maus und Tastatur alle Elemente eines Dokuments positionieren,
aber verzerrte Texte, unscharfe Grafiken und unübersichtliche
Subreport-Strukturen bringen mehr Frust als Freude.

_schild.report_ präsentiert sich als Alternative mit folgenden Zielen:

* übersichtliche Reporterstellung in lesbarem Format
* perfekte Typografie
* vollständige Steuerung der Druckausgabe
* unterstützung aller gängigen Grafikformate
* schnelle Anzeige der Dokumente

Lesbares Reportformat
_schild.report_ verwendet zur Erstellung von Reports das für Internetseiten
verwendete HTML, eine Auszeichnungssprache, die mit Hilfe von sog. Tags
die Darstellung von Elementen steuert. D.h. mit Hilfe von <b>Fett</b>
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
dazu eignet. Angaben wie {schueler.Name} geben den Nachnamen des
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
JavaScript Engines macht sich auch in der Anzeige der Reports bemerkbar.
Die Anzeige eines Klassensatzes ist innerhalb einer Sekunde möglich.
Lediglich der Datenverkehr zwischen MySQL-Server und _schild.report_ verzögert die
Darstellung meist um ein oder zwei Sekunden. Geschwindigkeiten, die mit
Schild nicht denkbar wären.

Voraussetzungen
_schild.report_ setzt eine MySQL-Datenbank voraus. Access-Datenbanken können
leider nicht angesprochen werden. Dafür läuft _schild.report_ auf Windows, Linux
und MacOS.
