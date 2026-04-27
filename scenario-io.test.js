var assert = require("assert");
var m = require("./scenario-io.js");

function validBase() {
  return {
    schemaVersion: 1,
    exportedAt: "2025-01-01T00:00:00.000Z",
    preferences: { language: "pt", theme: "light" },
    scenario: {
      numberOfLines: 1,
      robotModel: "KR140",
      recipes: [
        {
          rowId: "1",
          nomeReceita: "A",
          productionBpm: 10,
          boxesPerLayer: 1,
          layersPerPallet: 1,
          picksPerLayer: 1,
          slipSheetBottom: 0,
          slipSheetBetweenLayers: 0,
          palletPick: 0
        }
      ],
      lineRobotTimes: [
        {
          lineIndex: 1,
          cycleTimePickS: 1,
          cycleTimeSlipSheetS: 0,
          cycleTimePalletS: 0
        }
      ],
      lineRecipeMap: {}
    }
  };
}

assert.strictEqual(m.validateScenarioPayload(null).ok, false);
assert.strictEqual(
  m.validateScenarioPayload({ schemaVersion: 9, scenario: {} }).code,
  "scenario_err_schema_version"
);

var v = m.validateScenarioPayload(validBase());
assert.strictEqual(v.ok, true);
if (!v.ok) throw new Error("expected ok");
assert.strictEqual(v.data.scenario.numberOfLines, 1);

var emptyRecipes = validBase();
emptyRecipes.scenario.recipes = [];
assert.strictEqual(m.validateScenarioPayload(emptyRecipes).ok, false);

var noRow1 = validBase();
noRow1.scenario.recipes = [
  {
    rowId: "2",
    nomeReceita: "B",
    productionBpm: 1,
    boxesPerLayer: 1,
    layersPerPallet: 1,
    picksPerLayer: 1,
    slipSheetBottom: 0,
    slipSheetBetweenLayers: 0,
    palletPick: 0
  }
];
assert.strictEqual(m.validateScenarioPayload(noRow1).ok, true);

var badMap = validBase();
badMap.scenario.lineRecipeMap = { "1": "99" };
assert.strictEqual(
  m.validateScenarioPayload(badMap).code,
  "scenario_err_line_map_target"
);

var invalidJson = validBase();
invalidJson.scenario.numberOfLines = 9;
assert.strictEqual(
  m.validateScenarioPayload(invalidJson).code,
  "scenario_err_lines_count"
);

var twoLines = validBase();
twoLines.scenario.numberOfLines = 2;
twoLines.scenario.recipes.push({
  rowId: "2",
  nomeReceita: "B",
  productionBpm: 5,
  boxesPerLayer: 2,
  layersPerPallet: 2,
  picksPerLayer: 2,
  slipSheetBottom: 0,
  slipSheetBetweenLayers: 0,
  palletPick: 0
});
twoLines.scenario.lineRobotTimes = [
  {
    lineIndex: 1,
    cycleTimePickS: 1,
    cycleTimeSlipSheetS: 0,
    cycleTimePalletS: 0
  },
  {
    lineIndex: 2,
    cycleTimePickS: 2,
    cycleTimeSlipSheetS: 0,
    cycleTimePalletS: 0
  }
];
twoLines.scenario.lineRecipeMap = { "1": "1", "2": "2" };
var v2 = m.validateScenarioPayload(twoLines);
assert.strictEqual(v2.ok, true);

console.log("scenario-io tests OK");
