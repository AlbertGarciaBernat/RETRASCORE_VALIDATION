import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const root = process.cwd();
const outputDir = path.join(root, "outputs", "mortalidad_mecanismo_mais");
const data = JSON.parse(await fs.readFile(path.join(outputDir, "mortality_tables.json"), "utf8"));
const outputPath = path.join(outputDir, "mortalidad_mecanismo_mais_2015_2025.xlsx");

const wb = Workbook.create();
const mechanismSheet = wb.worksheets.add("Mecanismo");
const maisSheet = wb.worksheets.add("Lesión_MAIS");

const colors = {
  navy: "#1F4E78",
  blue: "#D9EAF7",
  paleBlue: "#EEF5FA",
  gray: "#666666",
  lightGray: "#E7E6E6",
  subtotal: "#DDEBF7",
  white: "#FFFFFF",
  text: "#1F1F1F",
};

const mechanismLabels = {
  "caida accidental": "Caída accidental",
  "moto": "Moto",
  "coche": "Coche",
  "precipitacion": "Precipitación",
  "atropello": "Atropello",
  "bici": "Bici",
  "otros/desconocido": "Otros/desconocido",
  "arma blanca": "Arma blanca",
  "golpeo con objeto": "Golpeo con objeto",
  "otros vehiculos": "Otros vehículos",
  "aplastamiento": "Aplastamiento",
  "arma de fuego": "Arma de fuego",
  "accidente por zambullida": "Accidente por zambullida",
  "asta de toro": "Asta de toro",
  "explosion": "Explosión",
  "vehiculo movilidad unipersonal": "Vehículo de movilidad personal",
};

function styleBase(sheet, widthRange) {
  sheet.showGridLines = false;
  const used = sheet.getRange(widthRange);
  used.format.font = { name: "Arial", size: 10, color: colors.text };
  used.format.verticalAlignment = "center";
}

function styleTitle(sheet, titleRange, subtitleRange, sourceRange) {
  sheet.getRange(titleRange).format.font = { name: "Arial", size: 16, bold: true, color: colors.navy };
  sheet.getRange(subtitleRange).format.font = { name: "Arial", size: 10, italic: true, color: colors.gray };
  sheet.getRange(sourceRange).format.font = { name: "Arial", size: 9, color: colors.gray };
}

function styleHeader(range) {
  range.format.fill = colors.navy;
  range.format.font = { name: "Arial", size: 10, bold: true, color: colors.white };
  range.format.horizontalAlignment = "center";
  range.format.verticalAlignment = "center";
  range.format.wrapText = true;
  range.format.borders = { preset: "inside", style: "thin", color: colors.white };
}

function styleBody(range) {
  range.format.borders = {
    insideHorizontal: { style: "thin", color: colors.lightGray },
    bottom: { style: "thin", color: colors.lightGray },
  };
}

function addNotes(sheet, startRow, lines, endColumn) {
  sheet.getRange(`A${startRow}`).values = [["Notas"]];
  sheet.getRange(`A${startRow}:${endColumn}${startRow}`).format.fill = colors.paleBlue;
  sheet.getRange(`A${startRow}:${endColumn}${startRow}`).format.font = { name: "Arial", size: 10, bold: true, color: colors.navy };
  const values = lines.map((line) => [line]);
  sheet.getRange(`B${startRow + 1}:B${startRow + lines.length}`).values = values;
  sheet.getRange(`A${startRow + 1}:${endColumn}${startRow + lines.length}`).format.font = { name: "Arial", size: 9, color: colors.gray };
  sheet.getRange(`A${startRow + 1}:${endColumn}${startRow + lines.length}`).format.wrapText = false;
  sheet.getRange(`A${startRow + 1}:${endColumn}${startRow + lines.length}`).format.rowHeight = 20;
}

// Tabla 1: mecanismo
mechanismSheet.getRange("A1").values = [["Mortalidad a 30 días por mecanismo"]];
mechanismSheet.getRange("A2").values = [["Comparación de las cohortes 2015–2019 y 2020–2025"]];
mechanismSheet.getRange("A3").values = [["Fuente: retrauci.csv. Definición del desenlace: clean_retrauci.Rmd."]];
const mechanismHeaders = [[
  "Mecanismo",
  "2015–2019 · N",
  "2015–2019 · Muertes",
  "2015–2019 · Mortalidad",
  "2020–2025 · N",
  "2020–2025 · Muertes",
  "2020–2025 · Mortalidad",
  "Diferencia (pp)",
]];
mechanismSheet.getRange("A5:H5").values = mechanismHeaders;

const mechanismStart = 6;
const mechanismRows = data.mechanism_table.map((row) => [
  mechanismLabels[row.mechanism] ?? row.mechanism,
  row["2015-2019"].n,
  row["2015-2019"].deaths,
  null,
  row["2020-2025"].n,
  row["2020-2025"].deaths,
  null,
  null,
]);
const mechanismEnd = mechanismStart + mechanismRows.length - 1;
mechanismSheet.getRange(`A${mechanismStart}:H${mechanismEnd}`).values = mechanismRows;
mechanismSheet.getRange(`D${mechanismStart}`).formulas = [[`=IF(B${mechanismStart}>0,C${mechanismStart}/B${mechanismStart},"")`]];
mechanismSheet.getRange(`D${mechanismStart}:D${mechanismEnd}`).fillDown();
mechanismSheet.getRange(`G${mechanismStart}`).formulas = [[`=IF(E${mechanismStart}>0,F${mechanismStart}/E${mechanismStart},"")`]];
mechanismSheet.getRange(`G${mechanismStart}:G${mechanismEnd}`).fillDown();
mechanismSheet.getRange(`H${mechanismStart}`).formulas = [[`=IF(OR(D${mechanismStart}="",G${mechanismStart}=""),"",100*(G${mechanismStart}-D${mechanismStart}))`]];
mechanismSheet.getRange(`H${mechanismStart}:H${mechanismEnd}`).fillDown();

styleBase(mechanismSheet, `A1:H${mechanismEnd + 8}`);
styleTitle(mechanismSheet, "A1:H1", "A2:H2", "A3:H3");
styleHeader(mechanismSheet.getRange("A5:H5"));
styleBody(mechanismSheet.getRange(`A${mechanismStart}:H${mechanismEnd}`));
mechanismSheet.getRange(`B${mechanismStart}:C${mechanismEnd}`).setNumberFormat("#,##0");
mechanismSheet.getRange(`E${mechanismStart}:F${mechanismEnd}`).setNumberFormat("#,##0");
mechanismSheet.getRange(`D${mechanismStart}:D${mechanismEnd}`).setNumberFormat("0.0%");
mechanismSheet.getRange(`G${mechanismStart}:G${mechanismEnd}`).setNumberFormat("0.0%");
mechanismSheet.getRange(`H${mechanismStart}:H${mechanismEnd}`).setNumberFormat('0.0 "pp"');
mechanismSheet.getRange(`B${mechanismStart}:H${mechanismEnd}`).format.horizontalAlignment = "right";
mechanismSheet.getRange(`A${mechanismStart}:H${mechanismEnd}`).conditionalFormats.add("expression", {
  formula: `=MOD(ROW(),2)=0`,
  format: { fill: colors.paleBlue },
});

const mechanismNotesRow = mechanismEnd + 2;
addNotes(mechanismSheet, mechanismNotesRow, [
  "La mortalidad se calcula entre pacientes con desenlace a 30 días conocido dentro de cada mecanismo.",
  "‘Otros’, ‘otro’ y ‘desconocido’ se agrupan como ‘Otros/desconocido’; los mecanismos vacíos no se incluyen.",
  `Desenlace conocido: 2015–2019 N=${data.audit["known_30d_2015-2019"].toLocaleString("es-ES")} (${data.audit["deaths_30d_2015-2019"].toLocaleString("es-ES")} muertes); 2020–2025 N=${data.audit["known_30d_2020-2025"].toLocaleString("es-ES")} (${data.audit["deaths_30d_2020-2025"].toLocaleString("es-ES")} muertes).`,
], "H");
mechanismSheet.getRange("A:A").format.columnWidth = 28;
mechanismSheet.getRange("B:H").format.columnWidth = 16;
mechanismSheet.getRange("A1:H3").format.rowHeight = 22;
mechanismSheet.getRange("A5:H5").format.rowHeight = 34;
mechanismSheet.freezePanes.freezeRows(5);
mechanismSheet.tables.add(`A5:H${mechanismEnd}`, true, "MortalityMechanismTable").style = "TableStyleMedium2";

// Tabla 2: región y MAIS exacto
maisSheet.getRange("A1").values = [["Mortalidad a 30 días por tipo de lesión y MAIS"]];
maisSheet.getRange("A2").values = [["Región anatómica, subtotal con lesión y grado MAIS regional exacto"]];
maisSheet.getRange("A3").values = [["Fuente: retrauci.csv. Correspondencia regional y desenlace: clean_retrauci.Rmd."]];
const maisHeaders = [[
  "Tipo de lesión",
  "Grado",
  "2015–2019 · N",
  "2015–2019 · Muertes",
  "2015–2019 · Mortalidad",
  "2020–2025 · N",
  "2020–2025 · Muertes",
  "2020–2025 · Mortalidad",
  "Diferencia (pp)",
]];
maisSheet.getRange("A5:I5").values = maisHeaders;
const maisStart = 6;
const maisRows = data.mais_table.map((row) => [
  row.region,
  row.severity,
  row["2015-2019"].n,
  row["2015-2019"].deaths,
  null,
  row["2020-2025"].n,
  row["2020-2025"].deaths,
  null,
  null,
]);
const maisEnd = maisStart + maisRows.length - 1;
maisSheet.getRange(`A${maisStart}:I${maisEnd}`).values = maisRows;
maisSheet.getRange(`E${maisStart}`).formulas = [[`=IF(C${maisStart}>0,D${maisStart}/C${maisStart},"")`]];
maisSheet.getRange(`E${maisStart}:E${maisEnd}`).fillDown();
maisSheet.getRange(`H${maisStart}`).formulas = [[`=IF(F${maisStart}>0,G${maisStart}/F${maisStart},"")`]];
maisSheet.getRange(`H${maisStart}:H${maisEnd}`).fillDown();
maisSheet.getRange(`I${maisStart}`).formulas = [[`=IF(OR(E${maisStart}="",H${maisStart}=""),"",100*(H${maisStart}-E${maisStart}))`]];
maisSheet.getRange(`I${maisStart}:I${maisEnd}`).fillDown();

styleBase(maisSheet, `A1:I${maisEnd + 9}`);
styleTitle(maisSheet, "A1:I1", "A2:I2", "A3:I3");
styleHeader(maisSheet.getRange("A5:I5"));
styleBody(maisSheet.getRange(`A${maisStart}:I${maisEnd}`));
maisSheet.getRange(`C${maisStart}:D${maisEnd}`).setNumberFormat("#,##0");
maisSheet.getRange(`F${maisStart}:G${maisEnd}`).setNumberFormat("#,##0");
maisSheet.getRange(`E${maisStart}:E${maisEnd}`).setNumberFormat("0.0%");
maisSheet.getRange(`H${maisStart}:H${maisEnd}`).setNumberFormat("0.0%");
maisSheet.getRange(`I${maisStart}:I${maisEnd}`).setNumberFormat('0.0 "pp"');
maisSheet.getRange(`C${maisStart}:I${maisEnd}`).format.horizontalAlignment = "right";
for (let row = maisStart; row <= maisEnd; row += 1) {
  if (maisSheet.getRange(`B${row}`).values[0][0] === "Total MAIS ≥1") {
    maisSheet.getRange(`A${row}:I${row}`).format.fill = colors.subtotal;
    maisSheet.getRange(`A${row}:I${row}`).format.font = { name: "Arial", size: 10, bold: true, color: colors.text };
    maisSheet.getRange(`A${row}:I${row}`).format.borders = { bottom: { style: "medium", color: colors.navy } };
  }
}

const maisNotesRow = maisEnd + 2;
addNotes(maisSheet, maisNotesRow, [
  "Cada región se analiza por separado; un paciente puede contribuir a varias regiones anatómicas.",
  "Los vacíos MAIS se codifican como 0 (sin lesión documentada). El subtotal incluye MAIS 1–6; las filas siguientes muestran el grado exacto.",
  "La mortalidad se calcula entre pacientes con desenlace a 30 días conocido dentro de cada región y grado MAIS.",
  "Correspondencia: cabeza=mais1; extremidad superior=mais2; tórax=mais3; abdomen=mais4; extremidad inferior=mais5; externa/térmica=mais6.",
], "I");
maisSheet.getRange("A:A").format.columnWidth = 23;
maisSheet.getRange("B:B").format.columnWidth = 16;
maisSheet.getRange("C:I").format.columnWidth = 16;
maisSheet.getRange("A1:I3").format.rowHeight = 22;
maisSheet.getRange("A5:I5").format.rowHeight = 34;
maisSheet.freezePanes.freezeRows(5);
maisSheet.freezePanes.freezeColumns(2);
maisSheet.tables.add(`A5:I${maisEnd}`, true, "MortalityMaisTable").style = "TableStyleMedium2";

await fs.mkdir(outputDir, { recursive: true });
const xlsx = await SpreadsheetFile.exportXlsx(wb);
await xlsx.save(outputPath);

const mechanismInspect = await wb.inspect({
  kind: "table",
  range: `Mecanismo!A1:H${mechanismEnd}`,
  include: "values,formulas",
  tableMaxRows: 25,
  tableMaxCols: 10,
  maxChars: 12000,
});
const maisInspect = await wb.inspect({
  kind: "table",
  range: `Lesión_MAIS!A1:I${Math.min(maisEnd, 20)}`,
  include: "values,formulas",
  tableMaxRows: 25,
  tableMaxCols: 10,
  maxChars: 12000,
});
const errors = await wb.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
  maxChars: 5000,
});

const mechanismPreview = await wb.render({ sheetName: "Mecanismo", range: `A1:H${mechanismNotesRow + 3}`, scale: 1.2, format: "png" });
await fs.writeFile(path.join(outputDir, "preview_mecanismo.png"), new Uint8Array(await mechanismPreview.arrayBuffer()));
const maisPreview = await wb.render({ sheetName: "Lesión_MAIS", range: `A1:I${maisNotesRow + 4}`, scale: 1.0, format: "png" });
await fs.writeFile(path.join(outputDir, "preview_mais.png"), new Uint8Array(await maisPreview.arrayBuffer()));

console.log(JSON.stringify({
  outputPath,
  mechanismRange: `A1:H${mechanismEnd}`,
  maisRange: `A1:I${maisEnd}`,
  mechanismInspect: mechanismInspect.ndjson,
  maisInspect: maisInspect.ndjson,
  errorScan: errors.ndjson,
}, null, 2));
